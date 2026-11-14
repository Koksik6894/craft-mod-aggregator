import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { credentialStatus, hasAdminRole, validCredential } from "./api-security";

export const getApiSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data: roles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleError || !hasAdminRole(roles)) return { allowed: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("api_credentials").select("updated_at").eq("provider", "curseforge").maybeSingle();
    if (error) throw new Error("Nie można odczytać ustawień.");
    return { allowed: true as const, ...credentialStatus(Boolean(data || process.env["CURSEFORGE_API_KEY"]), data?.updated_at ?? null) };
  });

export const replaceApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    if (!validCredential(input)) throw new Error("Nieprawidłowe dane klucza.");
    return input;
  })
  .handler(async ({ context, data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data: roles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleError || !hasAdminRole(roles)) return { ok: false, message: "Brak uprawnień." };
    const material = process.env["API_SETTINGS_ENCRYPTION_KEY"];
    if (!material) return { ok: false, message: "Zapis klucza jest chwilowo niedostępny." };
    try {
      const response = await fetch("https://api.curseforge.com/v1/mods/search?gameId=432&pageSize=1", {
        headers: { "x-api-key": data, Accept: "application/json" }, signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) return { ok: false, message: response.status === 403 || response.status === 401 ? "CurseForge odrzucił klucz. Dotychczasowe ustawienie pozostało bez zmian." : "CurseForge jest chwilowo niedostępny. Spróbuj ponownie." };
      const { encryptCredential } = await import("./api-crypto.server");
      const encrypted_value = await encryptCredential(data, material);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("api_credentials").upsert({ provider: "curseforge", encrypted_value, updated_by: context.userId, updated_at: new Date().toISOString() });
      if (error) return { ok: false, message: "Nie udało się zapisać klucza. Spróbuj ponownie." };
      return { ok: true, message: "Klucz został sprawdzony i zastąpiony." };
    } catch {
      return { ok: false, message: "Nie udało się sprawdzić lub zapisać klucza. Spróbuj ponownie." };
    }
  });
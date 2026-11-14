import { decryptCredential } from "./api-crypto.server";

// Called only inside a server handler. Public mod reads cannot expose this value.
export async function resolveCurseForgeKey(fallback: string | undefined, encryptionMaterial: string | undefined) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("api_credentials").select("encrypted_value").eq("provider", "curseforge").maybeSingle();
  if (error) throw new Error("API configuration unavailable");
  if (!data) return fallback;
  if (!encryptionMaterial) throw new Error("API configuration unavailable");
  return decryptCredential(data.encrypted_value, encryptionMaterial);
}
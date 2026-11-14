import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, type FormEvent } from "react";
import { KeyRound, Save, LogOut, ShieldCheck } from "lucide-react";
import { getApiSettings, replaceApiKey } from "@/lib/api-settings.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const settingsQuery = queryOptions({ queryKey: ["api-settings"], queryFn: () => getApiSettings(), staleTime: 0 });
export const Route = createFileRoute("/_authenticated/settings/api")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => ({ meta: [
    { title: "Ustawienia API — Krysztok" }, { name: "description", content: "Prywatny panel wymiany klucza CurseForge." },
    { property: "og:title", content: "Ustawienia API — Krysztok" }, { property: "og:description", content: "Chronione ustawienia właściciela." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }), component: ApiSettings,
});
function ApiSettings() {
  const { data } = useSuspenseQuery(settingsQuery);
  const save = useServerFn(replaceApiKey);
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.current || busy) return;
    const value = input.current.value.trim();
    input.current.value = "";
    setBusy(true); setMessage("");
    try {
      const result = await save({ data: value });
      setMessage(result.message);
      if (result.ok) { await queryClient.invalidateQueries({ queryKey: ["api-settings"] }); await queryClient.invalidateQueries({ queryKey: ["mods"] }); await queryClient.invalidateQueries({ queryKey: ["mod"] }); }
    } catch { setMessage("Nie udało się zapisać klucza. Spróbuj ponownie lub zaloguj się ponownie."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto min-h-[70vh] max-w-xl px-4 py-16 text-foreground">
    <div className="flex items-start justify-between gap-4"><ShieldCheck className="size-9 text-primary" /><Button variant="outline" onClick={() => supabase.auth.signOut()}><LogOut />Wyloguj się</Button></div>
    <h1 className="mt-6 font-pixel text-xl leading-relaxed">Ustawienia API</h1>
    {!data.allowed ? <p role="alert" className="mt-8 text-muted-foreground">Brak dostępu. Panel jest dostępny wyłącznie dla właściciela strony.</p> : <>
      <section className="mt-8 border-y border-border py-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound className="size-5 text-curseforge" />CurseForge</h2>
        <p className="mt-3 text-sm text-muted-foreground">{data.configured ? "Klucz jest zapisany." : "Klucz nie jest jeszcze zapisany."}</p>
        {data.updatedAt && <p className="mt-2 text-sm text-muted-foreground">Ostatnia zmiana: {new Date(data.updatedAt).toLocaleString("pl-PL")}</p>}
        <form onSubmit={submit} className="mt-6 space-y-4" autoComplete="off">
          <label htmlFor="new-api-key" className="block text-sm font-medium">Nowy klucz CurseForge</label>
          <Input ref={input} id="new-api-key" type="password" autoComplete="off" spellCheck={false} required maxLength={256} disabled={busy} placeholder="Wprowadź nowy klucz" />
          <Button disabled={busy} type="submit"><Save />{busy ? "Sprawdzanie…" : "Sprawdź i zastąp klucz"}</Button>
        </form>
        {message && <p role="status" className="mt-5 text-sm text-muted-foreground">{message}</p>}
      </section>
    </>}
  </main>;
}
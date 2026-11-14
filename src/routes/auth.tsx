import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Logowanie właściciela — Krysztok" }, { name: "description", content: "Bezpieczne logowanie do ustawień API Krysztok." },
    { property: "og:title", content: "Logowanie właściciela — Krysztok" }, { property: "og:description", content: "Prywatny dostęp do ustawień API." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" },
  ] }), component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [recovery, setRecovery] = useState(false);
  useEffect(() => { setRecovery(window.location.hash.includes("type=recovery")); }, []);
  async function submit(event: FormEvent, signup = false) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (recovery) {
        const { error } = await supabase.auth.updateUser({ password });
        setPassword("");
        setMessage(error ? "Nie udało się zmienić hasła." : "Hasło zostało zmienione.");
        if (!error) await navigate({ to: "/settings/api" });
      } else if (signup) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
        setPassword(""); setMessage(error ? "Nie udało się utworzyć konta." : "Sprawdź skrzynkę i potwierdź adres e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setPassword("");
        if (error) setMessage("Nie udało się zalogować. Sprawdź dane i potwierdzenie adresu.");
        else { await router.invalidate(); await navigate({ to: "/settings/api" }); }
      }
    } catch { setMessage("Logowanie jest chwilowo niedostępne."); } finally { setBusy(false); }
  }
  async function social(provider: "google" | "lovable") {
    setBusy(true); setMessage("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setMessage("Nie udało się zalogować.");
      else if (!result.redirected) { await router.invalidate(); await navigate({ to: "/settings/api" }); }
    } catch { setMessage("Logowanie jest chwilowo niedostępne."); } finally { setBusy(false); }
  }
  return <main className="mx-auto min-h-[70vh] max-w-md px-4 py-16 text-foreground">
    <LockKeyhole className="mb-5 size-8 text-primary" />
    <h1 className="font-pixel text-xl leading-relaxed">{recovery ? "Nowe hasło" : "Panel właściciela"}</h1>
    <form onSubmit={event => submit(event)} className="mt-8 space-y-4">
      {!recovery && <><label htmlFor="owner-email" className="block text-sm">E-mail</label><Input id="owner-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></>}
      <label htmlFor="owner-password" className="block text-sm">Hasło</label><Input id="owner-password" type="password" autoComplete={recovery ? "new-password" : "current-password"} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
      <Button disabled={busy} type="submit" className="w-full"><LogIn />{busy ? "Proszę czekać…" : recovery ? "Zmień hasło" : "Zaloguj się"}</Button>
      {!recovery && <Button disabled={busy || !email || password.length < 8} variant="outline" className="w-full" onClick={e => submit(e, true)}>Utwórz konto właściciela</Button>}
    </form>
    {!recovery && <div className="mt-5 space-y-3">
      <Button variant="outline" className="w-full" disabled={busy} onClick={() => social("google")}><svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Zaloguj się przez Google</Button>
      <Button className="lovable-auth-button w-full" disabled={busy} onClick={() => social("lovable")}>Zaloguj się przez Lovable</Button>
      <Button variant="link" disabled={busy || !email} onClick={async () => {
        setBusy(true); try { await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` }); setMessage("Jeśli konto istnieje, otrzymasz link do zmiany hasła."); } catch { setMessage("Spróbuj ponownie później."); } finally { setBusy(false); }
      }}>Nie pamiętam hasła</Button>
      <Button variant="link" onClick={() => navigate({ to: "/settings/api" })}>Przejdź do ustawień</Button>
    </div>}
    {message && <p role="status" className="mt-5 text-sm text-muted-foreground">{message}</p>}
  </main>;
}
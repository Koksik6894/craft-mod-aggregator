import { Link } from "@tanstack/react-router";
import { Moon, Sun, Pickaxe } from "lucide-react";
import { LANGS, useApp } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang, dark, toggleDark } = useApp();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-pixel text-xs text-foreground sm:text-sm">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-glow">
            <Pickaxe className="h-5 w-5" />
          </span>
          KRYSZTOK
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className="nav-link" activeProps={{ className: "nav-link-active" }} activeOptions={{ exact: true }}>{t.myMods}</Link>
          <Link to="/contact" className="nav-link" activeProps={{ className: "nav-link-active" }}>{t.contact}</Link>
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground"
          >
            {Object.entries(LANGS).map(([k, v]) => (
              <option key={k} value={k}>{v.flag} {v.name}</option>
            ))}
          </select>
          <button aria-label="Theme" onClick={toggleDark} className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-foreground transition hover:border-primary">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

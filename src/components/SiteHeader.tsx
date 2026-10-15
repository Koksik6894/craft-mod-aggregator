import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, Pickaxe, Palette, Heart } from "lucide-react";
import { LANGS, ACCENTS, SUPPORT_URL, useApp } from "@/lib/i18n";

export function SiteHeader() {
  const { t, lang, setLang, dark, toggleDark, accent, setAccent } = useApp();
  const [paletteOpen, setPaletteOpen] = useState(false);
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
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t.support}
            title={t.support}
            className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-primary transition hover:border-primary"
          >
            <Heart className="h-4 w-4" />
          </a>
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
          <div className="relative">
            <button
              aria-label={t.accent}
              aria-expanded={paletteOpen}
              onClick={() => setPaletteOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-foreground transition hover:border-primary"
            >
              <Palette className="h-4 w-4" />
            </button>
            {paletteOpen && (
              <div className="absolute right-0 top-10 z-40 flex gap-1.5 rounded-md border border-border bg-card p-2 shadow-glow">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    aria-label={a.name}
                    title={a.name}
                    onClick={() => { setAccent(a.id); setPaletteOpen(false); }}
                    className={"h-5 w-5 rounded-full border-2 " + (accent === a.id ? "border-foreground" : "border-transparent")}
                    style={{ background: a.hex }}
                  />
                ))}
              </div>
            )}
          </div>
          <button aria-label="Theme" onClick={toggleDark} className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-foreground transition hover:border-primary">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

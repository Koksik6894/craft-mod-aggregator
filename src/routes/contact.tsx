import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lightbulb, Hammer, Copy } from "lucide-react";
import { useApp } from "@/lib/i18n";

const EMAIL = "krysztokdev@gmail.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Krysztok Minecraft Mods" },
      { name: "description", content: "Send Krysztok a mod suggestion, bug report or custom mod request." },
      { property: "og:title", content: "Contact — Krysztok Minecraft Mods" },
      { property: "og:description", content: "Suggestions and custom Minecraft mod requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);
  return (
    <main className="hero-bg min-h-[80vh]">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-pixel text-2xl leading-relaxed text-foreground sm:text-4xl">{t.contactTitle}</h1>
        <p className="mx-auto mt-6 max-w-lg text-muted-foreground">{t.contactText}</p>
        <div className="block-card mt-10 p-8">
          <div className="flex items-center justify-center gap-3 text-lg font-bold text-foreground sm:text-2xl">
            <Mail className="h-6 w-6 text-primary" /> {EMAIL}
            <button
              aria-label={t.copy}
              onClick={() => { navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="rounded-md border border-border p-2 text-muted-foreground hover:text-primary"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {copied && <p className="mt-2 text-sm text-primary">{t.copied}</p>}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <a href={`mailto:${EMAIL}`} className="platform-btn platform-primary"><Mail className="h-4 w-4" /> {t.send}</a>
            <a href={`mailto:${EMAIL}?subject=${encodeURIComponent("Mod suggestion")}`} className="platform-btn platform-modrinth"><Lightbulb className="h-4 w-4" /> {t.suggest}</a>
            <a href={`mailto:${EMAIL}?subject=${encodeURIComponent("Custom mod request")}`} className="platform-btn platform-curseforge"><Hammer className="h-4 w-4" /> {t.commission}</a>
          </div>
        </div>
      </div>
    </main>
  );
}

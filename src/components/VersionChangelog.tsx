import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { marked } from "marked";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurseForgeChangelog, type ModVersion } from "@/lib/mods.functions";
import { cleanChangelog } from "@/lib/changelog";
import { useApp } from "@/lib/i18n";

export function VersionChangelog({ version }: { version: ModVersion }) {
  const { t, lang } = useApp();
  const fetchChangelog = useServerFn(getCurseForgeChangelog);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);
  async function toggle() {
    setOpen(!open);
    if (open || loaded || busy) return;
    if (version.platform === "modrinth") {
      setHtml(cleanChangelog(marked.parse(version.changelog ?? "", { async: false })));
      setLoaded(true); return;
    }
    if (!version.curseforgeModId || !version.curseforgeFileId) return;
    setBusy(true); setError(false);
    try {
      const result = await fetchChangelog({ data: { modId: version.curseforgeModId, fileId: version.curseforgeFileId } });
      setHtml(result.html); setError(result.unavailable); setLoaded(!result.unavailable);
    } catch { setError(true); } finally { setBusy(false); }
  }
  return <div className="w-full">
    <Button variant="ghost" size="sm" aria-expanded={open} onClick={toggle}>{open ? <ChevronUp /> : <ChevronDown />}{t.changelog}</Button>
    {open && <div className="mt-3 border-l-2 border-border pl-4">
      {busy ? <p role="status" className="text-sm text-muted-foreground">{lang === "pl" ? "Wczytywanie…" : "Loading…"}</p> : html ? <div className="prose-mod" dangerouslySetInnerHTML={{ __html: html }} /> : <p role="status" className="text-sm text-muted-foreground">{error ? (lang === "pl" ? "Nie udało się pobrać listy zmian. Kliknij ponownie, aby spróbować jeszcze raz." : "Changelog unavailable. Click again to retry.") : (lang === "pl" ? "Autor nie dodał listy zmian do tej wersji." : "No changelog was provided for this version.")}</p>}
    </div>}
  </div>;
}
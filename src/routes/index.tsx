import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Heart, Package, Flame, ArrowUpDown } from "lucide-react";
import { getMods, type Mod } from "@/lib/mods.functions";
import { useApp, SUPPORT_URL } from "@/lib/i18n";

const modsQuery = queryOptions({ queryKey: ["mods"], queryFn: () => getMods(), staleTime: 5 * 60_000 });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krysztok — Minecraft Mods" },
      { name: "description", content: "All Krysztok's Minecraft mods from Modrinth and CurseForge with live download stats." },
      { property: "og:title", content: "Krysztok — Minecraft Mods" },
      { property: "og:description", content: "Live download stats from Modrinth and CurseForge." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Krysztok — Minecraft Mods",
        description: "Minecraft mods by Krysztok, available on Modrinth and CurseForge.",
      }),
    }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(modsQuery),
  component: Index,
});

const fmt = (n: number, lang: string) => new Intl.NumberFormat(lang).format(n);

type SortKey = "downloads" | "newest" | "az";

function Index() {
  const { data } = useSuspenseQuery(modsQuery);
  const { t, lang } = useApp();
  const [sort, setSort] = useState<SortKey>("downloads");
  const { totals } = data;
  const mods = useMemo(() => {
    const arr = [...data.mods];
    if (sort === "newest") arr.sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));
    else if (sort === "az") arr.sort((a, b) => a.title.localeCompare(b.title));
    else arr.sort((a, b) => b.total - a.total);
    return arr;
  }, [data.mods, sort]);

  return (
    <main>
      <section className="hero-bg relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
          <p className="font-pixel text-[10px] uppercase tracking-widest text-primary">Minecraft Mod Developer</p>
          <h1 className="mt-6 font-pixel text-4xl leading-tight text-foreground sm:text-6xl">KRYSZTOK</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">{t.tagline}</p>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="block-card p-8">
              <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                <Download className="h-4 w-4" /> {t.total}
              </div>
              <div className="mt-3 font-pixel text-4xl text-gradient sm:text-6xl">{fmt(totals.all, lang)}</div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                <Stat label="Modrinth" value={fmt(totals.modrinth, lang)} tone="modrinth" />
                <Stat label="CurseForge" value={fmt(totals.curseforge, lang)} tone="curseforge" />
                <Stat label={t.mods} value={String(totals.count)} icon={<Package className="h-4 w-4" />} />
                <Stat label={t.followers} value={fmt(totals.followers, lang)} icon={<Heart className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-pixel text-xl text-foreground">{t.myMods}</h2>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            <select
              aria-label={t.sort}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground"
            >
              <option value="downloads">{t.sortDownloads}</option>
              <option value="newest">{t.sortNewest}</option>
              <option value="az">{t.sortAZ}</option>
            </select>
          </label>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mods.map((m, i) => <ModCard key={m.key} mod={m} rank={i} showRank={sort === "downloads"} />)}
        </div>
        <div className="mt-12 text-center">
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="platform-btn platform-primary">
            <Heart className="h-4 w-4" /> {t.support}
          </a>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: string; tone?: "modrinth" | "curseforge"; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <div className={`flex items-center gap-1.5 text-xs ${tone === "modrinth" ? "text-modrinth" : tone === "curseforge" ? "text-curseforge" : "text-muted-foreground"}`}>
        {icon ?? <span className="h-2 w-2 rounded-full bg-current" />} {label}
      </div>
      <div className="mt-1 text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function ModCard({ mod, rank, showRank }: { mod: Mod; rank: number; showRank: boolean }) {
  const { t, lang } = useApp();
  const max = Math.max(mod.total, 1);
  return (
    <Link to="/mods/$slug" params={{ slug: mod.key }} className="block-card group flex flex-col p-5 transition hover:-translate-y-1">
      <div className="flex items-start gap-4">
        {mod.icon ? (
          <img src={mod.icon} alt={mod.title} loading="lazy" className="pixelated h-16 w-16 rounded-md border border-border object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-md bg-muted"><Package /></div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-foreground">{mod.title}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-primary">
            {showRank && rank === 0 && <Flame className="h-4 w-4" />}
            <Download className="h-3.5 w-3.5" /> {fmt(mod.total, lang)} {t.downloads}
          </div>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 flex-1 text-sm text-muted-foreground">{mod.description}</p>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
        <div className="bg-modrinth" style={{ width: `${((mod.modrinth?.downloads ?? 0) / max) * 100}%` }} />
        <div className="bg-curseforge" style={{ width: `${((mod.curseforge?.downloads ?? 0) / max) * 100}%` }} />
      </div>
      {mod.loaders.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mod.loaders.map((l) => <span key={l} className="chip">{l}</span>)}
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {mod.modrinth && (
          <span className="platform-btn platform-modrinth">
            Modrinth · {fmt(mod.modrinth.downloads, lang)}
          </span>
        )}
        {mod.curseforge && (
          <span className="platform-btn platform-curseforge">
            CurseForge · {fmt(mod.curseforge.downloads, lang)}
          </span>
        )}
      </div>
    </Link>
  );
}

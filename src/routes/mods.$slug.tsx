import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { ArrowLeft, Download, ExternalLink, Heart, Package } from "lucide-react";
import { getMod } from "@/lib/mods.functions";
import { useApp, SUPPORT_URL } from "@/lib/i18n";
import { VersionChangelog } from "@/components/VersionChangelog";

const modQuery = (key: string) =>
  queryOptions({ queryKey: ["mod", key], queryFn: () => getMod({ data: key }), staleTime: 5 * 60_000 });

export const Route = createFileRoute("/mods/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(modQuery(params.slug));
    if (!data.mod) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const mod = loaderData?.mod;
    const title = mod ? `${mod.title} — Krysztok` : "Mod — Krysztok";
    const description = mod?.description || "Minecraft mod by Krysztok.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: mod ? `/mods/${mod.key}` : "/mods" },
        ...(mod?.icon
          ? [{ property: "og:image", content: mod.icon }, { name: "twitter:image", content: mod.icon }]
          : []),
        { name: "twitter:card", content: mod?.icon ? "summary_large_image" : "summary" },
      ],
      links: [{ rel: "canonical", href: mod ? `/mods/${mod.key}` : "/mods" }],
      scripts: mod
        ? [{
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: mod.title,
              description: mod.description,
              applicationCategory: "GameApplication",
              operatingSystem: "Minecraft",
              downloadUrl: mod.modrinth?.url ?? mod.curseforge?.url,
              author: { "@type": "Person", name: "Krysztok" },
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }]
        : [],
    };
  },
  component: ModPage,
});

const fmt = (n: number, lang: string) => new Intl.NumberFormat(lang).format(n);

function ModPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(modQuery(slug));
  const { t, lang } = useApp();
  const mod = data.mod;
  if (!mod) throw notFound();
  const html = data.body ? sanitizeHtml(marked.parse(data.body, { async: false }) as string, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["https", "http", "mailto"],
  }) : "";
  const updated = mod.updated
    ? new Date(mod.updated).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <main className="hero-bg min-h-[80vh]">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </Link>

        <div className="block-card mt-6 p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {mod.icon ? (
              <img src={mod.icon} alt={mod.title} className="pixelated h-20 w-20 rounded-md border border-border object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-md bg-muted"><Package className="h-8 w-8" /></div>
            )}
            <div className="min-w-0">
              <h1 className="font-pixel text-2xl leading-relaxed text-foreground sm:text-3xl">{mod.title}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-primary">
                <Download className="h-4 w-4" />
                <span className="text-xl font-bold">{fmt(mod.total, lang)}</span> {t.downloads}
              </div>
            </div>
          </div>

          <p className="mt-5 text-muted-foreground">{mod.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Modrinth" value={mod.modrinth ? fmt(mod.modrinth.downloads, lang) : "—"} tone="modrinth" />
            <Stat label="CurseForge" value={mod.curseforge ? fmt(mod.curseforge.downloads, lang) : "—"} tone="curseforge" />
            <Stat label={t.followers} value={fmt(mod.modrinth?.followers ?? 0, lang)} icon={<Heart className="h-4 w-4" />} />
            <Stat label={t.updated} value={updated ?? "—"} />
          </div>

          {(mod.categories.length > 0 || mod.loaders.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {mod.loaders.map((l) => <span key={"loader-" + l} className="chip capitalize">{l}</span>)}
              {(mod.gameVersions ?? []).map((v) => <span key={"v-" + v} className="chip text-primary">{v}</span>)}
              {mod.categories.map((c) => <span key={c} className="chip">{c}</span>)}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {mod.modrinth && (
              <a href={mod.modrinth.url} target="_blank" rel="noreferrer" className="platform-btn platform-modrinth">
                Modrinth · {fmt(mod.modrinth.downloads, lang)} <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {mod.curseforge && (
              <a href={mod.curseforge.url} target="_blank" rel="noreferrer" className="platform-btn platform-curseforge">
                CurseForge · {fmt(mod.curseforge.downloads, lang)} <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="platform-btn platform-primary">
              <Heart className="h-4 w-4" /> {t.support}
            </a>
          </div>
        </div>

        {data.versions.length > 0 && (
          <section className="block-card mt-6 p-6 sm:p-8">
            <h2 className="font-pixel text-base text-foreground">{t.changelog}</h2>
            <ul className="mt-5 divide-y divide-border">
              {data.versions.map((v, i) => (
                <li key={v.platform + v.url + i} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-bold text-foreground">{v.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{new Date(v.date).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" })}</span>
                      {v.type !== "release" && <span className="chip">{v.type}</span>}
                      {v.loaders.map((l) => <span key={l} className="chip capitalize">{l}</span>)}
                      {v.gameVersions.slice(0, 4).map((g) => <span key={g} className="chip text-primary">{g}</span>)}
                    </div>
                  </div>
                  <a href={v.url} target="_blank" rel="noreferrer" className={`platform-btn ${v.platform === "modrinth" ? "platform-modrinth" : "platform-curseforge"}`}>
                    <Download className="h-3.5 w-3.5" /> {t.download} · {v.platform === "modrinth" ? "Modrinth" : "CurseForge"}
                  </a>
                  {(v.platform === "modrinth" || v.curseforgeFileId) && <VersionChangelog version={v} />}
                </li>
              ))}
            </ul>
          </section>
        )}

        {html && (
          <article className="block-card prose-mod mt-6 p-6 sm:p-8" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: string; tone?: "modrinth" | "curseforge"; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <div className={`flex items-center gap-1.5 text-xs ${tone === "modrinth" ? "text-modrinth" : tone === "curseforge" ? "text-curseforge" : "text-muted-foreground"}`}>
        {icon ?? <span className="h-2 w-2 rounded-full bg-current" />} {label}
      </div>
      <div className="mt-1 truncate text-sm font-bold text-foreground sm:text-xl">{value}</div>
    </div>
  );
}

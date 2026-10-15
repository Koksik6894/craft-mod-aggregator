import { createServerFn } from "@tanstack/react-start";

export type Mod = {
  key: string;
  title: string;
  description: string;
  icon: string | null;
  categories: string[];
  loaders: string[];
  updated: string | null;
  modrinth?: { url: string; downloads: number; followers: number };
  curseforge?: { url: string; downloads: number };
  total: number;
};

const CF_AUTHOR = "krysztok";
const MR_USER = "Krysztok";

const norm = (s: string) =>
  s.replace(/\(.*?\)/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const getMods = createServerFn({ method: "GET" }).handler(async () => {
  const map = new Map<string, Mod>();

  try {
    const r = await fetch(`https://api.modrinth.com/v2/user/${MR_USER}/projects`, {
      headers: { "User-Agent": "krysztok-portfolio/1.0 (krysztokdev@gmail.com)" },
    });
    if (r.ok) {
      const list = (await r.json()) as any[];
      for (const p of list) {
        if (p.status !== "approved") continue;
        const k = norm(p.title);
        map.set(k, {
          key: k,
          title: p.title,
          description: p.description,
          icon: p.icon_url ?? null,
          categories: p.categories ?? [],
          loaders: p.loaders ?? [],
          updated: p.updated ?? null,
          modrinth: {
            url: `https://modrinth.com/${p.project_type}/${p.slug}`,
            downloads: p.downloads ?? 0,
            followers: p.followers ?? 0,
          },
          total: 0,
        });
      }
    }
  } catch (e) {
    console.error("modrinth", e);
  }

  try {
    const r = await fetch(`https://api.cfwidget.com/author/search/${CF_AUTHOR}`);
    if (r.ok) {
      const author = (await r.json()) as { projects: { id: number; name: string }[] };
      const details = await Promise.all(
        author.projects.map(async (p) => {
          try {
            const d = await fetch(`https://api.cfwidget.com/${p.id}`);
            return d.ok ? ((await d.json()) as any) : null;
          } catch {
            return null;
          }
        }),
      );
      for (const d of details) {
        if (!d || !d.title || d.title.startsWith("project-")) continue;
        const k = norm(d.title);
        const cf = { url: d.urls?.curseforge ?? d.urls?.project, downloads: d.downloads?.total ?? 0 };
        const ex = map.get(k);
        if (ex) {
          ex.curseforge = cf;
          if (!ex.icon) ex.icon = d.thumbnail ?? null;
        } else {
          map.set(k, {
            key: k,
            title: d.title.replace(/\(.*?\)/g, "").trim(),
            description: d.summary ?? "",
            icon: d.thumbnail ?? null,
            categories: d.categories ?? [],
            loaders: [],
            updated: d.download?.uploaded_at ?? null,
            curseforge: cf,
            total: 0,
          });
        }
      }
    }
  } catch (e) {
    console.error("curseforge", e);
  }

  const mods = [...map.values()].map((m) => ({
    ...m,
    total: (m.modrinth?.downloads ?? 0) + (m.curseforge?.downloads ?? 0),
  }));
  mods.sort((a, b) => b.total - a.total);
  return {
    mods,
    totals: {
      all: mods.reduce((s, m) => s + m.total, 0),
      modrinth: mods.reduce((s, m) => s + (m.modrinth?.downloads ?? 0), 0),
      curseforge: mods.reduce((s, m) => s + (m.curseforge?.downloads ?? 0), 0),
      followers: mods.reduce((s, m) => s + (m.modrinth?.followers ?? 0), 0),
      count: mods.length,
    },
    fetchedAt: new Date().toISOString(),
  };
});

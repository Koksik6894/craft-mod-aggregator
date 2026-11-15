import { createServerFn } from "@tanstack/react-start";

export type Mod = {
  key: string;
  title: string;
  description: string;
  icon: string | null;
  categories: string[];
  loaders: string[];
  gameVersions: string[];
  updated: string | null;
  modrinthSlug?: string;
  modrinth?: { url: string; downloads: number; followers: number };
  curseforge?: { url: string; downloads: number; id?: number };
  total: number;
};

const CF_AUTHOR = "krysztok";
const CF_AUTHOR_ID = 128100944;
const CF_API = "https://api.curseforge.com/v1";
// modLoader enum from the CurseForge API
const CF_LOADER: Record<number, string> = { 1: "forge", 4: "fabric", 5: "quilt", 6: "neoforge" };

type CfItem = {
  id: number; title: string; summary: string; icon: string | null; categories: string[];
  loaders: string[]; gameVersions: string[]; updated: string | null; url: string; downloads: number;
};

// Official CurseForge API when a key is set; free cfwidget mirror otherwise.
async function loadCurseForge(key: string | undefined): Promise<CfItem[]> {
  if (key) {
    const out: CfItem[] = [];
    for (let index = 0; index < 500; index += 50) {
      const r = await fetch(`${CF_API}/mods/search?gameId=432&authorId=${CF_AUTHOR_ID}&pageSize=50&index=${index}&sortField=6&sortOrder=desc`, {
        headers: { "x-api-key": key, Accept: "application/json" },
      });
      if (!r.ok) { console.error("curseforge api", r.status); break; }
      const j = (await r.json()) as { data: any[]; pagination: { totalCount: number } };
      for (const m of j.data) {
        if (m.status !== 4 || !m.isAvailable) continue; // 4 = approved
        if (!(m.authors ?? []).some((x: any) => x.id === CF_AUTHOR_ID)) continue;
        const idx = m.latestFilesIndexes ?? [];
        out.push({
          id: m.id, title: m.name, summary: m.summary ?? "", icon: m.logo?.thumbnailUrl ?? m.logo?.url ?? null,
          categories: (m.categories ?? []).map((c: any) => c.name),
          loaders: [...new Set(idx.map((f: any) => CF_LOADER[f.modLoader]).filter(Boolean) as string[])],
          gameVersions: uniqSorted(idx.map((f: any) => f.gameVersion)),
          updated: m.dateReleased ?? m.dateModified ?? null, url: m.links?.websiteUrl ?? "", downloads: m.downloadCount ?? 0,
        });
      }
      if (index + 50 >= j.pagination.totalCount) break;
    }
    return out;
  }
  const r = await fetch(`https://api.cfwidget.com/author/search/${CF_AUTHOR}`);
  if (!r.ok) return [];
  const author = (await r.json()) as { projects: { id: number }[] };
  const details = await Promise.all(author.projects.map(async (p) => {
    try { const d = await fetch(`https://api.cfwidget.com/${p.id}`); return d.ok ? ((await d.json()) as any) : null; } catch { return null; }
  }));
  return details.filter((d) => d && d.title && !d.title.startsWith("project-") && d.download?.id && d.downloads?.total > 0).map((d) => {
    const tags: string[] = [...Object.keys(d.versions ?? {}), ...(d.files ?? []).flatMap((f: any) => f.versions ?? [])];
    return {
      id: d.id, title: d.title, summary: d.summary ?? "", icon: d.thumbnail ?? null, categories: d.categories ?? [],
      loaders: [...new Set(tags.map((x) => x.toLowerCase()).filter((x) => LOADERS.includes(x)))],
      gameVersions: uniqSorted(tags), updated: d.download?.uploaded_at ?? null,
      url: d.urls?.curseforge ?? d.urls?.project, downloads: d.downloads?.total ?? 0,
    };
  });
}
const MR_USER = "Krysztok";
const UA = { "User-Agent": "krysztok-portfolio/1.0 (krysztokdev@gmail.com)" };

const LOADERS = ["fabric", "forge", "neoforge", "quilt"];
const isMc = (v: string) => /^\d+(\.\d+)+$/.test(v);
export const cmpVer = (a: string, b: string) => {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
};
const uniqSorted = (v: string[]) => [...new Set(v)].filter(isMc).sort((a, b) => cmpVer(b, a));

export type ModVersion = {
  name: string; date: string; gameVersions: string[]; loaders: string[];
  url: string; platform: "modrinth" | "curseforge"; type: string; changelog?: string | null;
  curseforgeModId?: number; curseforgeFileId?: number;
};

const norm = (s: string) =>
  s.replace(/\(.*?\)/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const getMods = createServerFn({ method: "GET" }).handler(async () => {
  const map = new Map<string, Mod>();

  try {
    const r = await fetch(`https://api.modrinth.com/v2/user/${MR_USER}/projects`, {
      headers: UA,
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
          loaders: (p.loaders ?? []).filter((l: string) => LOADERS.includes(l)),
          gameVersions: uniqSorted(p.game_versions ?? []),
          updated: p.updated ?? null,
          modrinthSlug: p.slug,
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
     const key = process.env["CURSEFORGE_API_KEY"];
     const items = await loadCurseForge(key);
    for (const it of items) {
      const k = norm(it.title);
      const cf = { url: it.url, downloads: it.downloads, id: it.id };
      const ex = map.get(k);
      if (ex) {
        ex.loaders = [...new Set([...ex.loaders, ...it.loaders])];
        ex.gameVersions = uniqSorted([...ex.gameVersions, ...it.gameVersions]);
        ex.curseforge = cf;
        if (!ex.icon) ex.icon = it.icon;
      } else {
        map.set(k, {
          key: k, title: it.title.replace(/\(.*?\)/g, "").trim(), description: it.summary,
          icon: it.icon, categories: it.categories, loaders: it.loaders, gameVersions: it.gameVersions,
          updated: it.updated, curseforge: cf, total: 0,
        });
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

export const getMod = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => (typeof d === "string" ? d : String(d ?? "")))
  .handler(async ({ data: key }) => {
    const all = await getMods();
    const mod = all.mods.find((m) => m.key === key) ?? null;
    let body: string | null = null;
    if (mod?.modrinthSlug) {
      try {
        const r = await fetch(`https://api.modrinth.com/v2/project/${mod.modrinthSlug}`, { headers: UA });
        if (r.ok) {
          const p = (await r.json()) as { body?: string };
          body = typeof p.body === "string" ? p.body : null;
        }
      } catch (e) {
        console.error("modrinth body", e);
      }
    }
    const versions: ModVersion[] = [];
    if (mod?.modrinthSlug) {
      try {
        const r = await fetch(`https://api.modrinth.com/v2/project/${mod.modrinthSlug}/version`, { headers: UA });
        if (r.ok) {
          for (const v of ((await r.json()) as any[]).slice(0, 15)) {
            versions.push({
              name: v.name || v.version_number, date: v.date_published,
              gameVersions: uniqSorted(v.game_versions ?? []), loaders: v.loaders ?? [],
              url: `https://modrinth.com/mod/${mod.modrinthSlug}/version/${v.id}`,
              platform: "modrinth", type: v.version_type ?? "release", changelog: v.changelog ?? null,
            });
          }
        }
      } catch (e) { console.error("modrinth versions", e); }
    }
    const apiKey = process.env["CURSEFORGE_API_KEY"];
    if (apiKey && mod?.curseforge?.id) {
      try {
        const r = await fetch(`${CF_API}/mods/${mod.curseforge.id}/files?pageSize=15`, { headers: { "x-api-key": apiKey, Accept: "application/json" } });
        if (r.ok) {
          for (const f of ((await r.json()) as { data: any[] }).data) {
            const tags: string[] = f.gameVersions ?? [];
            versions.push({
              name: f.displayName || f.fileName, date: f.fileDate,
              gameVersions: uniqSorted(tags), loaders: tags.map((x) => x.toLowerCase()).filter((x) => LOADERS.includes(x)),
              url: `${mod.curseforge.url}/files/${f.id}`, platform: "curseforge",
              curseforgeModId: mod.curseforge.id, curseforgeFileId: f.id,
              type: f.releaseType === 2 ? "beta" : f.releaseType === 3 ? "alpha" : "release",
            });
          }
        }
      } catch (e) { console.error("cf files", e); }
    } else if (mod?.curseforge?.url) {
      try {
        const id = mod.curseforge.url.split("/").pop();
        const r = await fetch(`https://api.cfwidget.com/minecraft/mc-mods/${id}`);
        if (r.ok) {
          const d = (await r.json()) as any;
          for (const f of (d.files ?? []).slice(0, 15)) {
            const tags: string[] = f.versions ?? [];
            versions.push({
              name: f.display || f.name, date: f.uploaded_at,
              gameVersions: uniqSorted(tags), loaders: tags.map((x) => x.toLowerCase()).filter((x) => LOADERS.includes(x)),
              url: f.url, platform: "curseforge", type: f.type ?? "release",
            });
          }
        }
      } catch (e) { console.error("cf versions", e); }
    }
    versions.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    return { mod, body, versions: versions.slice(0, 20) };
  });

export const getCurseForgeChangelog = createServerFn({ method: "GET" })
  .inputValidator((input: { modId: number; fileId: number }) => {
    if (!Number.isSafeInteger(input.modId) || input.modId <= 0 || !Number.isSafeInteger(input.fileId) || input.fileId <= 0) throw new Error("Invalid version");
    return input;
  })
  .handler(async ({ data }) => {
    const key = process.env["CURSEFORGE_API_KEY"];
    if (!key) return { html: null, unavailable: true };
    try {
      const headers = { "x-api-key": key, Accept: "application/json" };
      const project = await fetch(`${CF_API}/mods/${data.modId}`, { headers, signal: AbortSignal.timeout(10_000) });
      if (!project.ok) return { html: null, unavailable: true };
      const { data: mod } = await project.json() as { data: { status: number; isAvailable: boolean; authors: { id: number }[] } };
      if (mod.status !== 4 || !mod.isAvailable || !mod.authors.some(author => author.id === CF_AUTHOR_ID)) return { html: null, unavailable: true };
      const response = await fetch(`${CF_API}/mods/${data.modId}/files/${data.fileId}/changelog`, { headers, signal: AbortSignal.timeout(10_000) });
      if (!response.ok) return { html: null, unavailable: response.status !== 404 };
      const payload = await response.json() as { data?: string };
      const { cleanChangelog } = await import("./changelog");
      return { html: cleanChangelog(payload.data), unavailable: false };
    } catch { return { html: null, unavailable: true }; }
  });

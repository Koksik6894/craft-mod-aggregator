import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Dict = {
  tagline: string; total: string; mods: string; followers: string; myMods: string;
  contact: string; contactTitle: string; contactText: string; send: string;
  suggest: string; commission: string; updated: string; viewOn: string; downloads: string;
  copy: string; copied: string;
  sort: string; sortDownloads: string; sortNewest: string; sortAZ: string;
  support: string; back: string; accent: string;
};

export const LANGS: Record<string, { name: string; flag: string; t: Dict }> = {
  pl: { name: "Polski", flag: "🇵🇱", t: { tagline: "Tworzę mody do Minecrafta, które po prostu działają.", total: "Łącznie pobrań", mods: "Modów", followers: "Obserwujących", myMods: "Moje mody", contact: "Kontakt", contactTitle: "Masz pomysł na moda?", contactText: "Napisz do mnie z sugestią, zgłoszeniem błędu albo zamówieniem własnego moda.", send: "Napisz maila", suggest: "Sugestia", commission: "Zamów moda", updated: "Aktualizacja", viewOn: "Zobacz na", downloads: "pobrań", copy: "Kopiuj", copied: "Skopiowano!" } },
  en: { name: "English", flag: "🇬🇧", t: { tagline: "I build Minecraft mods that just work.", total: "Total downloads", mods: "Mods", followers: "Followers", myMods: "My mods", contact: "Contact", contactTitle: "Got a mod idea?", contactText: "Send me a suggestion, a bug report or a custom mod request.", send: "Send an email", suggest: "Suggestion", commission: "Commission a mod", updated: "Updated", viewOn: "View on", downloads: "downloads", copy: "Copy", copied: "Copied!" } },
  de: { name: "Deutsch", flag: "🇩🇪", t: { tagline: "Ich baue Minecraft-Mods, die einfach funktionieren.", total: "Downloads gesamt", mods: "Mods", followers: "Follower", myMods: "Meine Mods", contact: "Kontakt", contactTitle: "Eine Mod-Idee?", contactText: "Schick mir Vorschläge, Fehlerberichte oder Anfragen für eigene Mods.", send: "E-Mail senden", suggest: "Vorschlag", commission: "Mod beauftragen", updated: "Aktualisiert", viewOn: "Ansehen auf", downloads: "Downloads", copy: "Kopieren", copied: "Kopiert!" } },
  es: { name: "Español", flag: "🇪🇸", t: { tagline: "Creo mods de Minecraft que simplemente funcionan.", total: "Descargas totales", mods: "Mods", followers: "Seguidores", myMods: "Mis mods", contact: "Contacto", contactTitle: "¿Tienes una idea?", contactText: "Envíame sugerencias, errores o pide un mod personalizado.", send: "Enviar correo", suggest: "Sugerencia", commission: "Encargar mod", updated: "Actualizado", viewOn: "Ver en", downloads: "descargas", copy: "Copiar", copied: "¡Copiado!" } },
  fr: { name: "Français", flag: "🇫🇷", t: { tagline: "Je crée des mods Minecraft qui fonctionnent, tout simplement.", total: "Téléchargements", mods: "Mods", followers: "Abonnés", myMods: "Mes mods", contact: "Contact", contactTitle: "Une idée de mod ?", contactText: "Envoyez-moi une suggestion, un bug ou une demande de mod sur mesure.", send: "Envoyer un e-mail", suggest: "Suggestion", commission: "Commander un mod", updated: "Mis à jour", viewOn: "Voir sur", downloads: "téléchargements", copy: "Copier", copied: "Copié !" } },
  it: { name: "Italiano", flag: "🇮🇹", t: { tagline: "Creo mod per Minecraft che funzionano e basta.", total: "Download totali", mods: "Mod", followers: "Follower", myMods: "Le mie mod", contact: "Contatti", contactTitle: "Hai un'idea?", contactText: "Mandami suggerimenti, bug o richieste di mod personalizzate.", send: "Invia email", suggest: "Suggerimento", commission: "Richiedi mod", updated: "Aggiornato", viewOn: "Vedi su", downloads: "download", copy: "Copia", copied: "Copiato!" } },
  pt: { name: "Português", flag: "🇧🇷", t: { tagline: "Crio mods de Minecraft que simplesmente funcionam.", total: "Downloads totais", mods: "Mods", followers: "Seguidores", myMods: "Meus mods", contact: "Contato", contactTitle: "Tem uma ideia?", contactText: "Envie sugestões, bugs ou peça um mod personalizado.", send: "Enviar e-mail", suggest: "Sugestão", commission: "Encomendar mod", updated: "Atualizado", viewOn: "Ver no", downloads: "downloads", copy: "Copiar", copied: "Copiado!" } },
  nl: { name: "Nederlands", flag: "🇳🇱", t: { tagline: "Ik maak Minecraft-mods die gewoon werken.", total: "Totaal downloads", mods: "Mods", followers: "Volgers", myMods: "Mijn mods", contact: "Contact", contactTitle: "Een mod-idee?", contactText: "Stuur suggesties, bugs of een verzoek voor een eigen mod.", send: "E-mail sturen", suggest: "Suggestie", commission: "Mod bestellen", updated: "Bijgewerkt", viewOn: "Bekijk op", downloads: "downloads", copy: "Kopiëren", copied: "Gekopieerd!" } },
  cs: { name: "Čeština", flag: "🇨🇿", t: { tagline: "Tvořím Minecraft módy, které prostě fungují.", total: "Stažení celkem", mods: "Módů", followers: "Sledujících", myMods: "Moje módy", contact: "Kontakt", contactTitle: "Máš nápad na mód?", contactText: "Pošli návrh, chybu nebo objednávku vlastního módu.", send: "Napsat e-mail", suggest: "Návrh", commission: "Objednat mód", updated: "Aktualizace", viewOn: "Zobrazit na", downloads: "stažení", copy: "Kopírovat", copied: "Zkopírováno!" } },
  uk: { name: "Українська", flag: "🇺🇦", t: { tagline: "Я створюю моди для Minecraft, які просто працюють.", total: "Усього завантажень", mods: "Модів", followers: "Підписників", myMods: "Мої моди", contact: "Контакт", contactTitle: "Маєш ідею?", contactText: "Надішли пропозицію, баг або замов власний мод.", send: "Написати лист", suggest: "Пропозиція", commission: "Замовити мод", updated: "Оновлено", viewOn: "Дивитись на", downloads: "завантажень", copy: "Копіювати", copied: "Скопійовано!" } },
  ru: { name: "Русский", flag: "🌐", t: { tagline: "Я делаю моды для Minecraft, которые просто работают.", total: "Всего загрузок", mods: "Модов", followers: "Подписчиков", myMods: "Мои моды", contact: "Контакт", contactTitle: "Есть идея?", contactText: "Пришли предложение, баг или закажи свой мод.", send: "Написать письмо", suggest: "Предложение", commission: "Заказать мод", updated: "Обновлено", viewOn: "Смотреть на", downloads: "загрузок", copy: "Копировать", copied: "Скопировано!" } },
  tr: { name: "Türkçe", flag: "🇹🇷", t: { tagline: "Sadece çalışan Minecraft modları yapıyorum.", total: "Toplam indirme", mods: "Mod", followers: "Takipçi", myMods: "Modlarım", contact: "İletişim", contactTitle: "Bir fikrin mi var?", contactText: "Öneri, hata bildirimi ya da özel mod isteği gönder.", send: "E-posta gönder", suggest: "Öneri", commission: "Mod siparişi", updated: "Güncellendi", viewOn: "Görüntüle:", downloads: "indirme", copy: "Kopyala", copied: "Kopyalandı!" } },
  ja: { name: "日本語", flag: "🇯🇵", t: { tagline: "ちゃんと動くMinecraft MODを作っています。", total: "総ダウンロード数", mods: "MOD", followers: "フォロワー", myMods: "MOD一覧", contact: "連絡先", contactTitle: "MODのアイデアは？", contactText: "提案、バグ報告、MOD制作の依頼はこちらへ。", send: "メールを送る", suggest: "提案", commission: "制作依頼", updated: "更新", viewOn: "表示：", downloads: "DL", copy: "コピー", copied: "コピーしました" } },
  ko: { name: "한국어", flag: "🇰🇷", t: { tagline: "제대로 작동하는 마인크래프트 모드를 만듭니다.", total: "총 다운로드", mods: "모드", followers: "팔로워", myMods: "내 모드", contact: "연락처", contactTitle: "모드 아이디어가 있나요?", contactText: "제안, 버그 제보, 맞춤 모드 의뢰를 보내주세요.", send: "이메일 보내기", suggest: "제안", commission: "모드 의뢰", updated: "업데이트", viewOn: "보기:", downloads: "다운로드", copy: "복사", copied: "복사됨!" } },
  zh: { name: "中文", flag: "🇨🇳", t: { tagline: "我制作好用的 Minecraft 模组。", total: "总下载量", mods: "模组", followers: "关注者", myMods: "我的模组", contact: "联系", contactTitle: "有模组点子吗？", contactText: "欢迎发送建议、错误报告或定制模组请求。", send: "发送邮件", suggest: "建议", commission: "定制模组", updated: "更新于", viewOn: "查看于", downloads: "次下载", copy: "复制", copied: "已复制！" } },
};

// Translations for the newest features, merged over the English set when a language misses them.
const EXTRA: Record<string, Partial<Dict>> = {
  pl: { sort: "Sortuj", sortDownloads: "Najwięcej pobrań", sortNewest: "Najnowsze", sortAZ: "A–Z", support: "Wesprzyj mnie", back: "Wszystkie mody", accent: "Kolor strony" },
  en: { sort: "Sort", sortDownloads: "Most downloads", sortNewest: "Newest", sortAZ: "A–Z", support: "Support me", back: "All mods", accent: "Accent color" },
  de: { sort: "Sortieren", sortDownloads: "Meiste Downloads", sortNewest: "Neueste", sortAZ: "A–Z", support: "Unterstütze mich", back: "Alle Mods", accent: "Akzentfarbe" },
  es: { sort: "Ordenar", sortDownloads: "Más descargas", sortNewest: "Más recientes", sortAZ: "A–Z", support: "Apóyame", back: "Todos los mods", accent: "Color de acento" },
  fr: { sort: "Trier", sortDownloads: "Plus de téléchargements", sortNewest: "Plus récents", sortAZ: "A–Z", support: "Soutenez-moi", back: "Tous les mods", accent: "Couleur d'accent" },
  it: { sort: "Ordina", sortDownloads: "Più download", sortNewest: "Più recenti", sortAZ: "A–Z", support: "Sostienimi", back: "Tutte le mod", accent: "Colore d'accento" },
  pt: { sort: "Ordenar", sortDownloads: "Mais downloads", sortNewest: "Mais recentes", sortAZ: "A–Z", support: "Apoie-me", back: "Todos os mods", accent: "Cor de destaque" },
  nl: { sort: "Sorteren", sortDownloads: "Meeste downloads", sortNewest: "Nieuwste", sortAZ: "A–Z", support: "Steun mij", back: "Alle mods", accent: "Accentkleur" },
  cs: { sort: "Řadit", sortDownloads: "Nejvíc stažení", sortNewest: "Nejnovější", sortAZ: "A–Z", support: "Podpoř mě", back: "Všechny módy", accent: "Barva motivu" },
  uk: { sort: "Сортувати", sortDownloads: "Найбільше завантажень", sortNewest: "Найновіші", sortAZ: "A–Z", support: "Підтримай мене", back: "Усі моди", accent: "Колір сайту" },
  ru: { sort: "Сортировка", sortDownloads: "Больше всего загрузок", sortNewest: "Новейшие", sortAZ: "A–Z", support: "Поддержи меня", back: "Все моды", accent: "Цвет сайта" },
  tr: { sort: "Sırala", sortDownloads: "En çok indirme", sortNewest: "En yeni", sortAZ: "A–Z", support: "Bana destek ol", back: "Tüm modlar", accent: "Vurgu rengi" },
  ja: { sort: "並べ替え", sortDownloads: "DL数順", sortNewest: "新着順", sortAZ: "A–Z", support: "応援する", back: "すべてのMOD", accent: "アクセントカラー" },
  ko: { sort: "정렬", sortDownloads: "다운로드순", sortNewest: "최신순", sortAZ: "A–Z", support: "후원하기", back: "모든 모드", accent: "강조 색상" },
  zh: { sort: "排序", sortDownloads: "下载最多", sortNewest: "最新", sortAZ: "A–Z", support: "支持我", back: "所有模组", accent: "主题颜色" },
};

export const ACCENTS = [
  { id: "emerald", name: "Emerald", hex: "#3ecf6e" },
  { id: "violet", name: "Violet", hex: "#a855f7" },
  { id: "blue", name: "Blue", hex: "#3b82f6" },
  { id: "orange", name: "Orange", hex: "#f97316" },
  { id: "rose", name: "Rose", hex: "#f43f5e" },
] as const;

export const SUPPORT_URL = "https://ko-fi.com/krysztok";

type Ctx = { lang: string; setLang: (l: string) => void; t: Dict; dark: boolean; toggleDark: () => void; accent: string; setAccent: (a: string) => void };
const C = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangS] = useState("pl");
  const [dark, setDark] = useState(true);
  const [accent, setAccentS] = useState("emerald");
  useEffect(() => {
    const l = localStorage.getItem("lang");
    if (l && LANGS[l]) setLangS(l);
    else {
      const nav = navigator.language.slice(0, 2);
      if (LANGS[nav]) setLangS(nav);
    }
    setDark(localStorage.getItem("theme") !== "light");
    const a = localStorage.getItem("accent");
    if (a && ACCENTS.some((x) => x.id === a)) setAccentS(a);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: string) => { setLangS(l); localStorage.setItem("lang", l); };
  const setAccent = (a: string) => { setAccentS(a); localStorage.setItem("accent", a); };
  const toggleDark = () => setDark((d) => { localStorage.setItem("theme", d ? "light" : "dark"); return !d; });
  const t: Dict = { ...LANGS.pl!.t, ...(LANGS[lang] ?? LANGS.pl!).t, ...EXTRA.en, ...(EXTRA[lang] ?? {}) };
  return <C.Provider value={{ lang, setLang, t, dark, toggleDark, accent, setAccent }}>{children}</C.Provider>;
}

export const useApp = () => useContext(C)!;

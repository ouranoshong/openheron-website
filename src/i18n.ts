/**
 * 双语基础：语言定义与 URL 规则。
 *
 * 路由约定（默认语言英文不带前缀）：
 *   /           英文首页        /manual/...    英文手册
 *   /zh/        中文首页        /zh/manual/... 中文手册
 *
 * 手册没有独立的目录页 —— /manual 只是一条指向入口章节的地址，
 * 章节目录由各章页面左侧的侧边栏承担。
 */

export const LANGS = ['zh', 'en'] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export interface LangMeta {
  code: Lang;
  /** 语言自己的名字（母语），用于切换器 */
  label: string;
  /** html lang 属性 */
  htmlLang: string;
  /** 页头切换器上的标记 */
  short: string;
}

export const LANG_META: Record<Lang, LangMeta> = {
  zh: { code: 'zh', label: '中文', htmlLang: 'zh-CN', short: '中' },
  en: { code: 'en', label: 'English', htmlLang: 'en', short: 'EN' },
};

/**
 * 生成站内绝对路径。
 *
 * 不带尾部斜杠 —— 与 astro.config.mjs 的 `trailingSlash: 'never'` 对齐，
 * 也与 `build.format: 'file'` 的产物结构对应：
 *   /zh            → dist/zh.html
 *   /zh/manual     → dist/zh/manual.html
 *   /zh/manual/faq → dist/zh/manual/faq.html
 * 带上斜杠会触发 dev server 的重定向提示，线上也会多一跳。
 */
export function homeUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/' : `/${lang}`;
}

/**
 * 手册入口章节。
 *
 * 站点没有单独的「手册目录页」：页头的「用户手册」直接落到这一章，
 * 章节目录由章节页侧边栏列出。
 */
export const MANUAL_ENTRY_SLUG = 'first-run';

/** 手册的路径前缀（不含章节 slug）。 */
export function manualBaseUrl(lang: Lang): string {
  return lang === DEFAULT_LANG ? '/manual' : `/${lang}/manual`;
}

/**
 * 手册地址。
 *
 * 不传 slug 时给的是入口章节（第一次使用），不是目录页 —— 目录页已经没有了。
 */
export function manualUrl(lang: Lang, slug?: string): string {
  const base = manualBaseUrl(lang);
  return slug ? `${base}/${slug}` : `${base}/${MANUAL_ENTRY_SLUG}`;
}

/**
 * 把一条站内路径翻译成另一语言下的对应路径。
 * 用于语言切换器：当前在 /zh/manual/faq 时，英文版是 /manual/faq。
 *
 * 只处理已知的两种形态（前缀可有可无）：
 *   /[lang]            → 另一种语言的首页
 *   /[lang]/manual/... → 另一种语言的同名手册页
 *   /[lang]/manual     → 另一种语言的入口章节（没有目录页了）
 * 认不出来的路径原样返回（切换器就会退化成跳首页）。
 */
export function translatePath(pathname: string, target: Lang): string {
  // Astro.url.pathname 是产物路径（/zh/manual/faq.html），
  // 这里先归一成对外 URL（/zh/manual/faq）。
  const cleaned = pathname.replace(/\.html$/, '').replace(/\/+$/, '');
  const segs = cleaned.split('/').filter(Boolean);
  // 默认语言没有前缀：有前缀就剥掉，剩下的部分两种语言一致
  const rest = isLang(segs[0]) ? segs.slice(1) : segs;

  if (rest[0] !== 'manual') return homeUrl(target);
  return manualUrl(target, rest[1]);
}

/**
 * 语言切换器要渲染的两种语言。
 * order 决定切换器里前后顺序 —— 默认语言在前。
 */
export const LANG_SWITCH_ORDER: Lang[] = ['en', 'zh'];

/**
 * 从用户手册生成站内内容（双语）。
 *
 * 源是 openheron 仓库里的两本手册：
 *   docs/user-manual_zh.md  →  src/content/manual/zh/NN-<slug>.md
 *   docs/user-manual.md     →  src/content/manual/en/NN-<slug>.md
 *
 * 想用 openheron 仓库里的最新版，跑一次：
 *   OPENHERON_REPO=../openheron npm run build
 * astro build / dev 前自动跑一遍（见 package.json 的 prebuild）。
 *
 * 站内只呈现「使用说明」：用户手册原文按章拆页。
 * 手册里指向其它设计分册的链接（architecture.md 等）会降级为纯文本 ——
 * 那些是设计细节，本站不展示，也不留死链。
 *
 * 产出：src/content/manual/{zh,en}/<NN>-<slug>.md
 */

import fs from 'node:fs';
import path from 'node:path';

const SITE_ROOT = path.resolve(import.meta.dirname, '..');
const REPO_ROOT = process.env.OPENHERON_REPO ?? path.resolve(SITE_ROOT, '../openheron');
const OUT_DIR = path.join(SITE_ROOT, 'src/content/manual');

/**
 * 语言表。
 * 每个语言对应：手册源文件、输出目录、以及该语言下章节号 → URL slug 的映射。
 *
 * slug 两种语言共用一套 —— 同一章在两个语言下是同一个 URL 尾巴，
 * 语言前缀（/zh/）区分，默认语言英文不带前缀。这样中英对照链接可以按 slug 拼。
 */
const LANGS = [
  {
    code: 'zh',
    label: '中文',
    source: path.join(REPO_ROOT, 'docs/user-manual_zh.md'),
    /** 中文手册的章节号 → slug（与 openheron 仓库保持一致） */
    slugs: {
      1: 'installation',
      2: 'first-run',
      3: 'config-root',
      4: 'configuration',
      5: 'multi-agent',
      6: 'interface',
      7: 'knowledge-base',
      8: 'commands',
      9: 'http-api',
      10: 'faq',
    },
  },
  {
    code: 'en',
    label: 'English',
    source: path.join(REPO_ROOT, 'docs/user-manual.md'),
    slugs: {
      1: 'installation',
      2: 'first-run',
      3: 'config-root',
      4: 'configuration',
      5: 'multi-agent',
      6: 'interface',
      7: 'knowledge-base',
      8: 'commands',
      9: 'http-api',
      10: 'faq',
    },
  },
];

/** 上游文档自己写错的页内锚点（标题改过、目录没同步），构建期修正。 */
const STALE_ANCHORS = {
  'agent-design.md': {
    '#163-c-文件结构每个文件回答一个问题': '#c-文件结构每个文件回答一个问题',
  },
  'agent-design-v2.md': {
    '#8-落地记录待回填': '#8-落地记录2026-10-21',
  },
};

/**
 * 降级链接：
 *  - 指向其它设计分册的（architecture.md 等）→ 纯文本，本站不展示设计细节；
 *  - 指向源码文件的（../config/load.go）→ 纯文本；
 *  - 页内锚点 → 保留，必要时按 STALE_ANCHORS 修正；
 *  - 跨语言的同章链接（user-manual.md / user-manual_zh.md）→ 换成站内对应语言的 URL；
 *  - 代码块里的内容一律不动（里面常有 Go 签名被误匹配）。
 */
function rewriteLinks(body, docFile, lang) {
  const out = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }

    out.push(
      line.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label, target) => {
        if (/^(https?:|mailto:)/.test(target)) return whole;

        // 页内锚点
        if (target.startsWith('#')) {
          const fixes = STALE_ANCHORS[docFile];
          return fixes?.[target] ? `](${fixes[target]})` : whole;
        }

        // 跨语言手册链接 → 站内 URL。
        // 手稿原文里写的是同级的 user-manual.md / user-manual_zh.md，
        // 但那两本手册没有被拆章编号，站内对应的是「同章同 slug」那一页。
        const crossLang = target.match(/^user-manual(_zh)?\.md$/);
        if (crossLang) {
          const other = crossLang[1] ? 'zh' : 'en';
          return `](/${other}/manual/)`;
        }

        // 其它分册 / 源码文件：降级为纯文本
        return label;
      }),
    );
  }

  return out.join('\n');
}

/**
 * 上游英文手册里还留着几行没翻的示例（§4.1 的 agent 提示词）。
 * 在本站补上译文 —— 不改上游仓库，等上游补好后删掉这段即可。
 */
const EN_PATCHES = [
  {
    from: [
      '你是执行 Agent。收到任务后：',
      '1. 先读相关文件',
      '2. 按任务单逐项修改',
      '3. 改完跑一遍测试，把失败项原样贴出来',
    ],
    to: [
      'You are the executing agent. Once you receive a task:',
      '1. Read the relevant files first',
      '2. Work through the task order item by item',
      '3. Run the tests afterwards and paste the failures verbatim',
    ],
  },
];

function applyPatches(body, lang) {
  if (lang !== 'en') return body;
  let out = body;
  for (const patch of EN_PATCHES) {
    const from = patch.from.join('\n');
    if (out.includes(from)) out = out.replace(from, patch.to.join('\n'));
  }
  return out;
}

/** 标题层级上移一级：章标题在页面里是 h1，章内小节就应该是 h2。 */
function shiftHeadingDepth(text) {
  return text.replace(/^(#{3,})\s+/gm, (_, hashes) => `${hashes.slice(1)} `);
}

/** 拆章：收集每个「## N. 」标题的起止行。 */
function splitChapters(lines) {
  const starts = [];
  lines.forEach((line, i) => {
    const m = /^##\s+(\d+)\.\s+(.+?)\s*$/.exec(line);
    if (m) starts.push({ index: i, no: m[1], title: m[2] });
  });
  return starts;
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });

const summary = [];

for (const lang of LANGS) {
  const { code, label, source, slugs } = lang;

  if (!fs.existsSync(source)) {
    // 源文件不在（比如只克隆了本站仓库，openheron 仓库不在旁边）——
    // 如果已有生成好的内容就继续用，别让构建挂掉。
    const langDir = path.join(OUT_DIR, code);
    const hasGenerated =
      fs.existsSync(langDir) && fs.readdirSync(langDir).some((f) => f.endsWith('.md'));
    if (hasGenerated) {
      console.warn(`[build-content] 找不到 ${label} 源文件 ${source}，沿用仓库内已有的生成内容。`);
      continue;
    }
    console.error(`[build-content] 找不到 ${label} 源文件：${source}`);
    console.error(
      `[build-content] 请确认 ${path.relative(SITE_ROOT, source)} 存在，或用 OPENHERON_REPO 指定 openheron 仓库路径。`,
    );
    process.exit(1);
  }

  const text = fs.readFileSync(source, 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const starts = splitChapters(lines);

  if (starts.length === 0) {
    console.error(`[build-content] ${label} 源文件没有找到「## N.」章节标题，源文件格式可能变了`);
    process.exit(1);
  }

  const langDir = path.join(OUT_DIR, code);
  fs.mkdirSync(langDir, { recursive: true });

  const written = [];

  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
    const slug = slugs[start.no];
    if (!slug) continue;

    let body = lines.slice(start.index + 1, end).join('\n');
    body = body.replace(/\n-{3,}\s*$/, '').replace(/^\s*-{3,}\s*\n/, '');
    body = rewriteLinks(body, path.basename(source), code);
    body = applyPatches(body, code);
    body = shiftHeadingDepth(body).trim();

    // frontmatter 里不用 `slug` 字段：Astro 的 glob loader 会用它覆盖条目 id，
    // 而中英同名章节会让 id 冲突（loader 要求 slug 全局唯一）。
    // 改用 `chapterSlug` 存语言无关的语义 slug —— 同一章在两种语言下 slug 相同。
    // 唯一性由文件名（zh-01-… / en-01-…）保证。
    const file = path.join(langDir, `${code}-${String(i + 1).padStart(2, '0')}-${slug}.md`);
    fs.writeFileSync(
      file,
      [
        '---',
        `title: ${JSON.stringify(start.title)}`,
        `chapter: ${JSON.stringify(start.no)}`,
        `order: ${i + 1}`,
        `chapterSlug: ${JSON.stringify(slug)}`,
        `lang: ${JSON.stringify(code)}`,
        'kind: "manual-chapter"',
        `sourceFile: ${JSON.stringify(path.basename(source))}`,
        '---',
        '',
        body,
        '',
      ].join('\n'),
    );
    written.push({ file: path.basename(file), title: start.title });
  }

  summary.push({ label, code, count: written.length, written });
}

console.log(`[build-content] 源目录 ${path.relative(SITE_ROOT, REPO_ROOT)}`);
for (const s of summary) {
  console.log(`[build-content] ${s.label} (${s.code}/): 拆出 ${s.count} 章`);
  s.written.forEach((w) => console.log(`  ${w.file.padEnd(26)} ${w.title}`));
}

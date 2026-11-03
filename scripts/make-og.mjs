/**
 * 生成社交分享图 public/og.png（1200×630，标准 OG 比例）。
 *
 * 用 SVG 精确排版再转 PNG —— 文案、中英切换都由参数控制，
 * 不依赖任何图像生成模型（模型渲染中文不可靠）。
 *
 * 用法：
 *   node scripts/make-og.mjs            # 生成默认（中文）版本
 *   node scripts/make-og.mjs en         # 生成英文版本 → public/og.en.png
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE_ROOT = path.resolve(import.meta.dirname, '..');
const BRAND = path.join(SITE_ROOT, 'public/brand/heron-mark.svg');

const lang = process.argv[2] === 'en' ? 'en' : 'zh';
const outPath =
  lang === 'en' ? path.join(SITE_ROOT, 'public/og.en.png') : path.join(SITE_ROOT, 'public/og.png');

const W = 1200;
const H = 630;

const COPY = {
  zh: {
    name: 'openheron',
    headline: ['Agent 即工具', '多 Agent 运行时'],
    lead: '专家配专模，工具即隔离 —— token 花在真正需要它的地方',
    motto: '持久等待 · 瞬间出手 · 人机共治',
    alt: 'openheron —— 多 Agent 运行时',
  },
  en: {
    name: 'openheron',
    headline: ['Agent-as-tool', 'multi-agent runtime'],
    lead: 'Expert models, bounded isolation — tokens spent where they matter',
    motto: 'Persistent wait · Instant strike · Governed together',
    alt: 'openheron — a multi-agent runtime',
  },
};

const t = COPY[lang];

// 品牌标识：从 SVG 里抽出图形，嵌进 1200×630 画布
const brandSvg = fs.readFileSync(BRAND, 'utf8');
const brandInner = brandSvg
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  // 渐变/遮罩的 id 在 SVG 内联时要避免与页面其它 id 冲突
  .replace(/id="heronBrand"/g, 'id="ogBrand"')
  .replace(/id="heronBody"/g, 'id="ogBody"')
  .replace(/id="heronHalo"/g, 'id="ogHalo"')
  .replace(/url\(#heronBrand\)/g, 'url(#ogBrand)')
  .replace(/url\(#heronBody\)/g, 'url(#ogBody)')
  .replace(/url\(#heronHalo\)/g, 'url(#ogHalo)');

const MARK_SIZE = 150;
const MARK_X = (W - MARK_SIZE) / 2;
const MARK_Y = 78;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="ogGlow" cx="50%" cy="26%" r="42%">
      <stop offset="0%" stop-color="#7e14ff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#040319" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ogAccent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#dcfd35"/>
      <stop offset="100%" stop-color="#8fe3ff"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#040319"/>
  <rect width="${W}" height="${H}" fill="url(#ogGlow)"/>

  <g transform="translate(${MARK_X} ${MARK_Y}) scale(${MARK_SIZE / 48})">
    ${brandInner}
  </g>

  <!-- 品牌名 -->
  <text x="${W / 2}" y="330" text-anchor="middle"
        font-family="Questrial, Helvetica, Arial, sans-serif"
        font-size="72" font-weight="700" fill="#eeeeee" letter-spacing="-1">${t.name}</text>

  <!-- 定位语 -->
  <text x="${W / 2}" y="410" text-anchor="middle"
        font-family="Questrial, Helvetica, Arial, sans-serif"
        font-size="46" fill="url(#ogAccent)">${t.headline[0]}</text>
  <text x="${W / 2}" y="466" text-anchor="middle"
        font-family="Questrial, Helvetica, Arial, sans-serif"
        font-size="46" fill="#eeeeee">${t.headline[1]}</text>

  <!-- 副标题 -->
  <text x="${W / 2}" y="522" text-anchor="middle"
        font-family="Noto Sans CJK SC, PingFang SC, Microsoft YaHei, sans-serif"
        font-size="23" fill="#949494">${t.lead}</text>

  <!-- 底部标语 -->
  <text x="${W / 2}" y="576" text-anchor="middle"
        font-family="Noto Sans CJK SC, PingFang SC, Microsoft YaHei, sans-serif"
        font-size="19" fill="#5a5a6e" letter-spacing="1">${t.motto}</text>
</svg>`;

const tmp = path.join(SITE_ROOT, `.og-${lang}.svg`);
fs.writeFileSync(tmp, svg, 'utf8');

await sharp(Buffer.from(svg), { density: 144 })
  .resize(W, H)
  .png({ quality: 92 })
  .toFile(outPath);

fs.unlinkSync(tmp);

console.log(`[make-og] ${lang} → ${path.relative(SITE_ROOT, outPath)}`);

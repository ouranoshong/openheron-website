/**
 * 准备桌面版安装包：把 openheron-desktop 的构建产物拷进 public/downloads/，
 * 并写一份实测出来的元数据（版本 / 大小 / sha256）到 public/downloads/desktop.json。
 *
 * 为什么要有这一步：
 *  - 页面上的版本号、大小、校验和必须和实际文件一致 ⇒ 全部构建时实测，
 *    不写死在模板里；
 *  - 安装包不入库（15 MB + 18 MB × 每个版本会把仓库撑大），所以每次构建都重新取；
 *  - 取不到就当「没有安装包」：写 available:false，页面不显示下载入口，
 *    构建照常通过 —— 一个可选附件不该把整个站点拖垮。
 *
 * 来源：相邻仓库 openheron-desktop 的构建产物
 * （../openheron-desktop/dist/windows 与 ../openheron-desktop/dist/linux），
 * 可用环境变量 DESKTOP_DIST / DESKTOP_DIST_LINUX 分别覆盖。
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(SITE_ROOT, 'public', 'downloads');
const META_FILE = 'desktop.json';
const CHECKSUMS_FILE = 'SHA256SUMS.txt';

/** 桌面版的两个发行平台 —— 页面按这个顺序显示。 */
const PLATFORMS = [
  {
    id: 'windows-amd64',
    label: 'Windows x64',
    // 安装包：Inno Setup 的 .exe
    fileRe: /^openheron-desktop-(.+)-windows-amd64-setup\.exe$/,
    srcDir: process.env.DESKTOP_DIST
      ? path.resolve(process.env.DESKTOP_DIST)
      : path.resolve(SITE_ROOT, '..', 'openheron-desktop', 'dist', 'windows'),
  },
  {
    id: 'linux-amd64',
    label: 'Linux x64 · AppImage',
    // AppImage：自包含归档，没有「安装」这一步
    fileRe: /^openheron-desktop-(.+)-linux-amd64\.AppImage$/,
    srcDir: process.env.DESKTOP_DIST_LINUX
      ? path.resolve(process.env.DESKTOP_DIST_LINUX)
      : path.resolve(SITE_ROOT, '..', 'openheron-desktop', 'dist', 'linux'),
  },
];

/** 文件名里的版本号，形如 v0.2.4 */
function versionOf(fileName, re) {
  const m = re.exec(fileName);
  return m ? m[1] : null;
}

/** 版本比较：按数字逐段比，不是字符串比（否则 v1.0.10 会输给 v1.0.3）。 */
function compareVersions(a, b) {
  const pa = a.replace(/^v/, '').split('.').map((n) => Number(n) || 0);
  const pb = b.replace(/^v/, '').split('.').map((n) => Number(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function sha256Of(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function humanSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * 构建日期取**本地日期**，不用 toISOString（那是 UTC）——
 * 产物在本地时间 11-22 凌晨打的，UTC 会写成 11-21，页面上看着像前一天。
 */
function buildDate(file) {
  const d = fs.statSync(file).mtime;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 清掉上一轮留下的旧产物（只认自己拷的那两类文件，不碰目录里的其他东西）。 */
function clearStale(keep) {
  if (!fs.existsSync(OUT_DIR)) return;
  for (const name of fs.readdirSync(OUT_DIR)) {
    const mine = PLATFORMS.some((p) => p.fileRe.test(name));
    if (mine && !keep.includes(name)) {
      fs.rmSync(path.join(OUT_DIR, name));
      console.log(`[prepare-downloads] 清掉旧安装包 ${name}`);
    }
  }
}

function writeMeta(meta) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, META_FILE), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
}

/**
 * 校验和清单：把两个平台的条目**合并**成一份。
 *
 * 上游每个 dist 目录各有一份 SHA256SUMS.txt（各含一行）。
 * 站点只有一处下载入口 ⇒ 合并成一份，两个平台都在里面，
 * 用户 `sha256sum -c SHA256SUMS.txt` 一条命令就能全验上。
 * 写的是**实测出来的**哈希，与上游清单一致 —— 差一个字节这里就会对不上。
 */
function writeChecksums(packages) {
  const file = path.join(OUT_DIR, CHECKSUMS_FILE);
  if (!packages.length) {
    fs.rmSync(file, { force: true });
    return null;
  }
  const body = packages.map((p) => `${p.sha256}  ${p.file}`).join('\n');
  fs.writeFileSync(file, `${body}\n`, 'utf8');
  return `/downloads/${CHECKSUMS_FILE}`;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const packages = [];
  const keep = [];

  for (const platform of PLATFORMS) {
    const found = fs.existsSync(platform.srcDir)
      ? fs.readdirSync(platform.srcDir).filter((f) => platform.fileRe.test(f))
      : [];

    if (!found.length) {
      console.warn(
        `[prepare-downloads] ${platform.id}：没找到产物（来源：${platform.srcDir}）—— 这一栏不显示。`,
      );
      continue;
    }

    // 版本最高的那个
    found.sort((a, b) => compareVersions(versionOf(a, platform.fileRe), versionOf(b, platform.fileRe)));
    const file = found[found.length - 1];
    const version = versionOf(file, platform.fileRe);
    const src = path.join(platform.srcDir, file);

    fs.copyFileSync(src, path.join(OUT_DIR, file));
    keep.push(file);

    const size = fs.statSync(src).size;
    packages.push({
      platform: platform.id,
      platformLabel: platform.label,
      version,
      file,
      url: `/downloads/${file}`,
      size,
      sizeText: humanSize(size),
      sha256: sha256Of(src),
      builtAt: buildDate(src),
    });

    console.log(
      `[prepare-downloads] ${platform.id} · ${file} · ${humanSize(size)} · sha256 ${packages.at(-1).sha256.slice(0, 16)}…`,
    );
  }

  clearStale(keep);

  if (!packages.length) {
    writeMeta({
      available: false,
      reason: 'no-packages',
      sources: PLATFORMS.map((p) => p.srcDir),
    });
    writeChecksums([]);
    console.warn('[prepare-downloads] 一个平台都没有 —— 页面不显示下载入口。');
    return;
  }

  // 顶层版本号 = 各平台里最高的那个（页面标题上显示的那一个）
  const top = packages.reduce((a, b) => (compareVersions(a.version, b.version) >= 0 ? a : b));

  writeMeta({
    available: true,
    version: top.version,
    packages,
    checksumsUrl: writeChecksums(packages),
  });
}

main();

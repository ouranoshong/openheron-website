/**
 * 桌面版安装包的元数据：构建时实测写进 public/downloads/desktop.json，
 * 页面在**构建期**读它。
 *
 * 为什么是构建期读、而不是运行时拉：
 *  - 版本号、大小、sha256 必须和磁盘上那个文件一致 —— 同一份数据两处渲染，
 *    不会一个地方写着 v0.2.4、另一个地方写着 v1.0.3；
 *  - 取不到就当「没有安装包」：整块不显示 —— 宁可没有入口，也不要一个点不动的链接。
 *
 * 写入方是 scripts/prepare-downloads.mjs。
 */

import fs from 'node:fs';
import path from 'node:path';

export interface DesktopPackage {
  platform: string;
  platformLabel: string;
  version: string;
  file: string;
  url: string;
  size: number;
  sizeText: string;
  sha256: string;
  builtAt: string;
}

export interface DesktopMeta {
  available: boolean;
  version: string;
  packages: DesktopPackage[];
  checksumsUrl: string | null;
}

/**
 * 读一份元数据；文件不在、JSON 坏了、或文件本身不在磁盘上，都返回 null。
 *
 * 再查一次文件是否存在是有必要的：元数据是构建期写的，
 * 而 public/downloads/ 不入库 —— 换一台机器构建时可能没有产物，
 * 那时 json 还在（或者被写过 available:false），但 exe 并不在。
 */
export function readDesktopMeta(): DesktopMeta | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'downloads');
    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'desktop.json'), 'utf8')) as DesktopMeta;
    if (!meta?.available) return null;

    const packages = (meta.packages ?? []).filter((p) => fs.existsSync(path.join(dir, p.file)));
    if (!packages.length) return null;

    return { ...meta, packages };
  } catch {
    return null;
  }
}

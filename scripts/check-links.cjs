/**
 * 站内链接自检：遍历 dist 里所有页面，校验每一个 href/src。
 *
 *  - 相对/绝对路径要能落到某个实际文件；
 *  - 带 #fragment 的要能在目标页面找到对应 id；
 *  - fragment 按浏览器规则先 percent-decode 再比对（中文锚点在源码里常写成编码形式）。
 */

const fs = require('node:fs');
const path = require('node:path');

const dist = 'dist';
const pages = [];

(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) pages.push(p);
  }
})(dist);

const ids = new Map();
for (const p of pages) {
  ids.set(
    p,
    new Set([...fs.readFileSync(p, 'utf8').matchAll(/id="([^"]+)"/g)].map((m) => m[1])),
  );
}

const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

let broken = 0;
let checked = 0;
const report = [];

for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  const from = path.relative(dist, p);

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    checked++;

    const [rawPath, frag] = url.split('#');

    if (!rawPath) {
      if (frag && !ids.get(p).has(decode(frag))) {
        report.push(`锚点不存在  ${from}  →  #${frag}`);
        broken++;
      }
      continue;
    }

    // 站内 URL 不带尾部斜杠（/zh/manual/commands），
    // 产物是 build.format: 'file' 的扁平结构（zh/manual/commands.html）。
    // 去掉尾部斜杠再拼候选，两种写法都能命中。
    const cleanPath = rawPath.replace(/\/+$/, '');
    const target = cleanPath.startsWith('/')
      ? path.join(dist, cleanPath)
      : path.join(path.dirname(p), cleanPath);
    const candidates = [
      target,
      `${target}.html`,
      path.join(target, 'index.html'),
      // 目录式 URL 在 file 格式下映射到 <dir>.html
      `${target}.html`.replace(/\/([^/]+)$/, '/$1.html'),
    ];
    const found = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());

    if (!found) {
      report.push(`页面不存在  ${from}  →  ${url}`);
      broken++;
      continue;
    }

    if (frag) {
      // found 已经是实际存在的文件；但 file 格式下目录式 URL 落到 <name>.html，
      // 找 id 时要确认拿到的是同一个文件。
      const idFile = found.endsWith('.html') ? found : null;
      const targetIds = idFile ? (ids.get(idFile) ?? new Set()) : new Set();
      if (!targetIds.has(decode(frag))) {
        report.push(`锚点不存在  ${from}  →  ${url}`);
        broken++;
      }
    }
  }
}

report.slice(0, 25).forEach((r) => console.log(r));
if (report.length > 25) console.log(`… 其余 ${report.length - 25} 条`);
console.log(`\n页面 ${pages.length} 个 · 检查引用 ${checked} 条 · 问题 ${broken} 条`);
process.exit(broken ? 1 : 0);

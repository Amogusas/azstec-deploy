/* ------------------------------------------------------------------
   Сборка папки .deploy для публикации на Cloudflare Pages.

   Копирует только файлы сайта, исключая служебные/секретные:
   opencode.json, opencode.txt, .netlify, tools/, документацию и т.п.
   Запуск:  node tools/build-deploy.js
------------------------------------------------------------------ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.deploy');

/* Папки, которые не копируем вообще */
const SKIP_DIRS = new Set(['.deploy', '.netlify', '.git', '.wrangler', 'node_modules', 'tools', '.opencode']);

/* Файлы в корне, которые не публикуем (секреты и служебное) */
const SKIP_ROOT_FILES = new Set([
  'opencode.json', 'opencode.txt', '.gitignore',
  'deploy-cloudflare.bat', 'package.json', 'package-lock.json'
]);

function shouldSkipFile(rel, name) {
  if (name === '.nojekyll') return false;              // нужен GitHub Pages
  if (rel === '' && SKIP_ROOT_FILES.has(name)) return true;
  if (/^DEPLOY.*\.md$/i.test(name)) return true;      // инструкции
  if (/^\./.test(name)) return true;                   // служебные (кроме .nojekyll — выше)
  if (/\.(md|bat|log)$/i.test(name) && rel === '') return true;
  return false;
}

function copyDir(src, dest, rel) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const name = e.name;
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(name) || /^\./.test(name)) continue;   // все служебные папки (.github и т.п.)
      copyDir(s, d, rel ? rel + '/' + name : name);
    } else {
      if (shouldSkipFile(rel, name)) continue;
      fs.copyFileSync(s, d);
    }
  }
}

/* Чистим и пересобираем */
fs.rmSync(OUT, { recursive: true, force: true });
copyDir(ROOT, OUT, '');

/* Отчёт */
let files = 0, bytes = 0;
(function count(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) count(p);
    else { files++; bytes += fs.statSync(p).size; }
  }
})(OUT);

console.log('Папка .deploy готова.');
console.log('  файлов:', files, '| размер:', (bytes / 1048576).toFixed(1), 'МБ');
console.log('  исключено: opencode.json (содержит API-ключ), opencode.txt, .netlify и служебные файлы');

// 把整个应用打包成一个可以双击打开的 HTML 文件（不依赖本地服务器）
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

function loadEsbuild() {
  const require = createRequire(import.meta.url)
  try {
    return require('esbuild')
  } catch (err) { /* 继续找 pnpm 目录 */ }
  const pnpm = join(root, 'node_modules', '.pnpm')
  if (existsSync(pnpm)) {
    for (const dir of readdirSync(pnpm)) {
      if (dir.startsWith('esbuild@')) {
        const p = join(pnpm, dir, 'node_modules', 'esbuild')
        if (existsSync(p)) return createRequire(join(p, 'package.json'))('esbuild')
      }
    }
  }
  throw new Error('找不到 esbuild，请先运行 npm install')
}

const esbuild = loadEsbuild()
const outDir = join(root, 'standalone')
const tmpDir = join(outDir, '.tmp')
mkdirSync(tmpDir, { recursive: true })

await esbuild.build({
  entryPoints: [join(root, 'src', 'main.jsx')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2019'],
  minify: true,
  jsx: 'automatic',
  loader: { '.jsx': 'jsx', '.css': 'css' },
  define: {
    'import.meta.env.PROD': 'false',
    'process.env.NODE_ENV': '"production"'
  },
  outfile: join(tmpDir, 'app.js'),
  logLevel: 'warning'
})

const js = readFileSync(join(tmpDir, 'app.js'), 'utf8')
const cssPath = join(tmpDir, 'app.css')
const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : ''

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#faf6ef" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="今天拍什么" />
    <title>今天拍什么？</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root">
      <div style="padding:40px 20px;text-align:center;font-family:-apple-system,sans-serif;color:#8b8f98">
        正在打开《今天拍什么？》…
      </div>
    </div>
    <noscript>需要开启 JavaScript 才能使用这个应用。</noscript>
    <script>${js}</script>
  </body>
</html>
`

const outFile = join(outDir, '今天拍什么-单文件版.html')
writeFileSync(outFile, html)
console.log('已生成:', outFile, Math.round(html.length / 1024) + 'KB')

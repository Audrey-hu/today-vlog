import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'

let sharp = null
try {
  if (process.env.WSSIT_RUNTIME_NODE_MODULES) {
    const require = createRequire(process.env.WSSIT_RUNTIME_NODE_MODULES + '/package.json')
    sharp = require('sharp')
  } else {
    const require = createRequire(import.meta.url)
    sharp = require('sharp')
  }
} catch (err) {
  console.warn('sharp 不可用，跳过图标生成（public/ 已有现成图标）')
  process.exit(0)
}

const out = new URL('../public/', import.meta.url).pathname
await mkdir(out, { recursive: true })

async function icon(size, safe = 0.84) {
  const pad = Math.round(size * (1 - safe) / 2)
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#262a30"/>
    <rect x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size - pad * 2}" rx="${Math.round((size - pad * 2) * 0.2)}" fill="#faf6ef"/>
    <rect x="${Math.round(size * 0.24)}" y="${Math.round(size * 0.27)}" width="${Math.round(size * 0.52)}" height="${Math.round(size * 0.38)}" rx="${Math.round(size * 0.07)}" fill="#fffdf8" stroke="#262a30" stroke-width="${Math.max(2, Math.round(size * 0.018))}"/>
    <circle cx="${Math.round(size * 0.5)}" cy="${Math.round(size * 0.46)}" r="${Math.round(size * 0.11)}" fill="#262a30"/>
    <circle cx="${Math.round(size * 0.64)}" cy="${Math.round(size * 0.39)}" r="${Math.round(size * 0.035)}" fill="#e8893b"/>
    <rect x="${Math.round(size * 0.3)}" y="${Math.round(size * 0.76)}" width="${Math.round(size * 0.4)}" height="${Math.round(size * 0.035)}" rx="${Math.round(size * 0.018)}" fill="#2f9e6e"/>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

const sizes = [
  ['icon-192.png', 192, 0.9],
  ['icon-512.png', 512, 0.9],
  ['icon-maskable-512.png', 512, 0.72],
  ['apple-touch-icon.png', 180, 0.9]
]

for (const [name, size, safe] of sizes) {
  await sharp(await icon(size, safe)).toFile(out + name)
  console.log('wrote', name)
}

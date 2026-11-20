#!/usr/bin/env node
/**
 * Mushaf sayfa fontlarını indirir (R2'ye yüklenmek üzere).
 *
 * 604 sayfa × iki hat. ÖLÇÜLDÜ: V2 ~75 MB, V1 ~38 MB — git deposuna
 * girmez. İndirilen ağaç CDN'de görünecek yolun birebir aynısıdır:
 *
 *   <out>/mushaf/hafs/v2/woff2/p42.woff2
 *     → https://cdn.alaturkavakitler.com/mushaf/hafs/v2/woff2/p42.woff2
 *
 * Çalışma zamanında `VITE_MUSHAF_FONT_BASE` bu ağacın köküne
 * (`https://cdn.alaturkavakitler.com/mushaf`) ayarlanır; tanımlı
 * değilse uygulama yayıncının CDN'ine düşer, yani ayna kurulmadan da
 * çalışmaya devam eder.
 *
 * Kullanım:
 *   node scripts/mirror-mushaf-fonts.js --out /media/abdullah/F929-FA97/alaturka
 *   node scripts/mirror-mushaf-fonts.js --out <dizin> --script v2
 *   node scripts/mirror-mushaf-fonts.js --out <dizin> --limit 3   # deneme
 */
import { mkdirSync, createWriteStream, existsSync, statSync, renameSync, unlinkSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const CDN = 'https://static.qurancdn.com/fonts/quran'
const DIRS = { v1: 'hafs/v1', v2: 'hafs/v2' }
const PAGES = 604
/** Sure adı süslemesi: tek dosya, sayfalardan bağımsız. */
const EXTRA = [['surah-names/v1/sura_names.woff2', 'surah-names/v1/sura_names.woff2']]

function args(argv) {
  const out = { out: '.mirror', scripts: ['v1', 'v2'], limit: PAGES }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') out.out = argv[++i]
    else if (argv[i] === '--script') out.scripts = [argv[++i]]
    // Deneme için: yalnızca ilk N sayfa.
    else if (argv[i] === '--limit') out.limit = Number(argv[++i])
  }
  return out
}

const opt = args(process.argv.slice(2))
const root = `${opt.out.replace(/\/$/, '')}/mushaf`

let ok = 0
let skip = 0
let fail = 0
let bytes = 0

async function grab(tail) {
  const dest = `${root}/${tail}`
  if (existsSync(dest) && statSync(dest).size > 0) { skip++; return }
  mkdirSync(dest.slice(0, dest.lastIndexOf('/')), { recursive: true })
  const tmp = `${dest}.part`
  try {
    const res = await fetch(`${CDN}/${tail}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp))
    renameSync(tmp, dest)
    bytes += statSync(dest).size
    ok++
  } catch (e) {
    fail++
    try { if (existsSync(tmp)) unlinkSync(tmp) } catch { /* yoksay */ }
    console.error(`\n${tail}: ${e.message}`)
  }
}

for (const [, tail] of EXTRA) await grab(tail)

for (const id of opt.scripts) {
  const dir = DIRS[id]
  if (!dir) { console.error(`bilinmeyen hat: ${id}`); continue }
  // Aynı anda altı istek: CDN'i yormadan 604 dosyayı makul sürede alır.
  const queue = Array.from({ length: Math.min(opt.limit, PAGES) }, (_, i) => i + 1)
  const worker = async () => {
    while (queue.length) {
      const p = queue.shift()
      await grab(`${dir}/woff2/p${p}.woff2`)
      process.stderr.write(`\r${id} · indirilen ${ok}, atlanan ${skip}, hata ${fail}, ${(bytes / 1048576).toFixed(0)} MB   `)
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))
  process.stderr.write('\n')
}

console.error(`bitti — indirilen ${ok}, atlanan ${skip}, hata ${fail}, toplam ${(bytes / 1048576).toFixed(0)} MB`)
console.error(`yükleme:  rclone copy ${root} r2:alaturkavakitler-assets/mushaf`)

#!/usr/bin/env node
/**
 * Kârî kayıtlarının bir kopyasını indirir (R2'ye yüklenmek üzere).
 *
 * Dosyalar REPOYA GİRMEZ — bir hatim ~1 GB eder. Hedef dizin `--out`
 * ile verilir; indirilen ağaç **CDN'de görünecek yolun birebir aynısı**
 * olur, böylece yükleme tek bir dizin kopyalamaya iner ve kod tarafında
 * tahmin yürütülmez:
 *
 *   <out>/ses/<kari>/036.mp3   →   https://cdn.alaturkavakitler.com/ses/<kari>/036.mp3
 *
 * Yayıncıların kendi yol düzenleri birbirini tutmuyor (kimi
 * `abdul_basit_murattal/036.mp3`, kimi `saud_ash-shuraym/murattal/036.mp3`);
 * aynada tek düzen var.
 *
 * Kullanım:
 *   node scripts/mirror-recitations.js --out /media/abdullah/F929-FA97/alaturka
 *   node scripts/mirror-recitations.js --out <dizin> --reciter husary
 *   node scripts/mirror-recitations.js --out <dizin> --reciter husary --surah 36 55
 *   node scripts/mirror-recitations.js --out <dizin> --mode ayet --reciter husary
 *
 * `--mode sure` (varsayılan) sure başına tek dosya indirir — baştan sona
 * dinlemek için. `--mode ayet` ayet başına tek dosya indirir (everyayah):
 * mukabele düzeni, okunan ayeti vurgulamak için AYRI ZAMAN DAMGASI
 * GEREKTİRMEZ, çünkü dosya sınırı zaten ayet sınırıdır. Ölçüldü: bir
 * kârînin tamamı ~976 MB (6236 dosya).
 *
 * Yarıda kesilirse aynı komut kaldığı yerden devam eder: var olan ve
 * boyutu sıfırdan büyük dosyalar atlanır.
 */
import { mkdirSync, createWriteStream, existsSync, statSync, renameSync, unlinkSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { RECITERS, sourceFile } from '../src/data/reciters.js'
import { SURAHS } from '../src/data/kuranMeta.js'

const EVERYAYAH = 'https://everyayah.com/data/'
const VERSES_OF = new Map(SURAHS.map((s) => [s.id, s.verses]))

function args(argv) {
  const out = { out: '.mirror', reciter: null, surah: [], mode: 'sure' }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') out.out = argv[++i]
    else if (argv[i] === '--reciter') out.reciter = argv[++i]
    // 'sure' = sure başına tek dosya, 'ayet' = ayet başına tek dosya
    else if (argv[i] === '--mode') out.mode = argv[++i]
    else if (argv[i] === '--surah') while (argv[i + 1] && !argv[i + 1].startsWith('--')) out.surah.push(Number(argv[++i]))
  }
  return out
}

const opt = args(process.argv.slice(2))
const pad = (n) => String(n).padStart(3, '0')

const chosen = opt.reciter ? RECITERS.filter((r) => r.id === opt.reciter) : RECITERS
if (!chosen.length) {
  console.error(`Kârî bulunamadı: ${opt.reciter}\nSeçenekler: ${RECITERS.map((r) => r.id).join(', ')}`)
  process.exit(1)
}
const surahs = opt.surah.length ? opt.surah : Array.from({ length: 114 }, (_, i) => i + 1)

let ok = 0
let skip = 0
let fail = 0
let bytes = 0

/** İndirilecek dosyalar: (hedef adı, kaynak adresi) çiftleri. */
function plan(r, surah) {
  if (opt.mode === 'ayet') {
    if (!r.ayah) return []
    const n = VERSES_OF.get(surah) ?? 0
    return Array.from({ length: n }, (_, i) => [
      `${pad(surah)}${pad(i + 1)}.mp3`,
      `${EVERYAYAH}${r.ayah}/${pad(surah)}${pad(i + 1)}.mp3`,
    ])
  }
  if (!r.base || !r.path) return []
  // Hedef adı ayna ağacında hep dolgulu; KAYNAK adı yayıncınınkine uyar
  // (Turé ve mücevved Abdülbasit'te dolgu yok → `1.mp3`).
  return [[`${pad(surah)}.mp3`, r.base + sourceFile(r, surah)]]
}

for (const r of chosen) {
  const has = opt.mode === 'ayet' ? r.ayah : (r.base && r.path)
  if (!has) {
    console.error(`${r.id}: ${opt.mode} düzeninde kaynak adresi yok, atlanıyor`)
    continue
  }
  // Sure düzeni `ses/<kari>/036.mp3`, ayet düzeni
  // `ses/ayet/<kari>/002255.mp3`. Sure düzeni ön eksiz duruyor: bu
  // ağaçla 7 GB zaten indirilmişti, ön ek eklemek onu geçersiz kılardı.
  const dir = opt.mode === 'ayet'
    ? `${opt.out.replace(/\/$/, '')}/ses/ayet/${r.id}`
    : `${opt.out.replace(/\/$/, '')}/ses/${r.id}`
  mkdirSync(dir, { recursive: true })

  for (const s of surahs) {
   for (const [name, url] of plan(r, s)) {
    const dest = `${dir}/${name}`
    if (existsSync(dest) && statSync(dest).size > 0) { skip++; continue }
    // Önce geçici ada yazılır: indirme yarıda kalırsa dosya "tamam"
    // görünüp bir daha denenmemezlik etmesin.
    const tmp = `${dest}.part`
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp))
      renameSync(tmp, dest)
      bytes += statSync(dest).size
      ok++
      process.stderr.write(`\r${r.id} ${name} · indirilen ${ok}, atlanan ${skip}, hata ${fail}, ${(bytes / 1048576).toFixed(0)} MB   `)
    } catch (e) {
      fail++
      try { if (existsSync(tmp)) unlinkSync(tmp) } catch { /* yoksay */ }
      console.error(`\n${r.id} ${name}: ${e.message}`)
    }
   }
  }
  process.stderr.write('\n')
}

console.error(`bitti — indirilen ${ok}, atlanan ${skip}, hata ${fail}, toplam ${(bytes / 1048576).toFixed(0)} MB`)
console.error(`yükleme:  npx wrangler r2 object put ... ya da  rclone copy ${opt.out}/ses r2:alaturkavakitler-assets/ses`)

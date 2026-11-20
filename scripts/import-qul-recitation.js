#!/usr/bin/env node
/**
 * QUL kıraat dosyasını (.db) uygulamanın okuyacağı JSON'a çevirir.
 *
 * QUL indirmeleri GİRİŞ ister (ölçüldü:
 * `/resources/recitation/<id>/download` → `/users/sign_in`), bu yüzden
 * dosya elle indirilip bu betiğe verilir. İndirilen `.db` **repoya
 * girmez**; buradan çıkan JSON girer.
 *
 * Şema (QUL, "surah by surah" kayıtları):
 *   surah_list(surah_number, audio_url, duration)
 *   segments(surah_number, ayah_number, duration_sec,
 *            timestamp_from, timestamp_to, segments)
 * `segments` metni `[[kelime, başMs, bitişMs], …]`; zamanlar SURENİN
 * kendi dosyasına görelidir, ayete değil.
 *
 * Çıktı ikiye ayrılır, çünkü boyutları iki ayrı sınıfta:
 *   <kari>/ayah.json      ~100 kB (gzip ~46 kB) — ayet vurgusu.
 *                         Tek dosya, kârî seçilince yüklenir.
 *   <kari>/w/<sure>.json  toplam ~1,5 MB (gzip ~540 kB) — kelime
 *                         vurgusu. Sure sure, yalnızca istenince.
 *
 * Kullanım:
 *   node scripts/import-qul-recitation.js ~/Downloads/surah-recitation-hady-toure.db toure
 */
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { reciterById, sourceFile } from '../src/data/reciters.js'

const [dbPath, reciterId] = process.argv.slice(2)
if (!dbPath || !reciterId) {
  console.error('Kullanım: node scripts/import-qul-recitation.js <dosya.db> <kari-kimligi>')
  process.exit(1)
}

// QUL hem JSON hem SQLite sunuyor. Bu betik SQLite okur: JSON'un şekli
// QUL belgelerinde tanımlı değil ve kayıttan kayda değişebiliyor,
// SQLite'ın şeması ise sabit. Yanlış dosya verilirse söyle.
if (/\.json$/i.test(dbPath)) {
  console.error('Bu betik SQLite (.db) okur. QUL indirme sayfasından "Download sqlite" seç.')
  process.exit(1)
}

const db = new DatabaseSync(dbPath, { readOnly: true })
const OUT = new URL(`../src/data/recitation/${reciterId}/`, import.meta.url)

// QUL iki tür kayıt veriyor. `verses` şeması AYET başına ses demektir
// ve zamanları ayetin KENDİ dosyasına görelidir — sure dosyası çalarken
// kullanılamaz (ayet düzeninde vurgu için zaten damga gerekmiyor).
const tables = db.prepare("select name from sqlite_master where type='table'").all().map((t) => t.name)
if (!tables.includes('surah_list')) {
  console.error(tables.includes('verses')
    ? 'Bu dosya AYET kaydı (verses tablosu). Sure dosyası çalarken kullanılamaz;\n'
      + 'ayet düzeninde vurgu için damga zaten gerekmiyor (bkz. reciters.js `ayah`).'
    : `Beklenen tablolar yok: ${tables.join(', ')}`)
  process.exit(1)
}

let surahs = db.prepare('select surah_number, audio_url, duration from surah_list order by surah_number').all()
let rows = db.prepare(
  'select surah_number, ayah_number, timestamp_from, timestamp_to, segments'
  + ' from segments order by surah_number, ayah_number').all()

/**
 * Bazı dosyalarda AYNI kârînin İKİ kaydı var (228 sure satırı, 12472
 * damga): örneğin Hüsarî'de hem `qdc/khalil_al_husary/murattal` hem
 * `..._iza3a` (radyo kaydı) — süreleri 48 ve 34 sn, yani damgalar
 * birbirinin yerine KULLANILAMAZ. Hangisini aldığımız, uygulamanın o
 * kârî için ayarlı adresine bakılarak seçilir.
 */
if (surahs.length > 114) {
  const want = reciterById(reciterId)
  const url = want ? want.base + sourceFile(want, 1) : null
  // Küme = dosya adı atılmış yol. (Önce dosya adını düzenli ifadeyle
  // kesmeye çalıştım ve her sure ayrı bir "küme" sayıldı — 228 satırlık
  // bir uyarı dökülüyordu.)
  const dirOf = (u) => u.slice(0, u.lastIndexOf('/') + 1)
  const sets = [...new Set(surahs.map((r) => dirOf(r.audio_url)))]
  const hit = url ? sets.find((pre) => dirOf(url) === pre) : null
  const pick = hit ?? sets[0]
  if (!hit) {
    console.error(`UYARI: dosyada ${sets.length} ayrı kayıt var ve hiçbiri`)
    console.error(`       reciters.js'teki adrese uymuyor (${url}).`)
    console.error(`       İlki alınıyor: ${pick}`)
    console.error(`       Kümeler:\n         ${sets.join('\n         ')}`)
    console.error('       (Bu kayıtların süreleri farklı olabilir; damgalar birbirinin yerine kullanılamaz.)')
  }
  const keep = new Set(surahs.filter((r) => dirOf(r.audio_url) === pick).map((r) => r.surah_number))
  const first = new Map()
  for (const r of surahs) if (dirOf(r.audio_url) === pick && !first.has(r.surah_number)) first.set(r.surah_number, r)
  surahs = [...first.values()].sort((a, b) => a.surah_number - b.surah_number)
  // Damgalar hangi kayda ait olduğunu söylemiyor; sure başına ilk
  // kümeyi alıyoruz (satırlar küme küme sıralı geliyor).
  const seen = new Set()
  rows = rows.filter((r) => {
    const k = `${r.surah_number}-${r.ayah_number}`
    if (seen.has(k) || !keep.has(r.surah_number)) return false
    seen.add(k)
    return true
  })
}

if (surahs.length !== 114) throw new Error(`114 sure bekleniyordu, ${surahs.length} var`)
if (rows.length !== 6236) throw new Error(`6236 ayet bekleniyordu, ${rows.length} var`)

/**
 * Ses adresi kalıbı. 114 satırın tamamı aynı ön ek + sure numarası +
 * aynı son ek mi diye bakılır; değilse kalıp uydurulmaz, adresler
 * olduğu gibi yazılır.
 */
function urlPattern(list) {
  const first = list[0].audio_url
  const i = first.lastIndexOf('/') + 1
  const prefix = first.slice(0, i)
  const suffix = first.slice(first.lastIndexOf('.'))
  const fits = list.every((r) => {
    const name = r.audio_url.slice(i, r.audio_url.lastIndexOf('.'))
    return r.audio_url.startsWith(prefix) && r.audio_url.endsWith(suffix)
      && Number(name) === r.surah_number
  })
  if (!fits) return null
  const padded = list[0].audio_url.slice(i, list[0].audio_url.lastIndexOf('.')).length > 1
  return { base: prefix, path: `{n}${suffix}`, padded }
}

const ayah = {}
const words = {}
let prevSurah = 0
let prevAyah = 0
for (const r of rows) {
  // Sıra ve bütünlük: ayetler sure içinde 1'den başlayıp artmalı.
  if (r.surah_number !== prevSurah) { prevSurah = r.surah_number; prevAyah = 0 }
  if (r.ayah_number !== prevAyah + 1)
    throw new Error(`sure ${r.surah_number}: ayet sırası bozuk (${prevAyah} → ${r.ayah_number})`)
  prevAyah = r.ayah_number

  if (r.timestamp_to <= r.timestamp_from)
    throw new Error(`sure ${r.surah_number}:${r.ayah_number} damga aralığı geçersiz`)

  ;(ayah[r.surah_number] ??= []).push([r.timestamp_from, r.timestamp_to])
  let seg = []
  try { seg = r.segments ? JSON.parse(r.segments) : [] } catch { seg = [] }
  // Kelime numarası sırayla zaten var; yalnızca [baş, bitiş] saklanır.
  ;(words[r.surah_number] ??= []).push(seg.map((x) => [x[1], x[2]]))
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(new URL('w/', OUT), { recursive: true })

const pat = urlPattern(surahs)
writeFileSync(new URL('ayah.json', OUT), JSON.stringify(ayah) + '\n')
for (const [s, list] of Object.entries(words)) {
  writeFileSync(new URL(`w/${s}.json`, OUT), JSON.stringify(list) + '\n')
}

console.error(`${reciterId}: 114 sure, 6236 ayet yazıldı → src/data/recitation/${reciterId}/`)
if (pat) {
  console.error(`ses kalıbı:  base: '${pat.base}',  path: '${pat.path}'`
    + `  (sure numarası ${pat.padded ? 'sıfır dolgulu' : 'DOLGUSUZ'})`)
} else {
  console.error('ses adresleri tek bir kalıba oturmadı — reciters.js elle doldurulmalı')
  console.error(`örnek: ${surahs[0].audio_url}`)
}

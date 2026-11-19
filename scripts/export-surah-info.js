#!/usr/bin/env node
/**
 * `src/data/surahInfo.js` üretir: sure künyesi.
 *
 * Kaynaklar:
 *  - quran.com v4 `/chapters` — Arapça ad, iniş yeri (Mekke/Medine),
 *    ayet sayısı, iniş sırası, Türkçe okunuşlu ad.
 *  - Aşağıdaki `MEANINGS` — adın Türkçe anlamı. Bu tek elle yazılan
 *    parça; doğrulaması İngilizce adla yan yana basılarak yapılır
 *    (`--check`), çünkü quran.com adın anlamını Türkçe vermiyor.
 *  - TDV İslam Ansiklopedisi bağlantısı `slug + '-suresi'` kalıbıyla
 *    kurulur ve HER BİRİ tek tek HTTP ile doğrulanır; 200 dönmeyen
 *    surede bağlantı yazılmaz (uydurma bağlantı, bağlantı olmamasından
 *    kötüdür).
 *
 * Kullanım:  node scripts/export-surah-info.js [--check]
 */
import { writeFileSync } from 'node:fs'
import { SURAHS } from '../src/data/kuranMeta.js'

const MEANINGS = {
  1: 'Açılış', 2: 'İnek', 3: 'İmrân Ailesi', 4: 'Kadınlar', 5: 'Sofra',
  6: 'Davarlar', 7: 'Yüksek Yer', 8: 'Ganimetler', 9: 'Tövbe', 10: 'Yûnus',
  11: 'Hûd', 12: 'Yûsuf', 13: 'Gök Gürültüsü', 14: 'İbrâhim', 15: 'Hicr',
  16: 'Arı', 17: 'Gece Yürüyüşü', 18: 'Mağara', 19: 'Meryem', 20: 'Tâhâ',
  21: 'Peygamberler', 22: 'Hac', 23: 'İnananlar', 24: 'Işık',
  25: 'Hakkı Bâtıldan Ayıran', 26: 'Şairler', 27: 'Karınca', 28: 'Kıssalar',
  29: 'Örümcek', 30: 'Rumlar', 31: 'Lokmân', 32: 'Secde',
  33: 'Müttefik Topluluklar', 34: 'Sebe', 35: 'Yoktan Yaratan', 36: 'Yâsîn',
  37: 'Saf Saf Dizilenler', 38: 'Sâd', 39: 'Zümreler', 40: 'Bağışlayan',
  41: 'Ayrıntılı Kılındı', 42: 'Danışma', 43: 'Altın Süsler', 44: 'Duman',
  45: 'Diz Çökmüş', 46: 'Kum Tepeleri', 47: 'Muhammed', 48: 'Fetih',
  49: 'Odalar', 50: 'Kâf', 51: 'Savuran Rüzgârlar', 52: 'Tûr Dağı',
  53: 'Yıldız', 54: 'Ay', 55: 'Esirgeyen', 56: 'Gerçekleşecek Olay',
  57: 'Demir', 58: 'Tartışan Kadın', 59: 'Toplanma', 60: 'İmtihan Edilen Kadın',
  61: 'Saf', 62: 'Cuma', 63: 'Münafıklar', 64: 'Aldanış', 65: 'Boşanma',
  66: 'Yasaklama', 67: 'Egemenlik', 68: 'Kalem', 69: 'Gerçekleşecek Olan',
  70: 'Yükselme Yolları', 71: 'Nûh', 72: 'Cinler', 73: 'Örtüsüne Bürünen',
  74: 'Bürünüp Sarınan', 75: 'Kıyamet', 76: 'İnsan', 77: 'Gönderilenler',
  78: 'Haber', 79: 'Söküp Çıkaranlar', 80: 'Yüzünü Ekşitti', 81: 'Dürülme',
  82: 'Yarılma', 83: 'Ölçüde Hile Yapanlar', 84: 'Yarılma', 85: 'Burçlar',
  86: 'Gece Gelen', 87: 'En Yüce', 88: 'Kaplayan Felaket', 89: 'Şafak',
  90: 'Şehir', 91: 'Güneş', 92: 'Gece', 93: 'Kuşluk Vakti', 94: 'Göğüs Açılması',
  95: 'İncir', 96: 'Asılıp Tutunan', 97: 'Kadir', 98: 'Apaçık Delil',
  99: 'Sarsıntı', 100: 'Koşan Atlar', 101: 'Çarpacak Olan',
  102: 'Çoklukla Övünme', 103: 'Zaman', 104: 'Arkadan Çekiştiren', 105: 'Fil',
  106: 'Kureyş', 107: 'Küçük Yardım', 108: 'Bolluk', 109: 'İnkârcılar',
  110: 'Yardım', 111: 'Bükülmüş İp', 112: 'Samimiyet', 113: 'Aydınlık',
  114: 'İnsanlar',
}

const PLACES = { makkah: 'Mekke', madinah: 'Medine' }

async function chapters(lang) {
  const res = await fetch(`https://api.quran.com/api/v4/chapters?language=${lang}`)
  if (!res.ok) throw new Error(`chapters ${lang}: HTTP ${res.status}`)
  return (await res.json()).chapters
}

/** TDV bağlantısı gerçekten var mı. Yoksa null yazılır. */
async function tdv(slug) {
  const url = `https://islamansiklopedisi.org.tr/${slug}-suresi`
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return res.ok ? url : null
  } catch {
    return null
  }
}

const check = process.argv.includes('--check')

const [tr, en] = await Promise.all([chapters('tr'), chapters('en')])
const enName = Object.fromEntries(en.map((c) => [c.id, c.translated_name.name]))

if (Object.keys(MEANINGS).length !== 114)
  throw new Error(`MEANINGS eksik: ${Object.keys(MEANINGS).length}/114`)

const rows = []
let missing = 0
for (const c of tr) {
  const site = SURAHS.find((s) => s.id === c.id)
  if (!site) throw new Error(`site listesinde yok: ${c.id}`)
  const link = await tdv(site.slug)
  if (!link) missing++
  rows.push({
    id: c.id,
    name: site.name,
    arabic: c.name_arabic,
    meaning: MEANINGS[c.id],
    place: PLACES[c.revelation_place] ?? c.revelation_place,
    verses: c.verses_count,
    order: c.revelation_order,
    bismillah: c.bismillah_pre,
    tdv: link,
  })
  if (check) console.log(`${String(c.id).padStart(3)} ${site.name.padEnd(16)} ${MEANINGS[c.id].padEnd(26)} ← ${enName[c.id]}${link ? '' : '   [TDV YOK]'}`)
}

if (rows.length !== 114) throw new Error(`114 bekleniyordu, ${rows.length} çıktı`)
console.error(`TDV bağlantısı bulunamayan: ${missing}`)

const body = rows.map((r) => '  ' + JSON.stringify(r)).join(',\n')
writeFileSync(
  new URL('../src/data/surahInfo.js', import.meta.url),
  `// ÜRETİLMİŞ DOSYA — elle düzenleme.\n`
  + `// Kaynak: quran.com v4 /chapters (iniş yeri, ayet sayısı, iniş sırası)\n`
  + `// + scripts/export-surah-info.js içindeki Türkçe anlam listesi.\n`
  + `// TDV bağlantıları üretim sırasında tek tek HTTP ile doğrulandı.\n`
  + `// Yeniden üretmek için: node scripts/export-surah-info.js\n\n`
  + `export const SURAH_INFO = [\n${body},\n]\n\n`
  + `export const infoOf = (id) => SURAH_INFO.find((s) => s.id === Number(id)) ?? null\n`,
)
console.error('src/data/surahInfo.js yazıldı')

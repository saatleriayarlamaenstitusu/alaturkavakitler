#!/usr/bin/env node
/**
 * Mushaf satır dizimini `src/data/mushaf/juz-NN.json` dosyalarına yazar.
 *
 * Neden: dizim her sayfa açılışında quran.com'dan çekiliyordu. Veri
 * DEĞİŞMEYEN bir tablo — her seferinde ağdan istemek hem tek bir
 * sağlayıcıya bağlı kalmak hem de çevrimdışı okumayı imkânsız kılmak
 * demek. Bir kez indirilip depoda durur.
 *
 * Neden cüz cüz: tek dosya ~1,5 MB eder ve ilk açılışta tamamı iner.
 * Cüz başına ~50 kB, okunan cüzünki yüklenir.
 *
 * Her kelime için iki glif kodu birden saklanır (`a` = V1, `b` = V2):
 * hat seçimi okurken değişiyor, ikinci bir indirme gerektirmemeli.
 *
 * Kullanım:  node scripts/export-mushaf-lines.js [ilkSayfa] [sonSayfa]
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { JUZ_PAGES, PAGE_COUNT } from '../src/data/mushafPages.js'
import { SURAHS } from '../src/data/kuranMeta.js'

const NAME_OF = new Map(SURAHS.map((s) => [s.id, s.name]))

const API = 'https://api.quran.com/api/v4'
const OUT = new URL('../src/data/mushaf/', import.meta.url)
const LINES_PER_PAGE = 15

/** Kullanılmayan satır numarası sure adı ya da besmeledir. */
function headerLines(starts, firstLineOf, usedLines) {
  const marks = {}
  for (const surah of starts) {
    const first = firstLineOf.get(surah)
    if (!first) continue
    const free = []
    for (let n = first - 1; n >= 1 && !marks[n]; n--) {
      if (usedLines.has(n)) break
      free.unshift(n)
    }
    if (!free.length) continue
    marks[free[0]] = { kind: 'name', surah, name: NAME_OF.get(surah) ?? '' }
    if (free.length > 1) marks[free[1]] = { kind: 'basmala', surah }
  }
  return marks
}

async function fetchPage(page, tries = 3) {
  const url = `${API}/verses/by_page/${page}?words=true&per_page=50`
    + '&word_fields=line_number,code_v1,code_v2'
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      if (i === tries) throw new Error(`sayfa ${page}: ${e.message}`)
      await new Promise((r) => setTimeout(r, 400 * i))
    }
  }
}

function buildPage(page, data) {
  const rows = new Map()
  const firstLineOf = new Map()
  const usedLines = new Set()
  // Sure bu sayfada BAŞLIYORSA 1. ayeti burada görünür; dizine bakmaya
  // gerek yok, veri zaten söylüyor.
  const starts = []

  for (const v of data.verses ?? []) {
    const [surah, verse] = v.verse_key.split(':').map(Number)
    if (verse === 1) starts.push(surah)
    for (const w of v.words ?? []) {
      const n = w.line_number
      if (!n) continue
      usedLines.add(n)
      if (!firstLineOf.has(surah) || n < firstLineOf.get(surah)) firstLineOf.set(surah, n)
      if (!rows.has(n)) rows.set(n, [])
      rows.get(n).push({
        a: w.code_v1 ?? '',
        b: w.code_v2 ?? '',
        e: w.char_type_name === 'end' ? 1 : 0,
        s: surah,
        v: verse,
      })
    }
  }

  const marks = headerLines(starts, firstLineOf, usedLines)
  const lines = []
  for (let n = 1; n <= LINES_PER_PAGE; n++) {
    if (marks[n]) lines.push({ n, ...marks[n] })
    else if (rows.has(n)) lines.push({ n, kind: 'text', words: rows.get(n) })
  }
  return lines
}

/** Sayfanın cüzü — dosya adı için. */
function juzOf(page) {
  let juz = 1
  for (let i = 0; i < JUZ_PAGES.length; i++) if (page >= JUZ_PAGES[i]) juz = i + 1
  return juz
}

const from = Number(process.argv[2]) || 1
const to = Number(process.argv[3]) || PAGE_COUNT

mkdirSync(OUT, { recursive: true })

const byJuz = new Map()
let done = 0
const CONCURRENCY = 6

const queue = []
for (let p = from; p <= to; p++) queue.push(p)

async function worker() {
  while (queue.length) {
    const page = queue.shift()
    const lines = buildPage(page, await fetchPage(page))
    if (!lines.length) throw new Error(`sayfa ${page}: satır çıkmadı`)
    const juz = juzOf(page)
    if (!byJuz.has(juz)) byJuz.set(juz, {})
    byJuz.get(juz)[page] = lines
    done++
    if (done % 50 === 0) process.stderr.write(`  ${done}/${to - from + 1}\n`)
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

let bytes = 0
let pages = 0
for (const [juz, map] of [...byJuz].sort((a, b) => a[0] - b[0])) {
  const name = `juz-${String(juz).padStart(2, '0')}.json`
  const body = JSON.stringify(map)
  writeFileSync(new URL(name, OUT), body + '\n')
  bytes += body.length
  pages += Object.keys(map).length
}

// Doğrulama: her sayfanın satırları artan sırada ve 1..15 aralığında mı.
for (const map of byJuz.values()) {
  for (const [page, lines] of Object.entries(map)) {
    let prev = 0
    for (const l of lines) {
      if (l.n <= prev || l.n < 1 || l.n > LINES_PER_PAGE)
        throw new Error(`sayfa ${page}: satır sırası bozuk (${l.n})`)
      prev = l.n
    }
  }
}

console.error(`${pages} sayfa, ${byJuz.size} dosya, ${(bytes / 1048576).toFixed(2)} MB`)

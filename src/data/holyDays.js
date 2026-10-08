// Dinî günler ve geceler — hicri takvimden kural olarak türetilir.
//
// GECELERDEKİ İNCELİK: hicri gün güneş batımıyla başlar. "Recep ayının 27.
// gecesi" dendiğinde kastedilen, 26'sının akşamında başlayıp 27'sine ait olan
// gecedir. Bu yüzden kandiller, adı geçen günün BİR ÖNCEKİ hicri gününe
// işaretlenir — Diyanet'in yayımladığı miladi tarihler de böyledir.
// (2026 listesiyle tek tek karşılaştırılarak doğrulandı.)
import { toHijri, fromHijri, hijriMonthLength } from '@/utils/hijri'

export const KINDS = {
  kandil: 'Kandil',
  bayram: 'Bayram',
  arefe: 'Arefe',
  gun: 'Dinî gün',
}

const RECEP = 7
const SABAN = 8
const RAMAZAN = 9
const SEVVAL = 10
const ZILHICCE = 12
const MUHARREM = 1
const REBIULEVVEL = 3

const PERSEMBE = 4 // Date.getDay()

// Recep'teki ilk perşembe: Regaip o akşam başlar (perşembeyi cumaya bağlayan gece).
function isFirstThursdayOfRecep(date, h) {
  if (h.month !== RECEP || date.getDay() !== PERSEMBE) return false
  const first = fromHijri(h.year, RECEP, 1)
  const diff = Math.round((dayStart(date) - dayStart(first)) / 86400000)
  return diff >= 0 && diff < 7
}

const dayStart = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())

/**
 * O güne denk gelen dinî günler.
 * @param {Date} date
 * @returns {Array<{id, name, kind, night, note?}>} genelde 0 ya da 1 kayıt
 */
export function holyDaysOn(date = new Date()) {
  const h = toHijri(date)
  const out = []
  const add = (id, name, kind, night = false, note) => out.push({ id, name, kind, night, note })

  // ── Kandiller (hepsi gece; bir önceki hicri güne işaretlenir) ──
  if (isFirstThursdayOfRecep(date, h)) {
    add('regaip', 'Regaip Kandili', 'kandil', true, 'Recep ayının ilk cuma gecesi')
  }
  if (h.month === RECEP && h.day === 26) {
    add('mirac', 'Miraç Kandili', 'kandil', true, 'Recep ayının 27. gecesi')
  }
  if (h.month === SABAN && h.day === 14) {
    add('berat', 'Berat Kandili', 'kandil', true, 'Şaban ayının 15. gecesi')
  }
  if (h.month === RAMAZAN && h.day === 26) {
    // Kadir Gecesi'nin Ramazan'ın son on gününde gizli olduğu bilinir; 27. gece
    // yaygın olarak idrak edilir. Veri bunu "yaygın kabul" diye işaretler.
    add('kadir', 'Kadir Gecesi', 'kandil', true, "Ramazan'ın 27. gecesi")
  }
  if (h.month === REBIULEVVEL && h.day === 11) {
    add('mevlid', 'Mevlid Kandili', 'kandil', true, 'Rebiülevvel ayının 12. gecesi')
  }

  // ── Ramazan Bayramı ──
  if (h.month === RAMAZAN && h.day === hijriMonthLength(h.year, RAMAZAN)) {
    add('ramazan-arefe', 'Ramazan Bayramı Arefesi', 'arefe')
  }
  if (h.month === SEVVAL && h.day >= 1 && h.day <= 3) {
    add('ramazan-bayram', `Ramazan Bayramı ${h.day}. gün`, 'bayram')
  }

  // ── Kurban Bayramı ──
  if (h.month === ZILHICCE && h.day === 9) {
    add('kurban-arefe', 'Kurban Bayramı Arefesi', 'arefe', false, 'Arefe günü')
  }
  if (h.month === ZILHICCE && h.day >= 10 && h.day <= 13) {
    add('kurban-bayram', `Kurban Bayramı ${h.day - 9}. gün`, 'bayram')
  }

  // ── Diğer ──
  if (h.month === MUHARREM && h.day === 1) {
    add('hicri-yilbasi', 'Hicri Yılbaşı', 'gun', false, `${h.year} yılı başlangıcı`)
  }
  if (h.month === MUHARREM && h.day === 10) {
    add('asure', 'Aşure Günü', 'gun', false, 'Muharrem ayının 10. günü')
  }

  return out
}

/** Günün tek satırlık etiketi; yoksa boş dize. */
export function holyDayLabel(date = new Date()) {
  const d = holyDaysOn(date)
  return d.length ? d.map(x => x.name).join(' · ') : ''
}

/** Bir aralıktaki dinî günler: `{ '2026-03-20': [...] }` */
export function holyDaysBetween(start, end) {
  const map = {}
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  while (d <= last) {
    const list = holyDaysOn(d)
    if (list.length) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      map[iso] = list
    }
    d.setDate(d.getDate() + 1)
  }
  return map
}

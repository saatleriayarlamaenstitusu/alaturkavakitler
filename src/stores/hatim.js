import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { PAGE_COUNT } from '@/utils/mushaf'

/**
 * Hatimler.
 *
 * Bir hatim bir NİYETLE başlar ve sayfa sayfa ilerler. İlerleme
 * "kaçıncı sayfadayım" değil, "hangi sayfayı hangi gün okudum" olarak
 * tutulur: günlük takvim şeridi de, kaldığın yer de, tamamlanan oran da
 * bu tek kayıttan çıkıyor. Sayfayı yanlışlıkla işaretlediysen geri
 * alabilmek de bunu gerektiriyor — tek bir sayaç olsaydı mümkün olmazdı.
 *
 * Birden fazla hatim aynı anda sürebilir; biri "etkin"dir ve okuma
 * ekranındaki işaretleme ona yazar.
 */

const KEY = 'hatimler'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * İlk açılışta hazır duran hatim.
 *
 * Boş bir ekran "nereden başlayacağım" sorusunu kullanıcıya yıkıyor;
 * hazır bir niyet hem örnek hem davet. Yalnızca HİÇ kayıt yokken kurulur:
 * kullanıcı hatmini silmişse geri gelmemeli, bu yüzden kayıt bir kez
 * yazıldıktan sonra (liste boş olsa bile) bir daha tohumlanmaz.
 */
function seed() {
  const d = new Date()
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return {
    id: `h${Date.now().toString(36)}`,
    niyet: 'Ümmet için',
    startedAt: iso,
    dailyTarget: null,
    progress: {},
    finishedAt: null,
  }
}

function load() {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === null) {
      const first = seed()
      return { list: [first], activeId: first.id, fresh: true }
    }
    const raw = JSON.parse(stored || 'null')
    if (!raw || !Array.isArray(raw.list)) return { list: [], activeId: null }
    return { list: raw.list, activeId: raw.activeId ?? raw.list[0]?.id ?? null }
  } catch {
    return { list: [], activeId: null }
  }
}

export const useHatimStore = defineStore('hatim', () => {
  const saved = load()
  const list = ref(saved.list)
  const activeId = ref(saved.activeId)

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ list: list.value, activeId: activeId.value }))
    } catch {
      /* kota — hatim kaydı küçük, buraya düşmesi beklenmez */
    }
  }

  // Tohumlanan hatim hemen yazılır: yazılmazsa her açılışta yeni bir
  // kimlikle yeniden kurulur ve "sildim ama geri geldi" hissi doğar.
  if (saved.fresh) persist()

  watch([list, activeId], persist, { deep: true })

  const active = computed(() => list.value.find((h) => h.id === activeId.value) ?? null)

  /** Okunan sayfa sayısı. */
  const readCount = (h) => (h ? Object.keys(h.progress).length : 0)

  /** Tamamlanma oranı (0–1). */
  const ratio = (h) => readCount(h) / PAGE_COUNT

  /** Gün → o gün okunan sayfa sayısı. */
  function byDay(h) {
    const out = {}
    if (!h) return out
    for (const day of Object.values(h.progress)) out[day] = (out[day] ?? 0) + 1
    return out
  }

  /** Kaldığın yer: okunmamış ilk sayfa. */
  function nextPage(h) {
    if (!h) return 1
    for (let p = 1; p <= PAGE_COUNT; p++) if (!h.progress[p]) return p
    return PAGE_COUNT
  }

  const isRead = (h, page) => Boolean(h?.progress[page])

  /** Bütün hatimlerin günlük toplamı — üstteki genel çizelge için. */
  function allByDay() {
    const out = {}
    for (const h of list.value)
      for (const day of Object.values(h.progress)) out[day] = (out[day] ?? 0) + 1
    return out
  }

  /** Bütün hatimlerde okunan toplam sayfa. */
  const totalPages = () =>
    list.value.reduce((sum, h) => sum + Object.keys(h.progress).length, 0)

  /**
   * Bir günde hangi hatimden kaç sayfa okunduğu.
   *
   * Takvim sayfası bunu soruyor: "o gün ne yaptım" sorusunun cevabı
   * hatimlerin hepsine birden bakmayı gerektiriyor, tek tek değil.
   * @param {string} day `YYYY-MM-DD`
   * @returns {Array<{ id:string, niyet:string, pages:number }>}
   */
  function readOn(day) {
    const out = []
    for (const h of list.value) {
      let pages = 0
      for (const d of Object.values(h.progress)) if (d === day) pages++
      if (pages) out.push({ id: h.id, niyet: h.niyet, pages })
    }
    return out
  }

  function start(niyet, { dailyTarget = null } = {}) {
    const h = {
      id: `h${Date.now().toString(36)}`,
      niyet: String(niyet || '').trim() || 'Hatim',
      startedAt: today(),
      dailyTarget: dailyTarget ? Number(dailyTarget) : null,
      progress: {},
      finishedAt: null,
    }
    list.value = [h, ...list.value]
    activeId.value = h.id
    return h
  }

  /** Bir sayfayı okundu/okunmadı yapar; dönüş değeri yeni durumdur. */
  function togglePage(page, id = activeId.value) {
    const h = list.value.find((x) => x.id === id)
    if (!h) return false
    const key = String(page)
    if (h.progress[key]) {
      delete h.progress[key]
      h.finishedAt = null
    } else {
      h.progress[key] = today()
      if (Object.keys(h.progress).length === PAGE_COUNT) h.finishedAt = today()
    }
    // Pinia derin izliyor ama dizinin kendisine dokunmak, kaydı
    // kaçırmamak için ucuz bir güvence.
    list.value = [...list.value]
    return Boolean(h.progress[key])
  }

  /** Bir aralığı toptan işaretler — "buraya kadar okudum". */
  function markUpTo(page, id = activeId.value) {
    const h = list.value.find((x) => x.id === id)
    if (!h) return
    const day = today()
    for (let p = 1; p <= page; p++) if (!h.progress[p]) h.progress[p] = day
    if (Object.keys(h.progress).length === PAGE_COUNT) h.finishedAt = day
    list.value = [...list.value]
  }

  function remove(id) {
    list.value = list.value.filter((h) => h.id !== id)
    if (activeId.value === id) activeId.value = list.value[0]?.id ?? null
  }

  const setActive = (id) => { activeId.value = id }

  return {
    list, activeId, active,
    readCount, ratio, byDay, nextPage, isRead, readOn, allByDay, totalPages,
    start, togglePage, markUpTo, remove, setActive,
  }
})

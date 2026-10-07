import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'kazaCounts'
const VAKIT_KEYS = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi']

// Güneş vakti bir namaz vakti değil; kaza da tutulmaz. Liste altı sütun
// olduğu için anahtar yine de taşınır, sadece sayaç gösterilmez.
export const KAZA_KEYS = VAKIT_KEYS.filter(k => k !== 'gunes')

const empty = () => Object.fromEntries(KAZA_KEYS.map(k => [k, 0]))

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved || typeof saved !== 'object') return empty()
    // Sadece bilinen vakitler ve negatif olmayan tamsayılar.
    const out = empty()
    for (const k of KAZA_KEYS) {
      const n = Number(saved[k])
      if (Number.isFinite(n)) out[k] = Math.max(0, Math.round(n))
    }
    return out
  } catch {
    return empty()
  }
}

// Kaza borcu yalnızca kullanıcının kendi beyanıdır: uygulama bir vaktin
// kılınıp kılınmadığını bilemez, bu yüzden sayaç kendiliğinden artmaz.
export const useKazaStore = defineStore('kaza', () => {
  const counts = ref(load())

  watch(counts, (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
    } catch {
      // Kota dolu ya da depolama kapalı — sayaç oturum boyunca çalışmaya devam eder.
    }
  }, { deep: true })

  const total = computed(() => KAZA_KEYS.reduce((s, k) => s + counts.value[k], 0))
  const has = (key) => (counts.value[key] ?? 0) > 0

  function add(key, delta = 1) {
    if (!KAZA_KEYS.includes(key)) return
    counts.value[key] = Math.max(0, (counts.value[key] ?? 0) + delta)
  }

  function set(key, n) {
    if (!KAZA_KEYS.includes(key)) return
    counts.value[key] = Math.max(0, Math.round(Number(n) || 0))
  }

  function clear() {
    counts.value = empty()
  }

  return { counts, total, has, add, set, clear }
})

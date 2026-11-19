import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { normalizeOffsets } from '@/data/vakitNotify'

function load(key, defaultValue) {
  const stored = localStorage.getItem(`settings_${key}`)
  return stored !== null ? JSON.parse(stored) : defaultValue
}

export const useSettingsStore = defineStore('settings', () => {
  const primaryClock = ref(load('primaryClock', 'alaturka'))
  const secondaryClock = ref(load('secondaryClock', 'normal'))
  const clockStyle = ref(load('clockStyle', 'digital'))
  const analogDesign = ref(load('analogDesign', 1))
  const hijriOffset = ref(load('hijriOffset', false))
  const vakitSource = ref(load('vakitSource', 'diyanet'))
  const firstPage = ref(load('firstPage', '/'))
  const themePerVakit = ref(load('themePerVakit', true))
  const notificationsEnabled = ref(load('notificationsEnabled', false))
  // Vakit başına "kaç dakika önce" (-1 kapalı, 0 tam vakitte). Kayıtlı
  // değer varsayılanların üstüne oturtulur: listeye yeni bir vakit ya da
  // yeni bir varsayılan eklendiğinde eski kayıt onu eksik bırakmasın.
  const notifyOffsets = ref(normalizeOffsets(load('notifyOffsets', null)))
  const darkMode = ref(load('darkMode', 'auto'))
  const colorStyle = ref(load('colorStyle', 'klasik'))
  const homeClock = ref(load('homeClock', 'led')) // 'led' | 'normal'
  // Kuran gösterimi: okuma sayfası, hatim ve ileride kıraat kesitleri
  // aynı tercihi okur — ayet nasıl görünsün sorusu bir kez sorulur.
  // 0 = meal kapalı, yalnızca Arapça metin.
  const quranMeal = ref(load('quranMeal', 11))          // Diyanet İşleri
  const quranFont = ref(load('quranFont', 'lateef'))
  // Görünüm: 'mushaf' basılı sayfanın satır satır dizimi, 'esnek' akan
  // metin. Mushaf varsayılan — sayfa numarası zaten basılı nüshanın.
  const quranView = ref(load('quranView', 'mushaf'))    // 'mushaf' | 'esnek'
  const quranScript = ref(load('quranScript', 'v2'))    // QPC hattı (bkz. utils/qpc)
  // Esnek görünümde Arapça metnin boyu, yüzde olarak (100 = taban).
  const quranFontSize = ref(load('quranFontSize', 100))

  const all = { primaryClock, secondaryClock, clockStyle, analogDesign, hijriOffset, vakitSource, firstPage, themePerVakit, notificationsEnabled, notifyOffsets, quranMeal, quranFont, quranView, quranScript, quranFontSize, darkMode, colorStyle, homeClock }

  // `deep`: ayarların çoğu düz değer ama `notifyOffsets` bir obje —
  // içindeki tek bir vakit değişince de kaydedilmeli.
  for (const [key, r] of Object.entries(all)) {
    watch(r, (val) => localStorage.setItem(`settings_${key}`, JSON.stringify(val)), { deep: true })
  }

  return all
})

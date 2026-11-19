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

  const all = { primaryClock, secondaryClock, clockStyle, analogDesign, hijriOffset, vakitSource, firstPage, themePerVakit, notificationsEnabled, notifyOffsets, darkMode, colorStyle, homeClock }

  // `deep`: ayarların çoğu düz değer ama `notifyOffsets` bir obje —
  // içindeki tek bir vakit değişince de kaydedilmeli.
  for (const [key, r] of Object.entries(all)) {
    watch(r, (val) => localStorage.setItem(`settings_${key}`, JSON.stringify(val)), { deep: true })
  }

  return all
})

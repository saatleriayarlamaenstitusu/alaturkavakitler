import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

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
  const darkMode = ref(load('darkMode', 'auto'))

  const all = { primaryClock, secondaryClock, clockStyle, analogDesign, hijriOffset, vakitSource, firstPage, themePerVakit, notificationsEnabled, darkMode }

  for (const [key, r] of Object.entries(all)) {
    watch(r, (val) => localStorage.setItem(`settings_${key}`, JSON.stringify(val)))
  }

  return all
})

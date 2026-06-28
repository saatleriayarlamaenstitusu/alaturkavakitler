import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { createVakitObj, findVakit, VAKIT_COLORS } from '@/utils/vakit'

export const useAppStore = defineStore('app', () => {
  const city = ref(JSON.parse(localStorage.getItem('city') || 'null') || { plate: '34', name: 'İSTANBUL' })
  const vakitler = ref(JSON.parse(localStorage.getItem('vakitler') || 'null'))
  const vakit = ref(null)
  const currentVakit = ref(null)
  const loading = ref(false)
  const error = ref(null)

  watch(vakitler, (newVakitler) => {
    if (newVakitler) {
      localStorage.setItem('vakitler', JSON.stringify(newVakitler))
      vakit.value = createVakitObj(newVakitler)
    }
  })

  watch(city, (newCity) => {
    localStorage.setItem('city', JSON.stringify(newCity))
    fetchVakitler()
  })

  async function fetchVakitler() {
    loading.value = true
    error.value = null
    try {
      const url = `${import.meta.env.VITE_VAKIT_BASE_URL}${city.value.plate}.json`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      vakitler.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function shouldFetch() {
    if (!vakitler.value) return true
    const keys = Object.keys(vakitler.value)
    if (!keys.length) return true
    const lastDate = new Date(keys[keys.length - 1])
    const diffDays = (lastDate - new Date()) / (1000 * 60 * 60 * 24)
    return diffDays < 5
  }

  function setCurrentVakit(key) {
    currentVakit.value = key
    document.documentElement.dataset.vakit = key
    const themeColorEl = document.querySelector('meta[name="theme-color"]')
    if (themeColorEl) themeColorEl.content = VAKIT_COLORS[key] || '#ae002e'
  }

  function setCity(newCity) {
    city.value = newCity
  }

  async function init() {
    if (vakitler.value) {
      vakit.value = createVakitObj(vakitler.value)
    }
    if (shouldFetch()) {
      await fetchVakitler()
    }
    if (vakit.value) {
      setCurrentVakit(findVakit(vakit.value))
    }
  }

  return { city, vakitler, vakit, currentVakit, loading, error, fetchVakitler, setCurrentVakit, setCity, init }
})

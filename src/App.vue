<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useSettingsStore } from '@/stores/settings'
import TopNav from '@/components/nav/TopNav.vue'
import BottomNav from '@/components/nav/BottomNav.vue'

const appStore = useAppStore()
const settings = useSettingsStore()

let systemMediaQuery = null

function applyTheme(mode) {
  const html = document.documentElement
  if (mode === 'dark') {
    html.dataset.theme = 'dark'
  } else if (mode === 'light') {
    html.dataset.theme = 'light'
  } else {
    delete html.dataset.theme
  }
}

onMounted(() => {
  appStore.init()
  applyTheme(settings.darkMode)

  systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemMediaQuery.addEventListener('change', () => {
    if (settings.darkMode === 'auto') applyTheme('auto')
  })
})

onUnmounted(() => {
  systemMediaQuery?.removeEventListener('change', () => {})
})

watch(() => settings.darkMode, applyTheme)
</script>

<template>
  <div class="app">
    <TopNav />
    <div class="app-content">
      <router-view />
    </div>
    <BottomNav />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

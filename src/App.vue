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
    <div class="hat-watermark" aria-hidden="true"></div>
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
  position: relative;
}

.hat-watermark {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 55%;
  background-image: url('/Icons/topbgtext.svg');
  background-size: 90%;
  background-repeat: no-repeat;
  background-position: center 20%;
  filter: var(--watermark-filter);
  opacity: var(--watermark-opacity);
  pointer-events: none;
  z-index: -1;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
}
</style>

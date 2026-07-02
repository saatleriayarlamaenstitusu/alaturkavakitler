<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSettingsStore } from '@/stores/settings'
import TopNav from '@/components/nav/TopNav.vue'
import BottomNav from '@/components/nav/BottomNav.vue'

const appStore = useAppStore()
const settings = useSettingsStore()
const router = useRouter()
const route = useRoute()

let systemMediaQuery = null

function applyTheme(mode) {
  const resolved = mode === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode
  document.documentElement.dataset.theme = resolved
}

function applyPalette(style) {
  document.documentElement.dataset.palette = style || 'klasik'
}

onMounted(async () => {
  appStore.init()
  applyTheme(settings.darkMode)
  applyPalette(settings.colorStyle)

  await router.isReady()

  if (route.path === '/' && settings.firstPage !== '/') {
    router.replace(settings.firstPage)
  }

  systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemMediaQuery.addEventListener('change', () => {
    if (settings.darkMode === 'auto') applyTheme('auto')
  })
})

onUnmounted(() => {
  systemMediaQuery?.removeEventListener('change', () => {})
})

watch(() => settings.darkMode, applyTheme)
watch(() => settings.colorStyle, applyPalette)
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
  height: 100%;
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
  padding:0 1.25rem;
}
</style>

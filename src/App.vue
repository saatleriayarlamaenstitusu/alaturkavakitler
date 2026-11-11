<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSettingsStore } from '@/stores/settings'
import TopNav from '@/components/nav/TopNav.vue'
import BottomNav from '@/components/nav/BottomNav.vue'

const appStore = useAppStore()
const settings = useSettingsStore()
const router = useRouter()
const route = useRoute()

// Görsel oluşturucu kendi tam ekran kabuğuyla gelir.
const chromeless = computed(() => route.path === '/gorsel-olustur')

// Masaüstünde iki kolona bölünen sayfalar daha geniş bir kabuk ister.
// İşaret burada veriliyor çünkü yalnızca içerik değil, üst ve alt çubuk da
// aynı ölçüye hizalanmalı — CSS tek başına rotayı bilemez.
const WIDE_ROUTES = ['/', '/saat', '/vakitler', '/takvim']
const wide = computed(() => WIDE_ROUTES.includes(route.path))

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
  <div class="app" :class="{ wide }">
    <div class="hat-watermark" aria-hidden="true"></div>
    <!-- Üst çubuk ve içerik tek sütun; masaüstünde gezinme bu sütunun
         SOLUNA geçer (bkz. assets/css/desktop.css). Sarmalayıcı bunun
         içindir: mobilde kolonun kendisidir, masaüstünde ana sütun. -->
    <div class="app-main">
      <TopNav v-if="!chromeless" />
      <div class="app-content">
        <router-view />
      </div>
    </div>
    <BottomNav v-if="!chromeless" />
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

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* Kaydırma `.app-content`in işi; sarmalayıcı taşmayı kendi içinde
     tutmazsa flex zinciri çöküyor. */
  min-height: 0;
  min-width: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
  padding:0 1.25rem;
}

/* ── Masaüstü: kabuk satıra döner ──
   Solda gezinme rayı, sağda üst çubuk + içerik. Kural burada duruyor
   çünkü `.app` bu bileşenin scoped seçicisine sahip; `desktop.css`ten
   yazılsa özgüllük yarışını kaybeder. Rayın kendi biçimi
   `components/nav/BottomNav.vue`te.
   Blok dosyanın SONUNDA duruyor: `.app-content`in `padding` kısaltması
   yukarıda ve aynı özgüllükte, önce gelseydi kaynak sırası kazanırdı. */
@media (min-width: 900px) {
  .app {
    flex-direction: row;
  }

  /* Üst çubuk masaüstünde yok (parçaları raya taşındı); içerik o boşluğu
     kazanır ama sayfanın tepesine yapışmasın diye bir pay bırakılır. */
  .app-content {
    padding-top: 2.5rem;
  }
}
</style>

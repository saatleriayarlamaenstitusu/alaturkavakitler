<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  playing, loading, error, reciter, surahName, curSurah, curVerse, curPage, active,
  toggle, stop,
} from '@/stores/recitation'

/**
 * Mini oynatıcı — Kur'an sayfasının DIŞINDA.
 *
 * Kıraat artık sayfaya bağlı değil (`stores/recitation.js`): vakitlere
 * ya da takvime geçmek sesi kesmiyor. Ama kontrolsüz çalan bir ses de
 * olmaz — sayfadan çıkınca şeridin yerini bu küçük çubuk alıyor:
 * ne çaldığı yazar, duraklatılır, bırakılır ve bir dokunuşla okunan
 * yere dönülür.
 *
 * Kur'an sayfasında GÖSTERİLMEZ: orada tam şerit var, ikisi birden
 * aynı işi iki yerde yapardı.
 */
const route = useRoute()
const router = useRouter()

const show = computed(() => active.value && route.path !== '/kuran')

const where = computed(() => {
  const head = curSurah.value ? `${curSurah.value}. ${surahName.value}` : ''
  return curVerse.value ? `${head} · ${curVerse.value}. ayet` : head
})

/** Okunan yere dön: mushaf o ayette açılır. */
function goBack() {
  router.push({ path: '/kuran', query: { s: String(curPage.value ?? 1), a: `${curSurah.value}:${curVerse.value || 1}` } })
}
</script>

<template>
  <div v-if="show" class="mini">
    <button
      class="mini-play"
      :disabled="loading"
      :aria-label="playing ? 'Duraklat' : 'Devam et'"
      @click="toggle()"
    >{{ playing ? '❙❙' : '▶' }}</button>

    <button class="mini-info" aria-label="Okunan yere dön" @click="goBack">
      <span class="mini-where">{{ where }}</span>
      <span class="mini-who">
        {{ reciter?.name ?? '' }}
        <span v-if="error" class="mini-warn">· {{ error }}</span>
      </span>
    </button>

    <button class="mini-x" aria-label="Kıraati bırak" @click="stop()">×</button>
  </div>
</template>

<style scoped>
/* Mobilde akışta, alt gezinmenin hemen ÜSTÜNDE: üstüne binen bir çubuk
   sayfanın son satırını örterdi. Zemin mat kurulur — `--surface` bazı
   paletlerde saydam. */
.mini {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.6rem;
  border-top: 1px solid var(--border);
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
}

.mini-play {
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  font: inherit;
  font-size: 0.7rem;
  border: 1px solid var(--accent-ui);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.mini-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.mini-where,
.mini-who {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-where { font-size: 0.78rem; color: var(--text); }

.mini-who {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.mini-warn { color: var(--accent-ui); }

.mini-x {
  flex: 0 0 auto;
  width: 1.9rem;
  height: 1.9rem;
  font: inherit;
  font-size: 1rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.mini-x:hover { color: var(--text); }

/* Masaüstünde alt gezinme SOL RAY olduğu için çubuk akışta yeri yok:
   sağ alt köşede durur, içerikle yarışmadan. */
@media (min-width: 900px) {
  .mini {
    position: fixed;
    right: 1.25rem;
    bottom: 1.25rem;
    z-index: 40;
    width: min(20rem, calc(100vw - 2.5rem));
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.5rem 0.65rem;
  }
}
</style>

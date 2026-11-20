<script setup>
import { computed } from 'vue'
import { surahOfPage, versesOfPage } from '@/utils/mushaf'
import { useSettingsStore } from '@/stores/settings'
import { surahById } from '@/data/kuranMeta'
import { hasTimings } from '@/utils/recitation'
import {
  playing, loading, error, reciter, curSurah, curVerse,
  reciterId, playVerse, resume, pause, stop,
} from '@/stores/recitation'

/**
 * Dinleme şeridi — mukabele.
 *
 * Ayrı bir "Dinle" sayfası DEĞİL, okunan sayfanın üstüne oturan bir
 * şerit: ses çalarken okunan ayet mushafta vurgulanıyor ve kıraat
 * sayfanın sonuna gelince sayfa kendiliğinden çevriliyor. Dinlemek ve
 * okumak aynı anda olan bir iş; ikisini iki ekrana bölmek gözü
 * mushaftan koparıyor.
 *
 * **Ses burada DEĞİL** (`stores/recitation.js`): eleman bu şablonda
 * dururken Kur'an sayfasından çıkmak onu DOM'dan silip sesi kesiyordu.
 * Şerit artık yalnızca oynatıcının görünümü — açılıp kapanması
 * kıraati durdurmaz.
 */
const props = defineProps({
  page: { type: Number, required: true },
  /**
   * Sayfada işaretli ayet (`{ surah, verse }`) — gitme kutusundan,
   * seçiciden ya da hızlı erişimden gelen hedef. Kıraatin nereden
   * başlayacağını bu belirler: sure sayfanın ortasında başlıyor
   * olabiliyor (Kehf 293'te) ve yalnızca sayfaya bakılınca dinleme
   * sayfanın başındaki ÖNCEKİ sureden başlıyordu.
   */
  start: { type: Object, default: null },
})
const emit = defineEmits(['pick-reciter'])

const settings = useSettingsStore()

/**
 * Nereden başlanacak: işaretli ayet varsa oradan, yoksa sayfanın
 * suresinin sayfadaki ilk ayetinden.
 */
const target = computed(() => {
  const s = props.start?.surah ?? surahOfPage(props.page)?.id ?? 1
  if (props.start?.surah === s && props.start.verse) return { surah: s, verse: props.start.verse }
  const first = versesOfPage(props.page).find((v) => v.surah === s)
  return { surah: s, verse: first?.verse ?? 1 }
})

/** Şeritte yazan sure: çalan varsa o, yoksa başlanacak olan. */
const shownSurah = computed(() => curSurah.value || target.value.surah)
const surahName = computed(() => surahById(shownSurah.value)?.name ?? '')
const follows = computed(() => hasTimings(reciterId.value))

function onPlay() {
  if (playing.value) return pause()
  // Aynı surede duraklatılmışsa kaldığı yerden; değilse hedeften.
  if (curSurah.value === target.value.surah && curVerse.value) return resume()
  playVerse(target.value.surah, target.value.verse)
}
</script>

<template>
  <div class="listen">
    <button
      class="play"
      :disabled="loading"
      :aria-label="playing ? 'Duraklat' : 'Dinle'"
      @click="onPlay"
    >
      {{ playing ? '❙❙' : '▶' }}
    </button>

    <div class="info">
      <button class="who" @click="emit('pick-reciter')">
        {{ reciter?.name ?? 'Kârî seç' }}
        <span class="caret">▾</span>
      </button>
      <span class="what">
        {{ surahName }}
        <span v-if="!follows" class="warn">· ayet takibi yok</span>
        <span v-else-if="error" class="warn">· {{ error }}</span>
      </span>
    </div>

    <!-- Oto kaydırma: okunan ayet ekranın ortasında tutulsun mu.
         Anahtar şeritte, ayarlar sayfasında değil — dinlerken verilen
         bir karar ve etkisi hemen aynı ekranda görülüyor. -->
    <button
      class="follow"
      :class="{ on: settings.quranAutoScroll }"
      :aria-pressed="settings.quranAutoScroll"
      title="Okunan ayete kaydır"
      @click="settings.quranAutoScroll = !settings.quranAutoScroll"
    >
      <span class="follow-dot" aria-hidden="true" />
      Takip
    </button>

    <button class="x" aria-label="Dinlemeyi kapat" @click="stop()">×</button>
  </div>
</template>

<style scoped>
/* Takip anahtarı: açık/kapalı farkı nokta + dolgu ile okunuyor.
   Gerçek bir `input` değil, çünkü şeritte yer yok ve dokunma hedefi
   düğme kadar büyük olmalı. */
.follow {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  font: inherit;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.follow-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.35;
}

.follow.on {
  border-color: var(--accent-ui);
  color: var(--text);
}

.follow.on .follow-dot { background: var(--accent-ui); opacity: 1; }

/* Şerit sayfanın DİBİNDE ve akışta: üstüne binen bir çubuk olsaydı
   mushafın son satırını örterdi. */
.listen {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
}

.play {
  flex: 0 0 auto;
  width: 2.3rem;
  height: 2.3rem;
  font: inherit;
  font-size: 0.8rem;
  border: 1px solid var(--accent-ui);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.play:disabled { opacity: 0.4; cursor: default; }

.info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }

.who {
  font: inherit;
  font-size: 0.8rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text);
  text-align: start;
  cursor: pointer;
}

.caret { font-size: 0.6rem; color: var(--text-muted); }

.what {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.warn { color: var(--primary); }

.x {
  flex: 0 0 auto;
  width: 1.8rem;
  height: 1.8rem;
  font: inherit;
  font-size: 1.1rem;
  line-height: 1;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
</style>

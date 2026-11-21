<script setup>
import { ref, computed, watch } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useSettingsStore } from '@/stores/settings'
import { getFont } from '@/data/shareFonts'
import { authorById } from '@/data/kuranMeta'
import { mealFontById } from '@/data/mealFonts'
import { fetchVerse, eastern } from '@/utils/kuran'
import { hasTimings } from '@/utils/recitation'
import {
  playing, loading, error, reciter, reciterId, surahName,
  curSurah, curVerse, position, duration,
  toggle, step, seekTo, stop,
} from '@/stores/recitation'

/**
 * Oynatıcı ekranı.
 *
 * Şerit (`ListenBar`) okurken bakılan yerdir: tek satır, yalnızca
 * dur/kalk ve kârî. Ama bir de "yalnızca dinleniyor" hâli var —
 * sesi bir yere sarmak, okunan ayeti ve mealini görmek, ayet ayet
 * ilerlemek. Bunlar şeride sığmıyor ve sığdırılsa şerit mushafın
 * üstünde bir denetim paneline dönüyordu.
 *
 * Alt sayfa olarak açılıyor, yani okunan sayfanın üstüne biniyor ve
 * kapanınca mushaf olduğu gibi kalıyor. Kabuk ortak (`BottomSheet`) —
 * dördüncü müşterisi bu.
 *
 * Ayet metni `fetchVerse` ile gelir ve o katman önbellekli: aynı ayet
 * ikinci kez istendiğinde ağa çıkılmaz, yani ayet ayet ilerlemek her
 * adımda bir istek demek değil.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'pick-reciter'])

const settings = useSettingsStore()
const arFamily = computed(() => getFont(settings.quranFont).family)
const trFamily = computed(() => mealFontById(settings.quranMealFont).family)
const follows = computed(() => hasTimings(reciterId.value))

const verse = ref(null)
const verseErr = ref('')

/**
 * Okunan ayetin metni ve mealleri.
 *
 * Yalnızca sayfa AÇIKKEN istenir: kapalıyken her ayet değişiminde
 * istek atmak, görünmeyen bir şey için ağ trafiği demek.
 */
watch([() => props.open, curSurah, curVerse, () => settings.quranMeals], async () => {
  if (!props.open || !curSurah.value) return
  const want = { s: curSurah.value, v: curVerse.value || 1 }
  try {
    verseErr.value = ''
    const got = await fetchVerse(want.s, want.v, settings.quranMeals)
    // Geç gelen yanıt başka bir ayeti ezmesin: istek anındaki hedefle
    // o anki hedef karşılaştırılır (yanıtın kendi alan adlarına
    // güvenmeden).
    if (want.s === curSurah.value && want.v === (curVerse.value || 1))
      verse.value = { ...got, no: want.v }
  } catch (e) {
    verseErr.value = e.message ?? 'Ayet alınamadı'
  }
}, { immediate: true, deep: true })

const meals = computed(() => {
  if (!verse.value) return []
  return settings.quranMeals
    .map((id) => ({ id, name: authorById(id)?.name ?? '', text: verse.value.trs?.[id] ?? '' }))
    .filter((m) => m.text)
})

const clock = (sec) => {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const left = computed(() => (duration.value ? duration.value - position.value : 0))
const onSeek = (e) => seekTo(Number(e.target.value))
</script>

<template>
  <BottomSheet :open="open" label="Oynatıcı" @close="emit('close')">
    <template #head>
      <span class="title">Dinle</span>
      <button class="who" @click="emit('pick-reciter')">
        {{ reciter?.name ?? 'Kârî seç' }}
        <span v-if="reciter?.style" class="who-style">· {{ reciter.style }}</span>
        <span class="caret">▾</span>
      </button>
    </template>

    <div class="body">
      <p class="where">
        <span class="where-main">{{ curSurah }}. {{ surahName }}</span>
        <span v-if="curVerse" class="where-sub">{{ curVerse }}. ayet</span>
      </p>

      <!-- Sürgü: sesin neresinde olduğunu göstermek kadar oraya
           gitmeyi de sağlıyor. Sarılınca okunan ayet yeniden çözülür
           (bkz. stores/recitation `seekTo`) — ses bir yeri okurken
           mushafın başka bir yeri göstermesi en çok şaşırtan şeydi. -->
      <div class="seek">
        <input
          class="range"
          type="range"
          min="0"
          :max="duration || 0"
          step="1"
          :value="Math.min(position, duration || 0)"
          :disabled="!duration"
          aria-label="Kıraati sar"
          @input="onSeek"
        />
        <div class="times">
          <span>{{ clock(position) }}</span>
          <span>−{{ clock(left) }}</span>
        </div>
      </div>

      <div class="controls">
        <button class="ctl" :disabled="!follows || (curVerse || 1) <= 1" aria-label="Önceki ayet" @click="step(-1)">⏮</button>
        <button class="ctl ctl--main" :disabled="loading" :aria-label="playing ? 'Duraklat' : 'Devam et'" @click="toggle()">
          {{ playing ? '❙❙' : '▶' }}
        </button>
        <button class="ctl" :disabled="!follows" aria-label="Sonraki ayet" @click="step(1)">⏭</button>
        <button class="ctl ctl--off" aria-label="Kıraati bırak" @click="stop(); emit('close')">×</button>
      </div>

      <p v-if="!follows" class="note">Bu kârîde ayet takibi yok: ses çalar ama okunan ayet işaretlenmez.</p>
      <p v-else-if="error" class="note note--warn">{{ error }}</p>

      <!-- Okunan ayet ve karşılığı. Dinlerken mushafa bakmıyorsan
           okunanın ne olduğu da burada yazmalı. -->
      <section v-if="verse" class="verse">
        <p class="ar" dir="rtl" lang="ar" :style="{ fontFamily: arFamily }">
          {{ verse.ar }}
          <span class="ar-no">{{ eastern(verse.no) }}</span>
        </p>
        <p
          v-for="m in meals"
          :key="m.id"
          class="tr"
          :style="{ fontFamily: trFamily }"
        >
          <span v-if="meals.length > 1" class="tr-who">{{ m.name }}</span>
          {{ m.text }}
        </p>
      </section>
      <p v-else-if="verseErr" class="note note--warn">{{ verseErr }}</p>
    </div>
  </BottomSheet>
</template>

<style scoped>
.title {
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.who {
  margin-left: 0.6rem;
  font: inherit;
  font-size: 0.8rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.who-style, .caret { font-size: 0.62rem; color: var(--text-muted); }

.body { padding: 0.25rem 0.9rem 1.25rem; display: flex; flex-direction: column; gap: 0.9rem; }

.where { display: flex; align-items: baseline; gap: 0.5rem; margin: 0; }

.where-main { font-size: 1.15rem; letter-spacing: -0.01em; }

.where-sub {
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.seek { display: flex; flex-direction: column; gap: 0.2rem; }

/* Sürgü kendi çizimiyle: yerel görünüm paletlerde okunmuyor (koyu
   zeminde koyu ray). Ray `--border`, tutamak aksan rengi. */
.range {
  width: 100%;
  height: 1.1rem;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.range::-webkit-slider-runnable-track {
  height: 3px;
  border-radius: 999px;
  background: var(--border);
}

.range::-moz-range-track { height: 3px; border-radius: 999px; background: var(--border); }

.range::-webkit-slider-thumb {
  appearance: none;
  width: 0.85rem;
  height: 0.85rem;
  margin-top: -0.3rem;
  border-radius: 50%;
  background: var(--accent-ui);
  border: none;
}

.range::-moz-range-thumb {
  width: 0.85rem;
  height: 0.85rem;
  border: none;
  border-radius: 50%;
  background: var(--accent-ui);
}

.range:disabled { opacity: 0.4; cursor: default; }

.times {
  display: flex;
  justify-content: space-between;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.controls { display: flex; align-items: center; gap: 0.6rem; }

.ctl {
  flex: 0 0 auto;
  width: 2.4rem;
  height: 2.4rem;
  font: inherit;
  font-size: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.ctl:disabled { opacity: 0.3; cursor: default; }
.ctl--main { width: 3rem; height: 3rem; border-color: var(--accent-ui); }
.ctl--off { margin-left: auto; border: none; color: var(--text-muted); font-size: 1.2rem; }

.note { margin: 0; font-size: 0.7rem; line-height: 1.5; color: var(--text-muted); }
.note--warn { color: var(--primary); }

.verse {
  padding-top: 0.9rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.ar {
  margin: 0;
  font-size: 1.5rem;
  line-height: 2.2;
  text-align: right;
  color: var(--text);
}

.ar-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
  height: 1.5em;
  font-size: 0.5em;
  vertical-align: 0.5em;
  color: var(--accent-ui);
  border: 1px solid color-mix(in srgb, var(--accent-ui) 45%, transparent);
  border-radius: 50%;
}

.tr { margin: 0; font-size: 0.88rem; line-height: 1.65; color: var(--text); }

.tr-who {
  display: block;
  font-family: var(--font1);
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}
</style>

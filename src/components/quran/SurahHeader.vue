<script setup>
import { computed } from 'vue'
import { infoOf } from '@/data/surahInfo'
import { suraNameGlyph } from '@/utils/qpc'

/**
 * Sure başlığı — iki görünümün ortak bloğu.
 *
 * Mushafta sayfanın kendi süslemesi (tek glif) vardır ama o süsleme
 * Arapçadır: hangi sure olduğunu okuyabilen okur. Altına Türkçe ad,
 * anlamı ve künyesi konuyor — blok zeminli, çünkü sure başı sayfanın
 * içinde bir DURAK, akan metnin bir parçası değil.
 *
 * `variant`:
 *  - `mushaf` — süsleme glifi üstte, künye altında küçük
 *  - `flow`   — esnek görünümde süsleme yok, Türkçe ad başlıktır
 */
const props = defineProps({
  surah: { type: Number, required: true },
  name: { type: String, default: '' },
  variant: { type: String, default: 'flow' },
  /** Sure adı fontu yüklendiyse ailesi; yoksa glif basılmaz. */
  nameFont: { type: String, default: '' },
})
const emit = defineEmits(['info'])

const info = computed(() => infoOf(props.surah))
const title = computed(() => info.value?.name ?? props.name)
</script>

<template>
  <div class="sh" :class="variant">
    <span
      v-if="variant === 'mushaf' && nameFont"
      class="sh-glyph"
      :style="{ fontFamily: nameFont }"
      :aria-label="title"
    >{{ suraNameGlyph(surah) }}</span>

    <div class="sh-line">
      <span class="sh-name">{{ title }}</span>
      <span v-if="info" class="sh-meaning">{{ info.meaning }}</span>
      <span v-if="info" class="sh-dot">·</span>
      <span v-if="info" class="sh-meta">{{ info.place }} · {{ info.verses }} ayet</span>
      <button class="sh-info" aria-label="Sure hakkında" @click="emit('info', surah)">i</button>
    </div>
  </div>
</template>

<style scoped>
/* Zemin mat kurulur: `--surface` bazı paletlerde saydam ve altındaki
   sayfa gradyanı bloğun içinden görünüyor. */
.sh {
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  text-align: center;
}

.sh.mushaf { margin: 0.1em 0; }
.sh.flow { margin-bottom: 1rem; }

.sh-glyph {
  display: block;
  font-size: 1em;
  line-height: 1.3;
  color: var(--text);
}

.sh-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 0.35rem;
  font-family: var(--font1);
  direction: ltr;
}

.sh-name {
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text);
}

.sh.flow .sh-name { font-size: 0.95rem; }

.sh-meaning {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-style: italic;
}

.sh-dot { color: var(--text-muted); font-size: 0.6rem; }

.sh-meta {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Bilgi düğmesi künyenin SONUNDA, ayrı bir köşede değil: okunan
   satırın devamı, "daha fazlası" demek. */
.sh-info {
  flex: 0 0 auto;
  width: 1.15rem;
  height: 1.15rem;
  font: inherit;
  font-size: 0.6rem;
  font-style: italic;
  font-weight: 600;
  line-height: 1;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.sh-info:hover { border-color: var(--accent-ui); color: var(--text); }
</style>

<script setup>
import { computed, useId } from 'vue'
import { AUTHORS } from '@/data/kuranMeta'
import { MEAL_FONTS } from '@/data/mealFonts'
import BottomSheet from '@/components/ui/BottomSheet.vue'

/**
 * Meal seçici — ÇOKLU seçim.
 *
 * Yerel `select` yerine alt sayfa: dokuz meal arasında dili karışık bir
 * liste var ve açılır kutuda hangisinin Türkçe hangisinin İngilizce
 * olduğu ancak adından tahmin ediliyordu. Burada dil satırın kendisinde
 * bir rozet olarak duruyor.
 *
 * Seçim artık tek değil: birden fazla meal işaretlenebiliyor ve sayfada
 * yan yana okunuyor. Satıra dokunmak o meali açıp kapatır, sayfa açık
 * kalır — karşılaştırmalı okuma için meal seçmek bir değil birkaç
 * dokunuş. Liste boşsa meal kapalıdır; ayrı bir "kapalı" durumu yok,
 * en üstteki düğme yalnızca hepsini birden temizler.
 *
 * Yazı tipi de burada: meal uzun uzun okunan metindir ve Arapça metnin
 * hattı seçilebilirken karşılığının yazısı sabit kalıyordu.
 */
const props = defineProps({
  /** Seçili meal kimlikleri. */
  value: { type: Array, default: () => [] },
  open: { type: Boolean, default: false },
  canHideArabic: Boolean,
  arabicHidden: Boolean,
  /** Meal yazı tipi kimliği (`data/mealFonts.js`). */
  font: { type: String, default: 'sans' },
})
const emit = defineEmits(['close', 'toggle', 'clear', 'font', 'update:arabic-hidden'])

const arabicNote = useId()

const LANGS = { tr: 'Türkçe', en: 'İngilizce' }

const groups = computed(() => {
  const by = {}
  for (const a of AUTHORS) (by[a.lang] ??= []).push(a)
  return Object.entries(by).map(([lang, list]) => ({ lang, label: LANGS[lang] ?? lang, list }))
})

const on = (id) => props.value.includes(id)
</script>

<template>
  <BottomSheet :open="open" label="Meal seç" @close="emit('close')">
    <template #head>
      <span class="title">Meal</span>
      <span class="count">{{ value.length ? `${value.length} seçili` : 'kapalı' }}</span>
    </template>

    <!-- Yazı tipi listenin BAŞINDA: meal seçildikten sonra aşağı
         kaydırıp aramak gerekmesin, karar aynı yerde verilsin. -->
    <p class="group">Yazı tipi</p>
    <div class="fonts">
      <button
        v-for="f in MEAL_FONTS"
        :key="f.id"
        class="font"
        :class="{ on: font === f.id }"
        :style="{ fontFamily: f.family }"
        @click="emit('font', f.id)"
      >
        <span class="font-label">{{ f.label }}</span>
        <span class="font-note">{{ f.note }}</span>
      </button>
    </div>

    <p class="group">Okuma içeriği</p>
    <button
      v-if="canHideArabic"
      type="button"
      class="row"
      :class="{ on: arabicHidden }"
      :aria-pressed="arabicHidden"
      aria-label="Arapça kapalı"
      :aria-describedby="arabicNote"
      @click="emit('update:arabic-hidden', !arabicHidden)"
    >
      <span class="tick" aria-hidden="true">{{ arabicHidden ? '✓' : '' }}</span>
      <span class="row-main">Arapça kapalı</span>
      <span :id="arabicNote" class="row-note">{{ value.length ? 'yalnızca meal' : 'Diyanet meali açılır' }}</span>
    </button>
    <button type="button" class="row" :class="{ on: !value.length }" :aria-pressed="!value.length" @click="emit('clear')">
      <span class="tick" aria-hidden="true">{{ !value.length ? '✓' : '' }}</span>
      <span class="row-main">Meal kapalı</span>
      <span class="row-note">yalnızca Arapça</span>
    </button>

    <template v-for="g in groups" :key="g.lang">
      <p class="group">{{ g.label }}</p>
      <button
        v-for="a in g.list"
        :key="a.id"
        class="row"
        :class="{ on: on(a.id) }"
        :aria-pressed="on(a.id)"
        @click="emit('toggle', a.id)"
      >
        <span class="tick" aria-hidden="true">{{ on(a.id) ? '✓' : '' }}</span>
        <span class="row-main">{{ a.name }}</span>
        <span class="badge" :class="a.lang">{{ a.lang === 'tr' ? 'TR' : 'EN' }}</span>
      </button>
    </template>
  </BottomSheet>
</template>

<style scoped>
.title {
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.count {
  margin-left: 0.5rem;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--accent-ui);
}

/* Dil başlığı rozeti tekrarlıyor gibi görünse de işi farklı: başlık
   listeyi BÖLER, rozet tek satırı okurken dili söyler. */
.group {
  margin: 0.8rem 0 0.2rem;
  padding: 0 0.8rem;
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Her kare KENDİ yazısıyla yazar: adı değil görüntüsü seçtirir. */
.fonts { display: flex; gap: 0.4rem; padding: 0 0.8rem; }

.font {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-align: left;
}

.font.on { border-color: var(--accent-ui); background: color-mix(in srgb, var(--accent-ui) 12%, transparent); }
.font-label { font-size: 0.85rem; }
.font-note { font-size: 0.55rem; letter-spacing: 0.06em; color: var(--text-muted); font-family: var(--font1); }

.row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  font: inherit;
  text-align: start;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.row:focus-visible { outline: 2px solid var(--accent-ui); outline-offset: -2px; }

.row:hover { background: color-mix(in srgb, var(--text) 7%, transparent); }

.row.on {
  background: color-mix(in srgb, var(--accent-ui) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--accent-ui);
}

/* Onay işareti sabit genişlikte bir kolonda: açılıp kapandıkça adlar
   satırdan satıra kaymasın. */
.tick {
  flex: 0 0 1rem;
  font-size: 0.75rem;
  color: var(--accent-ui);
}

.row-main { flex: 1; min-width: 0; font-size: 0.88rem; }

.row-note {
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.badge {
  flex: 0 0 auto;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.badge.tr { border-color: var(--accent-ui); color: var(--text); }
</style>

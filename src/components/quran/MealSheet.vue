<script setup>
import { computed } from 'vue'
import { AUTHORS } from '@/data/kuranMeta'
import BottomSheet from '@/components/ui/BottomSheet.vue'

/**
 * Meal seçici.
 *
 * Yerel `select` yerine alt sayfa: dokuz meal arasında dili karışık bir
 * liste var ve açılır kutuda hangisinin Türkçe hangisinin İngilizce
 * olduğu ancak adından tahmin ediliyordu. Burada dil satırın kendisinde
 * bir rozet olarak duruyor.
 *
 * "Kapalı" listenin BAŞINDA: meali kapatmak bir meal seçmek kadar sık
 * yapılan bir iş (yalnızca Arapça okumak).
 */
defineProps({
  open: { type: Boolean, default: false },
  value: { type: Number, default: 0 },
})
const emit = defineEmits(['close', 'select'])

const LANGS = { tr: 'Türkçe', en: 'İngilizce' }

const groups = computed(() => {
  const by = {}
  for (const a of AUTHORS) (by[a.lang] ??= []).push(a)
  return Object.entries(by).map(([lang, list]) => ({ lang, label: LANGS[lang] ?? lang, list }))
})

function pick(id) {
  emit('select', id)
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" label="Meal seç" @close="emit('close')">
    <template #head><span class="title">Meal</span></template>

    <button class="row" :class="{ on: value === 0 }" @click="pick(0)">
      <span class="row-main">Meal kapalı</span>
      <span class="row-note">yalnızca Arapça</span>
    </button>

    <template v-for="g in groups" :key="g.lang">
      <p class="group">{{ g.label }}</p>
      <button
        v-for="a in g.list"
        :key="a.id"
        class="row"
        :class="{ on: value === a.id }"
        @click="pick(a.id)"
      >
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

/* Dil başlığı rozeti tekrarlıyor gibi görünse de işi farklı: başlık
   listeyi BÖLER, rozet tek satırı okurken dili söyler. */
.group {
  margin: 0.6rem 0 0.2rem;
  padding: 0 0.8rem;
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

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

.row:hover { background: color-mix(in srgb, var(--text) 7%, transparent); }

.row.on {
  background: color-mix(in srgb, var(--accent-ui) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--accent-ui);
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

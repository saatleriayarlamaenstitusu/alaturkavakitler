<script setup>
import { computed } from 'vue'
import { useWidgetFont } from './useWidgetFont'

// Şu anki vakit + sonraki vakit. Tüm metinler elle değiştirilebilir,
// boş bırakılan satır gizlenir.
const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)
const color = computed(() => (s.value.color === 'auto' ? props.accent : s.value.color))
const hasNext = computed(() => Boolean(s.value.next || s.value.nextTime))
const font = useWidgetFont(s, 700)
</script>

<template>
  <div class="w-vakit" :class="`is-${s.layout}`" :style="{ ...font, color }">
    <div class="block current">
      <div v-if="s.nowLabel" class="tag">{{ s.nowLabel }}</div>
      <div class="name">{{ s.current }}</div>
      <div v-if="s.currentTime" class="time">{{ s.currentTime }}</div>
    </div>

    <div v-if="hasNext" class="rule" aria-hidden="true"></div>

    <div v-if="hasNext" class="block next">
      <div v-if="s.nextLabel" class="tag">{{ s.nextLabel }}</div>
      <div class="name">{{ s.next }}</div>
      <div v-if="s.nextTime" class="time">{{ s.nextTime }}</div>
    </div>
  </div>
</template>

<style scoped>
.w-vakit {
  line-height: 1;
}

.tag {
  font-size: 22px;
  font-weight: var(--w-soft);
  letter-spacing: calc(0.3em + var(--ls, 0em));
  opacity: 0.5;
  margin-bottom: 14px;
}

.name {
  font-size: 76px;
  font-weight: var(--w);
  letter-spacing: calc(-0.03em + var(--ls, 0em));
}

.time {
  font-size: 40px;
  font-weight: var(--w-soft);
  letter-spacing: var(--ls, 0em);
  font-variant-numeric: tabular-nums;
  opacity: 0.72;
  margin-top: 12px;
}

/* ── Üst üste: şu anki vakit iri, sonraki altında ── */
.is-stacked {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.is-stacked .rule {
  width: 120px;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  margin: 26px 0;
}

.is-stacked .next .name { font-size: 48px; }
.is-stacked .next .time { font-size: 32px; }

/* ── Yan yana: iki vakit eşit ağırlıkta ── */
.is-inline {
  display: flex;
  align-items: center;
  gap: 40px;
}

.is-inline .rule {
  width: 3px;
  align-self: stretch;
  background: currentColor;
  opacity: 0.3;
}

.is-inline .name { font-size: 58px; }
.is-inline .time { font-size: 32px; }
.is-inline .next { opacity: 0.72; }
</style>

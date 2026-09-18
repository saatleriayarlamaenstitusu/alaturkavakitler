<script setup>
import { computed } from 'vue'
import { useWidgetFont } from './useWidgetFont'

const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)
const color = computed(() => (s.value.color === 'auto' ? props.accent : s.value.color))
const eventColor = computed(() =>
  s.value.eventColor === 'auto' ? props.accent : s.value.eventColor
)
const moonSrc = computed(() => `/Icons/moon/${s.value.moonDay}.svg`)
const font = useWidgetFont(s, 700)
</script>

<template>
  <div class="w-date" :class="`is-${s.variant}`" :style="{ ...font, color }">
    <img v-if="s.showMoon" class="moon" draggable="false" :src="moonSrc" :alt="`${s.moonDay}. gün ay`" />

    <div v-if="s.hijriDay" class="day">{{ s.hijriDay }}</div>

    <div class="info">
      <div v-if="s.hijriText" class="hijri">{{ s.hijriText }}</div>
      <div v-if="s.miladi" class="miladi">{{ s.miladi }}</div>
      <div v-if="s.event" class="event" :style="{ color: eventColor }">
        <span class="event-rule" aria-hidden="true"></span>
        <span class="event-text">{{ s.event }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.w-date {
  display: flex;
  align-items: center;
  gap: 26px;
}

/* ── Yatay: kart ve sade ── */
.is-card,
.is-plain {
  width: 720px;
}

.is-card {
  padding: 28px 34px;
  border-radius: 28px;
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.is-card .moon,
.is-plain .moon {
  order: 3;          /* ay sağda */
}

.day {
  font-size: 92px;
  font-weight: var(--w);
  line-height: 0.9;
  letter-spacing: calc(-0.04em + var(--ls, 0em));
  font-variant-numeric: tabular-nums;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.hijri {
  font-size: 40px;
  font-weight: var(--w);
  letter-spacing: calc(-0.01em + var(--ls, 0em));
  line-height: 1.05;
}

.miladi {
  font-size: 26px;
  font-weight: var(--w-soft);
  letter-spacing: var(--ls, 0em);
  opacity: 0.62;
}

/* ── Etkinlik: günün özel adı ── */
.event {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 4px;
}

.event-rule {
  width: 34px;
  height: 3px;
  background: currentColor;
  flex-shrink: 0;
  border-radius: 2px;
}

.event-text {
  font-size: 24px;
  font-weight: var(--w-soft);
  letter-spacing: calc(0.16em + var(--ls, 0em));
  text-transform: uppercase;
  line-height: 1.2;
}

.moon {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
}

/* ── Dikey minimal: ay üstte, her şey ortalı, zemin yok ── */
.is-vertical {
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
  width: 520px;
}

.is-vertical .moon {
  width: 72px;
  height: 72px;
  opacity: 0.85;
}

.is-vertical .day {
  font-size: 150px;
  line-height: 0.82;
  letter-spacing: calc(-0.05em + var(--ls, 0em));
}

.is-vertical .info {
  align-items: center;
  gap: 12px;
}

.is-vertical .hijri {
  font-size: 34px;
  letter-spacing: calc(0.02em + var(--ls, 0em));
}

.is-vertical .miladi {
  font-size: 24px;
}

.is-vertical .event {
  flex-direction: column;
  gap: 12px;
  margin-top: 6px;
}

.is-vertical .event-rule {
  width: 48px;
}
</style>

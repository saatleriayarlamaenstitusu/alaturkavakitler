<script setup>
import { computed } from 'vue'

const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)
const color = computed(() => (s.value.color === 'auto' ? props.accent : s.value.color))
const handColor = computed(() => (s.value.handColor === 'auto' ? props.accent : s.value.handColor))

// Akrep/yelkovan açıları, elle girilebilen "SS:DD" metninden türetilir.
const angles = computed(() => {
  const [h, m] = String(s.value.time ?? '').split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return { hour: 0, minute: 0 }
  return { hour: ((h % 12) + m / 60) * 30, minute: m * 6 }
})

const ticks = computed(() =>
  Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0
    return {
      i,
      x: major ? 98.75 : 99.5,
      y: major ? 8 : 12,
      w: major ? 2.5 : 1,
      h: major ? 12 : 3,
      o: major ? 0.75 : 0.3,
    }
  })
)
</script>

<template>
  <!-- SVG'de yalnızca dolgulu <rect>/<circle> kullanılır.
       stroke'lu <line>/<path>, foreignObject rasterizasyonunda
       tüm katmanı düşürüyor (bkz. export spike'ı). -->
  <svg class="w-analog" viewBox="0 0 200 200" width="380" height="380">
    <template v-if="s.showTicks">
      <rect
        v-for="t in ticks" :key="t.i"
        :x="t.x" :y="t.y" :width="t.w" :height="t.h"
        :fill="color" :fill-opacity="t.o"
        :transform="`rotate(${t.i * 6}, 100, 100)`"
      />
    </template>

    <rect
      x="98.5" y="28" width="3" height="80" :fill="color"
      :transform="`rotate(${angles.minute}, 100, 100)`"
    />
    <rect
      x="97" y="56" width="6" height="52" :fill="handColor"
      :transform="`rotate(${angles.hour}, 100, 100)`"
    />

    <circle cx="100" cy="100" r="4.5" :fill="color" />
    <circle cx="100" cy="100" r="2" :fill="handColor" />
  </svg>
</template>

<style scoped>
.w-analog { display: block; }
</style>

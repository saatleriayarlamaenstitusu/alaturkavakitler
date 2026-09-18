<script setup>
import { computed } from 'vue'

// Swiss/Uluslararası Tipografik üslupta ızgara: kenar boşluğu çerçevesi +
// sütun/satır ayraçları. Tuvalin tamamına yayılır, widget katmanlarının
// ALTINDA durur — çizgiler metnin arkasından geçer, okunaklığı bozmaz.
const props = defineProps({
  grid: { type: Object, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  accent: { type: String, default: '#ae002e' },
})

const color = computed(() => (props.grid.color === 'auto' ? props.accent : props.grid.color))

const inner = computed(() => {
  const m = props.grid.margin
  return { left: m, top: m, w: props.width - m * 2, h: props.height - m * 2 }
})

// Sütun ayraçları: n sütun → n-1 iç çizgi.
const verticals = computed(() => {
  const { left, w } = inner.value
  const n = props.grid.cols
  return Array.from({ length: Math.max(n - 1, 0) }, (_, i) => left + (w * (i + 1)) / n)
})

const horizontals = computed(() => {
  const { top, h } = inner.value
  const n = props.grid.rows
  return Array.from({ length: Math.max(n - 1, 0) }, (_, i) => top + (h * (i + 1)) / n)
})

const lineStyle = computed(() => ({
  background: color.value,
  opacity: props.grid.opacity,
}))
</script>

<template>
  <div class="grid-overlay" aria-hidden="true">
    <!-- Kenar boşluğu çerçevesi -->
    <div
      v-if="grid.frame"
      class="frame"
      :style="{
        left: `${inner.left}px`, top: `${inner.top}px`,
        width: `${inner.w}px`, height: `${inner.h}px`,
        borderWidth: `${grid.thickness}px`,
        borderColor: color,
        opacity: grid.opacity,
      }"
    ></div>

    <!-- Dikey ayraçlar: tuvalin tepesinden dibine kadar taşar -->
    <div
      v-for="(x, i) in verticals"
      :key="`v${i}`"
      class="line v"
      :style="{ ...lineStyle, left: `${x}px`, width: `${grid.thickness}px` }"
    ></div>

    <div
      v-for="(y, i) in horizontals"
      :key="`h${i}`"
      class="line h"
      :style="{ ...lineStyle, top: `${y}px`, height: `${grid.thickness}px` }"
    ></div>
  </div>
</template>

<style scoped>
.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.frame {
  position: absolute;
  border-style: solid;
}

.line { position: absolute; }

.line.v { top: 0; bottom: 0; }
.line.h { left: 0; right: 0; }
</style>

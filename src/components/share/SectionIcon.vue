<script setup>
import { computed } from 'vue'

/**
 * Ayar paneli bölüm başlıklarının yanındaki çizgi ikonu.
 * Tek çizgi kalınlığı, dik uçlar — başlıkla aynı ağırlıkta görünsün diye
 * dolgu yok, yalnızca kontur. Ad bulunamazsa genel bir işaret çizilir;
 * yeni bir grup eklenince panel ikonsuz kalmaz.
 *
 * Not: dışa aktarılan TUVAL parçalarında stroke'lu SVG kullanılmaz
 * (bkz. CLAUDE.md), burası arayüz — o sınır geçerli değil.
 */
const props = defineProps({
  name: { type: String, default: '' },
})

const SHAPES = {
  // Alan grupları
  icerik: [{ d: 'M2.5 4.5h11' }, { d: 'M2.5 8h11' }, { d: 'M2.5 11.5h7' }],
  tipografi: [{ d: 'M3.5 13 8 3l4.5 10' }, { d: 'M5.4 9.6h5.2' }],
  boyut: [
    { d: 'M2.5 6V2.5H6' },
    { d: 'M10 2.5h3.5V6' },
    { d: 'M13.5 10v3.5H10' },
    { d: 'M6 13.5H2.5V10' },
  ],
  gorunum: [{ c: [8, 8, 5.2] }, { d: 'M8 2.8a5.2 5.2 0 0 1 0 10.4z', solid: true }],
  // Takvim parçasının kendi grupları
  baslik: [{ d: 'M3.5 4h9' }, { d: 'M8 4v9' }],
  gunadi: [{ d: 'M2.5 6.5h2.6v3H2.5z' }, { d: 'M6.7 6.5h2.6v3H6.7z' }, { d: 'M10.9 6.5h2.6v3h-2.6z' }],
  sayi: [
    { c: [4, 4.5, 0.9], solid: true },
    { c: [8, 4.5, 0.9], solid: true },
    { c: [12, 4.5, 0.9], solid: true },
    { c: [4, 8, 0.9], solid: true },
    { c: [8, 8, 0.9], solid: true },
    { c: [12, 8, 0.9], solid: true },
    { c: [4, 11.5, 0.9], solid: true },
    { c: [8, 11.5, 0.9], solid: true },
  ],
  // Panel bölümleri
  preset: [{ d: 'M8 2.2 9.5 6.5 13.8 8 9.5 9.5 8 13.8 6.5 9.5 2.2 8 6.5 6.5z' }],
  zemin: [{ d: 'M2.5 2.5h11v11h-11z' }, { d: 'M13.5 2.5v11h-11z', solid: true }],
  ayar: [
    { d: 'M2.5 5.5h11' },
    { d: 'M2.5 10.5h11' },
    { c: [5.5, 5.5, 1.6] },
    { c: [10.5, 10.5, 1.6] },
  ],
  doku: [
    { c: [3.5, 4, 0.7], solid: true },
    { c: [8.5, 3, 0.7], solid: true },
    { c: [12.5, 5, 0.7], solid: true },
    { c: [5.5, 7.5, 0.7], solid: true },
    { c: [10, 8.5, 0.7], solid: true },
    { c: [3, 11, 0.7], solid: true },
    { c: [7.5, 12.5, 0.7], solid: true },
    { c: [12.5, 11.5, 0.7], solid: true },
  ],
  izgara: [{ d: 'M2.5 2.5h11v11h-11z' }, { d: 'M6.2 2.5v11' }, { d: 'M9.8 2.5v11' }, { d: 'M2.5 6.2h11' }, { d: 'M2.5 9.8h11' }],
  // Sekmeler
  ekle: [{ d: 'M8 2.5v11' }, { d: 'M2.5 8h11' }],
  arkaplan: [{ d: 'M2.5 3.5h11v9h-11z' }, { d: 'M2.5 10 6 7l3 2.5L11.5 7l2 1.8' }, { c: [5.5, 6, 1.1] }],
  oran: [{ d: 'M5.5 2.5v8h8' }, { d: 'M2.5 5.5h8v8' }],
  katman: [{ d: 'M8 2.5 14 6l-6 3.5L2 6z' }, { d: 'M2 10l6 3.5L14 10' }],
}

const FALLBACK = [{ d: 'M3.5 3.5h9v9h-9z' }]

const shapes = computed(() => SHAPES[props.name] ?? FALLBACK)
</script>

<template>
  <svg class="section-icon" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
    <template v-for="(s, i) in shapes" :key="i">
      <path v-if="s.d" :d="s.d" :class="{ solid: s.solid }" />
      <circle v-else :cx="s.c[0]" :cy="s.c[1]" :r="s.c[2]" :class="{ solid: s.solid }" />
    </template>
  </svg>
</template>

<style scoped>
.section-icon {
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.solid {
  fill: currentColor;
  stroke: none;
}
</style>

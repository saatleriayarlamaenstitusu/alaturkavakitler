<script setup>
import { computed } from 'vue'

// Kullanıcının Enter'la girdiği satır sonu tuvalde de satır sonu olmalı.
// `white-space: pre-wrap` yerine her satır ayrı bir düğüm: snapdom'un
// foreignObject rasterizasyonunda bu yol ölçülmüş ve çalışıyor, ayrıca
// her satır `dir="auto"` ile kendi yönünü bulabiliyor — karışık
// Arapça/Latin metinde satır bazında doğru akış veriyor.
const props = defineProps({
  text: { type: [String, Number], default: '' },
  // Tek satırlık metinde sarmalayıcı düğüm üretmemek için: çoğu widget'ın
  // tipografisi doğrudan bu elemana bağlı, gereksiz kutu eklemeyelim.
  dir: { type: String, default: 'auto' },
})

const lines = computed(() => String(props.text ?? '').split('\n'))
</script>

<template>
  <template v-if="lines.length === 1">{{ lines[0] }}</template>
  <template v-else>
    <div v-for="(line, i) in lines" :key="i" :dir="dir">{{ line || ' ' }}</div>
  </template>
</template>

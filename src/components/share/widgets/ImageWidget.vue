<script setup>
import { computed } from 'vue'

// Kullanıcının kendi görseli — tuvaldeki her şeyin üstüne binen bir katman.
// Asıl amacı karıştırma (blend): çarp/çıkar/aydınlat gibi modlarla alttaki
// fotoğrafa ya da vakit gradyanına karışan doku/desen katmanları.
//
// Karıştırma modu burada DEĞİL katmanın kendisinde uygulanır (`CanvasLayer`),
// çünkü `.layer` dönüşüm taşıdığı için yığın bağlamı açıyor: içeride verilen
// bir `mix-blend-mode` yalnızca o katmanın kendi içinde karışır, tuvale
// ulaşmaz. Widget yalnızca görseli ve kendi süzgeçlerini çizer.
const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)

const filter = computed(() => {
  const out = []
  if (s.value.grayscale) out.push('grayscale(1)')
  if (s.value.invert) out.push('invert(1)')
  const c = Number(s.value.contrast ?? 100)
  if (c !== 100) out.push(`contrast(${c}%)`)
  return out.length ? out.join(' ') : 'none'
})

const width = computed(() => `${Number(s.value.width) || 540}px`)
const radius = computed(() => `${Number(s.value.radius) || 0}px`)
</script>

<template>
  <div class="w-image" :style="{ width }">
    <img
      v-if="s.src"
      class="w-image-img"
      :src="s.src"
      :style="{ filter, borderRadius: radius }"
      draggable="false"
      alt=""
    />
    <!-- Görsel seçilmeden katman sıfır boyutlu olur ve tutulamazdı; boş
         durumda yerini belli eden bir kutu çizilir. -->
    <div v-else class="w-image-empty" :style="{ borderRadius: radius }">Görsel seç</div>
  </div>
</template>

<style scoped>
.w-image {
  display: block;
  line-height: 0;
}

.w-image-img {
  display: block;
  width: 100%;
  height: auto;
}

.w-image-empty {
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.45);
  color: rgba(255, 255, 255, 0.6);
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.04em;
}
</style>

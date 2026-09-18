<script setup>
import { computed } from 'vue'

// Film grain. Doku, uygulamanın base.css'teki grain'iyle aynı kaynaktan
// gelir (feTurbulence, fractalNoise) — tuvalde ve uygulamada aynı karakter.
// Arka planın hemen üstünde, grid ve widget katmanlarının ALTINDA durur:
// fotoğrafa/gradyana doku verir ama metni kumlamaz.
const props = defineProps({
  grain: { type: Object, required: true },
})

const NOISE = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const style = computed(() => ({
  opacity: props.grain.opacity,
  mixBlendMode: props.grain.blend,
  backgroundImage: NOISE,
  backgroundSize: `${props.grain.size}px ${props.grain.size}px`,
}))
</script>

<template>
  <div class="grain" :style="style" aria-hidden="true"></div>
</template>

<style scoped>
.grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>

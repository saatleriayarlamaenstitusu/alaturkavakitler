<script setup>
import { computed } from 'vue'

/**
 * Hatim ilerlemesinin görselleştirmesi.
 *
 * Behold'daki "içi gradyanla dolan yuvarlak" fikri, ama dolu bir daire
 * değil OTUZ DİLİM: hatim cüz cüz okunur, dolayısıyla halka da cüz cüz
 * dolmalı. Tek parça bir yay "yüzde kaç" der; otuz dilim "kaçıncı
 * cüzdeyim" der ve soru genellikle budur.
 *
 * Dilimler stroke'lu çizilmiyor — dolgulu `<rect>`ler bir grupta
 * döndürülüyor. Paylaşım tuvaline taşınacağı gün stroke'lu SVG'nin
 * dışa aktarımı çökerttiği kuralı hatırlamak gerekir (bkz. CLAUDE.md).
 */
const props = defineProps({
  ratio: { type: Number, default: 0 },
  size: { type: Number, default: 120 },
  segments: { type: Number, default: 30 },
})

const slices = computed(() => {
  const n = props.segments
  const filled = props.ratio * n
  return Array.from({ length: n }, (_, i) => ({
    angle: (360 / n) * i,
    // Son dolan dilim kısmen dolu: keskin bir sınır yerine sönümlenme,
    // ilerlemenin bir eşikte değil akışta olduğunu söylüyor.
    on: Math.min(1, Math.max(0, filled - i)),
  }))
})

const percent = computed(() => Math.round(props.ratio * 100))
</script>

<template>
  <svg class="ring" :width="size" :height="size" viewBox="0 0 100 100" role="img"
       :aria-label="`%${percent} tamamlandı`">
    <g v-for="(s, i) in slices" :key="i" :transform="`rotate(${s.angle} 50 50)`">
      <rect x="48.4" y="6" width="3.2" height="13" rx="1.2"
            :fill="s.on > 0 ? 'currentColor' : 'var(--text)'"
            :opacity="s.on > 0 ? 0.25 + 0.75 * s.on : 0.12" />
    </g>
    <text x="50" y="52" class="num" text-anchor="middle">{{ percent }}</text>
    <text x="50" y="64" class="unit" text-anchor="middle">%</text>
  </svg>
</template>

<style scoped>
.ring {
  color: var(--accent-ui);
  flex: 0 0 auto;
}

.num {
  fill: var(--text);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.unit {
  fill: var(--text-muted);
  font-size: 8px;
  letter-spacing: 0.1em;
}
</style>

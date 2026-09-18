<script setup>
import { computed } from 'vue'
import { useWidgetFont } from './useWidgetFont'
import { localizeNumerals } from '@/utils/numerals'

// Widget'lar saftır: tek veri kaynağı `settings`. Değerler katman eklenirken
// anlık görüntüden doldurulur, sonrasında kullanıcı serbestçe değiştirebilir.
// Boş bırakılan alan render edilmez.
const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)
const color = computed(() => (s.value.color === 'auto' ? props.accent : s.value.color))
const hasFoot = computed(() => Boolean(s.value.normal || s.value.city))
const font = useWidgetFont(s, 700)

// Üç metin satırının boyutu ayrı ayrı ayarlanır. Eski kayıtlarda bu alanlar
// olmayabileceği için CSS tarafında tasarım değerleri yedek olarak duruyor.
const num = (v) => localizeNumerals(v, s.value.numerals)

const sizes = computed(() => ({
  '--size-label': s.value.labelSize ? `${s.value.labelSize}px` : null,
  '--size-time': s.value.timeSize ? `${s.value.timeSize}px` : null,
  '--size-foot': s.value.footSize ? `${s.value.footSize}px` : null,
}))
</script>

<template>
  <div class="w-clock" :style="{ ...font, ...sizes, color, textAlign: s.align }">
    <div v-if="s.label" class="label">{{ s.label }}</div>
    <div class="time">{{ num(s.time) }}</div>
    <div v-if="hasFoot" class="foot">
      <span v-if="s.normal">{{ num(s.normal) }}</span>
      <span v-if="s.normal && s.city" class="dot">·</span>
      <span v-if="s.city">{{ s.city }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Ölçüler tuval birimindedir (1080px genişlikte çıktı pikseli). */
.w-clock {
  line-height: 1;
  white-space: nowrap;
}

.label {
  font-size: var(--size-label, 30px);
  font-weight: var(--w-soft);
  letter-spacing: calc(0.42em + var(--ls, 0em));
  opacity: 0.55;
  margin-bottom: 0.87em;
}

.time {
  font-size: var(--size-time, 250px);
  font-weight: var(--w);
  letter-spacing: calc(-0.05em + var(--ls, 0em));
  font-variant-numeric: tabular-nums;
}

.foot {
  margin-top: 0.88em;
  font-size: var(--size-foot, 34px);
  font-weight: var(--w-soft);
  letter-spacing: calc(0.06em + var(--ls, 0em));
  opacity: 0.7;
}

.dot { margin: 0 14px; }
</style>

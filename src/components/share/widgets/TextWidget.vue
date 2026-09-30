<script setup>
import { computed } from 'vue'
import { useWidgetFont } from './useWidgetFont'
import WidgetLines from './WidgetLines.vue'

const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  accent: { type: String, default: '#ae002e' },
})

const s = computed(() => props.settings)
const color = computed(() => (s.value.color === 'auto' ? props.accent : s.value.color))
const font = useWidgetFont(s, 600)
</script>

<template>
  <div
    class="w-text"
    :style="{
      ...font,
      color,
      fontSize: `${s.size}px`,
      textAlign: s.align,
      textTransform: s.uppercase ? 'uppercase' : 'none',
    }"
  >
    <!-- Satır sonları ve satır bazlı yön için ortak bileşen. -->
    <WidgetLines :text="s.text" />
  </div>
</template>

<style scoped>
.w-text {
  font-weight: var(--w);
  line-height: 1.22;
  letter-spacing: calc(-0.015em + var(--ls, 0em));
  max-width: 900px;
  word-break: break-word;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { calculateAlaturka } from '@/utils/clock'
import { DateTime } from 'luxon'

const appStore = useAppStore()
const now = ref(DateTime.now())
let intervalId = null

const alaturkaStr = computed(() => calculateAlaturka(now.value, appStore.vakitler))

const hands = computed(() => {
  const t = alaturkaStr.value
  if (!t || t === '--:--') return { hour: 0, minute: 0 }
  const [h, m] = t.split(':').map(Number)
  return {
    hour: ((h % 12) + m / 60) * 30,
    minute: m * 6,
  }
})

onMounted(() => {
  intervalId = setInterval(() => { now.value = DateTime.now() }, 1000)
})

onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <svg viewBox="0 0 200 200" class="analog-clock" aria-label="Alaturka saat">
    <!-- Dakika çizgileri (60) — Swiss demiryolu saati stili -->
    <g v-for="i in 60" :key="i" :transform="`rotate(${i * 6}, 100, 100)`">
      <line
        x1="100"
        :y1="i % 5 === 0 ? 8 : 12"
        x2="100"
        :y2="i % 5 === 0 ? 20 : 15"
        stroke="currentColor"
        :stroke-opacity="i % 5 === 0 ? 0.7 : 0.28"
        :stroke-width="i % 5 === 0 ? 2.5 : 1"
        stroke-linecap="butt"
      />
    </g>

    <!-- Yelkovan (dakika) — uzun, nötr -->
    <line
      x1="100" y1="108"
      x2="100" y2="28"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="butt"
      :transform="`rotate(${hands.minute}, 100, 100)`"
    />

    <!-- Akrep (saat) — kısa, vakit renginde -->
    <line
      class="hand-hour"
      x1="100" y1="108"
      x2="100" y2="56"
      stroke-width="6"
      stroke-linecap="butt"
      :transform="`rotate(${hands.hour}, 100, 100)`"
    />

    <!-- Merkez -->
    <circle cx="100" cy="100" r="4.5" fill="currentColor" />
    <circle cx="100" cy="100" r="2" class="hand-hour" :style="{ fill: 'var(--primary)' }" stroke="none" />
  </svg>
</template>

<style scoped>
.analog-clock {
  width: 100%;
  max-width: 280px;
  height: auto;
  display: block;
  margin: 0 auto;
  color: var(--text);
}

/* Akrep vakit renginde (yelkovan currentColor/--text kalır) */
.hand-hour {
  stroke: var(--primary);
}
</style>

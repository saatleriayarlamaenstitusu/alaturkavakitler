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
    <!-- Yüz kenarı -->
    <circle cx="100" cy="100" r="94" stroke="currentColor" stroke-opacity="0.14" stroke-width="1" fill="none" />

    <!-- Saat çizgileri (dış kenar) -->
    <g v-for="i in 12" :key="i" :transform="`rotate(${i * 30}, 100, 100)`">
      <line
        x1="100"
        :y1="i % 3 === 0 ? 8 : 11"
        x2="100"
        y2="17"
        stroke="currentColor"
        :stroke-opacity="i % 3 === 0 ? 0.55 : 0.22"
        :stroke-width="i % 3 === 0 ? 2 : 1"
      />
    </g>

    <!-- Yelkovan (dakika) — uzun, nötr -->
    <line
      x1="100" y1="100"
      x2="100" y2="30"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="butt"
      :transform="`rotate(${hands.minute}, 100, 100)`"
    />

    <!-- Akrep (saat) — kısa, vakit renginde -->
    <line
      class="hand-hour"
      x1="100" y1="100"
      x2="100" y2="58"
      stroke-width="5"
      stroke-linecap="butt"
      :transform="`rotate(${hands.hour}, 100, 100)`"
    />

    <!-- Merkez -->
    <circle cx="100" cy="100" r="4" fill="currentColor" />
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

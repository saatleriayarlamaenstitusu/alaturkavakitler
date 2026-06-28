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

    <!-- Dış halka -->
    <circle cx="100" cy="100" r="94" stroke="var(--primary)" stroke-opacity="0.25" stroke-width="1" fill="none" />
    <circle cx="100" cy="100" r="88" stroke="currentColor" stroke-opacity="0.08" stroke-width="1" fill="none" />

    <!-- Saat çizgileri -->
    <g v-for="i in 12" :key="i" :transform="`rotate(${i * 30}, 100, 100)`">
      <rect
        x="99.25"
        :y="i % 3 === 0 ? '8' : '12'"
        width="1.5"
        :height="i % 3 === 0 ? '15' : '8'"
        rx="0.75"
        fill="currentColor"
        :fill-opacity="i % 3 === 0 ? 0.8 : 0.28"
      />
    </g>

    <!-- Dakika çizgileri (ince) -->
    <g v-for="j in 60" :key="'m' + j" :transform="`rotate(${j * 6}, 100, 100)`">
      <rect
        v-if="j % 5 !== 0"
        x="99.5"
        y="13"
        width="1"
        height="4"
        rx="0.5"
        fill="currentColor"
        fill-opacity="0.1"
      />
    </g>

    <!-- Akrep (saat) -->
    <line
      x1="100" y1="64"
      x2="100" y2="104"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      :transform="`rotate(${hands.hour}, 100, 100)`"
    />

    <!-- Yelkovan (dakika) -->
    <line
      x1="100" y1="26"
      x2="100" y2="104"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      :transform="`rotate(${hands.minute}, 100, 100)`"
    />

    <!-- Merkez -->
    <circle cx="100" cy="100" r="5" fill="var(--primary)" />
    <circle cx="100" cy="100" r="2" fill="currentColor" opacity="0.6" />
  </svg>
</template>

<style scoped>
.analog-clock {
  width: 100%;
  max-width: 300px;
  height: auto;
  display: block;
  margin: 0 auto;
  color: var(--text);
  filter: drop-shadow(0 0 30px color-mix(in srgb, var(--primary) 30%, transparent));
}
</style>

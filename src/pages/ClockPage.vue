<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { calculateAlaturka } from '@/utils/clock'
import { nowHijri } from '@/utils/hijri'
import { DateTime } from 'luxon'
import AnalogClock from '@/components/clock/AnalogClock.vue'
import { useSeo } from '@/composables/useSeo'

useSeo({
  title: 'Alaturka Saat',
  description:
    'Alaturka (ezani) saati dijital ve analog olarak canlı görün. Son akşam ezanından itibaren geçen süreyi anlık takip edin.',
  path: '/saat',
})

const appStore = useAppStore()
const now = ref(DateTime.now())
let intervalId = null

const alaturkaTime = computed(() => calculateAlaturka(now.value, appStore.vakitler))
const normalTime = computed(() => now.value.setLocale('tr').toLocaleString(DateTime.TIME_SIMPLE))

const hijri = computed(() => nowHijri('object'))
const hijriLine = computed(() => `${hijri.value.date} ${hijri.value.monthName} ${hijri.value.year}`)
const miladiLine = computed(() => {
  const d = now.value.setLocale('tr')
  return `${d.day} ${d.monthLong} ${d.year}`
})

onMounted(() => {
  intervalId = setInterval(() => { now.value = DateTime.now() }, 1000)
})

onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div class="clock-page">
    <h1 class="page-title">saat</h1>

    <div class="clock-content">
      <div class="analog-section">
        <AnalogClock />
      </div>

      <div class="clock-divider"></div>

      <div class="digital-section">
        <span class="clock-label">Alaturka</span>
        <div class="alaturka-time">{{ alaturkaTime }}</div>
        <div class="normal-time">{{ normalTime }}</div>
      </div>

      <div class="date-block">
        <div class="date-col date-col--left">
          <span class="date-label">Hicri</span>
          <span class="date-value">{{ hijriLine }}</span>
        </div>
        <div class="date-col date-col--right">
          <span class="date-label">Miladi</span>
          <span class="date-value">{{ miladiLine }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clock-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.clock-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding:0 1rem;
  gap: 2rem;
}

.digital-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.clock-label {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.alaturka-time {
  font-size: 4.5rem;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font2);
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.normal-time {
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--text-muted);
  font-family: var(--font2);
  font-variant-numeric: tabular-nums;
}

.analog-section {
  width: 100%;
  max-width: 320px;
  align-self: center;
}

.clock-divider {
  height: 1px;
  width: 100%;
  background: var(--border);
}

/* Hicri solda, Miladi sağda; her biri label üstte tarih altta */
.date-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.date-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-col--right {
  text-align: right;
}

.date-label {
  font-size: 0.55rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.date-value {
  font-size: 0.85rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  color: var(--text);
}
</style>

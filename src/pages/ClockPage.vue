<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { calculateAlaturka } from '@/utils/clock'
import { DateTime } from 'luxon'
import AnalogClock from '@/components/clock/AnalogClock.vue'

const appStore = useAppStore()
const now = ref(DateTime.now())
let intervalId = null

const alaturkaTime = computed(() => calculateAlaturka(now.value, appStore.vakitler))
const normalTime = computed(() => now.value.setLocale('tr').toLocaleString(DateTime.TIME_SIMPLE))

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

      <div class="digital-section">
        <div class="alaturka-time">{{ alaturkaTime }}</div>
        <div class="normal-time">{{ normalTime }}</div>
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
  align-items: center;
  justify-content: center;
  padding: 2rem 2rem 3rem;
  gap: 2.5rem;
}

.analog-section {
  width: 100%;
  max-width: 300px;
}

.digital-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.alaturka-time {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font2);
  line-height: 1;
  letter-spacing: -0.02em;
}

.normal-time {
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--text-muted);
  font-family: var(--font2);
}
</style>

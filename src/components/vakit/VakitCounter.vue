<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { findVakit, isKerahat } from '@/utils/vakit'
import { DateTime } from 'luxon'

const appStore = useAppStore()
const counter = ref({ hours: 0, minutes: 0, seconds: 0 })
let intervalId = null

function pad(n) {
  return String(Math.floor(Math.abs(n))).padStart(2, '0')
}

const counterDisplay = computed(() => {
  const { hours, minutes, seconds } = counter.value
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
})

const kerahat = computed(() => {
  if (!appStore.vakit || !appStore.currentVakit) return false
  return isKerahat(counter.value, appStore.currentVakit, appStore.vakit)
})

function tick() {
  const { vakit } = appStore
  if (!vakit) return

  const now = DateTime.now()
  const found = findVakit(vakit)

  if (found !== appStore.currentVakit) {
    appStore.setCurrentVakit(found)
  }

  const currentKey = appStore.currentVakit
  if (!currentKey || !vakit[currentKey]) return

  const nextKey = vakit[currentKey].next
  const nextVakitObj = (currentKey === 'yatsi' && vakit[nextKey].valueDateObj < now)
    ? vakit[nextKey].valueDateObj2
    : vakit[nextKey].valueDateObj

  if (!nextVakitObj) return

  const dur = now.until(nextVakitObj).toDuration(['hours', 'minutes', 'seconds']).toObject()
  counter.value = dur
}

function startInterval() {
  if (intervalId) clearInterval(intervalId)
  tick()
  intervalId = setInterval(tick, 1000)
}

watch(() => appStore.vakit, (newVakit) => {
  if (newVakit) startInterval()
}, { immediate: true })

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div v-if="appStore.loading" class="vakit-counter vakit-counter--loading">
    <span>Yükleniyor…</span>
  </div>

  <div v-else-if="appStore.error" class="vakit-counter vakit-counter--error">
    <span>Bağlantı hatası</span>
  </div>

  <div v-else-if="appStore.currentVakit && appStore.vakit" class="vakit-counter">
    <div class="vakit-badges">
      <span class="badge badge--current">{{ appStore.vakit[appStore.currentVakit].name }}</span>
      <span class="badge-separator"></span>
      <span class="badge">{{ appStore.vakit[appStore.vakit[appStore.currentVakit].next].name }}</span>
    </div>

    <span class="counter-label">Vaktin çıkmasına</span>
    <div class="counter">{{ counterDisplay }}</div>

    <span v-if="kerahat" class="kerahat">Kerahat</span>
  </div>
</template>

<style scoped>
.vakit-counter {
  color: var(--text);
}

.vakit-badges {
  display: flex;
  align-items: center;
}

.badge {
  font-size: 0.75rem;
  font-weight: 300;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--text-muted);
  color: var(--text-muted);
}

.badge--current {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  opacity: 1;
}

.badge-separator {
  flex: 1;
  margin: 0 0.75rem;
  height: 1px;
  background: var(--text);
  opacity: 0.2;
}

.counter-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 300;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-top: 1.25rem;
  line-height: 1;
}

.counter {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  margin-top: 0.4rem;
  font-family: var(--font2);
  font-variant-numeric: tabular-nums;
}

.kerahat {
  display: inline-block;
  background: #991b1b;
  color: #fff;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem 0.25rem 2em;
  border-radius: 5px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  position: relative;
  overflow: hidden;
}

.kerahat::before {
  content: "!";
  position: absolute;
  left: -2px;
  top: -2px;
  font-size: 2em;
  font-weight: 900;
  line-height: 0.5;
  background: white;
  color: #991b1b;
  padding: 3px 6px;
  z-index: 3;
  border-radius: 10px;
}
</style>

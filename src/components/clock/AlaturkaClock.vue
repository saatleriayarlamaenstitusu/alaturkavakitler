<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { calculateAlaturka } from '@/utils/clock'
import { DateTime } from 'luxon'

const appStore = useAppStore()
const now = ref(DateTime.now())
let intervalId = null

const alaturkaTime = computed(() => calculateAlaturka(now.value, appStore.vakitler))
const normalTime = computed(() => now.value.setLocale('tr').toLocaleString(DateTime.TIME_SIMPLE))

onMounted(() => {
  intervalId = setInterval(() => { now.value = DateTime.now() }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="clock">
    <div class="primary-clock">{{ alaturkaTime }}</div>
    <div class="secondary-clock">{{ normalTime }}</div>
  </div>
</template>

<style scoped>
.clock {
  display: flex;
  flex-direction: column;
}

.primary-clock {
  font-size: 4.5rem;
  font-weight: 900;
  color: var(--text);
  font-family: var(--font2);
  line-height: 1;
}

.secondary-clock {
  font-size: 1.5rem;
  font-weight: 200;
  color: var(--text);
  font-family: var(--font2);
  margin-top: 0.25rem;
}
</style>

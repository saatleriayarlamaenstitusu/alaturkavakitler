<script setup>
import AlaturkaClock from '@/components/clock/AlaturkaClock.vue'
import LedClock from '@/components/clock/LedClock.vue'
import VakitCounter from '@/components/vakit/VakitCounter.vue'
import VakitList from '@/components/vakit/VakitList.vue'
import CalendarWidget from '@/components/calendar/CalendarWidget.vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
</script>

<template>
  <div class="home-page">
    <div class="clock-section">
      <LedClock v-if="settings.homeClock === 'led'" />
      <AlaturkaClock v-else />
    </div>
    <div class="vakit-block">
      <VakitCounter />
      <VakitList />
    </div>
    <div class="calendar-section">
      <CalendarWidget />
    </div>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 1rem;
}

.clock-section {
  flex: 1;
}

/* Kalan vakit sayacı + vakit listesi tek bir bütün blok */
.vakit-block {
  padding: 0.75rem 0 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
}

.calendar-section {
  padding: 1rem 0 0.25rem;
  border-top: 1px solid var(--border);
}
</style>

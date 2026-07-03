<script setup>
import HijriMonthCalendar from '@/components/calendar/HijriMonthCalendar.vue'
import { useSeo } from '@/composables/useSeo'

useSeo({
  title: 'Hicri Takvim',
  description:
    'Aylık hicri takvim, miladi karşılıkları ve ay fazları. Hicri ve miladi tarihleri bir arada görün.',
  path: '/takvim',
})
</script>

<template>
  <div class="calendar-page">
    <h1 class="page-title">takvim</h1>
    <HijriMonthCalendar />
  </div>
</template>

<style scoped>
.calendar-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 1.5rem;
}

.calendar-page :deep(.hijri-month) {
  flex: 1;
}
</style>

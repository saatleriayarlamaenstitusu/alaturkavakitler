<script setup>
import HijriMonthCalendar from '@/components/calendar/HijriMonthCalendar.vue'
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

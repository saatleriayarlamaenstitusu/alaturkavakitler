<script setup>
import AlaturkaClock from '@/components/clock/AlaturkaClock.vue'
import VakitCounter from '@/components/vakit/VakitCounter.vue'
import VakitList from '@/components/vakit/VakitList.vue'
import VakitRangeView from '@/components/vakit/VakitRangeView.vue'
</script>

<template>
  <div class="home-page">
    <div class="clock-section">
      <AlaturkaClock />
    </div>
    <div class="counter-section">
      <VakitCounter />
    </div>
    <div class="list-section">
      <VakitList />
    </div>
    <div class="range-section">
      <VakitRangeView />
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
  padding: 2.5rem 1.25rem 0;
}

.counter-section {
  padding: 2.5rem 1.25rem 0;
}

.list-section {
  padding: 0.75rem 1.25rem 1.25rem;
}

.range-section {
  margin-top: auto;
}
</style>

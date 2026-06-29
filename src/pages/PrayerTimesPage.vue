<script setup>
import VakitCounter from '@/components/vakit/VakitCounter.vue'
import VakitList from '@/components/vakit/VakitList.vue'
import VakitRangeView from '@/components/vakit/VakitRangeView.vue'
</script>

<template>
  <div class="prayer-times-page">
    <h1 class="page-title">vakitler</h1>
    <div class="counter-section">
      <VakitCounter />
    </div>
    <div class="list-section">
      <VakitList />
    </div>
    <VakitRangeView />
  </div>
</template>

<style scoped>
.prayer-times-page {
  padding: 0 1.25rem 1.25rem;
}

.counter-section {
  margin-top: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.list-section {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}
</style>

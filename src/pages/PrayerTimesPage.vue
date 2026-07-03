<script setup>
import VakitCounter from '@/components/vakit/VakitCounter.vue'
import VakitList from '@/components/vakit/VakitList.vue'
import VakitRangeView from '@/components/vakit/VakitRangeView.vue'
import { useSeo } from '@/composables/useSeo'

useSeo({
  title: 'Namaz Vakitleri',
  description:
    'Şehrinize göre güncel namaz vakitleri: imsak, güneş, öğle, ikindi, akşam ve yatsı. Kalan süre ve kerahat vakitleri.',
  path: '/vakitler',
})
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

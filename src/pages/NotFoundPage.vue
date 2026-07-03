<script setup>
import { RouterLink } from 'vue-router'
import { useSeo } from '@/composables/useSeo'

useSeo({
  title: 'Sayfa Bulunamadı',
  description: 'Aradığınız sayfa bulunamadı.',
})
</script>

<template>
  <div class="not-found-page">
    <h1 class="code">404</h1>
    <p>Sayfa bulunamadı.</p>
    <RouterLink to="/">Ana sayfaya dön</RouterLink>
  </div>
</template>

<style scoped>
.not-found-page {
  padding: 2rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: white;
}

.code {
  font-size: 5rem;
  font-weight: 900;
  font-family: var(--font2);
  opacity: 0.3;
}

a {
  color: white;
  text-decoration: underline;
}
</style>

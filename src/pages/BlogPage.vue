<script setup>
defineProps({
  page: { type: String, default: '' },
})
</script>

<template>
  <div class="blog-page">
    <h1 class="page-title">{{ page === 'yenilikler' ? 'yenilikler' : 'saat üzerine' }}</h1>
    <p class="placeholder">İçerik yakında.</p>
  </div>
</template>

<style scoped>
.blog-page {
  padding: 0 1.25rem;
}

.placeholder {
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1rem;
}
</style>

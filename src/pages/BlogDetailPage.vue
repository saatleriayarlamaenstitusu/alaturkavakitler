<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="blog-detail-page">
    <p class="placeholder">İçerik yakında. ({{ route.params.page }} / {{ route.params.id }})</p>
  </div>
</template>

<style scoped>
.blog-detail-page {
  padding: 1.25rem;
}

.placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>

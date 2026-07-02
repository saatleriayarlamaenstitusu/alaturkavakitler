<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getItem } from '@/content'

const route = useRoute()
const item = computed(() => getItem(route.params.page, route.params.id))
const paragraphs = computed(() => (item.value?.body || '').split('\n\n').filter(Boolean))
</script>

<template>
  <div class="blog-detail-page">
    <template v-if="item">
      <RouterLink :to="`/${route.params.page}`" class="back-link">‹ geri</RouterLink>

      <h1 class="detail-title">{{ item.title }}</h1>
      <div class="detail-meta">
        <span v-if="item.author" class="detail-author">{{ item.author }}</span>
        <span v-if="item.source" class="detail-source">{{ item.source }}</span>
      </div>

      <img v-if="item.cover" :src="item.cover" :alt="item.title" class="detail-cover" />

      <div class="detail-body">
        <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
      </div>
    </template>

    <p v-else class="placeholder">İçerik bulunamadı.</p>
  </div>
</template>

<style scoped>
.blog-detail-page {
  padding: 0 1.25rem 3rem;
}

.back-link {
  display: inline-block;
  margin: 1rem 0 1.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: none;
}

.detail-title {
  font-family: var(--font2);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
}

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.detail-author {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text);
}

.detail-source {
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--text-muted);
}

.detail-cover {
  width: 100%;
  height: auto;
  border-radius: var(--radius);
  margin: 1.5rem 0;
  display: block;
}

.detail-body {
  margin-top: 1.5rem;
}

.detail-body p {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text);
  margin-bottom: 1.1rem;
}
</style>

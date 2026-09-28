<script setup>
import { computed } from 'vue'
import { DateTime } from 'luxon'
import { getList } from '@/content'
import { useSeo } from '@/composables/useSeo'

const props = defineProps({
  page: { type: String, default: '' },
})

const isYenilikler = computed(() => props.page === 'yenilikler')
const title = computed(() => (isYenilikler.value ? 'yenilikler' : 'saat üzerine'))
const items = computed(() => getList(props.page))

useSeo({
  title: computed(() => (isYenilikler.value ? 'Yenilikler' : 'Saat Üzerine')),
  description: computed(() =>
    isYenilikler.value
      ? 'Alaturka Vakitler uygulamasındaki güncellemeler ve yeni özellikler.'
      : 'Alaturka saat, zaman ve takvim üzerine yazılar ve alıntılar.'
  ),
  path: computed(() => `/${props.page}`),
})

// Üst satırda tek bir bilgi var: yazarı varsa yazar, yoksa tarih.
// Yeniliklerde yazar yok, orada tarih görünür.
function meta(item) {
  if (item.author) return item.author
  if (!item.date) return ''
  return DateTime.fromISO(item.date).setLocale('tr').toFormat('d LLLL yyyy')
}

function excerpt(body) {
  // Özet düz metindir; detay sayfasında <strong>'a çevrilen **kalın**
  // işaretleri burada olduğu gibi görünmesin diye ayıklanır.
  const first = ((body || '').split('\n\n')[0] || '').replace(/\*\*(.+?)\*\*/g, '$1')
  return first.length > 140 ? first.slice(0, 140).trimEnd() + '…' : first
}
</script>

<template>
  <div class="blog-page">
    <h1 class="page-title">{{ title }}</h1>

    <p v-if="!items.length" class="placeholder">İçerik yakında.</p>

    <ul v-else class="blog-list">
      <li v-for="item in items" :key="item.id" class="blog-item">
        <RouterLink :to="`/detay/${page}/${item.id}`" class="blog-link">
          <img v-if="item.cover" :src="item.cover" :alt="item.title" class="blog-cover" loading="lazy" />
          <span v-if="meta(item)" class="blog-author">{{ meta(item) }}</span>
          <span class="blog-title">{{ item.title }}</span>
          <span class="blog-excerpt">{{ excerpt(item.body) }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.blog-page {
  padding-bottom: 2rem;
}

.placeholder {
  color: var(--text-muted);
  padding: 0 1.25rem;
  margin-top: 1rem;
}

.blog-list {
  list-style: none;
  margin-top: 0.5rem;
}

.blog-item {
  border-top: 1px solid var(--border);
}

.blog-link {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.25rem 0;
  text-decoration: none;
}

.blog-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius);
  margin-bottom: 0.6rem;
  display: block;
}

.blog-title {
  font-family: var(--font2);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--text);
}

.blog-author {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.blog-excerpt {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-muted);
}
</style>

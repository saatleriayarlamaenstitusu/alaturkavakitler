<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { DateTime } from 'luxon'

const appStore = useAppStore()

const vakitItems = computed(() => {
  if (!appStore.vakit) return []
  return Object.values(appStore.vakit)
})

function formatTime(dateObj) {
  if (!dateObj) return ''
  return dateObj.setLocale('tr').toLocaleString(DateTime.TIME_SIMPLE)
}
</script>

<template>
  <div v-if="appStore.vakit" class="vakit-list">
    <div
      v-for="item in vakitItems"
      :key="item.key"
      class="vakit-item"
      :class="{ active: appStore.currentVakit === item.key }"
    >
      <span class="label">{{ item.name }}</span>
      <span class="value">{{ formatTime(item.valueDateObj) }}</span>
    </div>
  </div>
</template>

<style scoped>
.vakit-list {
  padding: 0.75rem 0.5rem;
  border-radius: var(--radius);
  width: 100%;
  color: var(--text);
  display: flex;
  justify-content: space-between;
  background: var(--surface);
}

.vakit-item {
  display: flex;
  flex-direction: column;
  padding: 0.25rem;
  color: #6b7280;
  font-size: 1rem;
}

.vakit-item.active {
  color: #16a34a;
  border: 1px solid #16a34a;
  border-radius: 0.375rem;
}

.vakit-item.active + .vakit-item {
  color: white;
}

.label {
  display: block;
  font-weight: 300;
  line-height: 1.2;
  font-size: 10px;
}

.value {
  display: block;
  font-weight: 800;
  line-height: 1;
  font-family: var(--font2);
}
</style>

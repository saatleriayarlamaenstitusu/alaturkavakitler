<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { CITIES_LIST } from '@/data/cities'
import DropdownMenu from './DropdownMenu.vue'
import LogoWide from '@/components/ui/LogoWide.vue'

const appStore = useAppStore()

const selectedPlate = computed({
  get: () => appStore.city.plate,
  set: (plate) => {
    const city = CITIES_LIST.find(c => c.plate === plate)
    if (city) appStore.setCity({ plate: city.plate, name: city.name })
  },
})
</script>

<template>
  <nav class="top-nav">
    <RouterLink to="/" class="logo-link">
      <LogoWide class="logo" />
    </RouterLink>

    <div class="nav-right">
      <select class="city-select" v-model="selectedPlate">
        <option v-for="city in CITIES_LIST" :key="city.plate" :value="city.plate">
          {{ city.name }}
        </option>
      </select>

      <DropdownMenu>
        <RouterLink to="/ayarlar">Ayarlar</RouterLink>
        <RouterLink to="/saatuzerine">Saat Üzerine</RouterLink>
        <RouterLink to="/yenilikler">Yenilikler</RouterLink>
        <RouterLink to="/hakkinda">Hakkında</RouterLink>
      </DropdownMenu>
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0.5rem 1.25rem;
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  color: var(--text);
}

.logo {
  height: 36px;
  width: auto;
  margin: 0 0.625rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.city-select {
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text);
  cursor: pointer;
  max-width: 130px;
  appearance: none;
  padding: 0.3rem 0.5rem;
}

.city-select option {
  background: #1a1a1a;
  color: white;
}

.city-select:focus {
  outline: none;
  border-color: var(--primary);
}
</style>

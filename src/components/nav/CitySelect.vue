<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { CITIES } from '@alaturkavakitler/core'

// Core şehirleri plakaya göre anahtarlanmış bir obje olarak veriyor;
// seçici sıralı bir listeye ihtiyaç duyuyor.
const CITY_LIST = Object.values(CITIES)

// Şehir seçici iki yerde duruyor: mobilde üst çubukta, masaüstünde sol
// rayın dibinde. Tek bileşen — iki ayrı `select` olsaydı biri store'a
// bağlanıp diğeri unutulabilirdi.
const appStore = useAppStore()

const selectedPlate = computed({
  get: () => appStore.city.plate,
  set: (plate) => {
    const city = CITY_LIST.find(c => c.plate === plate)
    if (city) appStore.setCity({ plate: city.plate, name: city.name })
  },
})
</script>

<template>
  <select class="city-select" v-model="selectedPlate" aria-label="Şehir">
    <option v-for="city in CITY_LIST" :key="city.plate" :value="city.plate">
      {{ city.name }}
    </option>
  </select>
</template>

<style scoped>
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
  border-color: var(--accent-ui);
}
</style>

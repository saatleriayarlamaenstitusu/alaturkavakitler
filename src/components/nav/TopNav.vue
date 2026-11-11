<script setup>
import { RouterLink } from 'vue-router'
import DropdownMenu from './DropdownMenu.vue'
import CitySelect from './CitySelect.vue'
import LogoMotion from '@/components/ui/LogoMotion.vue'
import { SECONDARY_NAV } from '@/data/secondaryNav'
</script>

<template>
  <nav class="top-nav">
    <RouterLink to="/" class="logo-link" aria-label="Ana sayfa">
      <!-- Açılışta bir kez oynar. TopNav uygulama kabuğunda olduğu için
           sayfa gezintilerinde yeniden kurulmaz; animasyon yalnızca sayfa
           ilk açıldığında görünür. -->
      <LogoMotion class="logo" width="140px" :speed="0.9" />
    </RouterLink>

    <div class="nav-right">
      <CitySelect />

      <!-- Masaüstünde bu bağlantılar sol rayın ikincil bölümünde duruyor;
           menü orada gizlenir (aynı liste iki yerde görünmesin). Liste tek
           kaynaktan: `data/secondaryNav.js`. -->
      <DropdownMenu class="menu">
        <template v-for="item in SECONDARY_NAV" :key="item.path">
          <RouterLink :to="item.path" :class="{ 'menu-action': item.action }">{{ item.label }}</RouterLink>
          <span v-if="item.action" class="menu-sep" aria-hidden="true"></span>
        </template>
      </DropdownMenu>
    </div>
  </nav>
</template>

<style scoped>
.menu-action {
  font-weight: 700 !important;
}

.menu-sep {
  height: 1px;
  margin: 0.4rem 0.25rem;
  background: rgba(128, 128, 128, 0.45);
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0.5rem 1.25rem;
  flex-shrink: 0;
  position: relative;
  z-index: 5;
}

.logo-link {
  display: flex;
  align-items: center;
  color: var(--text);
}

.logo {
  margin: 0 0.625rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}




/* ── Masaüstü ──
   Üst çubuğun üç parçası da sol raya taşındı: logo rayın tepesinde,
   şehir seçici dibinde, menü satırları aradaki ikincil bölümde. Geriye
   bir şey kalmadığı için çubuğun kendisi kalkar ve içerik o 5.5rem'i
   kazanır. Eşik `assets/css/desktop.css`te açıklanan 900px. */
@media (min-width: 900px) {
  .top-nav { display: none; }
}
</style>

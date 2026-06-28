<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/home.svg" alt="Ana Sayfa" />
      </div>
    </RouterLink>
    <RouterLink to="/saat" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/clock.svg" alt="Saat" />
      </div>
    </RouterLink>
    <RouterLink to="/vakitler" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/mosque.svg" alt="Vakitler" />
      </div>
    </RouterLink>
    <RouterLink to="/takvim" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/calendar.svg" alt="Takvim" />
      </div>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: center;
  width: 100%;
  flex-shrink: 0;
  backdrop-filter: blur(9px);
}

.nav-link {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  opacity: 0.25;
  transition: opacity 0.2s ease;
  position: relative;
}

.nav-link img {
  height: 1.25rem;
  z-index: 10;
  /* SVG'ler beyaz — her zaman beyaz göster */
  filter: brightness(0) invert(1);
}

.nav-link.router-link-active,
.nav-link:hover {
  opacity: 1;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  width: 100%;
  position: relative;
}

.nav-link.router-link-active .nav-button::before {
  content: "";
  position: absolute;
  z-index: 0;
  background: var(--primary);
  width: 2.5em;
  height: 50%;
  left: 50%;
  bottom: -4px;
  transform: translate(-50%, -50%);
  filter: blur(18px);
}

.nav-link.router-link-active .nav-button::after {
  content: "";
  position: absolute;
  z-index: 0;
  background: var(--primary);
  transform: translate(-50%, -50%);
  left: 50%;
  border-radius: 50px;
  filter: blur(6px) brightness(3.5);
  height: 8px;
  bottom: -8px;
  width: 1.25em;
}

.nav-link.router-link-active::before {
  content: "";
  position: absolute;
  bottom: 3px;
  left: 50%;
  width: 3px;
  height: 3px;
  background: var(--text);
  transform: translate(-50%, -50%);
  border-radius: 50px;
  z-index: 2;
}
</style>

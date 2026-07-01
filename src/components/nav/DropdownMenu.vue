<script setup>
import { ref } from 'vue'

const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}
</script>

<template>
  <div class="dropdown" @click="toggle" v-click-outside="close" role="button" :aria-expanded="open">
    <img src="/Icons/kababmenu.svg" alt="Menü" width="16" height="16" class="trigger-icon" />
    <div v-show="open" class="dropdown-content" @click.stop="close">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #00000033;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trigger-icon {
  display: block;
  pointer-events: none;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  padding: 0.75rem;
  border-radius: 0.5rem;
  white-space: nowrap;
  backdrop-filter: blur(9px);
  background: #ffffff33;
  z-index: 10;
}

.dropdown-content :deep(a) {
  padding: 0.25rem 0.75rem;
  color: var(--text);
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.dropdown-content :deep(a:hover),
.dropdown-content :deep(a.router-link-active) {
  background: var(--primary);
  color: white;
}
</style>

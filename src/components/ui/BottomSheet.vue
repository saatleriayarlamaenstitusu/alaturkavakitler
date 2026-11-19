<script setup>
/**
 * Alt sayfa — yerel `select` yerine kullanılan kabuk.
 *
 * Yalnızca kabuktur: örtü, panel, başlık şeridi ve kayan gövde. İçini
 * çağıran doldurur (`head` ve varsayılan yuva). İki müşterisi var
 * (sure/sayfa/cüz seçici ve meal seçici) ve üçüncüsü geldiğinde de
 * aynı yerden gelmeli — iki ayrı kopya iki ayrı davranışa ayrışıyor.
 *
 * Mobilde dipten, masaüstünde ortadan açılır: alt sayfa parmağın
 * ulaştığı yerdir, farede ekranın dibi en uzak noktadır.
 */
defineProps({
  open: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
const emit = defineEmits(['close'])
</script>

<template>
  <!-- Örtü kapanma hedefidir. Panel tıklamayı yutar, yoksa içeride
       kaydırmak paneli kapatıyordu. -->
  <div v-if="open" class="veil" @click="emit('close')">
    <div class="panel" role="dialog" :aria-label="label" @click.stop>
      <header class="panel-head">
        <div class="panel-head-main"><slot name="head" /></div>
        <button class="panel-x" aria-label="Kapat" @click="emit('close')">×</button>
      </header>
      <div class="panel-body"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.veil {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(2px);
}

/* Mat zemin: `--surface` her palette opak değil (`canli`'de saydam),
   doğrudan verilince altındaki sayfa panelin içinden görünüyor. */
.panel {
  width: 100%;
  max-width: 32rem;
  max-height: 78dvh;
  display: flex;
  flex-direction: column;
  border-radius: 14px 14px 0 0;
  border: 1px solid var(--border);
  border-bottom: none;
  background-color: var(--bg);
  background-image: linear-gradient(var(--surface), var(--surface));
  animation: rise 0.18s ease-out;
}

@keyframes rise {
  from { transform: translateY(12px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .panel { animation: none; }
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.6rem 0.6rem 0.8rem;
  border-bottom: 1px solid var(--border);
}

.panel-head-main { flex: 1; min-width: 0; }

.panel-x {
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  font: inherit;
  font-size: 1.2rem;
  line-height: 1;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.panel-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.3rem 0;
}

@media (min-width: 900px) {
  .veil { align-items: center; }
  .panel {
    border-radius: 14px;
    border-bottom: 1px solid var(--border);
    max-height: 70dvh;
  }
}
</style>

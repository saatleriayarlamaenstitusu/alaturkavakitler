<script setup>
import { ref, watch } from 'vue'

/**
 * Bir hareketi bir KEZ öğreten küçük ipucu.
 *
 * Uygulamada iki şey yalnızca parmakla keşfediliyor: bir ayete iki kez
 * dokunmak kıraati oradan başlatıyor, bir vakte basılı tutmak kaza
 * sayacını açıyor. İkisi de ekranda hiçbir iz bırakmıyor — bilen bilir,
 * bilmeyen hiç öğrenmez. Bu yüzden ilk gelen kullanıcıya hareketin
 * KENDİSİ gösteriliyor: cümleyle anlatmak yerine canlanan bir parmak.
 *
 * Kalıcı bir arayüz parçası değil: bir kez kapandı mı (ya da hareket
 * gerçekten yapıldı mı) bir daha çıkmaz, karar `localStorage`da durur.
 * Modal DEĞİL — öğrettiği şeyi yapmaya engel olmamalı; akışın içinde
 * duran ince bir şerit.
 */
const props = defineProps({
  /** Kalıcı anahtar — `hint_<id>`. */
  id: { type: String, required: true },
  /** `hold` (basılı tut) | `double` (iki kez dokun). */
  gesture: { type: String, default: 'double' },
  text: { type: String, required: true },
  /** Koşullar uygunsa göster (örn. veri geldiyse). */
  when: { type: Boolean, default: true },
})

const KEY = `hint_${props.id}`

function stored() {
  try { return localStorage.getItem(KEY) === 'done' } catch { return true }
}

const done = ref(stored())

function dismiss() {
  done.value = true
  try { localStorage.setItem(KEY, 'done') } catch { /* özel kip */ }
}

// Hareket gerçekten yapıldıysa ipucunun işi bitmiştir; kapatmak için
// ayrıca dokunmak gerekmesin.
defineExpose({ dismiss })

// Fare/parmak yoksa (klavyeyle gezen) şerit yine de kapanabilsin diye
// dışarı bir olay veriliyor.
const emit = defineEmits(['close'])
watch(done, (v) => { if (v) emit('close') })
</script>

<template>
  <Transition name="hint">
    <div v-if="when && !done" class="hint" role="note">
      <span class="hint-art" :class="`is-${gesture}`" aria-hidden="true">
        <span class="ring"></span>
        <span class="ring ring2"></span>
        <span class="dot"></span>
      </span>
      <span class="hint-text">{{ text }}</span>
      <button class="hint-x" aria-label="İpucunu kapat" @click="dismiss">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.hint {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.4rem 0.5rem 0.65rem;
  border: 1px dashed color-mix(in srgb, var(--accent-ui) 45%, var(--border));
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent-ui) 7%, transparent);
}

.hint-text {
  flex: 1;
  min-width: 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--text-muted);
}

.hint-x {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 50%;
}

.hint-x:hover { color: var(--text); }

/* Parmak ve halkalar: hareketin kendisi. Ölçüler sabit piksel değil
   `em` — şerit metinle birlikte büyüyüp küçülür. */
.hint-art {
  position: relative;
  flex: 0 0 auto;
  width: 1.9rem;
  height: 1.9rem;
  display: grid;
  place-items: center;
}

.dot, .ring {
  grid-area: 1 / 1;
  border-radius: 50%;
}

.dot {
  width: 0.62rem;
  height: 0.62rem;
  background: var(--accent-ui);
}

.ring {
  width: 1.9rem;
  height: 1.9rem;
  border: 1.5px solid var(--accent-ui);
  opacity: 0;
}

/* İki kez dokunma: iki dalga arka arkaya, sonra bekleme. Aralık
   bilerek kısa (0.28s) — "iki kez" olduğu okunmalı, "iki ayrı
   dokunuş" değil. */
.is-double .ring { animation: ripple 2.4s ease-out infinite; }
.is-double .ring2 { animation-delay: 0.28s; }
.is-double .dot { animation: tap2 2.4s ease-out infinite; }

/* Basılı tutma: halka yavaşça dolar, parmak yerinde kalır ve biraz
   büyür — "bırakma" hissi. */
.is-hold .ring {
  opacity: 1;
  border-color: color-mix(in srgb, var(--accent-ui) 30%, transparent);
  animation: none;
}

.is-hold .ring2 {
  opacity: 1;
  border-color: transparent;
  border-top-color: var(--accent-ui);
  border-right-color: var(--accent-ui);
  animation: spinfill 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.is-hold .dot { animation: press 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

@keyframes ripple {
  0% { opacity: 0.9; transform: scale(0.35); }
  26% { opacity: 0; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}

@keyframes tap2 {
  0%, 10% { transform: scale(1); }
  5% { transform: scale(0.72); }
  16% { transform: scale(0.72); }
  22%, 100% { transform: scale(1); }
}

@keyframes spinfill {
  0% { transform: rotate(-90deg); opacity: 0; }
  10% { opacity: 1; }
  70%, 100% { transform: rotate(270deg); opacity: 0; }
}

@keyframes press {
  0% { transform: scale(1); }
  70% { transform: scale(1.5); }
  78%, 100% { transform: scale(1); }
}

/* Hareketi azaltma tercihi: ipucu yazıyla kalır, dönen bir şey olmaz. */
@media (prefers-reduced-motion: reduce) {
  .hint-art * { animation: none !important; }
  .is-double .ring { opacity: 0.5; }
}

.hint-enter-active, .hint-leave-active { transition: opacity 0.2s, transform 0.2s; }
.hint-enter-from, .hint-leave-to { opacity: 0; transform: translateY(-4px); }
</style>

<script setup>
import { QURAN_FONTS } from '@/data/quranFonts'
import { getFont } from '@/data/shareFonts'
import { ensureFont } from '@/composables/useShareFonts'
import BottomSheet from '@/components/ui/BottomSheet.vue'

/**
 * Esnek görünümün yazı tipi seçicisi.
 *
 * Ayarlar sayfasında da var ama okurken "şu yazıyı deneyeyim" demek
 * ayarlara gidip geri dönmeyi gerektiriyordu. Burada her satır KENDİ
 * yazı tipiyle örnek bir ibare gösteriyor: adı değil görüntüsü seçtirir.
 *
 * Örnek açılırken o ailenin indirilmesini tetikler (`ensureFont`);
 * dördü birden yüklenmiyor.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  value: { type: String, default: 'lateef' },
})
const emit = defineEmits(['close', 'select'])

const family = (id) => getFont(id).family

function show() {
  for (const f of QURAN_FONTS) ensureFont(f.id)
}

function pick(id) {
  emit('select', id)
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" label="Yazı tipi seç" @close="emit('close')" @vue:mounted="show">
    <template #head><span class="title">Yazı tipi</span></template>

    <button
      v-for="f in QURAN_FONTS"
      :key="f.id"
      class="row"
      :class="{ on: value === f.id }"
      @click="pick(f.id)"
    >
      <span class="row-head">
        <span class="row-name">{{ f.label }}</span>
        <span class="row-note">{{ f.note }}</span>
      </span>
      <span class="row-sample" :style="{ fontFamily: family(f.id) }" dir="rtl" lang="ar">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </span>
    </button>
  </BottomSheet>
</template>

<style scoped>
.title {
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.row {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.7rem 0.8rem;
  font: inherit;
  text-align: start;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.row + .row { border-top: 1px solid var(--border); }
.row:hover { background: color-mix(in srgb, var(--text) 7%, transparent); }

.row.on {
  background: color-mix(in srgb, var(--accent-ui) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--accent-ui);
}

.row-head { display: flex; align-items: baseline; gap: 0.5rem; }

.row-name { font-size: 0.82rem; }

.row-note {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.row-sample {
  font-size: 1.5rem;
  line-height: 1.9;
  color: var(--text);
}
</style>

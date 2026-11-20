<script setup>
import { computed } from 'vue'
import { availableReciters, tempoOf } from '@/data/reciters'
import { hasTimings } from '@/utils/recitation'
import BottomSheet from '@/components/ui/BottomSheet.vue'

/**
 * Kârî seçici.
 *
 * Ayarlarda DEĞİL dinleme şeridinin içinde: dinlerken değiştirilen bir
 * tercih, ayarlara gidip gelmeyi hak etmiyor.
 *
 * Damgası olmayan kârî listede durur ama "ayet takibi yok" diye
 * işaretlenir — sesi çalar, okunan ayet vurgulanmaz. Gizlemek,
 * kullanıcının sevdiği kârîyi sebepsizce yok saymak olurdu.
 */
defineProps({
  open: { type: Boolean, default: false },
  value: { type: String, default: '' },
})
const emit = defineEmits(['close', 'select'])

const list = computed(() => availableReciters().map((r) => ({
  ...r,
  follows: hasTimings(r.id),
  tempo: tempoOf(r),
})))

function pick(id) {
  emit('select', id)
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" label="Kârî seç" @close="emit('close')">
    <template #head><span class="title">Kârî</span></template>

    <button
      v-for="r in list"
      :key="r.id"
      class="row"
      :class="{ on: value === r.id }"
      @click="pick(r.id)"
    >
      <span class="row-main">
        <span class="row-name">{{ r.name }}</span>
        <span class="row-style">{{ r.style }}</span>
      </span>
      <!-- Tempo: Fâtiha'nın süresinden ölçülmüş üç kademe. Yalnızca
           kareler bırakılmadı — "üç kare hızlı mı ağır mı" sorusunu
           okurun tahminine bırakmamak için yanında sözü de var. -->
      <span v-if="r.tempo.level" class="tempo" :title="`Fâtiha ${r.fatiha} sn`">
        <i v-for="n in 3" :key="n" :class="{ on: n <= r.tempo.level }" />
        <em>{{ r.tempo.label }}</em>
      </span>
      <span v-if="r.follows" class="tag on">ayet takibi</span>
      <span v-else class="tag">takip yok</span>
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
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  font: inherit;
  text-align: start;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.row:hover { background: color-mix(in srgb, var(--text) 7%, transparent); }

.row.on {
  background: color-mix(in srgb, var(--accent-ui) 16%, transparent);
  box-shadow: inset 2px 0 0 var(--accent-ui);
}

.row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
.row-name { font-size: 0.88rem; }

.row-style {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tempo {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}

.tempo i {
  width: 5px;
  height: 5px;
  border: 1px solid var(--text-muted);
  border-radius: 1px;
}

.tempo i.on { background: var(--accent-ui); border-color: var(--accent-ui); }

.tempo em {
  margin-inline-start: 0.3rem;
  font-style: normal;
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tag {
  flex: 0 0 auto;
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-muted);
}

.tag.on { border-color: var(--accent-ui); color: var(--text); }
</style>

<script setup>
import { computed } from 'vue'
import { infoOf } from '@/data/surahInfo'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { pageOfSurah } from '@/utils/mushaf'
import { juzOfPage } from '@/utils/mushaf'

/**
 * Sure künyesi.
 *
 * Burada UYDURMA METİN YOK ve bu bilinçli: quran.com'un sure tanıtım
 * metni yalnızca İngilizce (dil parametresi yok sayılıyor, ölçüldü),
 * Türkçesini kendimiz yazmak 114 surede doğruluğu denetlenemeyen bir
 * metin yığını demek. Onun yerine doğrulanabilir künye veriliyor ve
 * asıl yazı için TDV İslam Ansiklopedisi'ne bağlanılıyor — maddenin
 * kendisi zaten Türkçe ve kaynaklı.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  surah: { type: Number, default: null },
})
const emit = defineEmits(['close'])

const info = computed(() => (props.surah ? infoOf(props.surah) : null))
const page = computed(() => (props.surah ? pageOfSurah(props.surah) : null))

const facts = computed(() => {
  const i = info.value
  if (!i) return []
  return [
    ['Anlamı', i.meaning],
    ['İniş yeri', i.place === 'Mekke' ? 'Mekke (Mekkî)' : 'Medine (Medenî)'],
    ['Ayet sayısı', `${i.verses}`],
    ['İniş sırası', `${i.order}.`],
    ['Mushafta', `${i.id}. sure · s. ${page.value} · ${juzOfPage(page.value)}. cüz`],
    // "Yok" iki surede iki ayrı şeydir: Fâtiha'da besmele surenin BİRİNCİ
    // AYETİDİR (o yüzden ayrıca basılmaz), Tevbe'de gerçekten yoktur.
    // Tek bir "yok" ikisini aynı kefeye koyup yanlış bilgi veriyordu.
    ['Besmele', i.id === 1 ? 'Birinci ayettir' : i.bismillah ? 'Var' : 'Yok'],
  ]
})
</script>

<template>
  <BottomSheet :open="open" label="Sure hakkında" @close="emit('close')">
    <template #head>
      <span v-if="info" class="head">
        <span class="head-name">{{ info.name }}</span>
        <span class="head-ar">{{ info.arabic }}</span>
      </span>
    </template>

    <div v-if="info" class="body">
      <dl class="facts">
        <template v-for="[k, v] in facts" :key="k">
          <dt>{{ k }}</dt>
          <dd>{{ v }}</dd>
        </template>
      </dl>

      <a
        v-if="info.tdv"
        class="tdv"
        :href="info.tdv"
        target="_blank"
        rel="noopener"
      >
        <span class="tdv-main">TDV İslam Ansiklopedisi'nde oku</span>
        <span class="tdv-sub">{{ info.name }} sûresi maddesi ↗</span>
      </a>
    </div>
  </BottomSheet>
</template>

<style scoped>
.head { display: flex; align-items: baseline; gap: 0.5rem; }

.head-name {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.head-ar { font-size: 0.95rem; color: var(--text-muted); }

.body { padding: 0.5rem 0.8rem 1rem; }

.facts {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 0.45rem 0.6rem;
  margin: 0;
  font-size: 0.8rem;
}

.facts dt {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding-top: 0.2em;
}

.facts dd { margin: 0; }

.tdv {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: 1.1rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text);
}

.tdv:hover { border-color: var(--accent-ui); }

.tdv-main { font-size: 0.8rem; }

.tdv-sub {
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
</style>

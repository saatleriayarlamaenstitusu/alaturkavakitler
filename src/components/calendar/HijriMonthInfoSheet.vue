<script setup>
import { computed } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { hijriMonthInfoOf } from '@/data/hijriMonthInfo'

/**
 * Hicri ay tanıtım sayfası / bilgi penceresi.
 *
 * Ayın etimolojik kökeni, lügat manası, İslam tarihindeki yeri ve
 * fazileti ile TDV İslam Ansiklopedisi maddesi yer alır.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  month: { type: [Number, String], default: null },
})

const emit = defineEmits(['close'])

const info = computed(() => (props.month ? hijriMonthInfoOf(props.month) : null))
</script>

<template>
  <BottomSheet :open="open" label="Hicri ay hakkında" @close="emit('close')">
    <template #head>
      <div v-if="info" class="head">
        <div class="head-titles">
          <span class="head-name">{{ info.name }}</span>
          <span class="head-ar">{{ info.arabic }}</span>
        </div>
        <div class="head-tags">
          <span class="tag tag-order">Hicri {{ info.order }}. Ay</span>
          <span v-if="info.isHaram" class="tag tag-haram" title="Savaşın yasaklandığı dört haram aydan biri">Haram Ay</span>
        </div>
      </div>
    </template>

    <div v-if="info" class="body">
      <!-- Kısa özet -->
      <p class="summary">{{ info.summary }}</p>

      <!-- Etimolojik köken ve lügat manası -->
      <section class="section">
        <h4 class="section-title">Etimoloji ve İsim Kökeni</h4>
        <div class="card">
          <p class="meaning-lead"><strong>Anlamı:</strong> {{ info.meaning }}</p>
          <p class="etymology-text">{{ info.etymology }}</p>
        </div>
      </section>

      <!-- İslami Önemi -->
      <section class="section">
        <h4 class="section-title">İslami Önemi ve Fazileti</h4>
        <p class="section-body">{{ info.islamicSignificance }}</p>
      </section>

      <!-- Önemli Tarihler / Hadiseler -->
      <section v-if="info.keyEvents && info.keyEvents.length" class="section">
        <h4 class="section-title">Önemli Hadiseler ve Günler</h4>
        <ul class="events-list">
          <li v-for="(evt, idx) in info.keyEvents" :key="idx" class="event-item">
            <span class="event-bullet" aria-hidden="true">◆</span>
            <span class="event-text">{{ evt }}</span>
          </li>
        </ul>
      </section>

      <!-- TDV İslam Ansiklopedisi Butonu -->
      <a
        v-if="info.tdv"
        class="tdv"
        :href="info.tdv"
        target="_blank"
        rel="noopener"
      >
        <span class="tdv-main">TDV İslam Ansiklopedisi'nde oku</span>
        <span class="tdv-sub">{{ info.name }} maddesi ↗</span>
      </a>
    </div>
  </BottomSheet>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.head-titles {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.head-name {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text);
}

.head-ar {
  font-size: 1.15rem;
  font-family: serif;
  color: var(--text-muted);
}

.head-tags {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tag {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.tag-order {
  background: color-mix(in srgb, var(--text) 8%, transparent);
  color: var(--text-muted);
}

.tag-haram {
  background: color-mix(in srgb, var(--accent-ui) 15%, transparent);
  color: var(--accent-ui);
  border: 1px solid color-mix(in srgb, var(--accent-ui) 35%, transparent);
}

.body {
  padding: 0.75rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: var(--text);
}

.summary {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.section-title {
  margin: 0;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.card {
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--text) 3%, transparent);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.meaning-lead {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--text);
}

.meaning-lead strong {
  font-weight: 600;
  color: var(--text-muted);
}

.etymology-text {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.section-body {
  margin: 0;
  font-size: 0.835rem;
  line-height: 1.55;
  color: var(--text);
}

.events-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.45;
}

.event-bullet {
  font-size: 0.5rem;
  color: var(--accent-ui);
  margin-top: 0.35rem;
  flex: 0 0 auto;
}

.event-text {
  color: var(--text);
}

/* TDV Düğmesi — SurahInfoSheet ile tutarlı */
.tdv {
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--text) 2%, transparent);
  color: var(--text);
  text-decoration: none;
  transition: border-color 0.14s, background 0.14s;
}

.tdv:hover {
  border-color: var(--text);
  background: color-mix(in srgb, var(--text) 5%, transparent);
}

.tdv-main {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.tdv-sub {
  font-size: 0.6875rem;
  color: var(--text-muted);
}
</style>

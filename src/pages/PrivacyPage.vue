<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useSeo, seoBreadcrumb } from '@/composables/useSeo'
import { privacyById, PRIVACY_UPDATED } from '@/data/privacy'

/**
 * Gizlilik politikası — tek şablon, iki belge.
 *
 * Site ve eklenti AYRI politikalara sahip (gerekçesi `data/privacy.js`
 * başında). Biçim ortak: iki ayrı sayfa bileşeni yazılsaydı bir
 * başlığın ölçüsünü değiştirmek iki yerde düzeltme isterdi.
 */
const props = defineProps({
  /** 'site' | 'eklenti' */
  which: { type: String, default: 'site' },
})

const doc = computed(() => privacyById(props.which))

/**
 * `useSeo` ALANLARI unref ediyor, nesnenin kendisini değil: tamamı bir
 * `computed` içine sarıldığında `opts.title` tanımsız kalıyor ve sayfa
 * başlıksız açılıyordu (ölçüldü — sekme adı "Alaturka Vakitler"de
 * kalıyor, kırıntı yolu hiç eklenmiyordu). Alanlar tek tek computed.
 *
 * Reaktif olmaları şart: iki rota AYNI bileşeni kullanıyor, aralarında
 * gezilince Vue örneği yeniden kurmuyor, yalnızca prop değişiyor.
 */
useSeo({
  title: computed(() => doc.value.title),
  description: computed(() =>
    `${doc.value.lead} — hangi verinin nerede durduğu, hangi isteğin nereye gittiği.`),
  path: computed(() => doc.value.path),
  jsonLd: computed(() => seoBreadcrumb([{ name: doc.value.title, path: doc.value.path }])),
})
</script>

<template>
  <div class="privacy-page blog-details">
    <h1 class="page-title">gizlilik</h1>
    <h2 class="pv-title">{{ doc.title }}</h2>
    <p class="pv-lead">{{ doc.lead }}</p>
    <p class="pv-date">Son güncelleme: {{ PRIVACY_UPDATED }}</p>

    <p v-for="(t, i) in doc.intro" :key="`i${i}`" class="pv-intro">{{ t }}</p>

    <section v-for="s in doc.sections" :key="s.h" class="pv-sec">
      <h3>{{ s.h }}</h3>
      <p v-for="(t, i) in s.p ?? []" :key="`p${i}`">{{ t }}</p>

      <ul v-if="s.list" class="pv-list">
        <li v-for="(t, i) in s.list" :key="`l${i}`">{{ t }}</li>
      </ul>

      <!-- İzin tablosu: solda iznin adı, sağda sebebi. Düz paragraf
           olarak yazıldığında hangi sebebin hangi izne ait olduğu
           ancak baştan sona okununca anlaşılıyordu. -->
      <dl v-if="s.rows" class="pv-rows">
        <template v-for="(r, i) in s.rows" :key="`r${i}`">
          <dt><code>{{ r[0] }}</code></dt>
          <dd>{{ r[1] }}</dd>
        </template>
      </dl>

      <p v-for="(t, i) in s.p2 ?? []" :key="`q${i}`">{{ t }}</p>
    </section>

    <!-- İki belge birbirine bağlı: hangisini arayan olursa olsun
         öbürünü de bulsun. -->
    <p class="pv-other">
      <RouterLink :to="doc.other.path">{{ doc.other.label }} →</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.privacy-page { padding-bottom: 3rem; }

.pv-title { font-size: 1.25rem; font-weight: 500; margin: 0 0 0.25rem; }

.pv-lead { font-size: 0.9rem; color: var(--text-muted); margin: 0 0 0.2rem; }

.pv-date {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 1.5rem;
}

.pv-intro { font-size: 0.95rem; line-height: 1.7; margin: 0 0 0.9rem; }

.pv-sec { margin-top: 2rem; }

.pv-sec h3 {
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}

.pv-sec p { font-size: 0.9rem; line-height: 1.7; margin: 0 0 0.7rem; }

.pv-list { margin: 0 0 0.9rem; padding-left: 1.1rem; }

.pv-list li { font-size: 0.88rem; line-height: 1.65; margin-bottom: 0.4rem; }

/* İzin adı ve sebebi: dar ekranda alt alta, masaüstünde yan yana. */
.pv-rows { margin: 0 0 0.9rem; }

.pv-rows dt { margin-top: 0.7rem; }

.pv-rows dt code {
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: var(--text);
  background: color-mix(in srgb, var(--text) 8%, transparent);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.pv-rows dd {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--text-muted);
}

.pv-other { margin-top: 2.5rem; font-size: 0.85rem; }
.pv-other a { color: var(--accent-ui); }

@media (min-width: 700px) {
  .pv-rows { display: grid; grid-template-columns: 14rem 1fr; gap: 0.2rem 1rem; }
  .pv-rows dt { margin-top: 0.5rem; }
  .pv-rows dd { margin-top: 0.5rem; }
}
</style>

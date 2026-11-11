<script setup>
import VakitCounter from '@/components/vakit/VakitCounter.vue'
import VakitList from '@/components/vakit/VakitList.vue'
import VakitRangeView from '@/components/vakit/VakitRangeView.vue'
import { useSeo, seoBreadcrumb } from '@/composables/useSeo'

useSeo({
  title: 'Namaz Vakitleri',
  description:
    'Şehrinize göre güncel namaz vakitleri: imsak, güneş, öğle, ikindi, akşam ve yatsı. Kalan süre ve kerahat vakitleri.',
  path: '/vakitler',
  jsonLd: seoBreadcrumb([{ name: 'Namaz Vakitleri', path: '/vakitler' }]),
})
</script>

<template>
  <div class="prayer-times-page">
    <h1 class="page-title">vakitler</h1>
    <div class="counter-section">
      <VakitCounter />
    </div>
    <div class="list-section">
      <VakitList />
    </div>
    <VakitRangeView />
  </div>
</template>

<style scoped>


.counter-section {
  margin-top: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.list-section {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

/* ── Masaüstü: iki kolon ──
   Solda sayaç ve vakit listesi, sağda günün zaman şeridi. Şerit mobilde
   sayfanın altında ince bir bant; sağ kolonda tek başına kalınca cılız
   duruyor, bu yüzden orada boyu büyütülüyor (`--range-h`). Sayfanın alt
   yarısındaki boşluk da böylece kapanıyor.
   Eşik `assets/css/desktop.css`te açıklanan 1024px. */
@media (min-width: 1024px) {
  /* Üstte sayaç ve liste yan yana, altta günün zaman şeridi boydan boya.
     Şerit başta sağ kolonda tek başına duruyordu; kolonun boyunu doldurmak
     için dikine uzayınca bir gün çizelgesinden çok dolu bir sütuna
     benziyordu. Yatayda zaten zamanı temsil ediyor — asıl yeri burası. */
  .prayer-times-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    /* Orta satır artan alanı yutar: sayaç ve liste dikeyde ortalanır,
       şerit sayfanın dibine oturur, altta boş bir yarım sayfa kalmaz. */
    grid-template-rows: auto 1fr auto;
    min-height: 100%;
    column-gap: 3.5rem;
    padding-bottom: 1.5rem;
  }

  /* Sayfa başlığı iki kolonun üstünde kalır; açıkça yerleştirilmezse
     ızgaranın ilk boş gözüne düşüyor. */
  .page-title { grid-area: 1 / 1 / 2 / -1; }

  .counter-section {
    grid-area: 2 / 1;
    align-self: center;
    padding-bottom: 0;
    border-bottom: 0;
  }

  .list-section {
    grid-area: 2 / 2;
    align-self: center;
    margin: 0;
    padding-bottom: 0;
    border-bottom: 0;
  }

  /* Ölçü akışkan: 1024px'de sabit 5.25rem sayaçla pusulayı aynı satıra
     sığdırmıyor, pusula alt satıra düşüyordu. */
  .prayer-times-page :deep(.counter) { font-size: clamp(4rem, 5vw, 5.25rem); }

  /* `--range-gap` bandın üstünde döndürülmüş etiketlere kalan paydır;
     mobilde bandın boyuna eşit, burada ayrı — bant genişleyince o kadar
     boşluğa gerek yok. */
  .prayer-times-page :deep(.vakit-range-view) {
    grid-area: 3 / 1 / 4 / -1;
    --range-h: clamp(110px, 20vh, 240px);
    --range-gap: 5rem;
  }
}
</style>

<script setup>
import AlaturkaClock from '@/components/clock/AlaturkaClock.vue'
import LedClock from '@/components/clock/LedClock.vue'
import VakitCounter from '@/components/vakit/VakitCounter.vue'
import VakitList from '@/components/vakit/VakitList.vue'
import CalendarWidget from '@/components/calendar/CalendarWidget.vue'
import { useSettingsStore } from '@/stores/settings'
import { useSeo, SEO_SITE } from '@/composables/useSeo'

const settings = useSettingsStore()

const description =
  "Türkiye'ye özel alaturka (ezani) saat, namaz vakitleri, hicri ve rumi takvim. Güneşin batışından itibaren geçen alaturka saati anlık takip edin."

useSeo({
  title: 'Alaturka Vakitler — Alaturka Saat, Namaz Vakitleri ve Hicri Takvim',
  description,
  path: '/',
  isHome: true,
  // Site ve kurum verisi `index.html`teki statik @graph'ta duruyor (orada
  // betik çalışmadan da okunur). Burada tekrarlansaydı aynı varlık iki kez
  // tarif edilmiş olurdu; ana sayfa yalnızca o grafın ana sayfasıdır.
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Alaturka Vakitler',
    url: `${SEO_SITE.url}/`,
    inLanguage: 'tr-TR',
    description,
    isPartOf: { '@id': SEO_SITE.siteId },
    about: { '@id': SEO_SITE.orgId },
  },
})
</script>

<template>
  <div class="home-page">
    <div class="clock-section">
      <LedClock v-if="settings.homeClock === 'led'" />
      <AlaturkaClock v-else />
    </div>
    <div class="vakit-block">
      <VakitCounter />
      <VakitList />
    </div>
    <div class="calendar-section">
      <CalendarWidget />
    </div>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 1rem;
}

.clock-section {
  flex: 1;
}

/* Kalan vakit sayacı + vakit listesi tek bir bütün blok */
.vakit-block {
  padding: 0.75rem 0 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
}

.calendar-section {
  padding: 1rem 0 0.25rem;
  border-top: 1px solid var(--border);
}

/* ── Masaüstü: iki kolon ──
   Mobilde üç blok alt alta; geniş ekranda saat ve takvim solda, vakit
   bilgisi sağda durur. Blokların içine dokunulmaz, yalnızca yerleşim
   değişir. Eşik `assets/css/desktop.css`te açıklanan 1240px. */
@media (min-width: 1240px) {
  .home-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto;
    column-gap: 3.5rem;
    /* Kompozisyon dikeyde ortalanır: bileşenler büyütüldükten sonra bile
       1080p'de altta bir sayfa yüksekliği kadar boşluk kalıyor, yukarı
       yaslanınca sayfa yarım görünüyordu. Ortalanınca boşluk iki uca
       bölünür ve ana sayfanın başlığı olmadığı için üstte de doğal durur. */
    align-content: center;
  }

  .clock-section    { grid-area: 1 / 1; }
  .calendar-section { grid-area: 2 / 1; }

  /* Sağ kolonun tamamı. Sol kolon (saat + takvim) belirgin biçimde daha
     uzun; sağdaki blok yukarı yaslandığında altında sayfanın yarısı kadar
     boşluk kalıyordu. Dikeyde ortalanınca sayaç saatin optik hizasına
     gelir ve boşluk iki uca bölünür. */
  .vakit-block {
    grid-area: 1 / 2 / span 2 / 2;
    align-self: center;
    margin-bottom: 0;
  }

  /* Mobilde saatten SONRA geldiği için üstünde çizgi var; iki kolonda
     ikisi de kolon başı olduğundan saat de aynı çizgiyi alır, yoksa
     sağ kolon çizgiyle, sol kolon çizgisiz başlıyor. */
  .clock-section {
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }
}
</style>

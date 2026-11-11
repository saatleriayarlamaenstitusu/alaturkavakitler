<script setup>
import { RouterLink } from 'vue-router'
import { SECONDARY_NAV } from '@/data/secondaryNav'
import NavIcon from './NavIcon.vue'
import CitySelect from './CitySelect.vue'
import LogoMotion from '@/components/ui/LogoMotion.vue'
</script>

<template>
  <nav class="bottom-nav">
    <!-- Masaüstünde üst çubuk kalkıyor; marka işareti rayın tepesinde.
         Mobilde gizli, orada üst çubuktaki asıl logo duruyor. -->
    <RouterLink to="/" class="rail-logo" aria-label="Ana sayfa">
      <LogoMotion width="168px" :speed="0.9" />
    </RouterLink>

    <RouterLink to="/" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/home.svg" alt="" aria-hidden="true" />
        <span class="nav-label">Ana Sayfa</span>
      </div>
    </RouterLink>
    <RouterLink to="/saat" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/clock.svg" alt="" aria-hidden="true" />
        <span class="nav-label">Saat</span>
      </div>
    </RouterLink>
    <RouterLink to="/vakitler" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/mosque.svg" alt="" aria-hidden="true" />
        <span class="nav-label">Vakitler</span>
      </div>
    </RouterLink>
    <RouterLink to="/takvim" class="nav-link">
      <div class="nav-button">
        <img src="/Icons/Nav/calendar.svg" alt="" aria-hidden="true" />
        <span class="nav-label">Takvim</span>
      </div>
    </RouterLink>

    <!-- Üst çubuktaki üç nokta menüsünün içeriği. Mobilde gizli (orada
         menü zaten var), masaüstünde rayın ikincil bölümü: bir kebap
         menüsü ekranın sağ üst köşesinde saklanacağına, yanda zaten
         duran gezinmenin devamı olur. Tek kaynak olsun diye liste
         `data/secondaryNav.js`te; üst çubuk da oradan besleniyor. -->
    <div class="nav-more">
      <span class="more-rule" aria-hidden="true"></span>
      <RouterLink
        v-for="item in SECONDARY_NAV"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ action: item.action }"
      >
        <div class="nav-button">
          <NavIcon :name="item.icon" />
          <span class="nav-label">{{ item.label }}</span>
        </div>
      </RouterLink>
    </div>

    <!-- Şehir seçici de üst çubuktan indi: rayın dibinde, gezinmenin
         altında kendi satırında. -->
    <div class="rail-foot">
      <CitySelect />
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: center;
  width: 100%;
  flex-shrink: 0;
  backdrop-filter: blur(9px);
}

.nav-link {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  opacity: 0.25;
  transition: opacity 0.2s ease;
  position: relative;
}

.nav-link img {
  height: 1.25rem;
  z-index: 10;
  /* SVG'ler beyaz — her zaman beyaz göster */
  filter: brightness(0) invert(1);
}

.nav-link.router-link-active,
.nav-link:hover {
  opacity: 1;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  width: 100%;
  position: relative;
}

.nav-link.router-link-active .nav-button::before {
  content: "";
  position: absolute;
  z-index: 0;
  background: var(--accent-ui);
  width: 2.5em;
  height: 50%;
  left: 50%;
  bottom: -4px;
  transform: translate(-50%, -50%);
  filter: blur(18px);
}

.nav-link.router-link-active .nav-button::after {
  content: "";
  position: absolute;
  z-index: 0;
  background: var(--accent-ui);
  transform: translate(-50%, -50%);
  left: 50%;
  border-radius: 50px;
  filter: blur(6px) brightness(3.5);
  height: 8px;
  bottom: -8px;
  width: 1.25em;
}

.nav-link.router-link-active::before {
  content: "";
  position: absolute;
  bottom: 3px;
  left: 50%;
  width: 3px;
  height: 3px;
  background: var(--text);
  transform: translate(-50%, -50%);
  border-radius: 50px;
  z-index: 2;
}

/* Etiket yalnızca masaüstü rayında görünür; alt çubukta yer yok ve
   ikonlar zaten dört başlık için yeterli. `alt` metni kaldırılmadı,
   ikon `aria-hidden` oldu — ad artık etiketin kendisinde. */
.nav-label {
  display: none;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text);
  white-space: nowrap;
}


/* ── Yalnızca masaüstü rayında olanlar ──
   Mobilde logo ve şehir seçici üst çubukta, ikincil bağlantılar oradaki
   menüdedir; burada ikinci bir kopyası görünmez. */
.rail-logo,
.nav-more,
.rail-foot { display: none; }

/* ── Masaüstü: alt çubuk değil, sol ray ──
   Alt gezinme parmağın ulaştığı yerdir; farede ekranın dibi en uzak
   yer. Geniş ekranda gezinme sola, içeriğin yanına alınır ve ikonların
   yanında adları yazar — yatayda zaten boş duran alan budur.
   `.app`in satıra dönmesi `assets/css/desktop.css`te.
   Eşik 900px: iki kolonlu düzenden (1024) önce, kabuk ölçüsüyle
   birlikte başlar. */
@media (min-width: 900px) {
  .bottom-nav {
    flex: 0 0 13.5rem;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0.15rem;
    width: auto;
    padding: 1.75rem 0.75rem 1.5rem;
    border-right: 1px solid var(--border);
    backdrop-filter: none;
  }

  .nav-link {
    flex: 0 0 auto;
    justify-content: flex-start;
    opacity: 0.45;
  }

  .nav-label { display: inline; }

  .nav-button {
    justify-content: flex-start;
    gap: 0.85rem;
    height: 2.6rem;
    padding: 0 0.85rem;
    border-radius: 6px;
  }

  .nav-link img { height: 1.05rem; }

  /* Alt çubuktaki parıltı ve nokta ekranın DİBİNE göre konumlanmış üç
     ayrı pseudo-eleman; dikey rayda hepsi yanlış yerde duruyor. Yerine
     okunur tek bir işaret: solda aksan çubuğu + hafif zemin. */
  .nav-link.router-link-active .nav-button::before,
  .nav-link.router-link-active .nav-button::after,
  .nav-link.router-link-active::before {
    display: none;
  }

  .nav-link.router-link-active .nav-button {
    background: color-mix(in srgb, var(--text) 10%, transparent);
    box-shadow: inset 2px 0 0 var(--accent-ui);
  }

  .nav-link:hover .nav-button {
    background: color-mix(in srgb, var(--text) 6%, transparent);
  }

  /* Marka işareti rayın tepesinde, ilk gezinme satırının üstünde. */
  .rail-logo {
    display: flex;
    align-items: center;
    padding: 0 0.85rem 2rem;
    color: var(--text);
  }

  /* İkincil satırlar birincillerle AYNI kalıbı kullanır: ikon + etiket,
     aynı yükseklik, aynı vurgu. Önce yalnızca metindiler ve ray iki ayrı
     listeden toplanmış gibi duruyordu; ayrımı ince bir çizgi ile etiket
     ağırlığı taşıyor, yapı değil. */
  .nav-more {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
  }

  .more-rule {
    height: 1px;
    margin: 0 0.85rem 0.9rem;
    background: var(--border);
  }

  .nav-more .nav-label {
    font-weight: 500;
    color: var(--text-muted);
  }

  .nav-link.action .nav-label {
    font-weight: 700;
    color: var(--text);
  }

  .nav-link:hover .nav-label,
  .nav-link.router-link-active .nav-label { color: var(--text); }

  /* Şehir seçici dibe yaslanır: gezinme listesinin devamı değil, kabuğun
     ayarı. */
  .rail-foot {
    display: flex;
    margin-top: auto;
    padding: 1.5rem 0.85rem 0;
  }

  .rail-foot :deep(.city-select) {
    width: 100%;
    max-width: none;
    padding: 0.45rem 0.6rem;
  }
}
</style>

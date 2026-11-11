<script setup>
import { computed } from 'vue'

/**
 * Rayın ikincil satırlarının ikonları.
 *
 * Biçim, `/Icons/Nav/*.svg`teki dört ana ikonun diliyle aynı tutuldu:
 * 24'lük ızgara, DOLGU (kontur yok), beyaz ve iki katmanlı — arkada
 * %35 opaklıkta gövde, önünde tam opak ayrıntı. Kontur tabanlı bir set
 * (bkz. share/SectionIcon.vue) rayda yan yana gelince iki ayrı
 * uygulamadan toplanmış gibi duruyordu.
 *
 * Ana dördü `<img>` olarak kalıyor: onlar dosyadan geliyor ve beyaz
 * SVG'ler filtreyle boyanıyor (bkz. CLAUDE.md). Buradakiler satır içi,
 * çünkü renkleri `currentColor`dan alıyor.
 */
const props = defineProps({
  name: { type: String, required: true },
})

const SHAPES = {
  // Görsel Oluştur — çerçeve + içinde güneş ve ufuk
  gorsel: {
    back: 'M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z',
    front: 'M8.6 7.6a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM4.6 19.2l4.9-4.9 3.6 3.6 3-3 4 4z',
  },
  // Ayarlar — üç sürgü rayı, üstünde düğmeler
  ayarlar: {
    back: 'M3 6.2h18v1.6H3zM3 11.2h18v1.6H3zM3 16.2h18v1.6H3z',
    front: 'M8 4.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zM15 9.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8zM7 14.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z',
  },
  // Saat Üzerine — kitap: sayfa bloğu + sırt ve satırlar
  yazi: {
    back: 'M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
    front: 'M4 4a2 2 0 0 1 2-2h2.4v20H6a2 2 0 0 1-2-2zM11 6.6h6v1.6h-6zM11 11h6v1.6h-6z',
  },
  // Yenilikler — kare içinde parıltı
  yeni: {
    back: 'M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z',
    front: 'M12 5.6l1.8 4.6 4.6 1.8-4.6 1.8L12 18.4l-1.8-4.6L5.6 12l4.6-1.8z',
  },
  // Hakkında — daire içinde "i"
  bilgi: {
    back: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
    front: 'M10.9 10.6h2.2v7h-2.2zM12 5.9a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z',
  },
}

const shape = computed(() => SHAPES[props.name] ?? SHAPES.bilgi)
</script>

<template>
  <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path class="back" :d="shape.back" />
    <path class="front" :d="shape.front" />
  </svg>
</template>

<style scoped>
.nav-icon {
  flex: 0 0 auto;
  width: 1.05rem;
  height: 1.05rem;
  fill: currentColor;
}

/* Ana ikonlardaki gövde/ayrıntı ayrımının aynısı. */
.back { opacity: 0.35; }
</style>

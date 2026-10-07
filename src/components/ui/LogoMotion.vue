<script setup>
// Logonun açılış animasyonu. İki yerde kullanılır: üst çubuktaki marka
// işareti (açılışta bir kez) ve yükleyici (`loop` ile sürekli).
// Tek kaynak `brand/logo-animation/index.html`; koreografi ve zamanlama
// oradaki ile aynı tutulmalı — birini değiştirince diğerini de güncelle.
defineProps({
  // Hız çarpanı. 1'den küçük değer daha çevik duruyor.
  speed: { type: Number, default: 0.85 },
  // Logonun genişliği (CSS uzunluğu).
  width: { type: String, default: '220px' },
  // Yükleyicide açık: veri gecikirse animasyon başa sarar.
  // Nav logosunda kapalı: açılışta bir kez oynar.
  loop: { type: Boolean, default: false },
  // Tanıtım videosundaki tam koreografi: işaret ortada belirip sola kayar.
  // Sitede kapalı — logo zaten yerinde duruyor, kaymasına gerek yok.
  slide: { type: Boolean, default: false },
  // Yükleyici olarak kullanılırken 'status', marka işareti olarak 'img'.
  role: { type: String, default: 'img' },
  label: { type: String, default: 'Alaturka Vakitler' },
})
</script>

<template>
  <div
    class="logo-motion"
    :class="{ loop, 'no-slide': !slide }"
    :style="{ '--dur': speed, '--size': width }"
    :role="role"
    :aria-label="label"
  >
    <svg class="mark" viewBox="0 0 60.931 12.166" role="img" aria-label="Alaturka Vakitler">
      <g class="lockup">
        <g transform="translate(-30.049 -474.358)">
          <!-- scale(-1) AYRI bir grupta durmalı: `.piece` üzerindeki CSS
               animasyonu `transform` yazıyor ve öznitelikteki dönüşümü
               eziyor — işaretin sol parçası bu yüzden kayboluyordu. -->
          <g transform="scale(-1)">
            <path class="piece p2" d="M-31.986-482.68q-.782 0-1.344-.563-.563-.562-.563-1.343 0-.813.563-1.376.562-.562 1.344-.562.812 0 1.375.562.562.563.562 1.344 0 .813-.562 1.375-.563.563-1.375.563zm-2.47 2.688q.407.844.407 1.719 0 .5-.125 1.031-.375 1.438-1.594 2.25l-5.814-11.532h3.845q1.094 2.188 3.281 6.532z"/>
          </g>
          <path class="piece p1" d="M49.414 478.203q-.781 0-1.344-.563-.562-.563-.562-1.344 0-.813.562-1.375.563-.563 1.344-.563.813 0 1.375.563.563.562.563 1.344 0 .812-.563 1.375-.562.563-1.375.563zm-2.47 2.687q.407.844.407 1.72 0 .5-.125 1.03-.375 1.439-1.594 2.251l-5.813-11.533h3.844q1.094 2.188 3.282 6.532z"/>
        <path class="ltr a" style="--i:0" d="M55.6390 477.7430h1.823l-.054-.635h-1.71zM56.5410 476.2260l.488 1.118-.03.212.414.852h.946l-1.818-3.665-1.813 3.665h.94l.43-.886-.04-.183z"/>
        <path class="ltr a" style="--i:1" d="M60.1650 474.9600v3.448h2.217v-.714h-1.384v-2.734z"/>
        <path class="ltr a" style="--i:2" d="M64.9030 477.7440h1.822l-.054-.636h-1.71zM65.8040 476.2260l.488 1.118-.03.212.414.852h.946l-1.818-3.665-1.813 3.665h.941l.429-.886-.04-.183z"/>
        <path class="ltr a" style="--i:3" d="M68.7390 475.7040h.946v2.704h.832v-2.704h.951v-.744h-2.73z"/>
        <path class="ltr a" style="--i:4" d="M73.2690 474.9600v2.315q0 .326.104.567.108.241.296.399.192.153.443.231.251.08.542.08.29 0 .542-.08.256-.078.443-.231.192-.158.296-.4.108-.24.108-.566v-2.315h-.833v2.256q0 .261-.137.424-.138.163-.42.163-.275 0-.413-.163-.138-.163-.138-.424v-2.256z"/>
        <path class="ltr a" style="--i:5" d="M79.0510 476.8470l.971 1.561h.975l-1.078-1.561zM78.1940 474.9600v3.448h.833v-3.448zM78.7160 475.6640h.675q.168 0 .286.055.123.054.187.157.064.099.064.242t-.064.246q-.064.099-.187.153-.118.049-.286.049h-.675v.645h.735q.443 0 .738-.142.296-.143.449-.395.152-.256.152-.586 0-.335-.152-.586-.153-.256-.449-.4-.295-.142-.738-.142h-.735z"/>
        <path class="ltr a" style="--i:6" d="M82.8280 474.9600v3.448h.863v-3.448zM84.8630 474.9600l-1.414 1.64 1.453 1.808h1.01l-1.473-1.832 1.4-1.616z"/>
        <path class="ltr a" style="--i:7" d="M88.2600 477.7430h1.823l-.054-.635h-1.71zM89.1620 476.2260l.488 1.118-.03.212.414.852h.946l-1.818-3.665-1.813 3.665h.941l.429-.886-.04-.183z"/>
        <path class="ltr v" style="--i:0" d="M55.9030 484.6860l-1.082-2.624h-.271l1.353 3.184 1.353-3.184h-.271z"/>
        <path class="ltr v" style="--i:1" d="M58.8450 484.0990h1.572l-.079-.228h-1.414zM59.6250 482.5000l.604 1.463.022.057.455 1.108h.272l-1.354-3.184-1.353 3.184h.272l.46-1.125.026-.053z"/>
        <path class="ltr v" style="--i:2" d="M62.6620 482.0620v3.066h.241v-3.066zM64.1730 482.0620l-1.34 1.441 1.406 1.625h.307l-1.415-1.63 1.349-1.436z"/>
        <path class="ltr v" style="--i:3" d="M66.2300 482.0620v3.066h.241v-3.066zM66.1860 481.5850q0 .066.049.114.048.048.113.048.07 0 .119-.048.048-.048.048-.114 0-.07-.048-.118-.048-.048-.119-.048-.065 0-.113.048-.049.048-.049.118z"/>
        <path class="ltr v" style="--i:4" d="M68.1780 482.2900h.806v2.838h.24v-2.838h.806v-.228h-1.852z"/>
        <path class="ltr v" style="--i:5" d="M71.7460 482.0620v3.066h1.506v-.228h-1.266v-2.838z"/>
        <path class="ltr v" style="--i:6" d="M75.0950 485.1280h1.52v-.228h-1.52zM75.0950 482.2900h1.52v-.228h-1.52zM75.0950 483.5600h1.432v-.227h-1.432zM74.9680 482.0620v3.066h.24v-3.066z"/>
        <path class="ltr v" style="--i:7" d="M79.1140 483.6650l1.016 1.463h.297l-1.046-1.463zM78.5920 482.0620v3.066h.241v-3.066zM78.7190 482.2770h.574q.232 0 .412.079.18.079.28.228.105.148.105.367 0 .22-.1.373-.101.149-.285.227-.18.075-.412.075h-.574v.215h.574q.298 0 .53-.101.236-.105.372-.307.136-.201.136-.481 0-.285-.136-.482t-.372-.302q-.232-.106-.53-.106h-.574z"/>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* ──────────────────────────────────────────────────────────────
   Alaturka Vakitler — logo reveal

   Koreografi:
   1. İşaret ORTADA parça parça belirir.
   2. İşaret sola kayarak yerine oturur.
   3. Kayarken sağda harfler soldan sağa tek tek açılır; her harf hafifçe
      sağdan gelir, yani işaret onları çekiştiriyormuş gibi geriden yetişir.

   Harfler gerçekten ayrı yollar: kelime yolundaki alt yollar mutlak
   koordinata çevrilip x konumlarına göre harflere gruplandı (8 + 8).
   ────────────────────────────────────────────────────────────── */
/* Değişkenler `:root`ta DEĞİL bileşenin kökünde: Vue scoped stilde `:root`
   seçicisi `:root[data-v-...]` hâline geliyor ve <html> ile hiç eşleşmiyor —
   `--shift` tanımsız kalınca sola kayma hiç olmuyordu.
   `--dur` ve `--size` zaten satır içi verilir. */
.logo-motion {
  /* Faz 1'de işareti tuvalin ortasına getiren kaydırma (viewBox birimi). */
  --shift: 19.814;
  /* Harfler arası gecikme ve her harfin süresi. */
  --ltr-step: 0.052s;
  --ltr-dur: 0.42s;
  /* Harflerin açılmaya başladığı an. Kayma varken işaret yola çıktıktan
     sonra, yokken hemen işaretin ardından. */
  --ltr-start: 0.66s;
}

/* Sitede işaret yerinde durur, yalnızca harfler açılır. */
.logo-motion.no-slide {
  --ltr-start: 0.28s;
}

.logo-motion.no-slide .lockup {
  animation: none;
  transform: none;
}

.mark {
  width: 100%;
  height: auto;
  overflow: visible;
  fill: currentColor;
}

/* Tüm kilit: önce sağa kaymış durur (işaret ortada), sonra yerine kayar. */
.lockup {
  transform: translateX(calc(var(--shift) * 1px));
  animation: slide calc(0.72s * var(--dur)) cubic-bezier(.26,.86,.3,1) calc(0.58s * var(--dur)) forwards;
}

@keyframes slide {
  to { transform: translateX(0); }
}

/* İşaret parçaları ortada belirir. `transform-box: fill-box` olmadan SVG'de
   dönüşüm kökeni tuvalin tamamına göre hesaplanır ve parçalar uçar. */
.piece {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  opacity: 0;
  animation: piece-in calc(0.56s * var(--dur)) cubic-bezier(.2,.9,.26,1) forwards;
}

.p2 { animation-delay: calc(0.02s * var(--dur)); }
.p1 { animation-delay: calc(0.14s * var(--dur)); }

@keyframes piece-in {
  from { opacity: 0; transform: translateY(26%) scale(.82); }
  to   { opacity: 1; transform: none; }
}

/* Harfler: soldan sağa sırayla. Her harf kendi genişliğinin bir miktar
   sağından gelir — işaret sola giderken onları çekiyormuş hissi bundan. */
.ltr {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  opacity: 0;
  animation:
    ltr-in calc(var(--ltr-dur) * var(--dur)) cubic-bezier(.18,.78,.26,1) forwards;
  animation-delay: calc((var(--ltr-start) + var(--i) * var(--ltr-step)) * var(--dur));
}

/* Alt satır üst satırın bir tık gerisinden gelir; iki satır aynı anda
   açılınca hareket düz bir duvar gibi okunuyordu. */
.ltr.v { animation-delay: calc((var(--ltr-start) + 0.06s + var(--i) * var(--ltr-step)) * var(--dur)); }

@keyframes ltr-in {
  from { opacity: 0; transform: translateX(2.2px) scale(.96); }
  to   { opacity: 1; transform: none; }
}

.logo-motion {
  width: var(--size);
  color: var(--text);
  line-height: 0;
}

/* Döngü: veri gecikirse açılış bitince bir nefes bekleyip baştan oynar.
   Tek tek gecikmeler yerine ortak bir tur süresi kullanılır, yoksa
   yinelemeler birbirinin üstüne biniyor. */
.logo-motion.loop .lockup,
.logo-motion.loop .piece,
.logo-motion.loop .ltr {
  animation-iteration-count: infinite;
  animation-duration: calc(2.9s * var(--dur));
}

.logo-motion.loop .lockup { animation-name: slide-loop; animation-delay: 0s; }
.logo-motion.loop.no-slide .lockup { animation: none; transform: none; }
.logo-motion.loop .piece { animation-name: piece-loop; }
.logo-motion.loop .ltr { animation-name: ltr-loop; }

@keyframes slide-loop {
  0%, 20%   { transform: translateX(calc(var(--shift) * 1px)); }
  45%, 88%  { transform: translateX(0); }
  100%      { transform: translateX(0); }
}

@keyframes piece-loop {
  0%        { opacity: 0; transform: translateY(26%) scale(.82); }
  18%, 86%  { opacity: 1; transform: none; }
  100%      { opacity: 0; transform: scale(.96); }
}

@keyframes ltr-loop {
  0%, 22%   { opacity: 0; transform: translateX(2.2px) scale(.96); }
  42%, 86%  { opacity: 1; transform: none; }
  100%      { opacity: 0; transform: translateX(-3px) scale(.96); }
}

/* Hareketi azalt tercihinde logo sabit durur; "yükleniyor" bilgisi
   kaybolmasın diye hafif bir nabız bırakılır. */
@media (prefers-reduced-motion: reduce) {
  .logo-motion .lockup { animation: none !important; transform: none !important; }

  .logo-motion .piece,
  .logo-motion .ltr {
    animation: reduced-pulse 1.6s ease-in-out infinite !important;
    opacity: 1;
    transform: none;
  }

  @keyframes reduced-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: .45; }
  }
}
</style>

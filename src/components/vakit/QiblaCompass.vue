<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { getCityCoords } from '@/data/cityCoords'
import { qiblaBearing, formatBearing, compassName } from '@/utils/qibla'

const appStore = useAppStore()

// Konum iki kaynaktan gelebilir: seçili ilin merkezi (her zaman var) ya da
// cihazın GPS'i (kullanıcı isterse). GPS il içindeki birkaç derecelik sapmayı
// da kapatır, o yüzden varsa o kullanılır.
const gps = ref(null)
const gpsState = ref('idle') // idle | isteniyor | aktif | hata
const gpsError = ref('')

const coords = computed(() => gps.value ?? getCityCoords(appStore.city?.plate))
const bearing = computed(() => (coords.value ? qiblaBearing(coords.value[0], coords.value[1]) : null))

function useGps() {
  if (!navigator.geolocation) {
    gpsState.value = 'hata'
    gpsError.value = 'Cihaz konum desteklemiyor'
    return
  }
  gpsState.value = 'isteniyor'
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      gps.value = [pos.coords.latitude, pos.coords.longitude]
      gpsState.value = 'aktif'
    },
    (err) => {
      gpsState.value = 'hata'
      gpsError.value = err.code === err.PERMISSION_DENIED
        ? 'Konum izni verilmedi'
        : 'Konum alınamadı'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  )
}

// ── Cihaz pusulası ──
// Yön bilgisi varsa kadran döner ve iğne gerçek kıbleyi gösterir; yoksa
// kadran kuzey yukarıda sabit kalır ve açı değeri okunur bir bilgi olarak
// durur (herhangi bir pusulayla kullanılabilir).
const heading = ref(null)
const headingState = ref('idle') // idle | bekleniyor | aktif | yok

// Brave'in parmak izi koruması yön sensörünü sessizce kapatıyor: olay hiç
// gelmiyor, hata da vermiyor. Ölçüldü — aynı cihazda Chrome'da çalışıyor,
// Brave'de çalışmıyor. Sebebi bilince kullanıcıya "pusulan yok" demek yerine
// ne yapacağını söyleyebiliyoruz.
const isBrave = ref(false)
navigator.brave?.isBrave?.().then((v) => { isBrave.value = v }).catch(() => {})

// Ekran döndürülmüşse cihazın üst kenarı ile ekranın "yukarı"sı ayrışır;
// kadran ekrana göre çizildiği için fark düşülmeli. Dikey kullanımda 0.
const screenAngle = () => screen.orientation?.angle ?? window.orientation ?? 0

function onOrientation(e) {
  // iOS kendi alanını verir ve zaten pusula yönüdür; diğerlerinde `alpha`
  // saat yönünün TERSİNE arttığı için 360'tan çıkarılır.
  // `absolute` değilse alpha'nın sıfırı rastgeledir — kuzeyi bilmiyoruz demektir,
  // yanlış yön göstermektense pusulasız kalmak yeğdir.
  const raw = typeof e.webkitCompassHeading === 'number'
    ? e.webkitCompassHeading
    : (e.absolute && typeof e.alpha === 'number' ? (360 - e.alpha) % 360 : null)
  if (raw == null || Number.isNaN(raw)) return
  heading.value = (raw - screenAngle() + 720) % 360
  headingState.value = 'aktif'
}

let listening = false
function listen() {
  if (listening) return
  listening = true
  window.addEventListener('deviceorientationabsolute', onOrientation, true)
  window.addEventListener('deviceorientation', onOrientation, true)
}

// Her zaman erkenden bağlan: iOS'ta izin verilene kadar olay gelmez, zararsız;
// Android'de ise kullanıcı düğmeye bastığında yön çoktan gelmiş olur.
// (Önce "requestPermission yoksa dinle" diye bir ayrım yapmıştım — bazı
// ortamlarda o alan iOS dışında da tanımlı olduğu için yanlış daldı.)
onMounted(listen)

async function useCompass() {
  const DOE = window.DeviceOrientationEvent
  if (!DOE) { headingState.value = 'yok'; return }
  // iOS 13+ açık izin ister ve yalnızca kullanıcı hareketiyle sorulabilir.
  if (typeof DOE.requestPermission === 'function') {
    try {
      if (await DOE.requestPermission() !== 'granted') { headingState.value = 'yok'; return }
    } catch { headingState.value = 'yok'; return }
  }
  headingState.value = 'bekleniyor'
  listen()
  // Yön gelmezse pes etme süresi. Dinleyici sökülmez — olay sonradan da
  // gelebilir ve geldiği anda kadran canlıya döner.
  // Süre bilerek uzun: konum izni kutusu açıkken sayfa askıya alınabiliyor,
  // kısa bir zaman aşımı "pusula yok" diye yanlış hüküm veriyordu.
  setTimeout(() => {
    if (heading.value == null) headingState.value = 'yok'
  }, 8000)
}

onUnmounted(() => {
  window.removeEventListener('deviceorientationabsolute', onOrientation, true)
  window.removeEventListener('deviceorientation', onOrientation, true)
})

// Kadranın dönüşü: pusula aktifse kuzey gerçek kuzeye bakar.
const dialRotation = computed(() => (heading.value == null ? 0 : -heading.value))
const live = computed(() => heading.value != null)

// ── Hizalanma ──
// Kıbleye dönüldüğünde (iğne tam yukarı geldiğinde) kadran yeşile döner.
// Girişte 4°, çıkışta 8°: tek bir eşik olsaydı pusula gürültüsü yüzünden
// sınırda titrerdi.
const ENTER = 4
const LEAVE = 8
const aligned = ref(false)

// İki yön arasındaki en kısa açısal fark (0–180). `+540 … -180` kalıbı
// sarmayı kendiliğinden halleder: 359° ile 1° arası 2° çıkar.
const delta = computed(() => {
  if (heading.value == null || bearing.value == null) return null
  return Math.abs(((heading.value - bearing.value + 540) % 360) - 180)
})

watch(delta, (d) => {
  if (d == null) { aligned.value = false; return }
  if (!aligned.value && d <= ENTER) aligned.value = true
  else if (aligned.value && d > LEAVE) aligned.value = false
})

const label = computed(() => {
  if (bearing.value == null) return ''
  return `${formatBearing(bearing.value)} ${compassName(bearing.value)}`
})

// Ayrıntı satırı akışta yer kaplamaz: metin uzayınca pusula alt satıra
// kayıyordu. Basılı tutunca tuvalin üstünde bir balonda açılır.
const details = ref(false)
let holdTimer = null

function startHold() {
  clearTimeout(holdTimer)
  holdTimer = setTimeout(() => { details.value = true }, 350)
}

function endHold() {
  clearTimeout(holdTimer)
  // Basılı tutma değilse kısa dokunuştur: canlı pusulayı devreye al.
  if (!details.value && retry.value) refine()
  details.value = false
}

// Pusula çalışmıyorsa düğme kalsın: kullanıcı tekrar deneyebilmeli ve
// iğnenin neden dönmediğini okuyabilmeli.
const retry = computed(() => !live.value && headingState.value !== 'bekleniyor')

const hint = computed(() => {
  const yer = gps.value ? 'konumuna göre' : (appStore.city?.name ?? '')
  if (headingState.value === 'bekleniyor') return 'Pusula aranıyor…'
  if (gpsState.value === 'isteniyor') return 'Konum alınıyor…'
  if (live.value) return `Canlı · ${yer}`
  // Kalkanlar kapalıyken de engellenebiliyor: Brave'de hareket sensörleri
  // ayrı bir site izni. Suçlamak yerine nereye bakılacağını söyle.
  if (headingState.value === 'yok') {
    return isBrave.value
      ? 'Brave engelliyor · Site ayarları › Hareket sensörleri'
      : 'Pusula yok · kuzeye göre'
  }
  if (gpsState.value === 'hata') return gpsError.value
  return `${yer} · dokun: canlı pusula`
})

async function refine() {
  // Önce pusula: iOS'ta izin yalnızca kullanıcı hareketi sürerken sorulabilir.
  // Konum kutusunu aynı anda açmak ikisini de sıraya sokup sayfayı askıya
  // alıyordu; konum biraz sonra istenir.
  await useCompass()
  setTimeout(useGps, 400)
}
</script>

<template>
  <div
    v-if="bearing != null"
    class="qibla"
    :class="{ live, aligned }"
    role="button"
    :aria-label="`Kıble ${label}`"
    @pointerdown="startHold"
    @pointerup="endHold"
    @pointerleave="endHold"
    @contextmenu.prevent
  >
    <!-- Kadran: kuzey çentiği kadranla birlikte döner, iğne kıbleye bakar.
         Pusula yoksa kuzey yukarıda sabit kalır. -->
    <svg class="dial" viewBox="0 0 64 64" aria-hidden="true">
      <circle class="ring" cx="32" cy="32" r="27" />
      <!-- Hizalanma anında bir kez genişleyip sönen halka. -->
      <circle v-if="aligned" class="pulse" cx="32" cy="32" r="27" />
      <g :style="{ transform: `rotate(${dialRotation}deg)`, transformOrigin: '32px 32px' }">
        <line class="north" x1="32" y1="7" x2="32" y2="13" />
        <g :style="{ transform: `rotate(${bearing}deg)`, transformOrigin: '32px 32px' }">
          <line class="needle" x1="32" y1="32" x2="32" y2="12" />
          <rect class="kaaba" x="28.5" y="7" width="7" height="7" rx="1" />
        </g>
      </g>
      <circle class="pivot" cx="32" cy="32" r="2" />
    </svg>


    <!-- Akıştan kopuk: açılıp kapanması düzeni oynatmaz. -->
    <div v-if="details" class="bubble">
      <span class="bubble-title">Kıble {{ label }}</span>
      <span class="bubble-note">{{ hint }}</span>
    </div>
  </div>
</template>

<style scoped>
.qibla {
  /* Yeşil yalnızca burada kullanılıyor; palete göre değişmesine gerek yok —
     "hizalandı" evrensel bir onay rengi. */
  --qibla-ok: #2fbf71;
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.dial {
  width: 3.25rem;
  height: 3.25rem;
  flex-shrink: 0;
  overflow: visible;
}

/* Renkler `--primary`den DEĞİL `--accent-ui`den gelir: `canli` paletinde
   `--bg: var(--primary)` olduğu için iğne zeminle aynı renge düşüp
   kayboluyordu. Halka/çentik de `--text` üzerinden, her palette okunur. */
.ring {
  fill: none;
  stroke: var(--text);
  stroke-width: 1.5;
  opacity: 0.28;
}

.north {
  stroke: var(--text);
  stroke-width: 1.5;
  opacity: 0.5;
}

.needle {
  stroke: var(--accent-ui);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.kaaba { fill: var(--accent-ui); }

.pivot {
  fill: var(--text);
  opacity: 0.55;
}

/* Canlıyken kadran biraz belirginleşir — tek görsel ipucu bu. */
.qibla.live .ring { opacity: 0.5; }

/* Kıbleye dönüldüğünde: halka ve iğne yeşile, bir kez nabız atar. */
.qibla.aligned .ring {
  stroke: var(--qibla-ok);
  stroke-width: 2.5;
  opacity: 1;
  transition: stroke 160ms ease, stroke-width 160ms ease, opacity 160ms ease;
}

.qibla.aligned .needle,
.qibla.aligned .north { stroke: var(--qibla-ok); opacity: 1; }
.qibla.aligned .kaaba { fill: var(--qibla-ok); }

.pulse {
  fill: none;
  stroke: var(--qibla-ok);
  stroke-width: 2;
  transform-origin: 32px 32px;
  animation: qibla-pulse 620ms ease-out forwards;
}

@keyframes qibla-pulse {
  from { transform: scale(1); opacity: 0.9; }
  to   { transform: scale(1.5); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .pulse { animation: none; opacity: 0; }
}


/* Balon tuvalin üstünde durur; sağ kenara yaslanır ki taşmasın. */
.bubble {
  position: absolute;
  bottom: calc(100% + 0.4rem);
  right: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.45rem 0.6rem;
  min-width: max-content;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.bubble-title {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text);
  white-space: nowrap;
}

.bubble-note {
  font-size: 0.625rem;
  line-height: 1.4;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  max-width: 13rem;
}
</style>

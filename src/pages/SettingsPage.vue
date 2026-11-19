<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { COLOR_STYLES } from '@/data/colorStyles'
import { NOTIFY_KEYS, NOTIFY_CHOICES, VAKIT_LABELS } from '@/data/vakitNotify'
import { AUTHORS } from '@/data/kuranMeta'
import { downloadBackup, readBackup, applyBackup } from '@/utils/backup'
import { supportsNotifications, requestNotificationPermission } from '@/composables/useVakitNotifications'
import { useSeo } from '@/composables/useSeo'

useSeo({
  title: 'Ayarlar',
  description: 'Tema, renk stili, saat görünümü ve açılış sayfası ayarları.',
  path: '/ayarlar',
})

const settings = useSettingsStore()

const themeOptions = [
  { value: 'auto',  label: 'Sistem', icon: '⊙' },
  { value: 'light', label: 'Açık',   icon: '☀' },
  { value: 'dark',  label: 'Koyu',   icon: '☽' },
]

const homeClockOptions = [
  { value: 'led',    label: 'LED' },
  { value: 'normal', label: 'Normal' },
]

const hijriOffsetOptions = [
  { value: true,  label: 'Akşam ezanı' },
  { value: false, label: 'Gece yarısı' },
]

// Bildirim izni sayfa açıkken değişebilir (tarayıcı ayarından geri
// alınabiliyor), bu yüzden okunan değer bir ref.
const permission = ref('default')
const notifySupported = supportsNotifications()

onMounted(() => {
  if (notifySupported) permission.value = Notification.permission
})

async function toggleNotifications(on) {
  if (!on) {
    settings.notificationsEnabled = false
    return
  }
  permission.value = await requestNotificationPermission()
  // İzin verilmediyse anahtar açılmaz: açık görünüp hiç bildirim
  // gelmemesi, kapalı durmasından daha yanıltıcı.
  settings.notificationsEnabled = permission.value === 'granted'
}

const notifyOptions = [
  { value: false, label: 'Kapalı' },
  { value: true,  label: 'Açık' },
]

// Kuran sayfasının yazı tipi. Liste bilinçli dar: mushaf nesih hattıyla
// okunur, talik ve kufi başka işler içindir. Hepsi `shareFonts.js`te
// tanımlı, yalnızca seçilen aile indirilir.
const quranFontOptions = [
  { value: 'lateef', label: 'Lateef' },
  { value: 'scheherazade', label: 'Scheherazade' },
  { value: 'amiri', label: 'Amiri' },
  { value: 'noto-naskh', label: 'Noto Naskh' },
]

// ── Yedek ──
// İçe aktarma iki adımlı: önce dosya okunup NE GELECEĞİ söylenir, sonra
// onaylanır. Tek dokunuşla üzerine yazmak, yanlış dosyada geri dönüşü
// olmayan bir iş olurdu.
const fileInput = ref(null)
const pending = ref(null)   // { data, keys, createdAt }
const backupNote = ref('')

async function pickFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  const result = readBackup(await file.text())
  if (!result.ok) {
    pending.value = null
    backupNote.value = result.error
    return
  }
  pending.value = result
  backupNote.value = ''
}

function confirmImport() {
  if (!pending.value) return
  applyBackup(pending.value.data)
  // Store'lar veriyi açılışta okuyor; yerine oturması için sayfa yenilenir.
  window.location.reload()
}

const backupDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })
}

const firstPageOptions = [
  { value: '/',         label: 'Ana Sayfa',    desc: 'Ana sayfa' },
  { value: '/saat',     label: 'Saat',         desc: 'Alaturka saat' },
  { value: '/vakitler', label: 'Vakitler',     desc: 'Namaz vakitleri' },
  { value: '/takvim',   label: 'Takvim',       desc: 'Hicri / Rumi takvim' },
]
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">ayarlar</h1>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Görünüm</h2>
        <p class="setting-desc">Tema ve renk stili</p>
      </div>

      <span class="sub-label">Tema</span>
      <div class="theme-selector">
        <button
          v-for="opt in themeOptions"
          :key="opt.value"
          class="theme-btn"
          :class="{ active: settings.darkMode === opt.value }"
          @click="settings.darkMode = opt.value"
        >
          <span class="theme-icon">{{ opt.icon }}</span>
          <span>{{ opt.label }}</span>
        </button>
      </div>

      <span class="sub-label sub-label--spaced">Renk stili</span>
      <div class="style-scroller">
        <button
          v-for="style in COLOR_STYLES"
          :key="style.id"
          class="style-card"
          :class="{ active: settings.colorStyle === style.id }"
          @click="settings.colorStyle = style.id"
        >
          <span class="style-square" :style="{ background: style.bg, color: style.fg }">
            <span class="square-label">{{ style.label }}</span>
            <span class="square-dots">
              <span
                v-for="(c, i) in style.swatch"
                :key="i"
                class="dot"
                :style="{ background: c }"
              ></span>
            </span>
          </span>
        </button>
      </div>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Ana Sayfa Saati</h2>
        <p class="setting-desc">Saat görünümü</p>
      </div>
      <div class="theme-selector">
        <button
          v-for="opt in homeClockOptions"
          :key="opt.value"
          class="theme-btn"
          :class="{ active: settings.homeClock === opt.value }"
          @click="settings.homeClock = opt.value"
        >
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Hicri Gün</h2>
        <p class="setting-desc">Hicri gün güneş batımıyla başlar. Açıkken tarih akşam ezanında döner, kapalıyken gece yarısında.</p>
      </div>
      <div class="theme-selector">
        <button
          v-for="opt in hijriOffsetOptions"
          :key="String(opt.value)"
          class="theme-btn"
          :class="{ active: settings.hijriOffset === opt.value }"
          @click="settings.hijriOffset = opt.value"
        >
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Vakit Hatırlatması</h2>
        <p class="setting-desc">Vakit girmeden önce haber ver</p>
      </div>

      <div class="theme-selector">
        <button
          v-for="opt in notifyOptions"
          :key="String(opt.value)"
          class="theme-btn"
          :class="{ active: settings.notificationsEnabled === opt.value }"
          :disabled="!notifySupported"
          @click="toggleNotifications(opt.value)"
        >
          <span>{{ opt.label }}</span>
        </button>
      </div>

      <p v-if="!notifySupported" class="notify-note">
        Bu tarayıcı bildirimleri desteklemiyor.
      </p>
      <p v-else-if="permission === 'denied'" class="notify-note">
        Bildirim izni reddedilmiş. Tarayıcının site ayarlarından izin verip tekrar deneyin.
      </p>
      <p v-else class="notify-note">
        Hatırlatma uygulama açıkken verilir. Her zaman çalışması için uygulamayı ana ekrana ekleyin.
      </p>

      <div v-if="settings.notificationsEnabled" class="notify-list">
        <label v-for="key in NOTIFY_KEYS" :key="key" class="notify-row">
          <span class="notify-vakit">{{ VAKIT_LABELS[key] }}</span>
          <select v-model.number="settings.notifyOffsets[key]" class="notify-select">
            <option v-for="c in NOTIFY_CHOICES" :key="c.value" :value="c.value">
              {{ c.value > 0 ? c.label + ' önce' : c.label }}
            </option>
          </select>
        </label>
      </div>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Kuran</h2>
        <p class="setting-desc">Okuma ve hatim sayfası</p>
      </div>

      <span class="sub-label">Yazı tipi</span>
      <div class="theme-selector">
        <button
          v-for="opt in quranFontOptions"
          :key="opt.value"
          class="theme-btn"
          :class="{ active: settings.quranFont === opt.value }"
          @click="settings.quranFont = opt.value"
        >
          <span>{{ opt.label }}</span>
        </button>
      </div>

      <span class="sub-label sub-label--spaced">Meal</span>
      <select v-model.number="settings.quranMeal" class="notify-select meal-select">
        <option :value="0">Kapalı — yalnızca Arapça</option>
        <option v-for="a in AUTHORS" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Yedek</h2>
        <p class="setting-desc">Verilerin tamamı bu cihazda tutuluyor</p>
      </div>

      <p class="notify-note">
        Ayarlar, şehir, kaza sayaçları, hatimler ve görsel düzeni tarayıcıda
        duruyor; tarayıcı verisi temizlenirse geri getirecek bir sunucu yok.
        Yedek dosyası bu cihazda üretilir, hiçbir yere gönderilmez.
      </p>

      <div class="backup-actions">
        <button class="theme-btn" @click="downloadBackup()">Yedeği indir</button>
        <button class="theme-btn" @click="fileInput?.click()">Yedekten yükle</button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="file-hidden"
          @change="pickFile"
        />
      </div>

      <p v-if="backupNote" class="notify-note notify-note--warn">{{ backupNote }}</p>

      <div v-if="pending" class="confirm">
        <p class="confirm-text">
          <strong>{{ pending.keys.length }}</strong> kayıt yüklenecek
          <template v-if="backupDate(pending.createdAt)">
            — {{ backupDate(pending.createdAt) }} tarihli yedek
          </template>.
          Bu cihazdaki aynı veriler değiştirilecek.
        </p>
        <div class="confirm-actions">
          <button class="theme-btn theme-btn--solid" @click="confirmImport">Yükle ve yenile</button>
          <button class="theme-btn" @click="pending = null">Vazgeç</button>
        </div>
      </div>
    </section>

    <section class="setting-block">
      <div class="setting-head">
        <h2 class="setting-name">Açılış Sayfası</h2>
        <p class="setting-desc">Uygulama açılınca hangi sayfa ile başlasın</p>
      </div>
      <div class="theme-selector">
        <button
          v-for="opt in firstPageOptions"
          :key="opt.value"
          class="theme-btn"
          :class="{ active: settings.firstPage === opt.value }"
          @click="settings.firstPage = opt.value"
        >
          <span>{{ opt.label }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  padding-bottom: 2rem;
}

/* Çizgiyle ayrılmış, sola yaslı section */
.setting-block {
  padding: 1.5rem 0;
  border-top: 1px solid var(--border);
}

.setting-block:first-of-type {
  margin-top: 0.5rem;
}

.setting-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.1rem;
}

.setting-name {
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text);
  line-height: 1.1;
}

.setting-desc {
  font-size: 0.65rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-top: 0.4rem;
}

/* Blok içi alt etiket (Tema / Renk stili) */
.sub-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.sub-label--spaced {
  margin-top: 1.5rem;
}

/* Tema seçici — sola yaslı segment kontrol */
.theme-selector {
  display: inline-flex;
  gap: 0.4rem;
}

.theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  cursor: pointer;
}

.theme-btn.active {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}

.theme-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Vakit hatırlatması ── */
.notify-note {
  font-size: 0.72rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin-top: 0.75rem;
  max-width: 44ch;
}

.notify-list {
  margin-top: 1.1rem;
  border-top: 1px solid var(--border);
  max-width: 24rem;
}

.notify-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--border);
}

.notify-vakit {
  font-size: 0.85rem;
  color: var(--text);
}

.notify-select {
  appearance: none;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  font: inherit;
  font-size: 0.78rem;
  color: var(--text);
  cursor: pointer;
}

.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.file-hidden { display: none; }

.notify-note--warn { color: var(--primary); }

.confirm {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  max-width: 34rem;
}

.confirm-text {
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--text);
}

.confirm-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.8rem;
}

.theme-btn--solid {
  background: var(--accent-ui);
  border-color: var(--accent-ui);
  color: #fff;
}

.meal-select {
  max-width: 22rem;
  width: 100%;
}

.notify-select:focus-visible {
  outline: 2px solid var(--accent-ui);
  outline-offset: 1px;
}

.theme-icon {
  font-size: 0.9rem;
  line-height: 1;
}

/* Renk stili — yatay kaydırılabilir kare önizlemeler */
.style-scroller {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  /* ekran kenarlarına taşır, içerik 1.25rem hizada başlar */
  margin: 0 -1.25rem;
  padding: 0.25rem 1.25rem 0.5rem;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.style-scroller::-webkit-scrollbar {
  display: none;
}

.style-card {
  flex: 0 0 auto;
  scroll-snap-align: start;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
}

/* Kare: arka plan = palet rengi, içinde stil adı + aksan noktaları */
.style-square {
  width: 96px;
  height: 96px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.7rem;
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.style-card.active .style-square {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--text);
}

.square-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.square-dots {
  display: flex;
  gap: 4px;
}

.square-dots .dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
}
</style>

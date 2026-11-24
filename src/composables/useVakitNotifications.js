import { watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useVakitPushStore } from '@/stores/vakitPush'
import { useSettingsStore } from '@/stores/settings'
import { isoDate } from '@alaturkavakitler/core'
import { NOTIFY_KEYS, NOTIFY_OFF, notifyText } from '@/data/vakitNotify'

/**
 * Vakit hatırlatmaları — tarayıcı tarafında.
 *
 * Açık sayfa zamanlayıcısı yalnızca Web Push aboneliği olmayan cihazlarda
 * kullanılır. İki yol aynı anda çalışırsa aynı hatırlatma iki kez gider.
 *
 * Tek bir `setTimeout` yerine KISA ARALIKLI bir yoklama var: arka plan
 * sekmesinde tarayıcı zamanlayıcıları kısıyor, cihaz uyuduğunda ise uzun
 * bir timeout olması gerekenden çok sonra uyanıyor. Yoklama "şu an ile
 * az önce arasında bir hatırlatma vakti geçti mi" diye bakar, böylece
 * geciken bir tik hatırlatmayı düşürmez.
 */

const TICK_MS = 20_000
// Uyanınca kaçırılmış bir hatırlatma hâlâ anlamlıysa verilir; bundan
// eskisi artık haber değil.
const GRACE_MS = 5 * 60 * 1000
const FIRED_KEY = 'vakitNotifyFired'

function loadFired() {
  try {
    const raw = JSON.parse(localStorage.getItem(FIRED_KEY) || '[]')
    return Array.isArray(raw) ? new Set(raw) : new Set()
  } catch {
    return new Set()
  }
}

function saveFired(set) {
  // Liste iki günden fazlasını taşımaz; anahtar tarihle başlıyor.
  const keep = [...set].slice(-24)
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(keep))
  } catch {
    /* kota — hatırlatma yine de verilir, sadece tekrarı engellenemez */
  }
}

export function supportsNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission() {
  if (!supportsNotifications()) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

async function show(title, body, tag) {
  const options = {
    body,
    tag,
    icon: '/logo192.png',
    badge: '/logo192.png',
  }
  // Android Chrome `new Notification()` çağrısını reddediyor; servis
  // çalışanı varsa bildirim oradan verilir.
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, options)
      return
    }
  } catch {
    /* servis çalışanı yoksa aşağıdaki yol kalır */
  }
  try {
    new Notification(title, options)
  } catch {
    /* bildirim verilemedi; sessizce geçilir */
  }
}

/**
 * Bugünün ve yarının tablosundan hatırlatma anlarını çıkarır.
 * `vakit` store'daki tablo; her vaktin bugünkü (`time`) ve yarınki
 * (`timeTomorrow`) karşılığı var.
 */
// Gün dönünce `timeTomorrow` bugünün hücresine kayar; tabloyu store
// yeniden kuruyor ve yoklama her seferinde güncelini okuyor, bu yüzden
// burada ayrıca gün takibi yok.
export function reminders(vakitObj, offsets) {
  const list = []
  if (!vakitObj) return list
  for (const key of NOTIFY_KEYS) {
    const minutes = Number(offsets?.[key])
    if (!Number.isFinite(minutes) || minutes === NOTIFY_OFF) continue
    const cell = vakitObj[key]
    if (!cell) continue
    for (const [at, time] of [[cell.time, cell.value], [cell.timeTomorrow, cell.valueTomorrow]]) {
      if (!at) continue
      const when = new Date(at.getTime() - minutes * 60000)
      list.push({
        key,
        minutes,
        time,
        at: when.getTime(),
        id: `${isoDate(when)}-${key}-${minutes}`,
      })
    }
  }
  return list.sort((a, b) => a.at - b.at)
}

export function useVakitNotifications() {
  const app = useAppStore()
  const settings = useSettingsStore()
  const push = useVakitPushStore()
  let timer = 0
  let fired = loadFired()

  async function check() {
    if (!settings.notificationsEnabled || push.suppressLocal) return
    if (!supportsNotifications() || Notification.permission !== 'granted') return

    const now = Date.now()
    const due = reminders(app.vakit, settings.notifyOffsets)
      .filter((r) => r.at <= now && r.at > now - GRACE_MS && !fired.has(r.id))

    for (const r of due) {
      fired.add(r.id)
      const { title, body } = notifyText(r.key, r.minutes, r.time)
      await show(title, body, r.id)
    }
    if (due.length) saveFired(fired)
  }

  function start() {
    if (timer) return
    check()
    timer = window.setInterval(check, TICK_MS)
  }

  function stop() {
    if (timer) window.clearInterval(timer)
    timer = 0
  }

  function onVisible() {
    if (document.visibilityState === 'visible') check()
  }

  onMounted(() => {
    start()
    document.addEventListener('visibilitychange', onVisible)
  })

  onUnmounted(() => {
    stop()
    document.removeEventListener('visibilitychange', onVisible)
  })

  // Ayar değişince beklenen davranış hemen görünsün: kapatılınca sıradaki
  // yoklama boş döner, açılınca o anda bir kontrol yapılır.
  watch(() => settings.notificationsEnabled, (on) => { if (on) check() })
  watch(() => settings.notifyOffsets, () => check(), { deep: true })
  // Açılışta tablo henüz yok (veri önbellekten/ağdan sonra geliyor);
  // geldiği anda bir kez bakılır, yoksa ilk hatırlatma bir sonraki
  // yoklamayı bekler.
  watch(() => app.vakit, () => check())

  return { check }
}

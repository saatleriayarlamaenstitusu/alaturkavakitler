import { computed, unref } from 'vue'
import { DateTime } from 'luxon'
import { useAppStore } from '@/stores/app'
import { useSettingsStore } from '@/stores/settings'
import { hijriNow } from '@/utils/hijri'

/**
 * Bugünün akşam ezanı anı — ayar kapalıysa ya da vakit bilinmiyorsa null.
 * Hicri gün güneş batımıyla başlar; ayar açıkken akşamdan sonra tarih bir
 * gün ileri alınır.
 */
export function aksamCutoff(vakitler, enabled, now = new Date()) {
  if (!enabled || !vakitler) return null
  const iso = DateTime.fromJSDate(now).toISODate()
  const time = vakitler[iso]?.aksam
  if (!time) return null
  const [h, m] = String(time).split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  const cutoff = new Date(now)
  cutoff.setHours(h, m, 0, 0)
  return cutoff
}

/**
 * Ayarı ve akşam vaktini hesaba katan hicri tarih.
 * @param {import('vue').Ref<Date>|Date} now saniye tiklerini izleyen bir ref
 *   verilirse tarih akşam ezanında kendiliğinden döner.
 */
export function useHijriToday(now = null) {
  const appStore = useAppStore()
  const settings = useSettingsStore()

  return computed(() => {
    const at = unref(now) ?? new Date()
    const cutoff = aksamCutoff(appStore.vakitler, settings.hijriOffset, at)
    const h = hijriNow(at, cutoff)
    // Eski çağrı yerleri `date` alanını bekliyor.
    return { ...h, date: h.day }
  })
}

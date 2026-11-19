/**
 * Yedek alma ve geri yükleme.
 *
 * Uygulamanın bütün hafızası tarayıcıda: ayarlar, şehir, kaza sayaçları,
 * hatimler, görsel oluşturucudaki düzen. Tarayıcı verisini temizlemek ya
 * da başka bir cihaza geçmek bunların hepsini siler ve geri getirecek bir
 * sunucu yok — bu yüzden dışa aktarma bir özellik değil, bir zorunluluk.
 *
 * ÖNBELLEKLER dahil değildir: namaz vakti JSON'u ve çekilmiş ayetler
 * yeniden indirilebilir, yedeği şişirmekten başka işe yaramazlar.
 * Verilen hatırlatmaların listesi de öyle — bir günlük bir işarettir.
 */

/** Yedeğe giren sabit anahtarlar. `settings_*` ayrıca toplanır. */
const KEYS = [
  'city',        // seçili şehir
  'kazaCounts',  // kaza sayaçları
  'hatimler',    // hatimler ve ilerlemeleri
  'shareEditor', // görsel oluşturucudaki son düzen
]

/** Yedeğe GİRMEYEN, yeniden üretilebilir veriler. */
const SKIP = ['vakitler', 'kuranVerses', 'vakitNotifyFired']

export const BACKUP_VERSION = 1

export function collectBackup() {
  const data = {}
  for (const key of Object.keys(localStorage)) {
    if (SKIP.includes(key)) continue
    if (!KEYS.includes(key) && !key.startsWith('settings_')) continue
    const value = localStorage.getItem(key)
    if (value !== null) data[key] = value
  }
  return {
    app: 'alaturkavakitler',
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    data,
  }
}

export function backupFilename(date = new Date()) {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return `alaturka-yedek-${iso}.json`
}

/** Yedeği indirir. Tarayıcı dışına hiçbir şey gitmez, dosya burada üretilir. */
export function downloadBackup() {
  const blob = new Blob([JSON.stringify(collectBackup(), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupFilename()
  a.click()
  // Sekme açık kaldığı sürece blob bellekte durur.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Yedeği okur ve doğrular — yazmaz.
 * @returns {{ ok: true, keys: string[], data: object, createdAt: string }
 *          | { ok: false, error: string }}
 */
export function readBackup(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Dosya okunamadı — geçerli bir JSON değil.' }
  }
  if (parsed?.app !== 'alaturkavakitler' || typeof parsed.data !== 'object' || !parsed.data)
    return { ok: false, error: 'Bu dosya Alaturka Vakitler yedeği değil.' }
  if (Number(parsed.version) > BACKUP_VERSION)
    return { ok: false, error: 'Yedek daha yeni bir sürümden; önce uygulamayı güncelleyin.' }

  // Yalnızca tanıdığımız anahtarlar yazılır: yedek dosyası elle
  // düzenlenebilir bir metindir, oradan gelen her şeye güvenilmez.
  const data = {}
  for (const [key, value] of Object.entries(parsed.data)) {
    if (typeof value !== 'string') continue
    if (!KEYS.includes(key) && !key.startsWith('settings_')) continue
    data[key] = value
  }
  if (!Object.keys(data).length)
    return { ok: false, error: 'Yedekte tanınan bir veri yok.' }

  return { ok: true, data, keys: Object.keys(data), createdAt: parsed.createdAt ?? '' }
}

/**
 * Yedeği yazar. Mevcut veriyi DEĞİŞTİRİR; çağıran onay almış olmalı.
 * Sayfa yeniden yüklenmeli — store'lar açılışta okuyor.
 */
export function applyBackup(data) {
  for (const [key, value] of Object.entries(data)) localStorage.setItem(key, value)
}

// Vakit hatırlatmalarının tek kaynağı.
//
// Hatırlatma vaktin KENDİSİNDE değil, öncesinde verilir: ezanı duyduğunda
// haber almak bir şeye yaramıyor, hazırlanacak vakit kalmış olmuyor.
// Her vakit için kaç dakika önce haber verileceği ayrı ayarlanır — imsak
// için bir saat anlamlıyken yatsı için on beş dakika yeterli.
//
// -1 = o vakit için hatırlatma kapalı, 0 = tam vaktinde.

export const VAKIT_LABELS = {
  imsak: 'İmsak',
  gunes: 'Güneş',
  ogle: 'Öğle',
  ikindi: 'İkindi',
  aksam: 'Akşam',
  yatsi: 'Yatsı',
}

export const NOTIFY_KEYS = Object.keys(VAKIT_LABELS)

export const NOTIFY_OFF = -1

export const DEFAULT_NOTIFY_OFFSETS = {
  imsak: 60,
  gunes: 20,
  ogle: 30,
  ikindi: 20,
  aksam: 30,
  yatsi: 15,
}

/** Seçilebilen önceden-haber süreleri (dakika). */
export const NOTIFY_CHOICES = [
  { value: NOTIFY_OFF, label: 'Kapalı' },
  { value: 0, label: 'Tam vakitte' },
  { value: 5, label: '5 dk' },
  { value: 10, label: '10 dk' },
  { value: 15, label: '15 dk' },
  { value: 20, label: '20 dk' },
  { value: 30, label: '30 dk' },
  { value: 45, label: '45 dk' },
  { value: 60, label: '1 saat' },
  { value: 90, label: '1,5 saat' },
  { value: 120, label: '2 saat' },
]

/** Kaydedilmiş değerleri varsayılanların üstüne oturtur. */
export function normalizeOffsets(stored) {
  const out = { ...DEFAULT_NOTIFY_OFFSETS }
  if (stored && typeof stored === 'object') {
    for (const key of NOTIFY_KEYS) {
      const v = Number(stored[key])
      if (Number.isFinite(v)) out[key] = v
    }
  }
  return out
}

/** Bildirim metni: "İmsak'a 1 saat kaldı" / "İmsak vakti girdi". */
export function notifyText(key, minutes, time) {
  const name = VAKIT_LABELS[key] ?? key
  if (minutes <= 0) {
    return { title: `${name} vakti`, body: time ? `Vakit girdi · ${time}` : 'Vakit girdi' }
  }
  const choice = NOTIFY_CHOICES.find((c) => c.value === minutes)
  const span = choice && choice.value > 0 ? choice.label : `${minutes} dk`
  return {
    title: `${name} yaklaşıyor`,
    body: time ? `${span} sonra ${name.toLocaleLowerCase('tr-TR')} · ${time}` : `${span} sonra ${name.toLocaleLowerCase('tr-TR')}`,
  }
}

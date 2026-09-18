import { DateTime } from 'luxon'
import { calculateAlaturka } from '@/utils/clock'
import { nowHijri } from '@/utils/hijri'
import { VAKIT_COLORS } from '@/utils/vakit'

const VAKIT_ORDER = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi']
const VAKIT_NAMES = {
  imsak: 'İmsak', gunes: 'Güneş', ogle: 'Öğle',
  ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı',
}

// Editör açıldığı anın dondurulmuş görüntüsü.
// Paylaşım widget'ları store'a değil bu objeye bakar: görsel bir ana aittir,
// tuval açıkken saat ilerlemez.
export function createSnapshot({ city, vakitler, currentVakit }) {
  const now = DateTime.now().setLocale('tr')
  const todayISO = now.toISODate()
  const today = vakitler?.[todayISO] ?? null
  const hijri = nowHijri('object')

  const list = VAKIT_ORDER.map(key => ({
    key,
    name: VAKIT_NAMES[key],
    value: today?.[key] ?? '--:--',
    color: VAKIT_COLORS[key],
  }))

  const currentIndex = Math.max(VAKIT_ORDER.indexOf(currentVakit), 0)
  const current = list[currentIndex]
  const next = list[(currentIndex + 1) % list.length]

  return {
    cityName: city?.name ?? '',
    alaturka: calculateAlaturka(now, vakitler),
    normal: now.toFormat('HH:mm'),
    currentVakit,
    primary: VAKIT_COLORS[currentVakit] ?? '#ae002e',
    miladi: {
      day: now.day,
      monthLong: now.monthLong,
      year: now.year,
      weekdayLong: now.weekdayLong,
      short: now.toFormat('dd.MM.yyyy'),
    },
    hijri,
    vakitler: list,
    current,
    next,
  }
}

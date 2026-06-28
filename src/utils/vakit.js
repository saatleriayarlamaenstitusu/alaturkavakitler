import { DateTime } from 'luxon'

export const VAKIT_COLORS = {
  imsak: '#00b7ff',
  gunes: '#ffbd33',
  ogle: '#ffd733',
  ikindi: '#ff8c33',
  aksam: '#0491fb',
  yatsi: '#2e3b83',
}

export function createVakitObj(vakitler) {
  const template = {
    imsak:  { key: 'imsak',  name: 'İmsak',   label: 'İmsak\'a',   next: 'gunes',  color: VAKIT_COLORS.imsak },
    gunes:  { key: 'gunes',  name: 'Güneş',   label: 'Güneş\'e',   next: 'ogle',   color: VAKIT_COLORS.gunes },
    ogle:   { key: 'ogle',   name: 'Öğle',    label: 'Öğle\'ye',   next: 'ikindi', color: VAKIT_COLORS.ogle },
    ikindi: { key: 'ikindi', name: 'İkindi',  label: 'İkindi\'ye', next: 'aksam',  color: VAKIT_COLORS.ikindi },
    aksam:  { key: 'aksam',  name: 'Akşam',   label: 'Akşam\'a',   next: 'yatsi',  color: VAKIT_COLORS.aksam },
    yatsi:  { key: 'yatsi',  name: 'Yatsı',   label: 'Yatsı\'ya',  next: 'imsak',  color: VAKIT_COLORS.yatsi },
  }

  const todayISO = DateTime.now().toISODate()
  const tomorrowISO = DateTime.now().plus({ days: 1 }).toISODate()
  const today = vakitler[todayISO]
  const tomorrow = vakitler[tomorrowISO]

  if (!today) return null

  for (const key in today) {
    if (!template[key]) continue
    template[key].value = today[key]
    template[key].valueDateObj = DateTime.fromISO(`${todayISO}T${today[key]}`)
  }

  if (tomorrow) {
    for (const key in tomorrow) {
      if (!template[key]) continue
      template[key].value2 = tomorrow[key]
      template[key].valueDateObj2 = DateTime.fromISO(`${tomorrowISO}T${tomorrow[key]}`)
    }
  }

  return template
}

export function findVakit(vakitObj) {
  if (!vakitObj) return 'yatsi'
  const now = DateTime.now()
  let maxPast = -Infinity
  let current = 'yatsi'

  for (const key in vakitObj) {
    const diff = vakitObj[key].valueDateObj - now
    if (diff < 0 && diff > maxPast) {
      maxPast = diff
      current = key
    }
  }

  return current
}

export function isKerahat(counter, currentVakit, vakit) {
  if (currentVakit === 'ikindi') {
    return counter.hours === 0 && counter.minutes < 45
  }
  if (currentVakit === 'gunes') {
    const gunesPlus45 = vakit['gunes'].valueDateObj.plus({ minutes: 45 })
    return (counter.hours === 0 && counter.minutes < 45) || gunesPlus45 > DateTime.now()
  }
  return false
}

import { NOTIFY_KEYS, NOTIFY_CHOICES, NOTIFY_OFF } from '../../src/data/vakitNotify.js'

export const MINUTE = 60_000
export const GRACE = 5 * MINUTE
const DAY = 86_400_000
const TURKEY_OFFSET = 3 * 60 * MINUTE
const dates = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
})
const choices = new Set(NOTIFY_CHOICES.map(({ value }) => value))

export function validOffsets(offsets) {
  return offsets && NOTIFY_KEYS.every((key) => choices.has(offsets[key]))
}

export function plan(table, offsets, now, cursor = now) {
  if (NOTIFY_KEYS.every((key) => offsets[key] === NOTIFY_OFF)) return { due: [], wake: null }
  const today = dates.format(now)
  const tomorrow = dates.format(now + DAY)
  const yesterday = dates.format(now - DAY)
  const due = []
  const nextMidnight = Date.parse(`${tomorrow}T00:00:00+03:00`)
  // Re-evaluate the daytime schedule each day while also considering tomorrow's
  // imsak reminder, which can fall before midnight.
  let wake = nextMidnight
  for (const [date, day] of [[yesterday, table[yesterday]], [today, table[today]], [tomorrow, table[tomorrow]]]) {
    for (const key of NOTIFY_KEYS) {
      const minutes = offsets[key]
      const time = day?.[key]
      if (minutes === NOTIFY_OFF || typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) continue
      const at = Date.parse(`${date}T${time}:00Z`) - TURKEY_OFFSET - minutes * MINUTE
      if (at > now) wake = Math.min(wake, at)
      if (at <= now && at > cursor && at > now - GRACE) due.push({ at, key, minutes, time, tag: `${date}-${key}-${minutes}` })
    }
  }
  if (!table[today] || !table[tomorrow]) wake = Math.min(wake, now + 15 * MINUTE)
  return { due, wake }
}

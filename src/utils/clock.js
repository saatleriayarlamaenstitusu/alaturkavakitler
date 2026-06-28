import { DateTime } from 'luxon'

export function calculateAlaturka(now, vakitler) {
  if (!vakitler) return '--:--'

  const todayISO = now.toISODate()
  const yesterdayISO = now.minus({ days: 1 }).toISODate()

  const todayAksam = vakitler[todayISO]?.aksam
  const yesterdayAksam = vakitler[yesterdayISO]?.aksam

  if (!todayAksam || !yesterdayAksam) return '--:--'

  const aksam = DateTime.fromISO(`${todayISO}T${todayAksam}`)

  if (now < aksam) {
    const dunAksam = DateTime.fromISO(`${yesterdayISO}T${yesterdayAksam}`)
    return now.diff(dunAksam).toFormat('hh:mm')
  }

  return now.diff(aksam).toFormat('hh:mm')
}

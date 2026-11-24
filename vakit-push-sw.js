self.addEventListener('push', (event) => {
  let data
  try { data = event.data?.json() } catch { return }
  if (typeof data?.title !== 'string' || typeof data?.body !== 'string') return
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    tag: data.tag,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: { vakitPush: true },
  }))
})

self.addEventListener('notificationclick', (event) => {
  if (!event.notification.data?.vakitPush) return
  event.notification.close()
  event.waitUntil((async () => {
    const url = new URL('/vakitler', self.location.origin).href
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = clients.find((client) => client.url === url)
    if (existing) await existing.focus()
    else await self.clients.openWindow(url)
  })())
})

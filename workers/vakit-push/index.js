import { buildPushPayload } from '@block65/webcrypto-web-push'
import { NOTIFY_KEYS, notifyText } from '../../src/data/vakitNotify.js'
import { GRACE, MINUTE, plan, validOffsets } from './schedule.js'

const ROOT = '/api/vakit-push/'
const SITE = 'https://alaturkavakitler.com'
const TIMES = 'https://raw.githubusercontent.com/saatleriayarlamaenstitusu/data-diyanet-namaz-vakitleri/main/data/namaz/'
const RETENTION = 365 * 24 * 60 * MINUTE

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

function validSubscription(sub) {
  if (typeof sub?.endpoint !== 'string' || sub.endpoint.length > 2500 ||
      !/^[\w-]{87}$/.test(sub.keys?.p256dh ?? '') ||
      !/^[\w-]{22}$/.test(sub.keys?.auth ?? '')) return false
  if (atob(sub.keys.p256dh.replace(/-/g, '+').replace(/_/g, '/')).charCodeAt(0) !== 4) return false
  let endpoint
  try { endpoint = new URL(sub.endpoint) } catch { return false }
  if (endpoint.protocol !== 'https:' || endpoint.port || endpoint.username ||
      endpoint.password || endpoint.hash) return false
  const { hostname, pathname } = endpoint
  // The endpoint comes from the client. Permit browser push services only,
  // and never follow redirects in send().
  if (/^[a-z0-9-]+\.notify\.windows\.com$/.test(hostname)) {
    return pathname === '/w/' && /^\?token=[\w.%+~=-]+$/.test(endpoint.search)
  }
  if (endpoint.search) return false
  return ((hostname === 'fcm.googleapis.com' || hostname === 'android.googleapis.com') &&
      /^\/fcm\/send\/[\w:.-]+$/.test(pathname)) ||
    (hostname === 'updates.push.services.mozilla.com' && /^\/wpush\/v2\/[\w-]+$/.test(pathname)) ||
    (/^[a-z0-9-]+\.push\.apple\.com$/.test(hostname) && /^\/[\w.-]+$/.test(pathname))
}

async function cityTable(city) {
  const response = await fetch(TIMES + city + '.json', {
    cf: { cacheTtl: 60, cacheEverything: true },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Vakit tablosu alınamadı')
  return response.json()
}

async function send(env, subscription, payload) {
  const request = await buildPushPayload({
    data: payload,
    options: { ttl: GRACE / 1000, urgency: 'high' },
  }, subscription, {
    subject: SITE,
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
  })
  const response = await fetch(subscription.endpoint, {
    ...request, redirect: 'manual', signal: AbortSignal.timeout(8000),
  })
  await response.body?.cancel()
  return response.status
}

async function installationId(request) {
  const token = request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1]
  if (!token) return null
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function save(request, env, id) {
  if (Number(request.headers.get('Content-Length')) > 8192) return json({ error: 'size' }, 413)
  const reader = request.body?.getReader()
  if (!reader) return json({ error: 'invalid' }, 400)
  const decoder = new TextDecoder()
  let raw = ''
  let bytes = 0
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    bytes += value.byteLength
    if (bytes > 8192) {
      await reader.cancel()
      return json({ error: 'size' }, 413)
    }
    raw += decoder.decode(value, { stream: true })
  }
  let input
  try { input = JSON.parse(raw + decoder.decode()) } catch { return json({ error: 'invalid' }, 400) }
  const { subscription, city, offsets } = input ?? {}
  if (typeof city !== 'string' || !/^(0[1-9]|[1-7][0-9]|8[01])$/.test(city) ||
      !validOffsets(offsets) || !validSubscription(subscription)) return json({ error: 'invalid' }, 400)
  const now = Date.now()
  // Persist preferences even if the upstream table is temporarily unavailable.
  // The scheduler alone reads the table, so changing city never depends on it.
  const wake = NOTIFY_KEYS.every((key) => offsets[key] === -1) ? null : now
  const schedule = Object.fromEntries(NOTIFY_KEYS.map((key) => [key, offsets[key]]))
  const { endpoint, keys: { auth, p256dh } } = subscription
  const result = await env.DB.prepare(`
    INSERT INTO subscriptions (id, endpoint, subscription, city, offsets, cursor_at, wake_at, expires_at, revision)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO UPDATE SET endpoint=excluded.endpoint, subscription=excluded.subscription,
      city=excluded.city, offsets=excluded.offsets, expires_at=excluded.expires_at,
      cursor_at=CASE WHEN subscriptions.city=excluded.city AND subscriptions.offsets=excluded.offsets
        AND subscriptions.endpoint=excluded.endpoint THEN subscriptions.cursor_at ELSE excluded.cursor_at END,
      wake_at=CASE WHEN subscriptions.city=excluded.city AND subscriptions.offsets=excluded.offsets
        AND subscriptions.endpoint=excluded.endpoint THEN subscriptions.wake_at ELSE excluded.wake_at END,
      revision=excluded.revision WHERE subscriptions.id=excluded.id
  `).bind(id, endpoint, JSON.stringify({ endpoint, keys: { auth, p256dh } }), city,
    JSON.stringify(schedule), now, wake, now + RETENTION, crypto.randomUUID()).run()
  return result.meta.changes ? json({ active: true }) : json({ error: 'endpoint-in-use' }, 409)
}

async function test(env, id) {
  const cutoff = Date.now() - 2 * MINUTE
  const row = await env.DB.prepare(`
    UPDATE subscriptions SET last_test_at=? WHERE id=? AND last_test_at<=?
    RETURNING subscription, revision
  `).bind(Date.now(), id, cutoff).first()
  if (!row) return json({ error: 'inactive-or-rate-limited' }, 429)
  const code = await send(env, JSON.parse(row.subscription), {
    title: 'Test bildirimi', body: 'Vakit hatırlatmaları için bildirim açık.', tag: 'vakit-test',
  })
  if (code === 404 || code === 410) await removeExpired(env, id, row.revision)
  return code >= 200 && code < 300 ? json({ sent: true }) : json({ error: 'delivery' }, 502)
}

const removeExpired = (env, id, revision) =>
  env.DB.prepare('DELETE FROM subscriptions WHERE id=? AND revision=?').bind(id, revision).run()

async function route(request, env) {
  const pathname = new URL(request.url).pathname
  if (pathname === ROOT + 'key' && request.method === 'GET') {
    return env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY
      ? json({ key: env.VAPID_PUBLIC_KEY }) : json({ error: 'unavailable' }, 503)
  }
  if (request.headers.get('Origin') !== SITE) return json({ error: 'origin' }, 403)
  const id = await installationId(request)
  if (!id) return json({ error: 'authorization' }, 401)
  const { success } = await env.API_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') ?? id })
  if (!success) return json({ error: 'rate-limited' }, 429)
  if (pathname === ROOT + 'subscription') {
    if (request.method === 'PUT') return save(request, env, id)
    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM subscriptions WHERE id=?').bind(id).run()
      return json({ active: false })
    }
  }
  if (pathname === ROOT + 'test' && request.method === 'POST') return test(env, id)
  return json({ error: 'not-found' }, 404)
}

async function run(env) {
  const now = Date.now()
  await env.DB.prepare('DELETE FROM subscriptions WHERE expires_at<=?').bind(now).run()
  const { results } = await env.DB.prepare(`
    SELECT * FROM subscriptions WHERE wake_at<=? ORDER BY wake_at LIMIT 30
  `).bind(now).all()
  const tables = new Map()
  for (let i = 0; i < results.length; i += 5) {
    await Promise.all(results.slice(i, i + 5).map(async (row) => {
      try {
        if (!tables.has(row.city)) tables.set(row.city, cityTable(row.city))
        const { due, wake } = plan(await tables.get(row.city), JSON.parse(row.offsets), now, row.cursor_at)
        // Compare both fields to ensure another cron invocation or a city/
        // preference update cannot claim this same set of reminders.
        const claimed = await env.DB.prepare(`
          UPDATE subscriptions SET wake_at=?, cursor_at=?
          WHERE id=? AND revision=? AND cursor_at=?
        `).bind(wake, now, row.id, row.revision, row.cursor_at).run()
        if (!claimed.meta.changes) return
        for (const item of due) {
          const code = await send(env, JSON.parse(row.subscription), {
            ...notifyText(item.key, item.minutes, item.time), tag: item.tag,
          })
          if (code === 404 || code === 410) {
            await removeExpired(env, row.id, row.revision)
            break
          }
          if (code < 200 || code >= 300) console.warn('Push rejected', code)
        }
      } catch {
        // Move an upstream failure behind other due rows without advancing
        // the cursor, so the next tick can still pick up a recent reminder.
        await env.DB.prepare(`
          UPDATE subscriptions SET wake_at=?
          WHERE id=? AND revision=? AND cursor_at=?
        `).bind(now + MINUTE, row.id, row.revision, row.cursor_at).run()
        console.warn('Scheduled reminder could not be sent')
      }
    }))
  }
}

export default {
  async fetch(request, env) {
    try { return await route(request, env) }
    catch (error) {
      console.error('Push API request failed', error.name, error.message.replace(/https?:\/\/\S+/g, '[url]'))
      return json({ error: 'unavailable' }, 503)
    }
  },
  async scheduled(_controller, env) {
    if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) await run(env)
  },
}

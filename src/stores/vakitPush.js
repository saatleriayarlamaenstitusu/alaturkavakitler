import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAppStore } from './app'
import { useSettingsStore } from './settings'
import { normalizeOffsets, NOTIFY_CHOICES, DEFAULT_NOTIFY_OFFSETS } from '@/data/vakitNotify'

const API = '/api/vakit-push/'
const TOKEN_KEY = 'vakitPushInstallation'
const choices = new Set(NOTIFY_CHOICES.map(({ value }) => value))

function newToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) => v.toString(16).padStart(2, '0')).join('')
}

async function api(path, { method = 'GET', token, data } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (data) headers['Content-Type'] = 'application/json'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch(API + path, {
      method, headers, body: data ? JSON.stringify(data) : undefined,
      cache: 'no-store', signal: controller.signal,
    })
    if (!response.ok) throw new Error(String(response.status))
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

function vapidKey(key) {
  const value = key.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0))
}

export const useVakitPushStore = defineStore('vakitPush', () => {
  const app = useAppStore()
  const settings = useSettingsStore()
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const state = ref(token.value ? 'pending' : 'idle')
  const available = ref(false)
  const preparationFailed = ref(false)
  const supported = typeof PushManager !== 'undefined' && Boolean(navigator.serviceWorker)
  const suppressLocal = computed(() => Boolean(token.value) && settings.notificationsEnabled)
  let registration
  let publicKey
  let queue = Promise.resolve()
  let preparation

  function prepare() {
    if (!supported || available.value) return Promise.resolve()
    if (!preparation) {
      preparationFailed.value = false
      preparation = Promise.all([
        api('key'),
        // Fresh installs can take longer than a timer while Workbox fills
        // the offline cache. Only the API request has a timeout.
        navigator.serviceWorker.ready,
      ]).then(([{ key }, reg]) => {
        if (!reg?.pushManager) throw new Error('push-manager')
        publicKey = vapidKey(key)
        registration = reg
        available.value = true
      }).catch(() => {
        preparationFailed.value = true
      }).finally(() => { preparation = null })
    }
    return preparation
  }

  function enqueue(operation) {
    // Read settings inside the queue. Rapid changes cannot overtake each
    // other and an offline update is sent with the latest values on reconnect.
    queue = queue.then(operation).catch(() => { state.value = 'error' })
    return queue
  }

  async function sync() {
    const current = token.value
    if (!current) return
    state.value = 'pending'
    const enabled = JSON.parse(localStorage.getItem('settings_notificationsEnabled') ?? String(settings.notificationsEnabled))
    const reg = registration ?? await navigator.serviceWorker?.getRegistration()
    if (enabled && Notification.permission === 'granted' && !reg) throw new Error('registration')
    const subscription = await reg?.pushManager?.getSubscription()
    if (!enabled || Notification.permission !== 'granted' || !subscription) {
      if (subscription) await subscription.unsubscribe()
      await api('subscription', { method: 'DELETE', token: current })
      localStorage.removeItem(TOKEN_KEY)
      token.value = null
      state.value = 'idle'
      return
    }
    const city = JSON.parse(localStorage.getItem('city') ?? 'null') ?? app.city
    const storedOffsets = JSON.parse(localStorage.getItem('settings_notifyOffsets') ?? 'null') ?? settings.notifyOffsets
    const offsets = normalizeOffsets(storedOffsets)
    for (const key of Object.keys(offsets)) {
      if (!choices.has(offsets[key])) offsets[key] = DEFAULT_NOTIFY_OFFSETS[key]
    }
    await api('subscription', {
      method: 'PUT', token: current,
      data: { city: String(city.plate).padStart(2, '0'), offsets, subscription: subscription.toJSON() },
    })
    state.value = 'active'
  }

  async function enable() {
    if (!available.value || token.value) return
    state.value = 'pending'
    try {
      // Subscribe directly in the click handler; WebKit requires a gesture.
      await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey })
      const current = newToken()
      localStorage.setItem(TOKEN_KEY, current)
      token.value = current
      await enqueue(sync)
    } catch {
      state.value = 'error'
    }
  }

  function refresh() {
    if (token.value) return enqueue(sync)
  }

  async function test() {
    await api('test', { method: 'POST', token: token.value })
  }

  watch([() => app.city.plate, () => settings.notifyOffsets, () => settings.notificationsEnabled],
    refresh, { deep: true })
  window.addEventListener('storage', (event) => {
    if (event.key !== null && event.key !== TOKEN_KEY) return
    token.value = localStorage.getItem(TOKEN_KEY)
    state.value = token.value ? 'pending' : 'idle'
    if (token.value) refresh()
  })
  window.addEventListener('online', () => {
    if (settings.notificationsEnabled) prepare()
    refresh()
  })
  window.addEventListener('focus', () => {
    if (state.value === 'error' || (token.value && Notification.permission !== 'granted')) refresh()
  })
  if (token.value) {
    // A returning installation may load before Workbox registers its worker.
    prepare().then(() => { if (available.value) refresh(); else state.value = 'error' })
  }

  return { supported, available, preparationFailed, state, suppressLocal, prepare, enable, refresh, test }
})

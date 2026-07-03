import { watchEffect, unref, onUnmounted } from 'vue'

const SITE_NAME = 'Alaturka Vakitler'
const SITE_URL = 'https://alaturkavakitler.com'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function clearJsonLd() {
  document.head
    .querySelectorAll('script[data-seo-jsonld]')
    .forEach((el) => el.remove())
}

function applyJsonLd(blocks) {
  clearJsonLd()
  for (const block of blocks) {
    if (!block) continue
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-seo-jsonld', '')
    el.textContent = JSON.stringify(block)
    document.head.appendChild(el)
  }
}

/**
 * Sayfa bazlı SEO. Değerler ref/computed veya düz değer olabilir.
 * @param {Object} opts { title, description, path }
 *   title: markanın önüne gelir; boşsa yalnız marka adı. Ana sayfada suffix eklenmez (isHome).
 */
export function useSeo(opts = {}) {
  const stop = watchEffect(() => {
    const title = unref(opts.title)
    const description = unref(opts.description)
    const path = unref(opts.path) ?? window.location.pathname
    const isHome = unref(opts.isHome) ?? false

    const fullTitle = !title ? SITE_NAME : isHome ? title : `${title} | ${SITE_NAME}`
    const url = SITE_URL + path

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertCanonical(url)

    // JSON-LD yapısal veri (tek obje veya dizi)
    const jsonLd = unref(opts.jsonLd)
    if (jsonLd) {
      applyJsonLd(Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    } else {
      clearJsonLd()
    }
  })

  onUnmounted(() => {
    stop()
    clearJsonLd()
  })
}

export const SEO_SITE = { name: SITE_NAME, url: SITE_URL }

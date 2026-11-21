import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { normalizeOffsets } from '@/data/vakitNotify'
import { AUTHORS } from '@/data/kuranMeta'

function load(key, defaultValue) {
  const stored = localStorage.getItem(`settings_${key}`)
  return stored !== null ? JSON.parse(stored) : defaultValue
}

/**
 * Meal listesini temizler: tanınan kimlikler, tekrarsız, AUTHORS
 * sırasında. 0 (kapalı) ve bilinmeyen kimlikler atılır — boş liste
 * "meal kapalı" demektir, ayrı bir anahtar tutmaya gerek yok.
 */
function normalizeMeals(value) {
  const ids = Array.isArray(value) ? value : [value]
  const want = new Set(ids.map(Number).filter((n) => AUTHORS.some((a) => a.id === n)))
  return AUTHORS.filter((a) => want.has(a.id)).map((a) => a.id)
}

export const useSettingsStore = defineStore('settings', () => {
  const primaryClock = ref(load('primaryClock', 'alaturka'))
  const secondaryClock = ref(load('secondaryClock', 'normal'))
  const clockStyle = ref(load('clockStyle', 'digital'))
  const analogDesign = ref(load('analogDesign', 1))
  const hijriOffset = ref(load('hijriOffset', false))
  const vakitSource = ref(load('vakitSource', 'diyanet'))
  const firstPage = ref(load('firstPage', '/'))
  const themePerVakit = ref(load('themePerVakit', true))
  const notificationsEnabled = ref(load('notificationsEnabled', false))
  // Vakit başına "kaç dakika önce" (-1 kapalı, 0 tam vakitte). Kayıtlı
  // değer varsayılanların üstüne oturtulur: listeye yeni bir vakit ya da
  // yeni bir varsayılan eklendiğinde eski kayıt onu eksik bırakmasın.
  const notifyOffsets = ref(normalizeOffsets(load('notifyOffsets', null)))
  // Varsayılan görünüm: AÇIK mod + mesh paleti. Sistem tercihine
  // uymak ("auto") açılışı cihaza bırakıyordu ve uygulamanın kendi
  // yüzü iki farklı cihazda iki başka şey oluyordu.
  const darkMode = ref(load('darkMode', 'light'))
  const colorStyle = ref(load('colorStyle', 'mesh'))
  const homeClock = ref(load('homeClock', 'led')) // 'led' | 'normal'
  // Kuran gösterimi: okuma sayfası, hatim ve ileride kıraat kesitleri
  // aynı tercihi okur — ayet nasıl görünsün sorusu bir kez sorulur.
  // 0 = meal kapalı, yalnızca Arapça metin.
  // Meal ARTIK ÇOKLU: birden fazla mütercim yan yana okunabiliyor.
  // Karşılaştırmalı okuma bu sayfanın en çok istenen işi ve tek seçimle
  // her defasında seçiciyi açıp kapatmak gerekiyordu. Sıra AUTHORS
  // sırasıdır (seçim sırası değil), yoksa aynı iki meal farklı sırada
  // seçildiğinde sayfa başka türlü diziliyor.
  // Eski tek değer (`quranMeal`) kayıttan taşınır; 0 = kapalı.
  const quranMeals = ref(normalizeMeals(load('quranMeals', null) ?? [load('quranMeal', 11)]))
  // Meal yazı tipi: Arapça metnin hattı seçilebilirken karşılığının
  // yazısı sabit kalıyordu. Üç küme — sans (taban), serif (Baskervville)
  // ve monospace; ailelerin kendisi `src/data/mealFonts.js`'te.
  const quranMealFont = ref(load('quranMealFont', 'sans'))
  const quranFont = ref(load('quranFont', 'lateef'))
  // Görünüm: 'mushaf' basılı sayfanın satır satır dizimi, 'esnek' akan
  // metin. Mushaf varsayılan — sayfa numarası zaten basılı nüshanın.
  const quranView = ref(load('quranView', 'mushaf'))    // 'mushaf' | 'esnek' | 'ayet'
  // Kıraat ilerledikçe okunan ayeti ekranın ortasında tut. Dinlerken
  // istenen bu; elle okurken sayfanın kendiliğinden kayması rahatsız
  // edici olduğu için yalnızca ses ÇALARKEN uygulanıyor.
  const quranAutoScroll = ref(load('quranAutoScroll', true))
  const quranScript = ref(load('quranScript', 'v2'))    // QPC hattı (bkz. utils/qpc)
  // Esnek görünümde Arapça metnin boyu, yüzde olarak (100 = taban).
  const quranFontSize = ref(load('quranFontSize', 100))
  // Renkli tecvit — YALNIZCA esnek görünümde. Mushaf görünümünde metin
  // glif kodlarından geliyor ve orada tecvit etiketi yok.
  const quranTajweed = ref(load('quranTajweed', false))
  // Son seçilen kârî. Dinleme şeridinde değişir, ayarlarda değil:
  // dinlerken verilen bir karar.
  // Varsayılan kârî Hadi Turé: ağır olmayan bir murattal okuyuş ve
  // damgaları bizde (ayet takibi ilk açılışta çalışıyor).
  const quranReciter = ref(load('quranReciter', 'toure'))

  const all = { primaryClock, secondaryClock, clockStyle, analogDesign, hijriOffset, vakitSource, firstPage, themePerVakit, notificationsEnabled, notifyOffsets, quranMeals, quranMealFont, quranFont, quranView, quranAutoScroll, quranScript, quranFontSize, quranTajweed, quranReciter, darkMode, colorStyle, homeClock }

  // `deep`: ayarların çoğu düz değer ama `notifyOffsets` bir obje —
  // içindeki tek bir vakit değişince de kaydedilmeli.
  for (const [key, r] of Object.entries(all)) {
    watch(r, (val) => localStorage.setItem(`settings_${key}`, JSON.stringify(val)), { deep: true })
  }

  return all
})

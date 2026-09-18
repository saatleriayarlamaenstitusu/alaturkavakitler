import ClockDigitalWidget from './ClockDigitalWidget.vue'
import ClockAnalogWidget from './ClockAnalogWidget.vue'
import VakitNowWidget from './VakitNowWidget.vue'
import DateWidget from './DateWidget.vue'
import TextWidget from './TextWidget.vue'
import LogoWidget from './LogoWidget.vue'
import PhraseWidget from './PhraseWidget.vue'
import { DEFAULT_FONT, getFont, weightOptions } from '@/data/shareFonts'
import { defaultPhrase } from '@/data/phraseSets'

// Paylaşım widget'ları — uygulama bileşenlerinden ayrı, export için yazılmış
// saf/compact bileşenler. Kurallar:
//   • store'a dokunmazlar; tek veri kaynağı kendi `settings` objeleridir
//   • `defaultProps(snapshot)` katman eklenirken bir kez çalışır: değerler
//     o anki tarih/saatten doldurulur, sonrası tamamen kullanıcının
//   • boş bırakılan metin alanı render edilmez (ayrı "göster" anahtarı yok)
//   • ölçüler tuval birimindedir (1080px genişlikte çıktı pikseli)
//   • SVG'de stroke'lu <line>/<path> YOK — büyük ölçekli export'u çökertiyor,
//     dolgulu <rect>/<circle> kullan
//
// Yeni widget eklemek: bileşeni yaz + buraya bir satır ekle.
// Seçici, ayar paneli ve tuval üçü de bu tablodan beslenir.

const COLOR_SWATCHES = ['#ffffff', '#000000', 'auto', '#ffd733', '#ff8c33', '#0491fb']

const colorField = (key, label) => ({ key, type: 'color', label, swatches: COLOR_SWATCHES })
// Yazı içeren her widget aynı üç alanı paylaşır: font, kalınlık, italik.
// Kalınlık listesi ve italik anahtarının varlığı seçili fonta bağlıdır.
const typographyFields = [
  { key: 'font', type: 'font', label: 'Yazı tipi' },
  { key: 'weight', type: 'select', compact: true, label: 'Kalınlık', options: (p) => weightOptions(p.font) },
  { key: 'italic', type: 'toggle', label: 'İtalik', hidden: (p) => !getFont(p.font).italic },
  { key: 'letterSpacing', type: 'range', label: 'Harf aralığı', min: -0.06, max: 0.4, step: 0.01 },
]

// Arap harfleri bitişik yazılır; letter-spacing bağlantıları koparıp metni
// bozar. Bu yüzden Arapça/Osmanlıca widget'larında harf aralığı sunulmaz.
const typographyFieldsNoTracking = typographyFields.filter(f => f.key !== 'letterSpacing')

const typographyDefaults = (weight) => ({ font: DEFAULT_FONT, weight, italic: false, letterSpacing: 0 })

const alignField = {
  key: 'align', type: 'select', label: 'Hizalama',
  options: [{ value: 'left', label: 'Sol' }, { value: 'center', label: 'Orta' }, { value: 'right', label: 'Sağ' }],
}

export const SHARE_WIDGETS = [
  {
    id: 'clock-digital',
    label: 'Alaturka Saat',
    hint: 'Dijital',
    component: ClockDigitalWidget,
    defaultProps: (snap) => ({
      label: 'ALATURKA',
      time: snap.alaturka,
      normal: snap.normal,
      city: snap.cityName,
      color: '#ffffff',
      align: 'center',
      timeSize: 250,
      labelSize: 30,
      footSize: 34,
      numerals: 'latin',
      ...typographyDefaults(700),
    }),
    settings: [
      { key: 'time', type: 'text', label: 'Saat' },
      { key: 'label', type: 'text', label: 'Başlık' },
      { key: 'normal', type: 'text', label: 'Normal saat' },
      { key: 'city', type: 'text', label: 'Şehir' },
      ...typographyFields,
      { key: 'timeSize', type: 'range', label: 'Saat boyutu', min: 80, max: 420, step: 5 },
      { key: 'labelSize', type: 'range', label: 'Başlık boyutu', min: 14, max: 90, step: 2,
        hidden: (p) => !p.label },
      { key: 'footSize', type: 'range', label: 'Alt yazı boyutu', min: 16, max: 100, step: 2,
        hidden: (p) => !p.normal && !p.city },
      { key: 'numerals', type: 'select', label: 'Rakam', options: [
        { value: 'latin', label: '12:34' }, { value: 'arabic', label: '١٢:٣٤' },
      ] },
      colorField('color', 'Renk'),
      alignField,
    ],
  },
  {
    id: 'clock-analog',
    label: 'Analog Saat',
    hint: 'Kadran',
    component: ClockAnalogWidget,
    defaultProps: (snap) => ({
      time: snap.alaturka,
      color: '#ffffff',
      handColor: 'auto',
      showTicks: true,
    }),
    settings: [
      { key: 'time', type: 'text', label: 'Saat (SS:DD)' },
      colorField('color', 'Kadran'),
      colorField('handColor', 'Akrep'),
      { key: 'showTicks', type: 'toggle', label: 'Dakika çizgileri' },
    ],
  },
  {
    id: 'vakit-now',
    label: 'Vakit',
    hint: 'Şu an + sonraki',
    component: VakitNowWidget,
    defaultProps: (snap) => ({
      nowLabel: 'ŞU AN',
      current: snap.current?.name ?? '',
      currentTime: snap.current?.value ?? '',
      nextLabel: 'SONRAKİ',
      next: snap.next?.name ?? '',
      nextTime: snap.next?.value ?? '',
      color: '#ffffff',
      layout: 'stacked',
      ...typographyDefaults(700),
    }),
    settings: [
      { key: 'current', type: 'text', label: 'Vakit' },
      { key: 'currentTime', type: 'text', label: 'Vakit saati' },
      { key: 'next', type: 'text', label: 'Sonraki vakit' },
      { key: 'nextTime', type: 'text', label: 'Sonraki saati' },
      { key: 'nowLabel', type: 'text', label: 'Üst etiket' },
      { key: 'nextLabel', type: 'text', label: 'Alt etiket' },
      ...typographyFields,
      colorField('color', 'Renk'),
      { key: 'layout', type: 'select', label: 'Düzen', options: [
        { value: 'stacked', label: 'Alt alta' }, { value: 'inline', label: 'Yan yana' },
      ] },
    ],
  },
  {
    id: 'date',
    label: 'Tarih',
    hint: 'Hicri + miladi',
    component: DateWidget,
    defaultProps: (snap) => ({
      hijriDay: String(snap.hijri.date).padStart(2, '0'),
      hijriText: `${snap.hijri.monthName} ${snap.hijri.year}`,
      miladi: `${snap.miladi.day} ${snap.miladi.monthLong} ${snap.miladi.year} · ${snap.miladi.weekdayLong}`,
      event: '',
      eventColor: 'auto',
      moonDay: snap.hijri.date,
      showMoon: true,
      color: '#ffffff',
      variant: 'card',
      ...typographyDefaults(700),
    }),
    settings: [
      { key: 'hijriDay', type: 'text', label: 'Hicri gün' },
      { key: 'hijriText', type: 'text', label: 'Hicri ay/yıl' },
      { key: 'miladi', type: 'text', label: 'Miladi tarih' },
      { key: 'event', type: 'text', label: 'Etkinlik' },
      { key: 'eventColor', type: 'color', label: 'Etkinlik rengi', swatches: COLOR_SWATCHES,
        hidden: (p) => !p.event },
      ...typographyFields,
      colorField('color', 'Renk'),
      { key: 'variant', type: 'select', label: 'Görünüm', options: [
        { value: 'card', label: 'Kart' }, { value: 'plain', label: 'Sade' }, { value: 'vertical', label: 'Dikey' },
      ] },
      { key: 'showMoon', type: 'toggle', label: 'Ay fazı' },
      { key: 'moonDay', type: 'range', label: 'Ay günü', min: 1, max: 29, step: 1 },
    ],
  },
  {
    id: 'text',
    label: 'Metin',
    hint: 'Serbest yazı',
    component: TextWidget,
    defaultProps: () => ({
      text: 'Vakit hayırlı olsun',
      color: '#ffffff',
      size: 52,
      align: 'center',
      uppercase: false,
      ...typographyDefaults(600),
    }),
    settings: [
      { key: 'text', type: 'textarea', label: 'Yazı' },
      ...typographyFields,
      { key: 'size', type: 'range', label: 'Boyut', min: 24, max: 160, step: 4 },
      colorField('color', 'Renk'),
      alignField,
      { key: 'uppercase', type: 'toggle', label: 'BÜYÜK HARF' },
    ],
  },
  {
    id: 'arabic',
    label: 'Arapça Metin',
    hint: 'Hazır ibareler',
    component: PhraseWidget,
    defaultProps: () => {
      const p = defaultPhrase('arabic')
      return {
        preset: p.id,
        text: p.ar,
        harakat: true,
        sub: p.tr,
        size: 84,
        color: '#ffffff',
        subColor: '#ffffff',
        align: 'center',
        font: 'amiri',
        weight: 400,
        italic: false,
      }
    },
    settings: [
      { key: 'preset', type: 'phrase', source: 'arabic', label: 'Hazır metin' },
      { key: 'text', type: 'textarea', label: 'Arapça' },
      { key: 'harakat', type: 'toggle', label: 'Hareke' },
      { key: 'sub', type: 'text', label: 'Alt satır' },
      ...typographyFieldsNoTracking,
      { key: 'size', type: 'range', label: 'Boyut', min: 40, max: 220, step: 4 },
      colorField('color', 'Renk'),
      { key: 'subColor', type: 'color', label: 'Alt satır rengi', swatches: COLOR_SWATCHES,
        hidden: (p) => !p.sub },
      alignField,
    ],
  },
  {
    id: 'ottoman',
    label: 'Osmanlıca',
    hint: 'Eski yazı',
    component: PhraseWidget,
    defaultProps: () => {
      const p = defaultPhrase('ottoman')
      return {
        preset: p.id,
        text: p.ar,
        harakat: false,   // Osmanlıca harekesiz yazılır
        sub: p.tr,
        size: 84,
        color: '#ffffff',
        subColor: '#ffffff',
        align: 'center',
        font: 'noto-nastaliq',
        weight: 400,
        italic: false,
      }
    },
    settings: [
      { key: 'preset', type: 'phrase', source: 'ottoman', label: 'Hazır metin' },
      { key: 'text', type: 'textarea', label: 'Eski yazı' },
      { key: 'sub', type: 'text', label: 'Alt satır' },
      ...typographyFieldsNoTracking,
      { key: 'size', type: 'range', label: 'Boyut', min: 40, max: 220, step: 4 },
      colorField('color', 'Renk'),
      { key: 'subColor', type: 'color', label: 'Alt satır rengi', swatches: COLOR_SWATCHES,
        hidden: (p) => !p.sub },
      alignField,
    ],
  },
  {
    id: 'logo',
    label: 'Logo',
    hint: 'Alaturka Vakitler',
    component: LogoWidget,
    defaultProps: () => ({
      variant: 'mark',
      size: 200,
      color: '#ffffff',
    }),
    settings: [
      { key: 'variant', type: 'select', label: 'Biçim', options: [
        { value: 'wide', label: 'Logo' }, { value: 'mark', label: 'Sembol' },
      ] },
      { key: 'size', type: 'range', label: 'Genişlik', min: 90, max: 800, step: 10 },
      colorField('color', 'Renk'),
    ],
  },
]

export function getWidget(id) {
  return SHARE_WIDGETS.find(w => w.id === id) || null
}

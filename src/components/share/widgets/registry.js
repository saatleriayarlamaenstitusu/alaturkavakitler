import ClockDigitalWidget from './ClockDigitalWidget.vue'
import ClockAnalogWidget from './ClockAnalogWidget.vue'
import VakitNowWidget from './VakitNowWidget.vue'
import DateWidget from './DateWidget.vue'
import TextWidget from './TextWidget.vue'
import LogoWidget from './LogoWidget.vue'
import MonthCalendarWidget from './MonthCalendarWidget.vue'
import PhraseWidget from './PhraseWidget.vue'
import { DEFAULT_FONT, getFont, weightOptions, isColorFont } from '@/data/shareFonts'
import { defaultPhrase } from '@/data/phraseSets'
import { currentMonthOf, GREGORIAN_MONTHS, HIJRI_MONTHS } from '@/utils/calendarGrid'
import { presetsFor } from '@/data/widgetPresets'
import { TABLE_RANGE } from '@/utils/hijri'

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

// Ayar grupları. EditorPanel alanları bu sırayla başlıklar altında toplar;
// bir alanda `group` yoksa 'gorunum' kabul edilir.
export const FIELD_GROUPS = [
  { id: 'icerik', label: 'İçerik' },
  { id: 'tipografi', label: 'Tipografi' },
  { id: 'boyut', label: 'Boyut' },
  { id: 'gorunum', label: 'Görünüm' },
]

const colorField = (key, label) => ({ key, type: 'color', label, swatches: COLOR_SWATCHES, group: 'gorunum' })

// Widget'ın kendi yazı tipiyle çizilen metnin rengi. COLRv1 fontlarda
// (örn. Aref Ruqaa Ink) harfler kendi renklerini taşır ve CSS color yok
// sayılır — ayarın çalışmadığı yerde görünmemesi daha dürüst.
const textColorField = (key, label) => ({
  ...colorField(key, label),
  // Takvimde tek bir `font` yok; üç katmanın herhangi biri renkli fontsa bile
  // diğerleri normal renk alır, o yüzden yalnızca `font` alanına bakılır.
  hidden: (p) => isColorFont(p.font),
})
// Yazı içeren her widget aynı üç alanı paylaşır: font, kalınlık, italik.
// Kalınlık listesi ve italik anahtarının varlığı seçili fonta bağlıdır.
const typographyFields = [
  { key: 'font', type: 'font', label: 'Yazı tipi', group: 'tipografi' },
  { key: 'weight', type: 'select', compact: true, label: 'Kalınlık', group: 'tipografi', options: (p) => weightOptions(p.font) },
  { key: 'italic', type: 'toggle', label: 'İtalik', group: 'tipografi', hidden: (p) => !getFont(p.font).italic },
  { key: 'letterSpacing', type: 'range', label: 'Harf aralığı', group: 'tipografi', min: -0.06, max: 0.4, step: 0.01, unit: 'em' },
]

// Arap harfleri bitişik yazılır; letter-spacing bağlantıları koparıp metni
// bozar. Bu yüzden Arapça/Osmanlıca widget'larında harf aralığı sunulmaz.
const typographyFieldsNoTracking = typographyFields.filter(f => f.key !== 'letterSpacing')

const typographyDefaults = (weight) => ({ font: DEFAULT_FONT, weight, italic: false, letterSpacing: 0 })

const alignField = {
  key: 'align', type: 'select', label: 'Hizalama', group: 'gorunum',
  options: [{ value: 'left', label: 'Sol' }, { value: 'center', label: 'Orta' }, { value: 'right', label: 'Sağ' }],
}


// `presets` ayrı bir dosyada tutulur (`src/data/widgetPresets.js`) ve burada
// kimliğe göre bağlanır: ön tanımlar sık düzenlenen, widget tanımı ise seyrek
// değişen bir şey — ikisini ayırmak ön tanım eklemeyi kolaylaştırıyor.
const WIDGETS = [
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
      { key: 'time', type: 'text', label: 'Saat', group: 'icerik', singleLine: true },
      { key: 'label', type: 'text', label: 'Başlık', group: 'icerik' },
      { key: 'normal', type: 'text', label: 'Normal saat', group: 'icerik', singleLine: true },
      { key: 'city', type: 'text', label: 'Şehir', group: 'icerik' },
      ...typographyFields,
      { key: 'timeSize', type: 'range', label: 'Saat boyutu', min: 80, max: 420, step: 5, group: 'boyut' },
      { key: 'labelSize', type: 'range', label: 'Başlık boyutu', min: 14, max: 90, step: 2, group: 'boyut',
        hidden: (p) => !p.label },
      { key: 'footSize', type: 'range', label: 'Alt yazı boyutu', min: 16, max: 100, step: 2, group: 'boyut',
        hidden: (p) => !p.normal && !p.city },
      { key: 'numerals', type: 'select', label: 'Rakam', group: 'tipografi', options: [
        { value: 'latin', label: '12:34' }, { value: 'arabic', label: '١٢:٣٤' },
      ] },
      textColorField('color', 'Renk'),
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
      { key: 'time', type: 'text', label: 'Saat (SS:DD)', group: 'icerik', singleLine: true },
      colorField('color', 'Kadran'),
      colorField('handColor', 'Akrep'),
      { key: 'showTicks', type: 'toggle', label: 'Dakika çizgileri', group: 'gorunum' },
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
      { key: 'current', type: 'text', label: 'Vakit', group: 'icerik' },
      { key: 'currentTime', type: 'text', label: 'Vakit saati', group: 'icerik', singleLine: true },
      { key: 'next', type: 'text', label: 'Sonraki vakit', group: 'icerik' },
      { key: 'nextTime', type: 'text', label: 'Sonraki saati', group: 'icerik', singleLine: true },
      { key: 'nowLabel', type: 'text', label: 'Üst etiket', group: 'icerik' },
      { key: 'nextLabel', type: 'text', label: 'Alt etiket', group: 'icerik' },
      ...typographyFields,
      textColorField('color', 'Renk'),
      { key: 'layout', type: 'select', label: 'Düzen', group: 'gorunum', options: [
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
      // `date` tek kaynak: seçiciden değişince hicri gün/ay/yıl, miladi
      // satır, ay fazı ve dinî gün birlikte güncellenir (EditorPanel'deki
      // `date` dalı). Sonrasında her alan yine elle değiştirilebilir.
      date: snap.miladi.iso,
      hijriDay: String(snap.hijri.date).padStart(2, '0'),
      hijriText: `${snap.hijri.monthName} ${snap.hijri.year}`,
      miladi: `${snap.miladi.day} ${snap.miladi.monthLong} ${snap.miladi.year}`,
      miladiNote: snap.miladi.weekdayLong,
      miladiSep: ' · ',
      // O güne denk gelen dinî gün varsa etkinlik satırı hazır gelir;
      // alan serbest, silinince satır çizilmez.
      event: snap.holyDay ?? '',
      eventColor: 'auto',
      moonDay: snap.hijri.date,
      showMoon: true,
      color: '#ffffff',
      variant: 'card',
      ...typographyDefaults(700),
    }),
    settings: [
      { key: 'date', type: 'date', label: 'Gün / ay / yıl', group: 'icerik',
        min: TABLE_RANGE.start, max: TABLE_RANGE.end },
      { key: 'hijriDay', type: 'text', label: 'Hicri gün', group: 'icerik', singleLine: true },
      { key: 'hijriText', type: 'text', label: 'Hicri ay/yıl', group: 'icerik' },
      { key: 'miladi', type: 'text', label: 'Miladi tarih', group: 'icerik' },
      { key: 'miladiNote', type: 'text', label: 'Tarihten sonrası', group: 'icerik' },
      { key: 'miladiSep', type: 'text', label: 'Ayraç', group: 'icerik',
        singleLine: true, hidden: (p) => !p.miladi || !p.miladiNote },
      { key: 'event', type: 'text', label: 'Etkinlik', group: 'icerik' },
      { key: 'eventColor', type: 'color', label: 'Etkinlik rengi', swatches: COLOR_SWATCHES,
        group: 'gorunum', hidden: (p) => !p.event || isColorFont(p.font) },
      ...typographyFields,
      textColorField('color', 'Renk'),
      { key: 'variant', type: 'select', label: 'Görünüm', group: 'gorunum', options: [
        { value: 'card', label: 'Kart' }, { value: 'plain', label: 'Sade' }, { value: 'vertical', label: 'Dikey' },
      ] },
      { key: 'showMoon', type: 'toggle', label: 'Ay fazı', group: 'gorunum' },
      { key: 'moonDay', type: 'range', label: 'Ay günü', min: 1, max: 29, step: 1, group: 'gorunum' },
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
      { key: 'text', type: 'textarea', label: 'Yazı', group: 'icerik' },
      ...typographyFields,
      { key: 'size', type: 'range', label: 'Boyut', min: 24, max: 160, step: 4, group: 'boyut' },
      textColorField('color', 'Renk'),
      alignField,
      { key: 'uppercase', type: 'toggle', label: 'BÜYÜK HARF', group: 'gorunum' },
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
      { key: 'preset', type: 'phrase', source: 'arabic', label: 'Hazır metin', group: 'icerik' },
      { key: 'text', type: 'textarea', label: 'Arapça', group: 'icerik' },
      { key: 'harakat', type: 'toggle', label: 'Hareke', group: 'icerik' },
      { key: 'sub', type: 'text', label: 'Alt satır', group: 'icerik' },
      ...typographyFieldsNoTracking,
      { key: 'size', type: 'range', label: 'Boyut', min: 40, max: 220, step: 4, group: 'boyut' },
      textColorField('color', 'Renk'),
      { key: 'subColor', type: 'color', label: 'Alt satır rengi', swatches: COLOR_SWATCHES,
        group: 'gorunum', hidden: (p) => !p.sub },
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
      { key: 'preset', type: 'phrase', source: 'ottoman', label: 'Hazır metin', group: 'icerik' },
      { key: 'text', type: 'textarea', label: 'Eski yazı', group: 'icerik' },
      { key: 'sub', type: 'text', label: 'Alt satır', group: 'icerik' },
      ...typographyFieldsNoTracking,
      { key: 'size', type: 'range', label: 'Boyut', min: 40, max: 220, step: 4, group: 'boyut' },
      textColorField('color', 'Renk'),
      { key: 'subColor', type: 'color', label: 'Alt satır rengi', swatches: COLOR_SWATCHES,
        group: 'gorunum', hidden: (p) => !p.sub },
      alignField,
    ],
  },
  {
    id: 'month-calendar',
    label: 'Aylık Takvim',
    hint: 'Hicri / miladi',
    component: MonthCalendarWidget,
    // Ayar sayısı yüksek; alanlar metin katmanına göre kendi gruplarında
    // toplanıyor (genel İçerik/Tipografi/Boyut/Görünüm yerine).
    groups: [
      { id: 'icerik', label: 'Takvim' },
      { id: 'baslik', label: 'Ay başlığı' },
      { id: 'gunadi', label: 'Gün adları' },
      { id: 'sayi', label: 'Gün sayıları' },
      { id: 'gorunum', label: 'Görünüm' },
    ],
    defaultProps: () => {
      const { year, month } = currentMonthOf('miladi')
      return {
        system: 'miladi',
        year,
        month,
        layout: 'grid',
        title: '',
        showAlt: true,
        showWeekdays: true,
        weekdayStyle: 'short',
        highlightToday: true,
        numerals: 'latin',
        width: 760,
        // Üç metin katmanı ayrı ayrı
        titleFont: DEFAULT_FONT, titleWeight: 700, titleSize: 46, titleAlign: 'center',
        weekdayFont: DEFAULT_FONT, weekdayWeight: 600, weekdaySize: 22,
        dayFont: DEFAULT_FONT, dayWeight: 500, daySize: 34,
        rowHeight: 2.5,
        rowGap: 0,
        color: '#ffffff',
        todayColor: 'auto',
        weekendOn: false,
        weekendColor: 'auto',
        dayBg: false,
        dayBgColor: 'tint',
        dayRadius: 50,
        holyDays: false,
        holyList: true,
        holyColor: 'auto',
      }
    },
    settings: [
      // ── Takvim ──
      { key: 'system', type: 'select', label: 'Takvim', group: 'icerik', options: [
        { value: 'miladi', label: 'Miladi' }, { value: 'hicri', label: 'Hicri' },
      ] },
      { key: 'month', type: 'stepper', label: 'Ay', group: 'icerik',
        format: (v, p) => (p.system === 'hicri' ? HIJRI_MONTHS : GREGORIAN_MONTHS)[v - 1] ?? v },
      { key: 'year', type: 'stepper', label: 'Yıl', group: 'icerik' },
      { key: 'layout', type: 'select', label: 'Düzen', group: 'icerik', options: [
        { value: 'grid', label: 'Izgara' }, { value: 'row', label: 'Tek satır' },
      ] },
      { key: 'showAlt', type: 'toggle', label: 'Diğer takvim', group: 'icerik' },
      { key: 'numerals', type: 'select', label: 'Rakam', group: 'icerik', options: [
        { value: 'latin', label: '12' }, { value: 'arabic', label: '١٢' },
      ] },

      // ── Ay başlığı ──
      { key: 'title', type: 'text', label: 'Metin', group: 'baslik' },
      { key: 'titleAlign', type: 'select', label: 'Hizalama', group: 'baslik', options: [
        { value: 'left', label: 'Sol' }, { value: 'center', label: 'Orta' }, { value: 'right', label: 'Sağ' },
      ] },
      { key: 'titleSize', type: 'range', label: 'Boyut', group: 'baslik', min: 0, max: 120, step: 2, unit: 'px' },
      { key: 'titleFont', type: 'font', label: 'Yazı tipi', group: 'baslik' },
      { key: 'titleWeight', type: 'select', compact: true, label: 'Kalınlık', group: 'baslik',
        options: (p) => weightOptions(p.titleFont) },

      // ── Gün adları ──
      { key: 'showWeekdays', type: 'toggle', label: 'Göster', group: 'gunadi' },
      { key: 'weekdayStyle', type: 'select', label: 'Biçim', group: 'gunadi',
        hidden: (p) => !p.showWeekdays, options: [
          { value: 'short', label: 'Pzt' }, { value: 'narrow', label: 'P' },
        ] },
      { key: 'weekdaySize', type: 'range', label: 'Boyut', group: 'gunadi', min: 6, max: 60, step: 1, unit: 'px',
        hidden: (p) => !p.showWeekdays },
      { key: 'weekdayFont', type: 'font', label: 'Yazı tipi', group: 'gunadi',
        hidden: (p) => !p.showWeekdays },
      { key: 'weekdayWeight', type: 'select', compact: true, label: 'Kalınlık', group: 'gunadi',
        hidden: (p) => !p.showWeekdays, options: (p) => weightOptions(p.weekdayFont) },

      // ── Gün sayıları ──
      { key: 'daySize', type: 'range', label: 'Boyut', group: 'sayi', min: 8, max: 90, step: 1, unit: 'px' },
      { key: 'rowHeight', type: 'range', label: 'Hücre yüksekliği', group: 'sayi', min: 1.2, max: 3.2, step: 0.1, unit: '×' },
      { key: 'rowGap', type: 'range', label: 'Hafta aralığı', group: 'sayi', min: 0, max: 60, step: 2, unit: 'px',
        hidden: (p) => p.layout === 'row' },
      { key: 'dayFont', type: 'font', label: 'Yazı tipi', group: 'sayi' },
      { key: 'dayWeight', type: 'select', compact: true, label: 'Kalınlık', group: 'sayi',
        options: (p) => weightOptions(p.dayFont) },

      // ── Görünüm ──
      { key: 'width', type: 'range', label: 'Genişlik', group: 'gorunum', min: 380, max: 1040, step: 20, unit: 'px' },
      textColorField('color', 'Renk'),
      { key: 'holyDays', type: 'toggle', label: 'Dinî günler', group: 'gorunum' },
      { key: 'holyList', type: 'toggle', label: 'Takvimin altında listele', group: 'gorunum',
        hidden: (p) => !p.holyDays },
      { key: 'holyColor', type: 'color', label: 'Dinî gün rengi', swatches: COLOR_SWATCHES,
        group: 'gorunum', hidden: (p) => !p.holyDays },
      { key: 'dayBg', type: 'toggle', label: 'Gün zemini', group: 'gorunum' },
      { key: 'dayRadius', type: 'range', label: 'Köşe yuvarlaklığı', group: 'gorunum', min: 0, max: 50, step: 2, unit: 'pct',
        hidden: (p) => !p.dayBg },
      { key: 'dayBgColor', type: 'color', label: 'Zemin rengi', group: 'gorunum',
        swatches: ['tint', ...COLOR_SWATCHES], hidden: (p) => !p.dayBg },
      { key: 'highlightToday', type: 'toggle', label: 'Bugünü vurgula', group: 'gorunum' },
      { key: 'todayColor', type: 'color', label: 'Bugün rengi', swatches: COLOR_SWATCHES, group: 'gorunum',
        hidden: (p) => !p.highlightToday },
      { key: 'weekendOn', type: 'toggle', label: 'Hafta sonu', group: 'gorunum' },
      { key: 'weekendColor', type: 'color', label: 'Hafta sonu rengi', swatches: COLOR_SWATCHES, group: 'gorunum',
        hidden: (p) => !p.weekendOn },
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
      { key: 'variant', type: 'select', label: 'Biçim', group: 'gorunum', options: [
        { value: 'wide', label: 'Logo' }, { value: 'mark', label: 'Sembol' },
      ] },
      { key: 'size', type: 'range', label: 'Genişlik', min: 90, max: 800, step: 10, group: 'boyut' },
      colorField('color', 'Renk'),
    ],
  },
]

export const SHARE_WIDGETS = WIDGETS.map(w => ({ ...w, presets: presetsFor(w.id) }))

export function getWidget(id) {
  return SHARE_WIDGETS.find(w => w.id === id) || null
}

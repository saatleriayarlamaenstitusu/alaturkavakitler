/**
 * Gizlilik politikaları — site ve eklenti AYRI.
 *
 * Ayrı olmalarının sebebi hukuki değil, olgusal: iki ürünün veri
 * resmi birbirinden farklı. Site bir PWA (kıble için konum izni,
 * ayet metni için kendi vekilimiz, Google Fonts); eklenti ise
 * tarayıcının içinde çalışıyor ve bambaşka izinler istiyor (sık
 * ziyaret edilen siteler, işlemci/bellek ölçümü, bildirim). Tek bir
 * belge yazılsaydı ya eklentinin izinleri sitenin okuruna anlamsız
 * gelirdi ya da mağaza incelemesi "burada anlatılan ürün bu değil"
 * derdi — Chrome Web Store, EKLENTİYİ anlatan bir belge istiyor.
 *
 * İkisi birbirine bağlantı veriyor, böylece hangisini arayan olursa
 * olsun öbürünü de buluyor.
 *
 * Metin burada, biçim `pages/PrivacyPage.vue`te: ikisi bir arada
 * dursaydı bir cümle düzeltmek için şablonu kurcalamak gerekirdi.
 */

/** Son esaslı güncelleme — metin değiştikçe elle güncellenir. */
export const PRIVACY_UPDATED = '24 Kasım 2026'

const CONTACT = {
  h: 'İletişim',
  p: [
    'Gizlilikle ilgili her soru için: info@alaturkavakitler.com',
    'Kaynak kodun tamamı açık: github.com/saatleriayarlamaenstitusu',
  ],
}

const CHANGES = {
  h: 'Değişiklikler',
  p: [
    'Bu metin değişirse yukarıdaki tarih güncellenir. Veri işleme biçimini esaslı olarak değiştiren bir değişiklik olursa uygulamanın "Yenilikler" sayfasında da duyurulur.',
  ],
}

export const PRIVACY = {
  site: {
    id: 'site',
    path: '/gizlilik',
    title: 'Gizlilik Politikası',
    lead: 'Alaturka Vakitler web uygulaması (alaturkavakitler.com)',
    other: { label: 'Yeni Sekme eklentisinin politikası', path: '/gizlilik/yeni-sekme' },
    intro: [
      'Hesap, giriş ve reklam yok. Ayarların, şehrin, kaza sayaçların, hatimlerin ve görsel düzenin tarayıcıda durur. Arka plan bildirimlerini açarsan, bildirim aboneliği ve hatırlatma ayarları ayrıca sunucuda tutulur.',
      'Uzun hâli aşağıda: hangi isteğin nereye gittiği, ne içerdiği ve neyin cihazdan hiç çıkmadığı.',
    ],
    sections: [
      {
        h: 'Cihazında kalanlar',
        p: ['Şunlar yalnızca tarayıcında saklanır ve hiçbir sunucuya gönderilmez:'],
        list: [
          'Ayarlar: saat tercihi, tema ve renk stili, meal seçimi ve yazı tipi.',
          'İndirilen namaz vakti tablosu. Şehir ve hatırlatma sürelerinin bildirim için nasıl kullanıldığı aşağıda açıklanıyor.',
          'Kaza sayaçların, hatim kayıtların ve okuduğun sayfalar.',
          'Görsel oluşturucudaki düzenin ve yüklediğin fotoğraflar.',
          'Yedek dosyası: tarayıcıda üretilir, indirdiğin yere iner, hiçbir yere gönderilmez.',
        ],
        p2: ['Tarayıcı verisini temizlemek bunların hepsini siler ve geri getirecek bir sunucu yoktur. Ayarlar sayfasındaki "Yedek" bölümü tam da bunun içindir.'],
      },
      {
        h: 'Ağa çıkan istekler',
        p: ['Uygulama çalışırken şu adreslere istek gider. Hiçbirine kişisel bilgi eklenmez:'],
        list: [
          'raw.githubusercontent.com — namaz vakti tabloları. İstek yalnızca il plaka numarasını içerir.',
          'alaturkavakitler.com/api/kuran — ayet metni ve meal. İstek sure, ayet ve mütercim numarasından ibarettir; bu vekil Açık Kuran API\'sine gider ve sonucu önbelleğe alır.',
          'cdn.alaturkavakitler.com — mushaf sayfa yazı tipleri, kıraat kayıtlarının yedek kopyası, hazır arka plan görselleri.',
          'download.quranicaudio.com — kıraat kayıtlarının asıl kaynağı (dinleme açıldığında).',
          'api.quran.com — yalnızca tecvitli metin ve mushaf dizimi için yedek yol.',
          'fonts.googleapis.com / fonts.gstatic.com — arayüz ve paylaşım görseli yazı tipleri. Google bu isteklerde IP adresini ve tarayıcı bilgisini görür.',
        ],
        p2: ['Site Cloudflare Pages üzerinde yayınlanıyor; her web sunucusu gibi Cloudflare de erişim kaydı tutar (IP adresi, tarayıcı bilgisi, istenen adres). Bu kayıtlara biz kişi bazında bakmıyoruz.'],
      },
      {
        h: 'Konum ve pusula',
        p: [
          'Kıble sayfası isteğe bağlı olarak konum izni ister. İzin verilirse konum YALNIZCA tarayıcıda, kıble açısını hesaplamak için kullanılır; hiçbir yere gönderilmez ve saklanmaz. İzin vermezsen seçtiğin ilin merkez koordinatı kullanılır.',
          'Cihaz pusulası (yön sensörü) da aynı şekilde yalnızca sayfanın içinde okunur.',
        ],
      },
      {
        h: 'Bildirimler',
        p: [
          'Arka plan bildirimini açarsan Cloudflare’de tarayıcının oluşturduğu bildirim adresi ve şifreleme anahtarları, rastgele cihaz kimliği, seçili il ve vakit başına hatırlatma süresi saklanır. Bu bilgiler hatırlatmayı zamanlamak ve tarayıcının bildirim hizmetine göndermek için kullanılır. Konum koordinatların gönderilmez.',
          'Ayarlar’dan kapattığında tarayıcı aboneliği iptal edilir ve sunucu kaydı bağlantı kurulduğunda silinir. Geçersiz abonelikler gönderim sırasında, bir yıl boyunca yenilenmeyen kayıtlar ise otomatik olarak kaldırılır.',
        ],
      },
      {
        h: 'Ölçümleme',
        p: [
          'Sitede reklam ve reklam izleyicisi yoktur. Ziyaret sayısını görmek için Google Analytics 4 kullanılabilir; açık olduğu dönemde Google çerez yerleştirir ve IP adresi, tarayıcı bilgisi, gezilen sayfalar gibi standart ölçüm verilerini işler. Ölçüm, kişisel bilgiye bağlanmaz ve profil çıkarmak için kullanılmaz.',
        ],
      },
      {
        h: 'Çocuklar',
        p: ['Uygulama çocuklara yönelik değildir ve yaş bilgisi dahil hiçbir kişisel veri toplamaz.'],
      },
      CHANGES,
      CONTACT,
    ],
  },

  eklenti: {
    id: 'eklenti',
    path: '/gizlilik/yeni-sekme',
    title: 'Gizlilik Politikası — Yeni Sekme',
    lead: 'Alaturka Vakitler Yeni Sekme (Chrome eklentisi)',
    other: { label: 'Web sitesinin politikası', path: '/gizlilik' },
    intro: [
      'Bu belge Chrome eklentisi içindir; web sitesinin politikası ayrıdır (aşağıda bağlantısı var).',
      'Kısa hâli: eklenti hiçbir kullanıcı verisi toplamaz, saklamaz ve göndermez. Hesap yok, giriş yok, ölçümleme yok, reklam yok.',
    ],
    sections: [
      {
        h: 'Toplanan veri',
        p: [
          'Hiçbiri. Eklentinin bir sunucusu yoktur. Ayarların tarayıcının kendi deposunda (chrome.storage.local) durur ve yalnızca senin cihazında kalır.',
        ],
      },
      {
        h: 'İzinler ve kullanım sebepleri',
        p: ['Eklentinin istediği her izin ve ne için istendiği:'],
        rows: [
          ['storage', 'Ayarları (şehir, widget yerleşimi, arka plan, not, kısayollar) ve namaz vakti tablosunu cihazda saklamak için.'],
          ['topSites', 'Kısayol ızgarasında en sık ziyaret ettiğin siteleri göstermek için. Liste yalnızca yeni sekme sayfasında görüntülenir; saklanmaz ve gönderilmez.'],
          ['system.cpu', '"Sistem" widget\'ında işlemci kullanımını göstermek için. Widget kapalıysa ölçüm hiç yapılmaz.'],
          ['system.memory', 'Aynı widget\'ta bellek kullanımını göstermek için.'],
          ['alarms', 'Namaz vakti hatırlatmalarını zamanlamak için.'],
          ['notifications', 'Senin açtığın vakit hatırlatmalarını göstermek için. Varsayılan olarak kapalıdır.'],
          ['raw.githubusercontent.com', 'Diyanet namaz vakti tablolarının tutulduğu açık veri deposu. İstek yalnızca il plaka numarasını içerir.'],
          ['api.open-meteo.com', 'Seçtiğin ŞEHRİN hava durumu. İstek yalnızca şehir merkezinin enlem ve boylamını içerir; cihaz konumu istenmez, konum izni sorulmaz.'],
        ],
      },
      {
        h: 'Arka plan görselleri ve kendi fotoğrafın',
        p: [
          'Hazır arka planlar eklentinin içinde tanımlı adreslerden (cdn.alaturkavakitler.com) indirilir.',
          'Kendi fotoğrafını yüklersen dosya HİÇBİR YERE GÖNDERİLMEZ: tarayıcıda küçültülüp yine tarayıcının kendi deposuna yazılır.',
        ],
      },
      {
        h: 'Yedek dosyası',
        p: [
          'Ayarlarını tek dosyaya yedekleyebilirsin. Dosya tarayıcıda üretilir ve indirdiğin yere iner; hiçbir sunucuya gönderilmez.',
        ],
      },
      {
        h: 'Veri satışı ve aktarımı',
        p: [
          'Eklenti hiçbir veriyi satmaz, üçüncü taraflara aktarmaz, kredi değerlendirmesi veya borç tahsilatı gibi amaçlarla kullanmaz ve beyan edilen tek amacı dışında kullanmaz.',
          'Eklentinin içinde uzaktan çalıştırılan kod yoktur; bütün kod pakete dahildir.',
        ],
      },
      {
        h: 'Dışarı açılan bağlantılar',
        p: [
          'Kısayollara, günün ayetindeki bağlantılara ya da arama kutusuna tıkladığında ilgili siteye SEN gitmiş olursun; o sitenin kendi gizlilik politikası geçerlidir. Eklenti bu tıklamaları kaydetmez.',
        ],
      },
      CHANGES,
      CONTACT,
    ],
  },
}

export const privacyById = (id) => PRIVACY[id] ?? PRIVACY.site

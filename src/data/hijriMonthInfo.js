/**
 * Hicri aylar künyesi, etimolojisi, İslami önemi ve TDV İslam Ansiklopedisi bağlantıları.
 *
 * Kaynak: TDV İslâm Ansiklopedisi maddeleri ve hadis-i şerifler.
 * Uydurma metin yerine doğrulanmış lügat kökenleri ve İslam tarihindeki
 * yerleri özetlenmiştir.
 */

export const HIJRI_MONTH_INFO = [
  {
    id: 1,
    name: 'Muharrem',
    arabic: 'المُحَرَّم',
    order: 1,
    isHaram: true,
    meaning: 'Haram kılınmış, hürmete layık ve saygıdeğer.',
    etymology: 'Cahiliye döneminde de kan dökülmesinin, baskın ve savaşın yasaklandığı dört haram aydan (eşhür-i hurum) biri olduğu için bu adı almıştır.',
    summary: 'Hicri yılın başlangıcı ve Allah’ın ayı (Şehrullah) olarak anılan kutsal aydır.',
    islamicSignificance: 'Hicri takvimin ilk ayıdır; Hz. Ömer devrinde hicretin başlangıç yılı kabul edilmesiyle takvim başı tayin edilmiştir. Peygamberimiz (s.a.v.) bu ayı "Şehrullah" (Allah’ın ayı) olarak nitelemiş ve Ramazan’dan sonra tutulan en faziletli orucun Muharrem orucu olduğunu bildirmiştir.',
    keyEvents: [
      '1 Muharrem — Hicri Yılbaşı',
      '10 Muharrem — Âşûrâ Günü (Hz. Musa ve birçok peygamberin necat bulması; Hz. Hüseyin ve Kerbela şehitleri)',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/muharrem--ay',
  },
  {
    id: 2,
    name: 'Safer',
    arabic: 'صَفَر',
    order: 2,
    isHaram: false,
    meaning: 'Boş kalmak (sıfr/boşluk) veya sararmak (sufr/sarılık).',
    etymology: 'Muharrem’deki savaş yasağının kalkmasıyla kabilelerin sefer ve gazveye çıkıp evlerin bomboş kalması sebebiyle yahut sonbaharda yaprakların sararıp solduğu döneme rastlamasından ötürü bu isim verilmiştir.',
    summary: 'Cahiliye hurafelerinin aksine hiçbir uğursuzluğu olmayan, ibadet ve hayırla geçirilen kameri aydır.',
    islamicSignificance: 'Cahiliye devrinde bu ayda uğursuzluk ve bela olduğuna inanılırdı. Resûl-i Ekrem (s.a.v.) "İslam’da uğursuzluk yoktur; Safer ayında da bir uğursuzluk bulunmaz" buyurarak bu batıl inancı kökünden reddetmiştir. Diğer aylar gibi bereket ve hayırla ihya edilir.',
    keyEvents: [
      'Hz. Ali ile Hz. Fatıma validemizin izdivacı',
      'Hayber fethinin tamamlanması',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/safer',
  },
  {
    id: 3,
    name: 'Rebiülevvel',
    arabic: 'رَبِيع الأوَّل',
    order: 3,
    isHaram: false,
    meaning: 'İlk bahar, yeşillik ve bolluk mevsimi.',
    etymology: 'Arapçada "rebî" ilkbahar ve yağmur mevsimini ifade eder. Kameri ayların adlandırıldığı dönemde tabiatın yeşerdiği ve havanın ılımanlaştığı ilkbahara rastladığı için bu adı almıştır.',
    summary: 'Âlemlere rahmet Peygamber Efendimiz’in (s.a.v.) dünyayı teşrif ettiği kutlu aydır.',
    islamicSignificance: 'Peygamber Efendimiz Hz. Muhammed (s.a.v.) bu ayın 12. gecesinde doğmuştur (Mevlid Kandili). Ayrıca Resûl-i Ekrem Medine’ye hicretini bu ayda tamamlamış, ilk mescid olan Kuba Mescidi’ni inşa etmiş ve ilk Cuma namazını kıldırmıştır. Aynı zamanda 63 yıllık kutlu ömrünü bu ayda tamamlayıp Refîk-i A‘lâ’ya irtihal etmiştir.',
    keyEvents: [
      '12 Rebiülevvel — Mevlid Kandili (Peygamber Efendimiz’in doğumu)',
      'Medine’ye hicret ve Kuba Mescidi’nin inşası',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/rebiulevvel',
  },
  {
    id: 4,
    name: 'Rebiülahir',
    arabic: 'رَبِيع الآخِر',
    order: 4,
    isHaram: false,
    meaning: 'Sonraki / ikinci bahar (Rebîüssânî).',
    etymology: 'Rebiülevvel ile başlayan ılıman bahar mevsiminin ikinci ve son bölümüne denk geldiği için "ikinci bahar" manasında Rebîülâhir veya Rebîüssânî denilmiştir.',
    summary: 'İlkbaharın devamı olan, manevi tefekkür ve sünnete bağlılığın pekiştirildiği aydır.',
    islamicSignificance: 'İslam tarihinde manevi tefekkürün sürdürüldüğü, Resûlullah’ın sünnet-i seniyyesine bağlılığın canlı tutulduğu aylardandır. Tarihte Zatü’r-Rika gibi erken dönem gazveleri ve İslam büyüklerinin hatıralarıyla anılır.',
    keyEvents: [
      'Tefekkür ve sünnete ittiba iklimi',
      'İslam tasavvufunun önderlerinden Abdülkadir-i Geylânî hazretlerinin vefatı (11 Rebiülahir)',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/rebiulahir',
  },
  {
    id: 5,
    name: 'Cemaziyelevvel',
    arabic: 'جُمَادَى الأُولَى',
    order: 5,
    isHaram: false,
    meaning: 'İlk donma, soğuk ve katılık zamanı (Cümâdelûlâ).',
    etymology: 'Arapçada "cumûd", suyun donması veya toprağın soğuk ve kuraklıktan katılaşması anlamına gelir. İsimlendirildiği dönemde kış mevsiminin suları donduran soğuklarına rastladığı için bu adı almıştır.',
    summary: 'Kış mevsiminin başlangıcını temsil eden, tarihte mühim gazvelere şahitlik etmiş kameri aydır.',
    islamicSignificance: 'İslam tarihinin en büyük askeri ve kahramanlık destanlarından Mûte Savaşı bu ayda cereyan etmiştir. Ayrıca Peygamber Efendimiz’in Hz. Hatice validemizle evliliği ve Hz. Fatıma’nın kızı Hz. Zeynep’in doğumu bu ayda nakledilir.',
    keyEvents: [
      'Mûte Savaşı ve İslam şehitleri',
      'Hz. Ali ile Hz. Fatıma’nın kızı Hz. Zeynep’in doğumu',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/cemaziyelevvel',
  },
  {
    id: 6,
    name: 'Cemaziyelahir',
    arabic: 'جُمَادَى الآخِرَة',
    order: 6,
    isHaram: false,
    meaning: 'İkinci / sonraki donma ayı (Cümâdelâhire).',
    etymology: 'Kış soğuklarının ve don mevsiminin ikinci ayını temsil eder; Cemaziyelevvel’in peşi sıra gelir.',
    summary: 'Kış mevsiminin sonunu ve İslam tarihinin dönüm noktası gelişmelerini barındıran aydır.',
    islamicSignificance: 'İslam tarihinin büyük zaferlerinden Yermük Zaferi bu ayda kazanılmıştır. Peygamberimiz’in ilk halifesi ve en sadık dostu Hz. Ebû Bekir (r.a.) bu ayda vefat etmiş (22 Cemaziyelahir) ve Hz. Ömer (r.a.) hilafet vazifesini devralmıştır.',
    keyEvents: [
      'Hz. Ebû Bekir’in (r.a.) vefatı ve Hz. Ömer’in hilafete gelişi',
      'Yermük Zaferi',
      'Hz. Fatıma validemizin doğumu (rivayet)',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/cemaziyelahir',
  },
  {
    id: 7,
    name: 'Recep',
    arabic: 'رَجَب',
    order: 7,
    isHaram: true,
    meaning: 'Tazim etmek, saygı duymak, çekinmek (tercîb).',
    etymology: 'Araplar cahiliye döneminde de bu ayda savaştan çekilip silahlarını bırakır, saygı ve hürmet gösterirlerdi. Dört haram aydan (eşhür-i hurum) tek başına duran ferd aydır.',
    summary: 'Mübarek Üç Aylar’ın kapısı, Regaib ve Miraç gecelerini bağrında taşıyan hürmetli aydır.',
    islamicSignificance: 'Üç ayların ilkidir. Manevi arınma mevsiminin başlangıcı kabul edilir. Resûlullah (s.a.v.) bu ay girdiğinde "Allahım! Recep ve Şaban’ı bize mübarek kıl ve bizi Ramazan’a ulaştır" duasıyla bu mevsimi karşılamıştır.',
    keyEvents: [
      'İlk Cuma gecesi — Regaib Kandili',
      '27. gece — Miraç Kandili (Hz. Peygamber’in semaya yükselişi ve 5 vakit namaz hediyesi)',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/receb',
  },
  {
    id: 8,
    name: 'Şaban',
    arabic: 'شَعْبَان',
    order: 8,
    isHaram: false,
    meaning: 'Kollara ayrılmak, dağılmak, yayılmak (şa‘b).',
    etymology: 'Recep ayında savaş yasağı sebebiyle evlerinde oturan Arap kabilelerinin, su aramak ve seferlere çıkmak üzere vadilere dağılması sebebiyle bu isim verilmiştir.',
    summary: 'Ramazan-ı Şerif’in müjdecisi, amellerin Allah’a arz edildiği ve Berat gecesini taşıyan aydır.',
    islamicSignificance: 'Peygamber Efendimiz’in yıl içinde Ramazan’dan sonra en çok nafile oruç tuttuğu aydır. "İnsanların recep ile ramazan arasında gaflet ettikleri aydır; ameller bu ayda âlemlerin Rabbine yükseltilir" buyurmuştur. Ayrıca kıblenin Mescid-i Aksa’dan Kâbe’ye çevrilmesi bu ayda gerçekleşmiştir.',
    keyEvents: [
      '15. gece — Berat Kandili (günahlardan arınma ve mağfiret gecesi)',
      'Kıblenin Kâbe-i Muazzama’ya çevrilmesi',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/saban',
  },
  {
    id: 9,
    name: 'Ramazan',
    arabic: 'رَمَضَان',
    order: 9,
    isHaram: false,
    meaning: 'Güneş sıcağından taşların kızışıp kavrulması (ramadâ’).',
    etymology: 'İsimlendirildiği dönemde kavurucu yaz sıcağına rastlamasından veya tutulan orucun günahları yakıp yok etmesi münasebetiyle bu adı almıştır.',
    summary: 'On bir ayın sultanı; Kur’an’ın indirildiği, orucun farz kılındığı ve Kadir Gecesi’ni barındıran aydır.',
    islamicSignificance: 'İslam’ın en faziletli ve mukaddes ayıdır. Kur’an-ı Kerim bu ayda indirilmeye başlanmıştır (Bakara 2/185). İslam’ın beş şartından biri olan Ramazan orucu bu ayda farz kılınmıştır. Bin aydan hayırlı Kadir Gecesi bu aydadır. Teravih namazı, mukabele, fıtır sadakası ve itikaf ile ihya edilir.',
    keyEvents: [
      'Kur’an-ı Kerim’in nüzulü',
      'Farz olan Ramazan Orucu',
      'Kadir Gecesi (bin aydan daha hayırlı gece)',
      'Bedir Zaferi ve Mekke’nin Fethi',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/ramazan',
  },
  {
    id: 10,
    name: 'Şevval',
    arabic: 'شَوَّال',
    order: 10,
    isHaram: false,
    meaning: 'Yukarı kalkmak, yükselmek, ayrılmak (şevl).',
    etymology: 'Dişi develerin kuyruklarını yukarı kaldırmaları veya sütlerinin çekilmesi vaktine denk gelmesinden dolayı bu ismi almıştır.',
    summary: 'Ramazan Bayramı ile başlayan ve altı gün nafile orucuyla bütün yılı ihya sevabı kazandıran aydır.',
    islamicSignificance: 'İlk günü Ramazan Bayramı’dır (Îdü’l-Fıtr). Ramazan sonrasında bu ayda tutulan 6 gün orucu çok faziletlidir; hadiste "Ramazan’ı tutup ardından Şevval’den altı gün oruç ekleyen, bütün yılı oruçlu geçirmiş gibi olur" buyrulmuştur. Aynı zamanda Hac aylarının (eşhürü’l-hac) ilkidir.',
    keyEvents: [
      '1–3 Şevval — Ramazan Bayramı',
      'Şevval’in 6 gün sünnet orucu',
      'Hac mevsiminin (eşhürü’l-hac) başlangıcı',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/sevval',
  },
  {
    id: 11,
    name: 'Zilkade',
    arabic: 'ذُو القَعْدَة',
    order: 11,
    isHaram: true,
    meaning: 'Oturma sahibi, barış mevsimi (ka‘de/kuûd).',
    etymology: 'Cahiliye döneminden itibaren Araplar bu ayda savaştan ve yağmadan çekilip evlerinde oturur, sulh içinde hac hazırlığı yaparlardı. Dört haram aydan biridir.',
    summary: 'Hac aylarından olan, savaşın yasaklandığı ve barış ile ibadete ayrılmış hürmetli aydır.',
    islamicSignificance: 'Haram ayların peş peşe gelen üçlüsünün ilkidir (Zilkade, Zilhicce, Muharrem). İslam tarihinde barışın ve sabrın sembolü olan Hudeybiye Antlaşması (Hicretin 6. yılı) ve ertesi yıl yapılan Umretü’l-Kaza bu ayda gerçekleşmiştir.',
    keyEvents: [
      'Hudeybiye Barış Antlaşması',
      'Umretü’l-Kaza (Kaza Umresi)',
      'Hac yolculuklarının başlaması',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/zilkade',
  },
  {
    id: 12,
    name: 'Zilhicce',
    arabic: 'ذُو الحِجَّة',
    order: 12,
    isHaram: true,
    meaning: 'Hac sahibi, hac mevsimi.',
    etymology: 'Kâbe-i Muazzama’nın ziyaret edilip hac ibadetinin eda edildiği ay olduğu için bu adla anılmıştır. Yılın son ve haram aylarındandır.',
    summary: 'Hac farizasının eda edildiği, ilk on günü Kur’an’da övülen ve Kurban Bayramı’nı barındıran mübarek aydır.',
    islamicSignificance: 'Hicri senenin hitamıdır. Fecr sûresinde yemin edilen ilk on gecesi senenin en faziletli günleridir. 9 Zilhicce Arefe günü hacılar Arafat vakfesindedir. 10–13 Zilhicce Kurban Bayramı olup kurban ibadeti yerine getirilir ve teşrik tekbirleri alınır. Peygamberimiz Veda Hutbesi’ni bu ayda irad etmiştir.',
    keyEvents: [
      'Zilhicce’nin ilk 10 mübarek günü',
      '9 Zilhicce — Arefe Günü (Arafat Vakfesi)',
      '10–13 Zilhicce — Kurban Bayramı ve Teşrik Tekbirleri',
      'Veda Haccı ve Veda Hutbesi',
    ],
    tdv: 'https://islamansiklopedisi.org.tr/zilhicce',
  },
]

/**
 * Ay numarası (1–12) veya ay adına göre künye döndürür.
 * @param {number|string} monthOrName
 * @returns {typeof HIJRI_MONTH_INFO[number]|null}
 */
export function hijriMonthInfoOf(monthOrName) {
  if (!monthOrName) return null
  if (typeof monthOrName === 'number') {
    return HIJRI_MONTH_INFO.find((m) => m.id === monthOrName) ?? null
  }
  const str = String(monthOrName).trim().toLowerCase()
  return (
    HIJRI_MONTH_INFO.find(
      (m) =>
        m.name.toLowerCase() === str ||
        m.name.toLowerCase().replace(/ü/g, 'u').replace(/i/g, 'ı') === str ||
        String(m.id) === str
    ) ?? null
  )
}

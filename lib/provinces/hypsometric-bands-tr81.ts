import {
  TR_PLATE_NUMBERS,
  type ProvinceElevationBandAnchor,
  type ProvinceHypsometricProfile,
  type TrProvinceCode
} from "./types";

export interface ResolvedProvinceElevationBandSpec {
  id: "low" | "center" | "foothill" | "summit";
  labelTr: string;
  elevationM: number;
  orographicBoost: number;
  isReferenceBand: boolean;
}

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

function band(
  id: ProvinceElevationBandAnchor["id"],
  labelTr: string,
  elevationM: number,
  baseOroWeight: number
): ProvinceElevationBandAnchor {
  return { id, labelTr, elevationM, baseOroWeight };
}

function prof(
  provinceCode: TrProvinceCode,
  provinceName: string,
  maxPhysicalPeakM: number,
  low: [string, number, number],
  center: [string, number, number],
  foothill: [string, number, number],
  summit: [string, number, number]
): ProvinceHypsometricProfile {
  return {
    provinceCode,
    provinceName,
    maxPhysicalPeakM,
    bands: [
      band("low", low[0], low[1], low[2]),
      band("center", center[0], center[1], center[2]),
      band("foothill", foothill[0], foothill[1], foothill[2]),
      band("summit", summit[0], summit[1], summit[2])
    ]
  };
}

/**
 * Türkiye 81 İl 4-İrtifa Hipsometrik Kesit Tablosu (`TR-01` .. `TR-81`).
 * Her ilin gerçek vadi/kıyı tabanı (`low`), il merkezi (`center`), yamaç/yayla (`foothill`)
 * ve kayak/zirve kuşağı (`summit`) gerçek fiziki tavan (`maxPhysicalPeakM`) altında tanımlanmıştır.
 */
export const TR81_HYPSOMETRIC_PROFILES: Readonly<
  Record<TrProvinceCode, ProvinceHypsometricProfile>
> = Object.freeze({
  "TR-01": prof(
    "TR-01",
    "Adana",
    3723,
    ["Karataş / Yumurtalık Kıyı", 5, 0.91],
    ["Adana Merkez (Çukurova)", 25, 1.0],
    ["Pozantı / Akçatekir Yamaç", 850, 1.24],
    ["Aladağlar / Tekir Zirve Kuşağı", 2200, 1.56]
  ),
  "TR-02": prof(
    "TR-02",
    "Adıyaman",
    2551,
    ["Atatürk Barajı Havzası", 410, 0.9],
    ["Adıyaman Merkez", 670, 1.0],
    ["Çelikhan / Sincik Yamaç", 1250, 1.2],
    ["Nemrut Dağı Zirve", 2150, 1.48]
  ),
  "TR-03": prof(
    "TR-03",
    "Afyonkarahisar",
    2449,
    ["Bolvadin – Eber Havzası", 960, 0.94],
    ["Afyonkarahisar Merkez", 1020, 1.0],
    ["Sandıklı – Kumalar Yamaç", 1450, 1.18],
    ["Sultandağları / Akdağ Zirve", 2100, 1.44]
  ),
  "TR-04": prof(
    "TR-04",
    "Ağrı",
    5137,
    ["Patnos – Murat Vadisi", 1520, 0.94],
    ["Ağrı Merkez", 1640, 1.0],
    ["Diyadin – Bubi Dağı Yamaç", 2250, 1.22],
    ["Ağrı Dağı Yüksek Kuşak", 3200, 1.58]
  ),
  "TR-05": prof(
    "TR-05",
    "Amasya",
    2062,
    ["Taşova – Yeşilırmak Boğazı", 240, 0.92],
    ["Amasya Merkez (Harşena Vadisi)", 412, 1.0],
    ["Merzifon – Boraboy Yamaç", 950, 1.18],
    ["Akdağ / Tavşan Dağı Zirve", 1850, 1.46]
  ),
  "TR-06": prof(
    "TR-06",
    "Ankara",
    2034,
    ["Polatlı – Sakarya Vadisi", 690, 0.92],
    ["Ankara Merkez (Kalaba)", 891, 1.0],
    ["İncek – Çankaya / Kızılcahamam", 1220, 1.14],
    ["Elmadağ Kayak / Işık Dağı", 1860, 1.42]
  ),
  "TR-07": prof(
    "TR-07",
    "Antalya",
    3070,
    ["Konyaaltı / Lara Kıyı", 10, 0.95],
    ["Antalya Merkez (Falez Platosu)", 45, 1.0],
    ["Korkuteli / Termessos Yamaç", 950, 1.26],
    ["Saklıkent / Beydağları Zirve", 2050, 1.58]
  ),
  "TR-08": prof(
    "TR-08",
    "Artvin",
    3932,
    ["Hopa / Arhavi Karadeniz Kıyı", 15, 0.94],
    ["Artvin Merkez (Çoruh Yamaç)", 550, 1.0],
    ["Şavşat / Kafkasör Yaylası", 1450, 1.28],
    ["Atabarı / Karçal Dağları Zirve", 2450, 1.62]
  ),
  "TR-09": prof(
    "TR-09",
    "Aydın",
    1831,
    ["Kuşadası / Didim Kıyı", 10, 0.94],
    ["Aydın Merkez (Büyük Menderes)", 65, 1.0],
    ["Paşayaylası / Madran Etek", 650, 1.2],
    ["Aydın Dağları / Madranbaba", 1480, 1.46]
  ),
  "TR-10": prof(
    "TR-10",
    "Balıkesir",
    1774,
    ["Edremit / Bandırma Kıyı", 12, 0.93],
    ["Balıkesir Merkez", 145, 1.0],
    ["Dursunbey / Kazdağı Yamaç", 680, 1.2],
    ["Kazdağları (Karataş Sırtı)", 1620, 1.5]
  ),
  "TR-11": prof(
    "TR-11",
    "Bilecik",
    1906,
    ["Osmaneli – Sakarya Vadisi", 115, 0.9],
    ["Bilecik Merkez", 525, 1.0],
    ["Bozüyük / Pazaryeri Platosu", 860, 1.15],
    ["Domaniç – Kömürsu Sırtı", 1520, 1.42]
  ),
  "TR-12": prof(
    "TR-12",
    "Bingöl",
    3250,
    ["Genç – Murat Nehri Vadisi", 980, 0.93],
    ["Bingöl Merkez", 1150, 1.0],
    ["Karlıova / Yolçatı Geçidi", 1820, 1.24],
    ["Hesarek Kayak / Bingöl Dağları", 2500, 1.54]
  ),
  "TR-13": prof(
    "TR-13",
    "Bitlis",
    4058,
    ["Hizan – Botan Alt Vadi", 1180, 0.92],
    ["Bitlis Merkez / Tatvan Kıyı", 1560, 1.0],
    ["Rahva / Nemrut Kalderası Etek", 2050, 1.24],
    ["Nemrut / Süphan Zirve Kuşağı", 2850, 1.58]
  ),
  "TR-14": prof(
    "TR-14",
    "Bolu",
    2400,
    ["Mengen / Göynük Alt Vadi", 450, 0.91],
    ["Bolu Merkez (Ova)", 740, 1.0],
    ["Abant / Gölcük Çam Kuşağı", 1350, 1.24],
    ["Kartalkaya / Köroğlu Zirve", 2000, 1.56]
  ),
  "TR-15": prof(
    "TR-15",
    "Burdur",
    2598,
    ["Bucak – Kestel Alt Havza", 450, 0.9],
    ["Burdur Merkez (Göl Havzası)", 950, 1.0],
    ["Gölhisar / Yeşilova Platosu", 1380, 1.18],
    ["Salda Kayak / Eşeler Dağı", 2050, 1.48]
  ),
  "TR-16": prof(
    "TR-16",
    "Bursa",
    2543,
    ["Mudanya / Kıyı", 15, 0.92],
    ["Bursa Merkez (Ova)", 100, 1.0],
    ["Yamaç / Teleferik Etek", 550, 1.18],
    ["Uludağ Oteller / Zirve", 1850, 1.52]
  ),
  "TR-17": prof(
    "TR-17",
    "Çanakkale",
    1774,
    ["Boğaz / Kordon Kıyı", 8, 0.94],
    ["Çanakkale Merkez / Ezine", 35, 1.0],
    ["Bayramiç / Yenice Yamaç", 520, 1.2],
    ["Kazdağları Kuzey Sırtı", 1450, 1.5]
  ),
  "TR-18": prof(
    "TR-18",
    "Çankırı",
    2587,
    ["Kızılırmak Vadi Tabanı", 560, 0.92],
    ["Çankırı Merkez", 730, 1.0],
    ["Ilgaz / Yapraklı Yaylası", 1350, 1.22],
    ["Ilgaz Yıldıztepe / Büyükhacet", 2050, 1.52]
  ),
  "TR-19": prof(
    "TR-19",
    "Çorum",
    2097,
    ["Osmancık – Kızılırmak Vadisi", 420, 0.9],
    ["Çorum Merkez", 800, 1.0],
    ["İskilip / Kargı Yaylası", 1280, 1.18],
    ["Köse Dağı / Abdullah Yaylası", 1880, 1.44]
  ),
  "TR-20": prof(
    "TR-20",
    "Denizli",
    2571,
    ["Sarayköy – Menderes Tabanı", 170, 0.91],
    ["Denizli Merkez", 390, 1.0],
    ["Bağbaşı Yaylası / Çameli", 1250, 1.22],
    ["Denizli Kayak (Bozdağ) / Honaz", 2150, 1.52]
  ),
  "TR-21": prof(
    "TR-21",
    "Diyarbakır",
    1957,
    ["Bismil – Dicle Havzası", 545, 0.94],
    ["Diyarbakır Merkez", 675, 1.0],
    ["Ergani / Çüngüş Yamaç", 1080, 1.18],
    ["Karacadağ / Kulp Dağ Kuşağı", 1820, 1.44]
  ),
  "TR-22": prof(
    "TR-22",
    "Edirne",
    678,
    ["Meriç / İpsala Alt Ovası", 18, 0.95],
    ["Edirne Merkez", 42, 1.0],
    ["Lalapaşa / Süloğlu Platosu", 240, 1.12],
    ["Mahya-Istranca / Koru Dağı Sırtı", 610, 1.28]
  ),
  "TR-23": prof(
    "TR-23",
    "Elazığ",
    2347,
    ["Keban – Fırat Vadi Tabanı", 810, 0.92],
    ["Elazığ Merkez", 1065, 1.0],
    ["Harput / Hazar Gölü Kuşağı", 1450, 1.18],
    ["Hazarbaba Kayak / Zirve", 2150, 1.46]
  ),
  "TR-24": prof(
    "TR-24",
    "Erzincan",
    3549,
    ["Kemaliye – Karasu Kanyonu", 880, 0.91],
    ["Erzincan Merkez (Ova)", 1215, 1.0],
    ["Refahiye / Sakaltutan Geçidi", 1950, 1.24],
    ["Ergan Dağı Kayak / Munzur Sırtı", 2750, 1.56]
  ),
  "TR-25": prof(
    "TR-25",
    "Erzurum",
    3937,
    ["İspir / Tortum Çoruh Vadisi", 1180, 0.88],
    ["Erzurum Merkez (Ova)", 1890, 1.0],
    ["Palandöken Etek / Horasan", 2350, 1.2],
    ["Palandöken Ejder / Kargapazarı", 3125, 1.54]
  ),
  "TR-26": prof(
    "TR-26",
    "Eskişehir",
    1826,
    ["Sarıcakaya – Orta Sakarya Vadisi", 220, 0.88],
    ["Eskişehir Merkez (Porsuk)", 790, 1.0],
    ["Seyitgazi / Mihalıççık Yamaç", 1220, 1.16],
    ["Türkmen Dağı / Sündiken Sırtı", 1720, 1.38]
  ),
  "TR-27": prof(
    "TR-27",
    "Gaziantep",
    1496,
    ["Karkamış – Fırat Ovası", 380, 0.9],
    ["Gaziantep Merkez", 850, 1.0],
    ["Nurdağı / İslahiye Yamaç", 1120, 1.15],
    ["Sofdağı (Dülük / Hızır Yaylası)", 1420, 1.34]
  ),
  "TR-28": prof(
    "TR-28",
    "Giresun",
    3331,
    ["Giresun Sahil / Tirebolu", 10, 0.96],
    ["Giresun Merkez", 45, 1.0],
    ["Dereli / Kulakkaya Yaylası", 1250, 1.3],
    ["Kümbet / Karagöl Dağ Kuşağı", 2250, 1.62]
  ),
  "TR-29": prof(
    "TR-29",
    "Gümüşhane",
    3331,
    ["Kürtün – Harşit Vadisi", 760, 0.9],
    ["Gümüşhane Merkez", 1225, 1.0],
    ["Torul / Kostan Geçidi", 1850, 1.22],
    ["Zigana Kayak / Abdal Musa Sırtı", 2550, 1.52]
  ),
  "TR-30": prof(
    "TR-30",
    "Hakkari",
    4135,
    ["Çukurca – Zap Derin Vadisi", 950, 0.88],
    ["Hakkari Merkez", 1720, 1.0],
    ["Yüksekova / Mergabütan Etek", 2300, 1.24],
    ["Mergabütan Kayak / Cilo – Sat", 3150, 1.6]
  ),
  "TR-31": prof(
    "TR-31",
    "Hatay",
    2240,
    ["İskenderun / Samandağ Kıyı", 10, 0.94],
    ["Antakya Merkez (Asi Vadisi)", 95, 1.0],
    ["Belen Geçidi / Soğukoluk", 760, 1.24],
    ["Amanoslar (Bozdağ / Mığır Zirve)", 1820, 1.54]
  ),
  "TR-32": prof(
    "TR-32",
    "Isparta",
    2992,
    ["Sütçüler – Köprüçay Vadisi", 380, 0.89],
    ["Isparta Merkez", 1050, 1.0],
    ["Eğirdir / Gölcük Krater Yamaç", 1520, 1.2],
    ["Davraz Kayak Merkezi / Dedegöl", 2250, 1.52]
  ),
  "TR-33": prof(
    "TR-33",
    "Mersin",
    3524,
    ["Mezitli / Silifke Kıyı", 10, 0.95],
    ["Mersin Merkez", 35, 1.0],
    ["Gözne / Çamlıyayla Yamaç", 1080, 1.26],
    ["Karboğazı / Bolkar Zirve Kuşağı", 2350, 1.58]
  ),
  "TR-34": prof(
    "TR-34",
    "İstanbul",
    537,
    ["Boğaz / Marmara Sahil", 12, 0.94],
    ["İstanbul Merkez (Şişli – Fatih)", 55, 1.0],
    ["Çamlıca / Sarıyer Kuzey Sırtı", 195, 1.12],
    ["Aydos Tepesi / Polonezköy Sırtı", 480, 1.26]
  ),
  "TR-35": prof(
    "TR-35",
    "İzmir",
    2159,
    ["Konak / Kordon Kıyı", 10, 0.94],
    ["İzmir Merkez / Bornova", 45, 1.0],
    ["Sabuncubeli / Yamanlar Dağı", 680, 1.22],
    ["Bozdağ Kayak Merkezi", 1680, 1.5]
  ),
  "TR-36": prof(
    "TR-36",
    "Kars",
    3196,
    ["Kağızman – Aras Vadisi", 1410, 0.9],
    ["Kars Merkez (Plato)", 1775, 1.0],
    ["Sarıkamış Kristal Kar Etek", 2180, 1.2],
    ["Sarıkamış Cibiltepe / Allahuekber", 2634, 1.48]
  ),
  "TR-37": prof(
    "TR-37",
    "Kastamonu",
    2587,
    ["İnebolu / Cide Karadeniz Kıyı", 15, 0.93],
    ["Kastamonu Merkez", 780, 1.0],
    ["Küre / Yaralıgöz Geçidi", 1380, 1.24],
    ["Ilgaz Dağı Kayak / Çatalılgaz", 2100, 1.54]
  ),
  "TR-38": prof(
    "TR-38",
    "Kayseri",
    3917,
    ["Yeşilhisar – Sultan Sazlığı", 985, 0.95],
    ["Kayseri Merkez", 1054, 1.0],
    ["Erciyes Tekir / Hacılar Kapı", 2150, 1.32],
    ["Erciyes Yüksek Pist / Zirve Kuşağı", 2950, 1.62]
  ),
  "TR-39": prof(
    "TR-39",
    "Kırklareli",
    1031,
    ["İğneada / Kıyıköy Sahil", 12, 0.94],
    ["Kırklareli Merkez", 205, 1.0],
    ["Demirköy – Istranca Orman Yamaç", 540, 1.18],
    ["Mahya Dağı (Yıldız Dağları Zirve)", 960, 1.38]
  ),
  "TR-40": prof(
    "TR-40",
    "Kırşehir",
    1825,
    ["Kaman – Hirfanlı Havzası", 820, 0.94],
    ["Kırşehir Merkez", 985, 1.0],
    ["Mucur / Çiçekdağı Platosu", 1320, 1.14],
    ["Baran Dağı / Kervansaray Sırtı", 1720, 1.34]
  ),
  "TR-41": prof(
    "TR-41",
    "Kocaeli",
    1699,
    ["İzmit Körfezi / Kandıra Kıyı", 12, 0.93],
    ["Kocaeli Merkez (İzmit)", 75, 1.0],
    ["Maşukiye / Kuzuyayla Yamaç", 650, 1.22],
    ["Kartepe Kayak / Zirve", 1600, 1.54]
  ),
  "TR-42": prof(
    "TR-42",
    "Konya",
    3240,
    ["Tuz Gölü Havzası (Cihanbeyli)", 905, 0.92],
    ["Konya Merkez (Ova)", 1016, 1.0],
    ["Meram – Sille / Beyşehir Yamaç", 1350, 1.18],
    ["Alacabel – Erenler / Orta Toros", 1950, 1.48]
  ),
  "TR-43": prof(
    "TR-43",
    "Kütahya",
    2309,
    ["Tavşanlı / Simav Alt Havza", 780, 0.94],
    ["Kütahya Merkez", 970, 1.0],
    ["Domaniç / Çavdarhisar Yamaç", 1420, 1.18],
    ["Murat Dağı Termal Kayak / Akdağ", 2050, 1.46]
  ),
  "TR-44": prof(
    "TR-44",
    "Malatya",
    2639,
    ["Karakaya Barajı / Battalgazi", 710, 0.92],
    ["Malatya Merkez", 950, 1.0],
    ["Darende / Hekimhan Platosu", 1480, 1.18],
    ["Beydağı / Kubbe Geçidi Zirve", 2250, 1.46]
  ),
  "TR-45": prof(
    "TR-45",
    "Manisa",
    2070,
    ["Saruhanlı – Gediz Ovası", 42, 0.95],
    ["Manisa Merkez", 75, 1.0],
    ["Demirci / Spil Yamaç", 720, 1.2],
    ["Spil Dağı Atalanı / Bozdağ Sırtı", 1480, 1.48]
  ),
  "TR-46": prof(
    "TR-46",
    "Kahramanmaraş",
    3054,
    ["Türkoğlu – Aksu Ovası", 460, 0.94],
    ["Kahramanmaraş Merkez", 570, 1.0],
    ["Göksun / Başkonuş Yaylası", 1380, 1.24],
    ["Yedikuyular Kayak / Berit Dağı", 2200, 1.54]
  ),
  "TR-47": prof(
    "TR-47",
    "Mardin",
    1385,
    ["Kızıltepe – Mezopotamya Ovası", 485, 0.88],
    ["Mardin Merkez (Tarihi Sırt)", 1050, 1.0],
    ["Mazıdağı / Ömerli Platosu", 1180, 1.08],
    ["Bagok (İzla) / Mazı Dağ Sırtı", 1320, 1.18]
  ),
  "TR-48": prof(
    "TR-48",
    "Muğla",
    2915,
    ["Bodrum / Marmaris / Fethiye Kıyı", 12, 0.92],
    ["Muğla Merkez (Menteşe Platosu)", 660, 1.0],
    ["Kavaklıdere / Göktepe Yamaç", 1250, 1.2],
    ["Babadağ / Sandras – Akdağ Zirve", 2050, 1.5]
  ),
  "TR-49": prof(
    "TR-49",
    "Muş",
    2963,
    ["Murat Nehri Boğazı / Sungu", 1250, 0.95],
    ["Muş Merkez", 1350, 1.0],
    ["Varto / Malazgirt Platosu", 1720, 1.18],
    ["Güzeltepe Kayak / Kurtik Dağı", 2400, 1.48]
  ),
  "TR-50": prof(
    "TR-50",
    "Nevşehir",
    1988,
    ["Avanos – Kızılırmak Vadisi", 920, 0.92],
    ["Nevşehir Merkez / Ürgüp", 1225, 1.0],
    ["Derinkuyu / Uçhisar Platosu", 1520, 1.12],
    ["Erdaş / Hodul Dağı Zirve", 1880, 1.32]
  ),
  "TR-51": prof(
    "TR-51",
    "Niğde",
    3756,
    ["Bor Ovası", 1085, 0.95],
    ["Niğde Merkez", 1230, 1.0],
    ["Çamardı / Ketençimen Yamaç", 1850, 1.24],
    ["Aladağlar (Demirkazık) / Bolkar", 2850, 1.58]
  ),
  "TR-52": prof(
    "TR-52",
    "Ordu",
    3107,
    ["Altınordu / Ünye Sahil", 10, 0.96],
    ["Ordu Merkez", 35, 1.0],
    ["Boztepe / Aybastı Perşembe Yaylası", 950, 1.26],
    ["Çambaşı Kayak Merkezi / Karagöl", 2000, 1.58]
  ),
  "TR-53": prof(
    "TR-53",
    "Rize",
    3937,
    ["Rize Sahil / Pazar Kıyı", 10, 0.97],
    ["Rize Merkez", 40, 1.0],
    ["Ayder Yaylası / Çamlıhemşin", 1350, 1.32],
    ["Ovit Geçidi / Kaçkar Zirve Kuşağı", 2650, 1.66]
  ),
  "TR-54": prof(
    "TR-54",
    "Sakarya",
    1725,
    ["Karasu / Kocaali Karadeniz Kıyı", 10, 0.95],
    ["Sakarya Merkez (Adapazarı)", 35, 1.0],
    ["Sapanca – Soğucak / Hendek Yamaç", 680, 1.22],
    ["Dikmen Tepesi / Keremali Zirve", 1580, 1.52]
  ),
  "TR-55": prof(
    "TR-55",
    "Samsun",
    2062,
    ["Atakum / Bafra Delta Kıyı", 10, 0.96],
    ["Samsun Merkez", 35, 1.0],
    ["Kavak / Havza Geçidi", 720, 1.18],
    ["Ladik Akdağ Kayak Merkezi", 1680, 1.48]
  ),
  "TR-56": prof(
    "TR-56",
    "Siirt",
    2838,
    ["Kurtalan / Botan Derin Vadisi", 480, 0.9],
    ["Siirt Merkez", 895, 1.0],
    ["Şirvan / Pervari Yamaç", 1480, 1.22],
    ["Herekol (Yazlıca) Dağı Zirve", 2420, 1.52]
  ),
  "TR-57": prof(
    "TR-57",
    "Sinop",
    1812,
    ["İnceburun / Gerze Kıyı", 10, 0.96],
    ["Sinop Merkez (Yarımada)", 32, 1.0],
    ["Boyabat / Dranaz Geçidi", 820, 1.22],
    ["Çangal / Kunduz Dağ Sırtı", 1620, 1.48]
  ),
  "TR-58": prof(
    "TR-58",
    "Sivas",
    3015,
    ["Suşehri – Kelkit Vadisi", 850, 0.91],
    ["Sivas Merkez", 1285, 1.0],
    ["Kangal / Yağdonduran Geçidi", 1780, 1.18],
    ["Yıldız Dağı Kayak Merkezi / Kızıldağ", 2450, 1.5]
  ),
  "TR-59": prof(
    "TR-59",
    "Tekirdağ",
    945,
    ["Süleymanpaşa / Şarköy Kıyı", 10, 0.95],
    ["Tekirdağ Merkez", 45, 1.0],
    ["Çorlu / Malkara Trakya Platosu", 240, 1.1],
    ["Ganos (Işıklar) Dağı Zirve", 820, 1.32]
  ),
  "TR-60": prof(
    "TR-60",
    "Tokat",
    2416,
    ["Erbaa / Niksar Kelkit Ovası", 240, 0.9],
    ["Tokat Merkez (Yeşilırmak)", 625, 1.0],
    ["Çamlıbel Geçidi / Başçiftlik", 1380, 1.22],
    ["Başçiftlik Kayak / Topçam Zirve", 2050, 1.5]
  ),
  "TR-61": prof(
    "TR-61",
    "Trabzon",
    3376,
    ["Sahil / Akçaabat Kıyı", 12, 0.97],
    ["Trabzon Merkez / Boztepe", 45, 1.0],
    ["Maçka / Uzungöl Yamaç", 1050, 1.28],
    ["Zigana / Çakırgöl Dağ Kuşağı", 2050, 1.6]
  ),
  "TR-62": prof(
    "TR-62",
    "Tunceli",
    3462,
    ["Pertek – Keban Havzası", 860, 0.95],
    ["Tunceli Merkez (Munzur Vadisi)", 940, 1.0],
    ["Ovacık Kayak / Pülümür Vadisi", 1650, 1.24],
    ["Munzur / Mercan Dağları Zirve", 2750, 1.58]
  ),
  "TR-63": prof(
    "TR-63",
    "Şanlıurfa",
    1919,
    ["Harran / Akçakale Ovası", 375, 0.93],
    ["Şanlıurfa Merkez", 550, 1.0],
    ["Siverek Platosu", 820, 1.14],
    ["Karacadağ Kayak Merkezi / Zirve", 1850, 1.46]
  ),
  "TR-64": prof(
    "TR-64",
    "Uşak",
    2309,
    ["Ulubey / Eşme Alt Havza", 620, 0.92],
    ["Uşak Merkez", 915, 1.0],
    ["Banaz / Sivaslı Yamaç", 1350, 1.18],
    ["Murat Dağı / Bulkaz Zirve", 2050, 1.46]
  ),
  "TR-65": prof(
    "TR-65",
    "Van",
    3684,
    ["Van Gölü Kıyısı (Edremit)", 1650, 0.98],
    ["Van Merkez", 1675, 1.0],
    ["Abalı Kayak / Kurubaş Geçidi", 2250, 1.22],
    ["Artos / Erek Dağı Zirve Kuşağı", 3150, 1.54]
  ),
  "TR-66": prof(
    "TR-66",
    "Yozgat",
    2272,
    ["Çekerek / Yerköy Alt Vadi", 780, 0.9],
    ["Yozgat Merkez", 1300, 1.0],
    ["Çamlık Milli Parkı / Akdağmadeni", 1580, 1.14],
    ["Akdağlar / Deveci Dağı Zirve", 1980, 1.38]
  ),
  "TR-67": prof(
    "TR-67",
    "Zonguldak",
    1637,
    ["Çaycuma Vadisi / Ereğli Kıyı", 12, 0.95],
    ["Zonguldak Merkez", 45, 1.0],
    ["Devrek / Gökçebey Orman Yamaç", 650, 1.22],
    ["Bacaklıyayla / Alaplı Zirve", 1520, 1.5]
  ),
  "TR-68": prof(
    "TR-68",
    "Aksaray",
    3268,
    ["Eskil – Tuz Gölü Havzası", 910, 0.95],
    ["Aksaray Merkez", 980, 1.0],
    ["Ihlara – Güzelyurt Platosu", 1520, 1.2],
    ["Hasandağı Yüksek Kuşak", 2750, 1.56]
  ),
  "TR-69": prof(
    "TR-69",
    "Bayburt",
    3356,
    ["Çoruh Alt Boğazı", 1450, 0.95],
    ["Bayburt Merkez", 1550, 1.0],
    ["Kop Dağı Kayak / Geçit", 2250, 1.24],
    ["Soğanlı / Mescit Dağları Zirve", 2850, 1.52]
  ),
  "TR-70": prof(
    "TR-70",
    "Karaman",
    2877,
    ["Ermenek – Göksu Vadisi", 420, 0.9],
    ["Karaman Merkez (Ova)", 1035, 1.0],
    ["Sarıveliler / Sertavul Geçidi", 1620, 1.22],
    ["Karadağ / Orta Toros Zirve", 2280, 1.48]
  ),
  "TR-71": normBand71(),
  "TR-72": prof(
    "TR-72",
    "Batman",
    2973,
    ["Hasankeyf – Dicle Vadisi", 500, 0.96],
    ["Batman Merkez", 550, 1.0],
    ["Kozluk / Sason Yamaç", 1150, 1.22],
    ["Mereto (Aydınlık) Dağı Zirve", 2350, 1.54]
  ),
  "TR-73": prof(
    "TR-73",
    "Şırnak",
    3356,
    ["Cizre – Dicle Ovası", 380, 0.86],
    ["Şırnak Merkez", 1360, 1.0],
    ["Uludere / Beytüşşebap Yamaç", 1920, 1.2],
    ["Cudi / Kato Dağ Kuşağı", 2750, 1.52]
  ),
  "TR-74": prof(
    "TR-74",
    "Bartın",
    1685,
    ["Amasra / İnkumu Kıyı", 10, 0.97],
    ["Bartın Merkez", 25, 1.0],
    ["Ulus – Küre Milli Park Etek", 620, 1.22],
    ["Arıt / Küre Dağları Sırtı", 1480, 1.5]
  ),
  "TR-75": prof(
    "TR-75",
    "Ardahan",
    3197,
    ["Posof Alt Vadisi", 1440, 0.92],
    ["Ardahan Merkez (Kura Platosu)", 1829, 1.0],
    ["Göle / Çıldır Gölü Kuşağı", 2150, 1.15],
    ["Yalnızçam Kayak / Kısır Dağı", 2750, 1.46]
  ),
  "TR-76": prof(
    "TR-76",
    "Iğdır",
    5137,
    ["Aralık – Aras Tabanı", 815, 0.96],
    ["Iğdır Merkez (Mikroklima Ovası)", 858, 1.0],
    ["Tuzluca / Korhan Yaylası", 1750, 1.26],
    ["Ağrı Dağı Kuzey Yamaç Kuşağı", 3200, 1.62]
  ),
  "TR-77": prof(
    "TR-77",
    "Yalova",
    926,
    ["Çınarcık / Sahil Kıyı", 8, 0.96],
    ["Yalova Merkez", 30, 1.0],
    ["Termal / Erikli Yaylası Yamaç", 390, 1.18],
    ["Delmece Yaylası / Taz Dağı Sırtı", 840, 1.38]
  ),
  "TR-78": prof(
    "TR-78",
    "Karabük",
    2000,
    ["Yenice Orman Vadisi", 220, 0.96],
    ["Karabük Merkez", 280, 1.0],
    ["Safranbolu / Eflani Platosu", 950, 1.2],
    ["Keltepe Kayak Merkezi (Zirve)", 1850, 1.52]
  ),
  "TR-79": prof(
    "TR-79",
    "Kilis",
    1264,
    ["Elbeyli – Afrin Ovası", 460, 0.93],
    ["Kilis Merkez", 640, 1.0],
    ["Musabeyli Yamaç", 860, 1.12],
    ["Darmık / Kartal Dağı Sırtı", 1180, 1.28]
  ),
  "TR-80": prof(
    "TR-80",
    "Osmaniye",
    2246,
    ["Kadirli – Ceyhan Ovası", 65, 0.95],
    ["Osmaniye Merkez", 125, 1.0],
    ["Hasanbeyli / Zorkun Etek", 920, 1.24],
    ["Zorkun Yaylası / Düldül Dağı", 1780, 1.54]
  ),
  "TR-81": prof(
    "TR-81",
    "Düzce",
    1830,
    ["Akçakoca Karadeniz Kıyı", 12, 0.96],
    ["Düzce Merkez (Ova)", 150, 1.0],
    ["Kaynaşlı / Topuk Yaylası", 850, 1.22],
    ["Kardüz Yaylası / Bolu Dağı Sırtı", 1650, 1.52]
  )
});

function normBand71(): ProvinceHypsometricProfile {
  return prof(
    "TR-71",
    "Kırıkkale",
    1744,
    ["Yahşihan – Kızılırmak Tabanı", 670, 0.96],
    ["Kırıkkale Merkez", 740, 1.0],
    ["Keskin / Çelebi Platosu", 1140, 1.14],
    ["Dinek Dağı Zirve", 1620, 1.36]
  );
}

void TR_PLATE_NUMBERS;

/**
 * İlin 4 hipsometrik düğümü üzerinden sürekli ve parçalı-doğrusal orografik yağış ağırlığı `W_oro(z)` hesaplar.
 */
export function interpolateProvinceOrographicWeight(
  profile: ProvinceHypsometricProfile,
  elevationM: number
): number {
  const z = Number.isFinite(elevationM) ? Math.max(0, elevationM) : profile.bands[1].elevationM;
  const knots = profile.bands;

  if (z <= knots[0].elevationM) {
    const span01 = Math.max(25, knots[1].elevationM - knots[0].elevationM);
    const slope01 = (knots[1].baseOroWeight - knots[0].baseOroWeight) / span01;
    return clamp(knots[0].baseOroWeight - (knots[0].elevationM - z) * slope01 * 0.7, 0.78, 1.85);
  }

  for (let i = 0; i < knots.length - 1; i++) {
    const k0 = knots[i];
    const k1 = knots[i + 1];
    if (z <= k1.elevationM) {
      const frac = (z - k0.elevationM) / Math.max(1, k1.elevationM - k0.elevationM);
      return k0.baseOroWeight + (k1.baseOroWeight - k0.baseOroWeight) * frac;
    }
  }

  const last = knots[knots.length - 1];
  return clamp(last.baseOroWeight + ((z - last.elevationM) / 1500) * 0.12, last.baseOroWeight, 1.85);
}

/**
 * Seçili ilin 4-bant rakım kesitini (`low < center < foothill < summit`), fiziki zirve tavanına
 * (`Math.max(maxPhysicalPeakM, zRef)`) ve tekil referans özdeşliğine (`isReferenceBand === true`,
 * `orographicBoost === 1.0`) %100 sadık kalarak deterministik biçimde çözer.
 */
export function resolveProvinceElevationBandSpecs(params: {
  provinceCode: TrProvinceCode;
  referenceElevationM: number;
  locationName?: string;
}): ResolvedProvinceElevationBandSpec[] {
  const profile = TR81_HYPSOMETRIC_PROFILES[params.provinceCode] ?? TR81_HYPSOMETRIC_PROFILES["TR-16"];
  const anchors = profile.bands;
  const zRef = Number.isFinite(params.referenceElevationM)
    ? Math.max(0, Math.round(params.referenceElevationM))
    : anchors[1].elevationM;

  const ceilingM = Math.max(profile.maxPhysicalPeakM, zRef);

  // 1. Referans bandı yuvasını (0..3) seç (TR-16 Bursa için mevcut 55 / 360 / 1150 m sınırlarını birebir koru)
  let refSlot: 0 | 1 | 2 | 3;
  if (params.provinceCode === "TR-16") {
    refSlot = zRef < 55 ? 0 : zRef <= 360 ? 1 : zRef <= 1150 ? 2 : 3;
  } else {
    const m01 = 0.5 * (anchors[0].elevationM + anchors[1].elevationM);
    const m12 = 0.5 * (anchors[1].elevationM + anchors[2].elevationM);
    const m23 = 0.5 * (anchors[2].elevationM + anchors[3].elevationM);
    refSlot = zRef < m01 ? 0 : zRef <= m12 ? 1 : zRef <= m23 ? 2 : 3;
  }

  // Sınır fizibilitesi: zRef === 0..5 iken altında yer kalması, ceilingM'e çok yakınken üstünde yer kalması
  if (zRef < 6) {
    refSlot = 0;
  } else if (ceilingM - zRef < 45) {
    refSlot = 3;
  } else if (ceilingM - zRef < 90 && refSlot < 2) {
    refSlot = 2;
  }

  const elevs: [number, number, number, number] = [
    anchors[0].elevationM,
    anchors[1].elevationM,
    anchors[2].elevationM,
    anchors[3].elevationM
  ];
  elevs[refSlot] = zRef;

  // 2. Referans yuvanın ALTINDAKİ bantların kesin artan (0 <= e[0] < ... < e[refSlot]) kalmasını garanti et
  for (let i = refSlot - 1; i >= 0; i--) {
    const upper = elevs[i + 1];
    const minPossible = i;
    const minGap = Math.max(1, Math.min(15, Math.floor((upper - minPossible) / 2)));
    const maxAllowed = upper - minGap;
    if (elevs[i] > maxAllowed) {
      elevs[i] = Math.max(minPossible, maxAllowed);
    }
    if (elevs[i] < minPossible) {
      elevs[i] = minPossible;
    }
  }

  // 3. Referans yuvanın ÜSTÜNDEKİ bantların kesin artan ve <= ceilingM kalmasını garanti et
  for (let i = refSlot + 1; i <= 3; i++) {
    const lower = elevs[i - 1];
    const slotsRemainingAfter = 3 - i;
    const maxAllowed = ceilingM - slotsRemainingAfter * Math.min(15, Math.floor((ceilingM - zRef) / 4));
    const hardMax = ceilingM - slotsRemainingAfter;
    const safeCap = Math.max(lower + 1, Math.min(hardMax, maxAllowed));
    const minGap = Math.max(1, Math.min(15, Math.floor((safeCap - lower) / 2)));
    const minNeeded = lower + minGap;

    if (elevs[i] < minNeeded) {
      elevs[i] = Math.min(hardMax, minNeeded);
    } else if (elevs[i] > safeCap) {
      elevs[i] = safeCap;
    }
  }

  // 4. Referans ağırlığına göre normalize orografik çarpan ve etiket üretimi
  const wRef = Math.max(0.1, interpolateProvinceOrographicWeight(profile, zRef));
  const cleanLocName = params.locationName?.trim() ?? "";

  return ([0, 1, 2, 3] as const).map((idx) => {
    const anchor = anchors[idx];
    const isRef = idx === refSlot;
    const zBand = elevs[idx];

    let labelTr = anchor.labelTr;
    if (isRef) {
      const distFromAnchorM = Math.abs(zBand - anchor.elevationM);
      if (
        cleanLocName.length > 0 &&
        cleanLocName.toLocaleLowerCase("tr-TR") !== profile.provinceName.toLocaleLowerCase("tr-TR") &&
        distFromAnchorM > 35
      ) {
        labelTr = cleanLocName;
      } else if (distFromAnchorM > (idx <= 1 ? 85 : 180)) {
        const tierLabel =
          idx === 0 ? "Alt Havza" : idx === 1 ? "Merkez" : idx === 2 ? "Yamaç" : "Zirve";
        labelTr = `Seçili ${profile.provinceName} (${tierLabel})`;
      }
    }

    const orographicBoost = isRef
      ? 1.0
      : Number(
          clamp(
            interpolateProvinceOrographicWeight(profile, zBand) / wRef,
            0.55,
            1.75
          ).toFixed(4)
        );

    return {
      id: anchor.id,
      labelTr,
      elevationM: zBand,
      orographicBoost,
      isReferenceBand: isRef
    };
  });
}

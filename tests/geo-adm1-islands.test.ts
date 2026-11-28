import { describe, expect, it } from "vitest";
import {
  areAdjacentProvinces,
  parseTrAdmin1ToProvinceCode,
  pointInProvincePolygon,
  resolveProvinceCode,
  TR_PROVINCE_NAMES_BY_CODE
} from "../lib/provinces/geo-adm1-resolver";
import { TR_PLATE_NUMBERS, type TrProvinceCode } from "../lib/provinces/types";

const PROVINCE_CENTERS_81: ReadonlyArray<
  readonly [TrProvinceCode, string, number, number]
> = [
  ["TR-01", "Adana", 37.0, 35.3213],
  ["TR-02", "Adıyaman", 37.7648, 38.2786],
  ["TR-03", "Afyonkarahisar", 38.7507, 30.5567],
  ["TR-04", "Ağrı", 39.7191, 43.0503],
  ["TR-05", "Amasya", 40.6499, 35.8353],
  ["TR-06", "Ankara", 39.9334, 32.8597],
  ["TR-07", "Antalya", 36.8969, 30.7133],
  ["TR-08", "Artvin", 41.1828, 41.8183],
  ["TR-09", "Aydın", 37.856, 27.8416],
  ["TR-10", "Balıkesir", 39.6484, 27.8826],
  ["TR-11", "Bilecik", 40.1451, 29.9799],
  ["TR-12", "Bingöl", 38.8855, 40.4966],
  ["TR-13", "Bitlis", 38.4006, 42.1095],
  ["TR-14", "Bolu", 40.735, 31.6061],
  ["TR-15", "Burdur", 37.7203, 30.2908],
  ["TR-16", "Bursa", 40.2308, 29.0133],
  ["TR-17", "Çanakkale", 40.1553, 26.4142],
  ["TR-18", "Çankırı", 40.6013, 33.6134],
  ["TR-19", "Çorum", 40.5506, 34.9556],
  ["TR-20", "Denizli", 37.7765, 29.0864],
  ["TR-21", "Diyarbakır", 37.9144, 40.2306],
  ["TR-22", "Edirne", 41.6771, 26.5557],
  ["TR-23", "Elazığ", 38.681, 39.2264],
  ["TR-24", "Erzincan", 39.75, 39.5],
  ["TR-25", "Erzurum", 39.9043, 41.2679],
  ["TR-26", "Eskişehir", 39.7767, 30.5206],
  ["TR-27", "Gaziantep", 37.0662, 37.3833],
  ["TR-28", "Giresun", 40.9128, 38.3895],
  ["TR-29", "Gümüşhane", 40.4603, 39.4814],
  ["TR-30", "Hakkari", 37.5833, 43.7333],
  ["TR-31", "Hatay", 36.2021, 36.1606],
  ["TR-32", "Isparta", 37.7648, 30.5566],
  ["TR-33", "Mersin", 36.8121, 34.6415],
  ["TR-34", "İstanbul", 41.0082, 28.9784],
  ["TR-35", "İzmir", 38.4237, 27.1428],
  ["TR-36", "Kars", 40.6013, 43.0975],
  ["TR-37", "Kastamonu", 41.3887, 33.7827],
  ["TR-38", "Kayseri", 38.7312, 35.4787],
  ["TR-39", "Kırklareli", 41.7333, 27.2167],
  ["TR-40", "Kırşehir", 39.1425, 34.1709],
  ["TR-41", "Kocaeli", 40.7654, 29.9408],
  ["TR-42", "Konya", 37.8746, 32.4932],
  ["TR-43", "Kütahya", 39.4167, 29.9833],
  ["TR-44", "Malatya", 38.3552, 38.3095],
  ["TR-45", "Manisa", 38.6191, 27.4289],
  ["TR-46", "Kahramanmaraş", 37.5858, 36.9371],
  ["TR-47", "Mardin", 37.3212, 40.7245],
  ["TR-48", "Muğla", 37.2153, 28.3636],
  ["TR-49", "Muş", 38.7432, 41.5064],
  ["TR-50", "Nevşehir", 38.6244, 34.7144],
  ["TR-51", "Niğde", 37.9667, 34.6833],
  ["TR-52", "Ordu", 40.9839, 37.8764],
  ["TR-53", "Rize", 41.0201, 40.5234],
  ["TR-54", "Sakarya", 40.7569, 30.3783],
  ["TR-55", "Samsun", 41.2867, 36.33],
  ["TR-56", "Siirt", 37.9333, 41.95],
  ["TR-57", "Sinop", 42.0231, 35.1531],
  ["TR-58", "Sivas", 39.7477, 37.0179],
  ["TR-59", "Tekirdağ", 40.9833, 27.5167],
  ["TR-60", "Tokat", 40.3167, 36.55],
  ["TR-61", "Trabzon", 41.0027, 39.7168],
  ["TR-62", "Tunceli", 39.1079, 39.5401],
  ["TR-63", "Şanlıurfa", 37.1591, 38.7969],
  ["TR-64", "Uşak", 38.6823, 29.4082],
  ["TR-65", "Van", 38.4891, 43.4089],
  ["TR-66", "Yozgat", 39.8181, 34.8147],
  ["TR-67", "Zonguldak", 41.4564, 31.7987],
  ["TR-68", "Aksaray", 38.3687, 34.037],
  ["TR-69", "Bayburt", 40.2552, 40.2249],
  ["TR-70", "Karaman", 37.1759, 33.2287],
  ["TR-71", "Kırıkkale", 39.8468, 33.5153],
  ["TR-72", "Batman", 37.8812, 41.1351],
  ["TR-73", "Şırnak", 37.5164, 42.4611],
  ["TR-74", "Bartın", 41.6344, 32.3375],
  ["TR-75", "Ardahan", 41.1105, 42.7022],
  ["TR-76", "Iğdır", 39.9237, 44.045],
  ["TR-77", "Yalova", 40.655, 29.2769],
  ["TR-78", "Karabük", 41.2061, 32.6204],
  ["TR-79", "Kilis", 36.7184, 37.1212],
  ["TR-80", "Osmaniye", 37.0742, 36.2478],
  ["TR-81", "Düzce", 40.8438, 31.1565]
];

describe("GEO-01: Resmi 81-İl ADM1 Poligon Yönlendirici ve Yabancı Ada Dışlama Maskesi", () => {
  it("1. 81 il merkezinin tamamı eksiksiz ve sıfır hatayla TR-01..TR-81 plaka koduna ve resmi il adına çözülür", () => {
    expect(PROVINCE_CENTERS_81).toHaveLength(81);
    expect(Object.keys(TR_PROVINCE_NAMES_BY_CODE)).toHaveLength(81);

    for (let i = 0; i < PROVINCE_CENTERS_81.length; i++) {
      const [expectedCode, expectedName, lat, lon] = PROVINCE_CENTERS_81[i];
      expect(expectedCode).toBe(`TR-${TR_PLATE_NUMBERS[i]}`);

      const res = resolveProvinceCode({ lat, lon });
      expect(res.provinceCode, `${expectedName} (${lat}, ${lon})`).toBe(expectedCode);
      expect(res.provinceName).toBe(expectedName);
      expect(res.plateNumber).toBe(i + 1);
      expect(pointInProvincePolygon(lat, lon, expectedCode)).toBe(true);
    }
  });

  it("2. Zorlu sınır ilçeleri (Gebze/Tuzla, Yalova/Bursa, Domaniç/İnegöl/Keles, Alanya/Kaş, Bandırma/Edremit, İskenderun/Payas/Osmaniye, Tarsus/Adana, Ereğli) %100 doğru ili döndürür", () => {
    const borderCases: ReadonlyArray<readonly [string, number, number, TrProvinceCode]> = [
      // Kocaeli (TR-41) vs İstanbul (TR-34)
      ["Gebze", 40.8028, 29.4307, "TR-41"],
      ["Çayırova", 40.8253, 29.3736, "TR-41"],
      ["Darıca", 40.7739, 29.4003, "TR-41"],
      ["Tuzla", 40.8161, 29.3006, "TR-34"],
      ["Pendik", 40.8756, 29.2333, "TR-34"],

      // Yalova (TR-77) vs Bursa (TR-16) — eski BBox sızıntısı tamamen engellenir!
      ["Yalova Merkez", 40.655, 29.2769, "TR-77"],
      ["Çınarcık", 40.6422, 29.12, "TR-77"],
      ["Armutlu", 40.5186, 28.8317, "TR-77"],
      ["Altınova", 40.6953, 29.5094, "TR-77"],
      ["Gemlik", 40.4325, 29.1564, "TR-16"],
      ["Orhangazi", 40.4892, 29.3089, "TR-16"],
      ["Mudanya", 40.3753, 28.8822, "TR-16"],

      // Kütahya (TR-43) vs Bursa (TR-16)
      ["Domaniç", 39.8019, 29.6092, "TR-43"],
      ["Tavşanlı", 39.5424, 29.4941, "TR-43"],
      ["İnegöl", 40.0781, 29.5133, "TR-16"],
      ["Keles", 39.9136, 29.2369, "TR-16"],
      ["Uludağ Oteller / Zirve", 40.1069, 29.1292, "TR-16"],

      // Antalya (TR-07) uç ilçeleri
      ["Alanya", 36.5444, 31.9956, "TR-07"],
      ["Gazipaşa", 36.2694, 32.3181, "TR-07"],
      ["Kaş", 36.2018, 29.6377, "TR-07"],
      ["Kalkan", 36.265, 29.4139, "TR-07"],

      // Balıkesir (TR-10) Marmara ve Ege kıyıları
      ["Bandırma", 40.3522, 27.9767, "TR-10"],
      ["Edremit", 39.5961, 27.0244, "TR-10"],
      ["Ayvalık", 39.3192, 26.6931, "TR-10"],

      // Hatay (TR-31) vs Osmaniye (TR-80)
      ["İskenderun", 36.5872, 36.1733, "TR-31"],
      ["Payas", 36.7556, 36.2128, "TR-31"],
      ["Dörtyol", 36.8542, 36.2225, "TR-31"],
      ["Osmaniye Merkez", 37.0742, 36.2478, "TR-80"],

      // Mersin (TR-33) vs Adana (TR-01)
      ["Tarsus", 36.9167, 34.8956, "TR-33"],
      ["Adana Seyhan", 37.0, 35.3213, "TR-01"],

      // Eşadlı Ereğli ilçeleri (Konya vs Zonguldak vs Tekirdağ)
      ["Konya Ereğli", 37.5133, 34.0467, "TR-42"],
      ["Karadeniz Ereğli", 41.2847, 31.4147, "TR-67"],
      ["Marmaraereğlisi", 40.97, 27.9553, "TR-59"]
    ];

    for (const [label, lat, lon, expectedCode] of borderCases) {
      const res = resolveProvinceCode({ lat, lon });
      expect(res.provinceCode, `${label} (${lat}, ${lon})`).toBe(expectedCode);
    }

    // Sınırdan uzak (> 1.5 km) iç noktalarda yanıltıcı admin1 gelse bile poligon kazanır
    const gebzeWithWrongAdmin1 = resolveProvinceCode({
      lat: 40.8028,
      lon: 29.4307,
      admin1: "İstanbul"
    });
    expect(gebzeWithWrongAdmin1.provinceCode).toBe("TR-41");
    expect(gebzeWithWrongAdmin1.method).toBe("exact_polygon");
  });

  it("3. Türkiye adaları (Gökçeada, Bozcaada, Marmara, Avşa, Cunda, İmralı, Prens Adaları, Akdamar) kendi gerçek illerine atanır", () => {
    const turkishIslands: ReadonlyArray<readonly [string, number, number, TrProvinceCode]> = [
      ["Gökçeada", 40.1925, 25.9069, "TR-17"],
      ["Bozcaada", 39.835, 26.0706, "TR-17"],
      ["Marmara Adası", 40.6167, 27.6167, "TR-10"],
      ["Avşa Adası", 40.5106, 27.4981, "TR-10"],
      ["Cunda / Alibey Adası", 39.3364, 26.6556, "TR-10"],
      ["İmralı Adası", 40.5389, 28.5328, "TR-16"],
      ["Büyükada (Prens Adaları)", 40.8622, 29.1244, "TR-34"],
      ["Heybeliada (Prens Adaları)", 40.8769, 29.0928, "TR-34"],
      ["Burgazada (Prens Adaları)", 40.8806, 29.0631, "TR-34"],
      ["Kınalıada (Prens Adaları)", 40.9094, 29.05, "TR-34"],
      ["Akdamar Adası (Van Gölü)", 38.3414, 43.0369, "TR-65"]
    ];

    for (const [label, lat, lon, expectedCode] of turkishIslands) {
      const res = resolveProvinceCode({ lat, lon });
      expect(res.provinceCode, label).toBe(expectedCode);
    }
  });

  it("4. Yunan adaları (Meis, Rodos, Simi, İstanköy/Kos, Sisam/Samos, Sakız/Chios, Midilli/Lesbos, Limni, Semadirek), Dedeağaç (LGAL), Batum ve Girne/Kıbrıs kesinlikle GLOBAL döner", () => {
    const foreignExclusions: ReadonlyArray<readonly [string, number, number]> = [
      ["Meis / Kastellorizo (Kaş'a 2 km)", 36.15, 29.59],
      ["Meis Limanı", 36.1486, 29.5914],
      ["Meis Kuzey Kıyısı (Kaş Boğazı)", 36.1545, 29.592],
      ["Rodos", 36.43, 28.22],
      ["Simi / Sömbeki", 36.615, 27.836],
      ["İstanköy / Kos", 36.89, 27.28],
      ["Sisam / Samos", 37.75, 26.97],
      ["Sisam Doğu Ucu (Dilek Boğazı karşısı)", 37.7547, 26.9778],
      ["Sakız / Chios", 38.37, 26.13],
      ["Midilli / Lesbos", 39.1, 26.55],
      ["Limni / Limnos", 39.91, 25.23],
      ["Semadirek / Samothraki", 40.46, 25.52],
      ["Dedeağaç Havalimanı (LGAL)", 40.8558, 25.9564],
      ["Batum", 41.61, 41.6],
      ["Girne / Kıbrıs", 35.33, 33.32],
      ["Londra", 51.5072, -0.1276],
      ["Tokyo", 35.6762, 139.6503]
    ];

    for (const [label, lat, lon] of foreignExclusions) {
      const rawClick = resolveProvinceCode({ lat, lon });
      expect(rawClick.provinceCode, `${label} (${lat}, ${lon})`).toBe("GLOBAL");
      expect(rawClick.method, `${label} method`).toBe("global_outside");
    }
  });

  it("5. parseTrAdmin1ToProvinceCode: tarihsel/merkez takma adları, NFC/NFD ve Türkçe İ/I dönüşümlerini çözer; bölge adlarını reddeder", () => {
    expect(parseTrAdmin1ToProvinceCode("İçel")).toBe("TR-33");
    expect(parseTrAdmin1ToProvinceCode("I\u0307c\u0327el")).toBe("TR-33"); // NFD
    expect(parseTrAdmin1ToProvinceCode("Afyon")).toBe("TR-03");
    expect(parseTrAdmin1ToProvinceCode("Antakya")).toBe("TR-31");
    expect(parseTrAdmin1ToProvinceCode("İzmit")).toBe("TR-41");
    expect(parseTrAdmin1ToProvinceCode("Adapazarı")).toBe("TR-54");
    expect(parseTrAdmin1ToProvinceCode("İstanbul".normalize("NFD"))).toBe("TR-34");
    expect(parseTrAdmin1ToProvinceCode("ISTANBUL")).toBe("TR-34");
    expect(parseTrAdmin1ToProvinceCode("DİYARBAKIR")).toBe("TR-21");
    expect(parseTrAdmin1ToProvinceCode("IĞDIR")).toBe("TR-76");
    expect(parseTrAdmin1ToProvinceCode("Hakkâri")).toBe("TR-30");
    expect(parseTrAdmin1ToProvinceCode("Kocaeli Province")).toBe("TR-41");
    expect(parseTrAdmin1ToProvinceCode("Bursa · Batı Ova (MGM 18386)")).toBe("TR-16");

    // Bölge isimleri kesinlikle null dönmeli
    expect(parseTrAdmin1ToProvinceCode("Marmara Bölgesi")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("Ege Bölgesi")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("Akdeniz Bölgesi")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("İç Anadolu Bölgesi")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("Karadeniz Bölgesi")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("Doğu Anadolu Bölgesi")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("Güneydoğu Anadolu Bölgesi")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("Marmara Region")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode("")).toBeNull();
    expect(parseTrAdmin1ToProvinceCode(null)).toBeNull();
  });

  it("6. Komşuluk grafiği, <= 1.5 km sırt sınırı admin1 hakemliği (Ilgaz TR-18/TR-37), kıyı yakalama (coastal_snap) ve < 0.5 ms hız bütçesi sağlanır", () => {
    expect(areAdjacentProvinces("TR-16", "TR-77")).toBe(true);
    expect(areAdjacentProvinces("TR-16", "TR-43")).toBe(true);
    expect(areAdjacentProvinces("TR-41", "TR-34")).toBe(true);
    expect(areAdjacentProvinces("TR-18", "TR-37")).toBe(true);
    expect(areAdjacentProvinces("TR-16", "TR-06")).toBe(false);
    expect(areAdjacentProvinces("TR-16", "TR-16")).toBe(false);

    // Ilgaz Dağı sırt hattında (<= 1.5 km) komşu il admin1 hakemliği (border_admin1_tiebreak)
    const ilgazRidgeAsCankiri = resolveProvinceCode({
      lat: 41.084,
      lon: 33.7788,
      admin1: "Çankırı"
    });
    expect(ilgazRidgeAsCankiri.provinceCode).toBe("TR-18");

    const ilgazRidgeAsKastamonu = resolveProvinceCode({
      lat: 41.084,
      lon: 33.7788,
      admin1: "Kastamonu"
    });
    expect(ilgazRidgeAsKastamonu.provinceCode).toBe("TR-37");
    expect(
      ilgazRidgeAsCankiri.method === "border_admin1_tiebreak" ||
        ilgazRidgeAsKastamonu.method === "border_admin1_tiebreak"
    ).toBe(true);

    // Mudanya kıyısı ~900m açığı -> Marmara iç deniz coastal_snap ile TR-16
    const mudanyaOffshore = resolveProvinceCode({ lat: 40.392, lon: 28.885 });
    expect(mudanyaOffshore.provinceCode).toBe("TR-16");
    expect(mudanyaOffshore.method).toBe("coastal_snap");

    // Açık Karadeniz (> 2.5 km açık deniz, ~18 km) -> GLOBAL
    const openBlackSea = resolveProvinceCode({ lat: 41.45, lon: 29.05 });
    expect(openBlackSea.provinceCode).toBe("GLOBAL");

    // Performans testi: 2.000 karışık sorgu ortalaması < 0.5 ms
    const t0 = performance.now();
    const iterations = 2000;
    for (let i = 0; i < iterations; i++) {
      const sample = PROVINCE_CENTERS_81[i % PROVINCE_CENTERS_81.length];
      resolveProvinceCode({ lat: sample[2], lon: sample[3] });
    }
    const avgMs = (performance.now() - t0) / iterations;
    expect(avgMs).toBeLessThan(0.5);
  });
});

/**
 * ATMOS v5.0 — Wave 1 (GEO-04): National 80-Province Server-Only MGM Live Mesh,
 * Global `/kar` & `/denizler` Singleflight Collectors, 3-Gate Ownership Firewall,
 * `5+3+2+2` Stratified Top-12 Selector, Regional QC & ALARO Hourly/Daily Adapter.
 *
 * NOTE: Server-only runtime module (do not import in client components).
 * Bursa (`TR-16`) is 100% sealed to `lib/bursa-mesh.ts` and rejected here.
 */

import {
  isTrProvinceCode,
  type ProvinceStationOverride,
  type ProvinceZoneKind,
  type RegionalQcAndMosBounds,
  type TrProvinceCode
} from "./types";

export const MGM_NATIONAL_USER_AGENT =
  "Mozilla/5.0 (compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent)";

export const MGM_REQUIRED_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  Accept: "application/json, text/plain, */*",
  Origin: "https://www.mgm.gov.tr",
  Referer: "https://www.mgm.gov.tr/",
  "User-Agent": MGM_NATIONAL_USER_AGENT
});

export const SNOW_MARINE_CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes
export const PROVINCE_CENTERS_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
export const PROVINCE_MESH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const PROVINCE_FORECAST_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_PROVINCE_FANOUT_STATIONS = 12;

const EARTH_RADIUS_KM = 6371.0;

const MGM_PRECIP_CODES = new Set([
  "HY", "Y", "KY", "SY", "KSY", "GSY", "KGY", "HKY", "K", "KKY", "DY", "D", "YKY"
]);
const MGM_SNOW_CODES = new Set(["HKY", "K", "KKY", "YKY"]);
const MGM_STORM_CODES = new Set(["GSY", "KGY", "DY", "D"]);

export interface CanonicalProvinceMgmMeta {
  readonly provinceCode: TrProvinceCode;
  readonly plateNumber: number;
  /** NFC-normalized exact province string expected by `servis.mgm.gov.tr/web/merkezler/ililcesi?il=...` */
  readonly mgmProvinceName: string;
  readonly primaryMerkezId: number;
  readonly primarySondurumIstNo: number;
  readonly primarySaatlikIstNo: number;
  readonly primaryGunlukIstNo: number;
  readonly defaultElevationM: number;
  readonly isCoastalOrMajorLake: boolean;
}

function nfc(val: string): string {
  return val.normalize("NFC");
}

/**
 * Complete 81-Province Plate -> Canonical NFC MGM Province Registry.
 * Verified directly against `https://servis.mgm.gov.tr/web/merkezler/iller` + GLO-90 DEM fixes.
 */
export const TR_PROVINCE_MGM_REGISTRY: Readonly<Record<TrProvinceCode, CanonicalProvinceMgmMeta>> =
  Object.freeze({
    "TR-01": { provinceCode: "TR-01", plateNumber: 1, mgmProvinceName: nfc("Adana"), primaryMerkezId: 90101, primarySondurumIstNo: 19272, primarySaatlikIstNo: 17352, primaryGunlukIstNo: 90101, defaultElevationM: 20, isCoastalOrMajorLake: true },
    "TR-02": { provinceCode: "TR-02", plateNumber: 2, mgmProvinceName: nfc("Adıyaman"), primaryMerkezId: 90201, primarySondurumIstNo: 17265, primarySaatlikIstNo: 17265, primaryGunlukIstNo: 90201, defaultElevationM: 672, isCoastalOrMajorLake: false },
    "TR-03": { provinceCode: "TR-03", plateNumber: 3, mgmProvinceName: nfc("Afyonkarahisar"), primaryMerkezId: 90301, primarySondurumIstNo: 17190, primarySaatlikIstNo: 17190, primaryGunlukIstNo: 90301, defaultElevationM: 1034, isCoastalOrMajorLake: false },
    "TR-04": { provinceCode: "TR-04", plateNumber: 4, mgmProvinceName: nfc("Ağrı"), primaryMerkezId: 90401, primarySondurumIstNo: 17099, primarySaatlikIstNo: 17099, primaryGunlukIstNo: 90401, defaultElevationM: 1646, isCoastalOrMajorLake: false },
    "TR-05": { provinceCode: "TR-05", plateNumber: 5, mgmProvinceName: nfc("Amasya"), primaryMerkezId: 90501, primarySondurumIstNo: 17085, primarySaatlikIstNo: 17085, primaryGunlukIstNo: 90501, defaultElevationM: 409, isCoastalOrMajorLake: false },
    "TR-06": { provinceCode: "TR-06", plateNumber: 6, mgmProvinceName: nfc("Ankara"), primaryMerkezId: 90601, primarySondurumIstNo: 17130, primarySaatlikIstNo: 17130, primaryGunlukIstNo: 90601, defaultElevationM: 891, isCoastalOrMajorLake: false },
    "TR-07": { provinceCode: "TR-07", plateNumber: 7, mgmProvinceName: nfc("Antalya"), primaryMerkezId: 90701, primarySondurumIstNo: 17302, primarySaatlikIstNo: 17302, primaryGunlukIstNo: 90701, defaultElevationM: 47, isCoastalOrMajorLake: true },
    "TR-08": { provinceCode: "TR-08", plateNumber: 8, mgmProvinceName: nfc("Artvin"), primaryMerkezId: 90801, primarySondurumIstNo: 17045, primarySaatlikIstNo: 17045, primaryGunlukIstNo: 90801, defaultElevationM: 613, isCoastalOrMajorLake: true },
    "TR-09": { provinceCode: "TR-09", plateNumber: 9, mgmProvinceName: nfc("Aydın"), primaryMerkezId: 90901, primarySondurumIstNo: 17234, primarySaatlikIstNo: 17234, primaryGunlukIstNo: 90901, defaultElevationM: 56, isCoastalOrMajorLake: true },
    "TR-10": { provinceCode: "TR-10", plateNumber: 10, mgmProvinceName: nfc("Balıkesir"), primaryMerkezId: 91001, primarySondurumIstNo: 18433, primarySaatlikIstNo: 17150, primaryGunlukIstNo: 91001, defaultElevationM: 110, isCoastalOrMajorLake: true },
    "TR-11": { provinceCode: "TR-11", plateNumber: 11, mgmProvinceName: nfc("Bilecik"), primaryMerkezId: 91101, primarySondurumIstNo: 17120, primarySaatlikIstNo: 17120, primaryGunlukIstNo: 91101, defaultElevationM: 539, isCoastalOrMajorLake: false },
    "TR-12": { provinceCode: "TR-12", plateNumber: 12, mgmProvinceName: nfc("Bingöl"), primaryMerkezId: 91201, primarySondurumIstNo: 17203, primarySaatlikIstNo: 17203, primaryGunlukIstNo: 91201, defaultElevationM: 1139, isCoastalOrMajorLake: false },
    "TR-13": { provinceCode: "TR-13", plateNumber: 13, mgmProvinceName: nfc("Bitlis"), primaryMerkezId: 91301, primarySondurumIstNo: 17208, primarySaatlikIstNo: 17208, primaryGunlukIstNo: 91301, defaultElevationM: 1789, isCoastalOrMajorLake: true },
    "TR-14": { provinceCode: "TR-14", plateNumber: 14, mgmProvinceName: nfc("Bolu"), primaryMerkezId: 91401, primarySondurumIstNo: 17070, primarySaatlikIstNo: 17070, primaryGunlukIstNo: 91401, defaultElevationM: 743, isCoastalOrMajorLake: false },
    "TR-15": { provinceCode: "TR-15", plateNumber: 15, mgmProvinceName: nfc("Burdur"), primaryMerkezId: 91501, primarySondurumIstNo: 17238, primarySaatlikIstNo: 17238, primaryGunlukIstNo: 91501, defaultElevationM: 957, isCoastalOrMajorLake: false },
    "TR-16": { provinceCode: "TR-16", plateNumber: 16, mgmProvinceName: nfc("Bursa"), primaryMerkezId: 91601, primarySondurumIstNo: 17116, primarySaatlikIstNo: 17116, primaryGunlukIstNo: 91601, defaultElevationM: 100, isCoastalOrMajorLake: true },
    "TR-17": { provinceCode: "TR-17", plateNumber: 17, mgmProvinceName: nfc("Çanakkale"), primaryMerkezId: 91701, primarySondurumIstNo: 17112, primarySaatlikIstNo: 17112, primaryGunlukIstNo: 91701, defaultElevationM: 6, isCoastalOrMajorLake: true },
    "TR-18": { provinceCode: "TR-18", plateNumber: 18, mgmProvinceName: nfc("Çankırı"), primaryMerkezId: 91801, primarySondurumIstNo: 17080, primarySaatlikIstNo: 17080, primaryGunlukIstNo: 91801, defaultElevationM: 755, isCoastalOrMajorLake: false },
    "TR-19": { provinceCode: "TR-19", plateNumber: 19, mgmProvinceName: nfc("Çorum"), primaryMerkezId: 91901, primarySondurumIstNo: 17084, primarySaatlikIstNo: 17084, primaryGunlukIstNo: 91901, defaultElevationM: 776, isCoastalOrMajorLake: false },
    "TR-20": { provinceCode: "TR-20", plateNumber: 20, mgmProvinceName: nfc("Denizli"), primaryMerkezId: 92001, primarySondurumIstNo: 17237, primarySaatlikIstNo: 17237, primaryGunlukIstNo: 92001, defaultElevationM: 425, isCoastalOrMajorLake: false },
    "TR-21": { provinceCode: "TR-21", plateNumber: 21, mgmProvinceName: nfc("Diyarbakır"), primaryMerkezId: 92101, primarySondurumIstNo: 17281, primarySaatlikIstNo: 17280, primaryGunlukIstNo: 92101, defaultElevationM: 674, isCoastalOrMajorLake: false },
    "TR-22": { provinceCode: "TR-22", plateNumber: 22, mgmProvinceName: nfc("Edirne"), primaryMerkezId: 92201, primarySondurumIstNo: 17050, primarySaatlikIstNo: 17050, primaryGunlukIstNo: 92201, defaultElevationM: 51, isCoastalOrMajorLake: true },
    "TR-23": { provinceCode: "TR-23", plateNumber: 23, mgmProvinceName: nfc("Elazığ"), primaryMerkezId: 92301, primarySondurumIstNo: 17201, primarySaatlikIstNo: 17201, primaryGunlukIstNo: 92301, defaultElevationM: 881, isCoastalOrMajorLake: false },
    "TR-24": { provinceCode: "TR-24", plateNumber: 24, mgmProvinceName: nfc("Erzincan"), primaryMerkezId: 92401, primarySondurumIstNo: 17094, primarySaatlikIstNo: 17094, primaryGunlukIstNo: 92401, defaultElevationM: 1216, isCoastalOrMajorLake: false },
    "TR-25": { provinceCode: "TR-25", plateNumber: 25, mgmProvinceName: nfc("Erzurum"), primaryMerkezId: 92501, primarySondurumIstNo: 17095, primarySaatlikIstNo: 17095, primaryGunlukIstNo: 92501, defaultElevationM: 1860, isCoastalOrMajorLake: false },
    "TR-26": { provinceCode: "TR-26", plateNumber: 26, mgmProvinceName: nfc("Eskişehir"), primaryMerkezId: 92601, primarySondurumIstNo: 17126, primarySaatlikIstNo: 17126, primaryGunlukIstNo: 92601, defaultElevationM: 801, isCoastalOrMajorLake: false },
    "TR-27": { provinceCode: "TR-27", plateNumber: 27, mgmProvinceName: nfc("Gaziantep"), primaryMerkezId: 92701, primarySondurumIstNo: 17261, primarySaatlikIstNo: 17261, primaryGunlukIstNo: 92701, defaultElevationM: 700, isCoastalOrMajorLake: false },
    "TR-28": { provinceCode: "TR-28", plateNumber: 28, mgmProvinceName: nfc("Giresun"), primaryMerkezId: 92801, primarySondurumIstNo: 17034, primarySaatlikIstNo: 17034, primaryGunlukIstNo: 92801, defaultElevationM: 38, isCoastalOrMajorLake: true },
    "TR-29": { provinceCode: "TR-29", plateNumber: 29, mgmProvinceName: nfc("Gümüşhane"), primaryMerkezId: 92901, primarySondurumIstNo: 17088, primarySaatlikIstNo: 17088, primaryGunlukIstNo: 92901, defaultElevationM: 1216, isCoastalOrMajorLake: false },
    "TR-30": { provinceCode: "TR-30", plateNumber: 30, mgmProvinceName: nfc("Hakkari"), primaryMerkezId: 93001, primarySondurumIstNo: 17285, primarySaatlikIstNo: 17285, primaryGunlukIstNo: 93001, defaultElevationM: 1727, isCoastalOrMajorLake: false },
    "TR-31": { provinceCode: "TR-31", plateNumber: 31, mgmProvinceName: nfc("Hatay"), primaryMerkezId: 93101, primarySondurumIstNo: 17372, primarySaatlikIstNo: 17372, primaryGunlukIstNo: 93101, defaultElevationM: 82, isCoastalOrMajorLake: true },
    "TR-32": { provinceCode: "TR-32", plateNumber: 32, mgmProvinceName: nfc("Isparta"), primaryMerkezId: 93201, primarySondurumIstNo: 17240, primarySaatlikIstNo: 17240, primaryGunlukIstNo: 93201, defaultElevationM: 997, isCoastalOrMajorLake: false },
    "TR-33": { provinceCode: "TR-33", plateNumber: 33, mgmProvinceName: nfc("Mersin"), primaryMerkezId: 93301, primarySondurumIstNo: 17340, primarySaatlikIstNo: 17340, primaryGunlukIstNo: 93301, defaultElevationM: 7, isCoastalOrMajorLake: true },
    "TR-34": { provinceCode: "TR-34", plateNumber: 34, mgmProvinceName: nfc("İstanbul"), primaryMerkezId: 93401, primarySondurumIstNo: 17060, primarySaatlikIstNo: 17060, primaryGunlukIstNo: 93401, defaultElevationM: 33, isCoastalOrMajorLake: true },
    "TR-35": { provinceCode: "TR-35", plateNumber: 35, mgmProvinceName: nfc("İzmir"), primaryMerkezId: 93501, primarySondurumIstNo: 17220, primarySaatlikIstNo: 17220, primaryGunlukIstNo: 93501, defaultElevationM: 29, isCoastalOrMajorLake: true },
    "TR-36": { provinceCode: "TR-36", plateNumber: 36, mgmProvinceName: nfc("Kars"), primaryMerkezId: 93601, primarySondurumIstNo: 17097, primarySaatlikIstNo: 17097, primaryGunlukIstNo: 93601, defaultElevationM: 1795, isCoastalOrMajorLake: false },
    "TR-37": { provinceCode: "TR-37", plateNumber: 37, mgmProvinceName: nfc("Kastamonu"), primaryMerkezId: 93701, primarySondurumIstNo: 17074, primarySaatlikIstNo: 17074, primaryGunlukIstNo: 93701, defaultElevationM: 800, isCoastalOrMajorLake: true },
    "TR-38": { provinceCode: "TR-38", plateNumber: 38, mgmProvinceName: nfc("Kayseri"), primaryMerkezId: 93802, primarySondurumIstNo: 17196, primarySaatlikIstNo: 17196, primaryGunlukIstNo: 93801, defaultElevationM: 1094, isCoastalOrMajorLake: false },
    "TR-39": { provinceCode: "TR-39", plateNumber: 39, mgmProvinceName: nfc("Kırklareli"), primaryMerkezId: 93901, primarySondurumIstNo: 17052, primarySaatlikIstNo: 17052, primaryGunlukIstNo: 93901, defaultElevationM: 232, isCoastalOrMajorLake: true },
    "TR-40": { provinceCode: "TR-40", plateNumber: 40, mgmProvinceName: nfc("Kırşehir"), primaryMerkezId: 94001, primarySondurumIstNo: 17160, primarySaatlikIstNo: 17160, primaryGunlukIstNo: 94001, defaultElevationM: 1007, isCoastalOrMajorLake: false },
    "TR-41": { provinceCode: "TR-41", plateNumber: 41, mgmProvinceName: nfc("Kocaeli"), primaryMerkezId: 94101, primarySondurumIstNo: 17066, primarySaatlikIstNo: 17066, primaryGunlukIstNo: 94101, defaultElevationM: 60, isCoastalOrMajorLake: true },
    "TR-42": { provinceCode: "TR-42", plateNumber: 42, mgmProvinceName: nfc("Konya"), primaryMerkezId: 94201, primarySondurumIstNo: 17245, primarySaatlikIstNo: 17245, primaryGunlukIstNo: 94201, defaultElevationM: 1029, isCoastalOrMajorLake: false },
    "TR-43": { provinceCode: "TR-43", plateNumber: 43, mgmProvinceName: nfc("Kütahya"), primaryMerkezId: 94301, primarySondurumIstNo: 17155, primarySaatlikIstNo: 17155, primaryGunlukIstNo: 94301, defaultElevationM: 969, isCoastalOrMajorLake: false },
    "TR-44": { provinceCode: "TR-44", plateNumber: 44, mgmProvinceName: nfc("Malatya"), primaryMerkezId: 94401, primarySondurumIstNo: 17199, primarySaatlikIstNo: 17197, primaryGunlukIstNo: 94401, defaultElevationM: 950, isCoastalOrMajorLake: false },
    "TR-45": { provinceCode: "TR-45", plateNumber: 45, mgmProvinceName: nfc("Manisa"), primaryMerkezId: 94508, primarySondurumIstNo: 17186, primarySaatlikIstNo: 17186, primaryGunlukIstNo: 94501, defaultElevationM: 71, isCoastalOrMajorLake: false },
    "TR-46": { provinceCode: "TR-46", plateNumber: 46, mgmProvinceName: nfc("Kahramanmaraş"), primaryMerkezId: 94601, primarySondurumIstNo: 17255, primarySaatlikIstNo: 17255, primaryGunlukIstNo: 94601, defaultElevationM: 581, isCoastalOrMajorLake: false },
    "TR-47": { provinceCode: "TR-47", plateNumber: 47, mgmProvinceName: nfc("Mardin"), primaryMerkezId: 94711, primarySondurumIstNo: 17275, primarySaatlikIstNo: 17275, primaryGunlukIstNo: 94701, defaultElevationM: 1040, isCoastalOrMajorLake: false },
    "TR-48": { provinceCode: "TR-48", plateNumber: 48, mgmProvinceName: nfc("Muğla"), primaryMerkezId: 94801, primarySondurumIstNo: 17292, primarySaatlikIstNo: 17292, primaryGunlukIstNo: 94801, defaultElevationM: 646, isCoastalOrMajorLake: true },
    "TR-49": { provinceCode: "TR-49", plateNumber: 49, mgmProvinceName: nfc("Muş"), primaryMerkezId: 94901, primarySondurumIstNo: 17204, primarySaatlikIstNo: 17204, primaryGunlukIstNo: 94901, defaultElevationM: 1316, isCoastalOrMajorLake: false },
    "TR-50": { provinceCode: "TR-50", plateNumber: 50, mgmProvinceName: nfc("Nevşehir"), primaryMerkezId: 95001, primarySondurumIstNo: 17193, primarySaatlikIstNo: 17193, primaryGunlukIstNo: 95001, defaultElevationM: 1260, isCoastalOrMajorLake: false },
    "TR-51": { provinceCode: "TR-51", plateNumber: 51, mgmProvinceName: nfc("Niğde"), primaryMerkezId: 95101, primarySondurumIstNo: 17250, primarySaatlikIstNo: 17250, primaryGunlukIstNo: 95101, defaultElevationM: 1211, isCoastalOrMajorLake: false },
    "TR-52": { provinceCode: "TR-52", plateNumber: 52, mgmProvinceName: nfc("Ordu"), primaryMerkezId: 95201, primarySondurumIstNo: 17033, primarySaatlikIstNo: 17033, primaryGunlukIstNo: 95201, defaultElevationM: 5, isCoastalOrMajorLake: true },
    "TR-53": { provinceCode: "TR-53", plateNumber: 53, mgmProvinceName: nfc("Rize"), primaryMerkezId: 95301, primarySondurumIstNo: 17040, primarySaatlikIstNo: 17040, primaryGunlukIstNo: 95301, defaultElevationM: 8, isCoastalOrMajorLake: true },
    "TR-54": { provinceCode: "TR-54", plateNumber: 54, mgmProvinceName: nfc("Sakarya"), primaryMerkezId: 95401, primarySondurumIstNo: 17069, primarySaatlikIstNo: 17069, primaryGunlukIstNo: 95401, defaultElevationM: 30, isCoastalOrMajorLake: true },
    "TR-55": { provinceCode: "TR-55", plateNumber: 55, mgmProvinceName: nfc("Samsun"), primaryMerkezId: 95501, primarySondurumIstNo: 17030, primarySaatlikIstNo: 17030, primaryGunlukIstNo: 95501, defaultElevationM: 4, isCoastalOrMajorLake: true },
    "TR-56": { provinceCode: "TR-56", plateNumber: 56, mgmProvinceName: nfc("Siirt"), primaryMerkezId: 95601, primarySondurumIstNo: 17210, primarySaatlikIstNo: 17210, primaryGunlukIstNo: 95601, defaultElevationM: 895, isCoastalOrMajorLake: false },
    "TR-57": { provinceCode: "TR-57", plateNumber: 57, mgmProvinceName: nfc("Sinop"), primaryMerkezId: 95701, primarySondurumIstNo: 17026, primarySaatlikIstNo: 17026, primaryGunlukIstNo: 95701, defaultElevationM: 29, isCoastalOrMajorLake: true },
    "TR-58": { provinceCode: "TR-58", plateNumber: 58, mgmProvinceName: nfc("Sivas"), primaryMerkezId: 95801, primarySondurumIstNo: 17090, primarySaatlikIstNo: 17090, primaryGunlukIstNo: 95801, defaultElevationM: 1294, isCoastalOrMajorLake: false },
    "TR-59": { provinceCode: "TR-59", plateNumber: 59, mgmProvinceName: nfc("Tekirdağ"), primaryMerkezId: 95901, primarySondurumIstNo: 17056, primarySaatlikIstNo: 17056, primaryGunlukIstNo: 95901, defaultElevationM: 4, isCoastalOrMajorLake: true },
    "TR-60": { provinceCode: "TR-60", plateNumber: 60, mgmProvinceName: nfc("Tokat"), primaryMerkezId: 96001, primarySondurumIstNo: 17086, primarySaatlikIstNo: 17086, primaryGunlukIstNo: 96001, defaultElevationM: 611, isCoastalOrMajorLake: false },
    "TR-61": { provinceCode: "TR-61", plateNumber: 61, mgmProvinceName: nfc("Trabzon"), primaryMerkezId: 96101, primarySondurumIstNo: 17037, primarySaatlikIstNo: 17038, primaryGunlukIstNo: 96101, defaultElevationM: 39, isCoastalOrMajorLake: true },
    "TR-62": { provinceCode: "TR-62", plateNumber: 62, mgmProvinceName: nfc("Tunceli"), primaryMerkezId: 96201, primarySondurumIstNo: 17165, primarySaatlikIstNo: 17165, primaryGunlukIstNo: 96201, defaultElevationM: 981, isCoastalOrMajorLake: false },
    "TR-63": { provinceCode: "TR-63", plateNumber: 63, mgmProvinceName: nfc("Şanlıurfa"), primaryMerkezId: 96301, primarySondurumIstNo: 17270, primarySaatlikIstNo: 17270, primaryGunlukIstNo: 96301, defaultElevationM: 550, isCoastalOrMajorLake: false },
    "TR-64": { provinceCode: "TR-64", plateNumber: 64, mgmProvinceName: nfc("Uşak"), primaryMerkezId: 96401, primarySondurumIstNo: 17188, primarySaatlikIstNo: 17188, primaryGunlukIstNo: 96401, defaultElevationM: 919, isCoastalOrMajorLake: false },
    "TR-65": { provinceCode: "TR-65", plateNumber: 65, mgmProvinceName: nfc("Van"), primaryMerkezId: 96501, primarySondurumIstNo: 17172, primarySaatlikIstNo: 17170, primaryGunlukIstNo: 96501, defaultElevationM: 1675, isCoastalOrMajorLake: true },
    "TR-66": { provinceCode: "TR-66", plateNumber: 66, mgmProvinceName: nfc("Yozgat"), primaryMerkezId: 96601, primarySondurumIstNo: 17140, primarySaatlikIstNo: 17140, primaryGunlukIstNo: 96601, defaultElevationM: 1301, isCoastalOrMajorLake: false },
    "TR-67": { provinceCode: "TR-67", plateNumber: 67, mgmProvinceName: nfc("Zonguldak"), primaryMerkezId: 96701, primarySondurumIstNo: 17022, primarySaatlikIstNo: 17022, primaryGunlukIstNo: 96701, defaultElevationM: 135, isCoastalOrMajorLake: true },
    "TR-68": { provinceCode: "TR-68", plateNumber: 68, mgmProvinceName: nfc("Aksaray"), primaryMerkezId: 96801, primarySondurumIstNo: 17192, primarySaatlikIstNo: 17192, primaryGunlukIstNo: 96801, defaultElevationM: 970, isCoastalOrMajorLake: false },
    "TR-69": { provinceCode: "TR-69", plateNumber: 69, mgmProvinceName: nfc("Bayburt"), primaryMerkezId: 96901, primarySondurumIstNo: 17089, primarySaatlikIstNo: 17089, primaryGunlukIstNo: 96901, defaultElevationM: 1584, isCoastalOrMajorLake: false },
    "TR-70": { provinceCode: "TR-70", plateNumber: 70, mgmProvinceName: nfc("Karaman"), primaryMerkezId: 97001, primarySondurumIstNo: 17246, primarySaatlikIstNo: 17246, primaryGunlukIstNo: 97001, defaultElevationM: 1018, isCoastalOrMajorLake: false },
    "TR-71": { provinceCode: "TR-71", plateNumber: 71, mgmProvinceName: nfc("Kırıkkale"), primaryMerkezId: 97101, primarySondurumIstNo: 17135, primarySaatlikIstNo: 17135, primaryGunlukIstNo: 97101, defaultElevationM: 751, isCoastalOrMajorLake: false },
    "TR-72": { provinceCode: "TR-72", plateNumber: 72, mgmProvinceName: nfc("Batman"), primaryMerkezId: 97201, primarySondurumIstNo: 17282, primarySaatlikIstNo: 17282, primaryGunlukIstNo: 97201, defaultElevationM: 610, isCoastalOrMajorLake: false },
    "TR-73": { provinceCode: "TR-73", plateNumber: 73, mgmProvinceName: nfc("Şırnak"), primaryMerkezId: 97301, primarySondurumIstNo: 17287, primarySaatlikIstNo: 17287, primaryGunlukIstNo: 97301, defaultElevationM: 1350, isCoastalOrMajorLake: false },
    "TR-74": { provinceCode: "TR-74", plateNumber: 74, mgmProvinceName: nfc("Bartın"), primaryMerkezId: 97401, primarySondurumIstNo: 17020, primarySaatlikIstNo: 17020, primaryGunlukIstNo: 97401, defaultElevationM: 33, isCoastalOrMajorLake: true },
    "TR-75": { provinceCode: "TR-75", plateNumber: 75, mgmProvinceName: nfc("Ardahan"), primaryMerkezId: 97501, primarySondurumIstNo: 17046, primarySaatlikIstNo: 17046, primaryGunlukIstNo: 97501, defaultElevationM: 1827, isCoastalOrMajorLake: false },
    "TR-76": { provinceCode: "TR-76", plateNumber: 76, mgmProvinceName: nfc("Iğdır"), primaryMerkezId: 97601, primarySondurumIstNo: 17100, primarySaatlikIstNo: 17100, primaryGunlukIstNo: 97601, defaultElevationM: 856, isCoastalOrMajorLake: false },
    "TR-77": { provinceCode: "TR-77", plateNumber: 77, mgmProvinceName: nfc("Yalova"), primaryMerkezId: 97701, primarySondurumIstNo: 17119, primarySaatlikIstNo: 17119, primaryGunlukIstNo: 97701, defaultElevationM: 4, isCoastalOrMajorLake: true },
    "TR-78": { provinceCode: "TR-78", plateNumber: 78, mgmProvinceName: nfc("Karabük"), primaryMerkezId: 97801, primarySondurumIstNo: 17078, primarySaatlikIstNo: 17077, primaryGunlukIstNo: 97801, defaultElevationM: 485, isCoastalOrMajorLake: false },
    "TR-79": { provinceCode: "TR-79", plateNumber: 79, mgmProvinceName: nfc("Kilis"), primaryMerkezId: 97901, primarySondurumIstNo: 17262, primarySaatlikIstNo: 17262, primaryGunlukIstNo: 97901, defaultElevationM: 640, isCoastalOrMajorLake: false },
    "TR-80": { provinceCode: "TR-80", plateNumber: 80, mgmProvinceName: nfc("Osmaniye"), primaryMerkezId: 98001, primarySondurumIstNo: 17355, primarySaatlikIstNo: 17355, primaryGunlukIstNo: 98001, defaultElevationM: 94, isCoastalOrMajorLake: false },
    "TR-81": { provinceCode: "TR-81", plateNumber: 81, mgmProvinceName: nfc("Düzce"), primaryMerkezId: 98101, primarySondurumIstNo: 17072, primarySaatlikIstNo: 17072, primaryGunlukIstNo: 98101, defaultElevationM: 146, isCoastalOrMajorLake: true }
  });

/**
 * Empirically audited Cross-Province Proxy `sondurumIstNo` map across all 1,085 MGM centers.
 * Maps `istNo` -> true physical owner `TrProvinceCode`.
 * Blocks Trabzon/Şalpazarı (18559 -> TR-28 Giresun), Rize/İyidere (17775 -> TR-61 Trabzon),
 * and Giresun/Çanakçı (18223 -> TR-61 Trabzon) from leaking across province borders.
 */
export const KNOWN_CROSS_PROVINCE_STATION_OWNERS: Readonly<Record<number, TrProvinceCode>> =
  Object.freeze({
    18559: "TR-28", // Giresun / Eynesil (Ören Beldesi) — borrowed as proxy by Trabzon / Şalpazarı
    17775: "TR-61", // Trabzon / Of (Fidanlık) — borrowed as proxy by Rize / İyidere
    18223: "TR-61"  // Trabzon / Arsin — borrowed as proxy by Giresun / Çanakçı
  });

/**
 * Built-in GLO-90 DEM elevation fixes for MGM centers where `yukseklik` erroneously returns `0`
 * (prevents 4°C to 7.6°C hydrostatic vertical transport errors even without external DEM hooks).
 */
export const BUILTIN_MGM_ZERO_ELEVATION_DEM_M: Readonly<Record<number, number>> = Object.freeze({
  // Keyed by sondurumIstNo
  19359: 429,  // Denizli / Merkezefendi
  17123: 787,  // Eskişehir / Tepebaşı (Hasan Polatkan)
  19375: 676,  // Diyarbakır / Kayapınar
  19916: 671,  // Diyarbakır / Yenişehir
  17270: 548,  // Şanlıurfa / Haliliye
  19341: 548,  // Şanlıurfa / Karaköprü
  19184: 78,   // Osmaniye / Sumbas
  17255: 581,  // Kahramanmaraş / Merkez
  18279: 1117, // Kahramanmaraş / Çağlayancerit
  19269: 1193, // Siirt / Tillo
  17066: 60,   // Kocaeli / İzmit
  17040: 8,    // Rize / Merkez
  17026: 29,   // Sinop / Merkez
  // Keyed by merkezId as secondary fallback
  92020: 429,
  92615: 787,
  92115: 676,
  92117: 671,
  96312: 548,
  96313: 548,
  98006: 78,
  94601: 581,
  94609: 1117,
  95602: 1193,
  94101: 60,
  95301: 8,
  95701: 29
});

export const DEFAULT_NATIONAL_QC_BOUNDS: RegionalQcAndMosBounds = Object.freeze({
  minPlausibleTempC: -50,
  maxPlausibleTempC: 53,
  minPlausibleMslpHpa: 950,
  maxPlausibleMslpHpa: 1070,
  kalmanTempBiasCapC: 6.5
});

export function normalizeTrAsciiKey(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/i\u0307/gi, "i")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[âä]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/[ûü]/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

const NORMALIZED_NAME_TO_PROVINCE_CODE: ReadonlyMap<string, TrProvinceCode> = (() => {
  const m = new Map<string, TrProvinceCode>();
  for (const meta of Object.values(TR_PROVINCE_MGM_REGISTRY)) {
    m.set(normalizeTrAsciiKey(meta.mgmProvinceName), meta.provinceCode);
  }
  m.set("icel", "TR-33");
  m.set("afyon", "TR-03");
  m.set("maras", "TR-46");
  m.set("urfa", "TR-63");
  m.set("antep", "TR-27");
  return m;
})();

const PLATE_TO_PROVINCE_CODE: ReadonlyMap<number, TrProvinceCode> = (() => {
  const m = new Map<number, TrProvinceCode>();
  for (const meta of Object.values(TR_PROVINCE_MGM_REGISTRY)) {
    m.set(meta.plateNumber, meta.provinceCode);
  }
  return m;
})();

export function resolveProvinceCodeFromTrName(rawName: string | null | undefined): TrProvinceCode | null {
  if (!rawName || typeof rawName !== "string") return null;
  const key = normalizeTrAsciiKey(rawName);
  return NORMALIZED_NAME_TO_PROVINCE_CODE.get(key) ?? null;
}

export function resolveProvinceCodeFromPlate(plateNumber: number): TrProvinceCode | null {
  if (!Number.isInteger(plateNumber)) return null;
  return PLATE_TO_PROVINCE_CODE.get(plateNumber) ?? null;
}

export function resolveCanonicalMgmProvinceName(provinceCode: TrProvinceCode): string {
  assertNationalNonBursaProvince(provinceCode);
  return TR_PROVINCE_MGM_REGISTRY[provinceCode].mgmProvinceName.normalize("NFC");
}

export function assertNationalNonBursaProvince(provinceCode: TrProvinceCode): CanonicalProvinceMgmMeta {
  if (!isTrProvinceCode(provinceCode)) {
    throw new Error(`Invalid Turkish province code: ${String(provinceCode)}`);
  }
  if (provinceCode === "TR-16") {
    throw new Error(
      "TR-16 Bursa is sealed to lib/bursa-mesh.ts and forbidden in lib/provinces/mgm-national-live.ts"
    );
  }
  return TR_PROVINCE_MGM_REGISTRY[provinceCode];
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function computeMagnusDewPointC(tempC: number, rhPct: number): number {
  const clampedRh = Math.max(1, Math.min(100, rhPct));
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(clampedRh / 100) + (a * tempC) / (b + tempC);
  return (b * gamma) / (a - gamma);
}

function cleanMgmNumber(val: unknown): number | null {
  if (typeof val !== "number" || !Number.isFinite(val)) return null;
  if (val <= -9990) return null;
  return val;
}

async function mgmFetchJson<T>(url: string, timeoutMs = 5500): Promise<T | null> {
  const res = await globalThis.fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: { ...MGM_REQUIRED_HEADERS },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export type PointInProvinceHook = (
  lat: number,
  lon: number,
  provinceCode: TrProvinceCode
) => boolean;

export type DemElevationResolverHook = (
  istNo: number,
  merkezId: number,
  rawElevM: number,
  lat: number,
  lon: number
) => number;

export interface MgmNationalSnowStation {
  readonly istNo: number;
  readonly snowDepthCm: number;
  readonly observedAtIso: string;
  readonly stationName: string;
  readonly lat: number;
  readonly lon: number;
  readonly il: string;
  readonly ilce: string;
  readonly provinceCode: TrProvinceCode | null;
}

export interface MgmNationalMarineStation {
  readonly istNo: number;
  readonly waterTempC: number;
  readonly observedAtIso: string;
  readonly stationName: string;
  readonly lat: number;
  readonly lon: number;
  readonly il: string;
  readonly ilce: string;
  readonly provinceCode: TrProvinceCode | null;
}

export type VerticalStratumRole =
  | "basin_floor"
  | "coastal_or_gap"
  | "mid_slope"
  | "alpine_snow";

export interface VerifiedMgmProvinceCenter {
  readonly provinceCode: TrProvinceCode;
  readonly plateNumber: number;
  readonly merkezId: number;
  readonly sondurumIstNo: number;
  readonly gunlukTahminIstNo: number;
  readonly saatlikTahminIstNo: number | null;
  readonly il: string;
  readonly ilce: string;
  readonly lat: number;
  readonly lon: number;
  readonly elevationM: number;
  readonly rawElevationM: number;
  readonly priority: number;
  readonly isPrimaryCenter: boolean;
  readonly isIntraProvinceBorrowed: boolean;
  readonly stratumRole: VerticalStratumRole;
  readonly zone: ProvinceZoneKind;
  readonly subBasinId: string;
  readonly urbanFraction: number;
  readonly coldPoolSusceptibility: number;
  readonly sourceKind: "MGM_ILILCESI" | "MGM_KAR_OMGI";
  readonly preReportedSnowDepthCm: number | null;
}

export type OwnershipRejectReason =
  | "BURSA_VAULT_SEALED"
  | "MISSING_IDENTIFIERS"
  | "PLATE_MISMATCH"
  | "PROVINCE_NAME_MISMATCH"
  | "KNOWN_CROSS_PROVINCE_PROXY"
  | "ACIKLAMA_CROSS_PROVINCE_PROXY"
  | "OUTSIDE_PROVINCE_POLYGON";

export interface OwnershipVerificationResult {
  readonly accepted: boolean;
  readonly isIntraProvinceBorrowed: boolean;
  readonly rejectReason?: OwnershipRejectReason;
}

export type NationalQcFlag =
  | "OK"
  | "MISSING_TEMP"
  | "GROSS_LIMIT_REJECT"
  | "STALE_OBSERVATION"
  | "SOLAR_RADIATION_SPIKE"
  | "SPATIAL_BUDDY_OUTLIER"
  | "SPATIAL_BUDDY_SOFT_CLIP"
  | "RURAL_BASIN_ISOLATED";

export type NationalBoundaryLayerState =
  | "STRONG_INVERSION"
  | "SHALLOW_INVERSION"
  | "FOEHN_MIXED"
  | "MOIST_OROGRAPHIC"
  | "STANDARD_MIXED";

export interface NationalRawObservation {
  readonly station: VerifiedMgmProvinceCenter;
  readonly observedAtIso: string;
  readonly tempC: number | null;
  readonly apparentTempC: number | null;
  readonly dewPointC: number | null;
  readonly relHumidityPct: number | null;
  readonly pressureMslHpa: number | null;
  readonly pressureStationHpa: number | null;
  readonly windSpeedKt: number | null;
  readonly windDirDeg: number | null;
  readonly precip10MinMm: number | null;
  readonly precip1HrMm: number | null;
  readonly precip24HrMm: number | null;
  readonly precipToday00Mm: number | null;
  readonly visibilityM: number | null;
  readonly snowDepthCm: number | null;
  readonly seaTempC: number | null;
  readonly isPrecipitating: boolean;
  readonly wxCodeRaw?: string;
  readonly tier: 1 | 2 | 3;
  readonly hasTenthDegreePrecision: boolean;
  readonly source: "MGM_10MIN" | "MGM_KAR_OMGI";
}

export interface NationalQcObservation extends NationalRawObservation {
  readonly ageMinutes: number;
  readonly freshnessWeight: number;
  readonly qcWeight: number;
  readonly qcFlags: readonly NationalQcFlag[];
  readonly reducedTempAtRefC: number | null;
  readonly madZScore: number | null;
}

export interface NationalVerticalProfile {
  readonly baseFloorElevationM: number;
  readonly lowerKnotM: number;
  readonly upperKnotM: number;
  readonly lapseRateCPerKm: number;
  readonly lowerLapseCPerKm: number;
  readonly midLapseCPerKm: number;
  readonly upperLapseCPerKm: number;
  readonly inversionStrengthC: number;
  readonly boundaryLayerState: NationalBoundaryLayerState;
  readonly floorRefTempC: number | null;
  readonly mountainRefTempC: number | null;
  readonly measuredPairCount: number;
  readonly isDirectlyMeasured: boolean;
}

export interface NationalProvinceMeshSnapshot {
  readonly provinceCode: TrProvinceCode;
  readonly provinceName: string;
  readonly fetchedAtIso: string;
  readonly selectedStationIds: readonly number[];
  readonly stations: readonly NationalQcObservation[];
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly marineStations: readonly MgmNationalMarineStation[];
  readonly nearestWaterTempC: number | null;
  readonly verticalProfile: NationalVerticalProfile;
}

export interface MgmNationalHourlyStep {
  readonly utcHourKey: string; // "YYYY-MM-DDTHH:00"
  readonly tempC: number;
  readonly apparentTempC: number;
  readonly rhPct: number;
  readonly windDirDeg: number;
  readonly windSpeedKmh: number;
  readonly windGustKmh: number;
  readonly isWet: boolean;
  readonly isSnow: boolean;
  readonly isStorm: boolean;
  readonly wxCode: string;
}

export interface MgmNationalDailyDistrictDay {
  readonly dateYmd: string;
  readonly dayOffset: number;
  readonly tempMinC: number;
  readonly tempMaxC: number;
  readonly rhMinPct: number | null;
  readonly rhMaxPct: number | null;
  readonly windSpeedKmh: number | null;
  readonly windDirDeg: number | null;
  readonly wxCode: string;
  readonly isWet: boolean;
  readonly deltaMinVsPrimaryC: number;
  readonly deltaMaxVsPrimaryC: number;
}

export interface MgmProvinceForecastBundle {
  readonly provinceCode: TrProvinceCode;
  readonly fetchedAtIso: string;
  readonly targetDistrict: string;
  readonly saatlikIstNo: number;
  readonly targetGunlukIstNo: number;
  readonly primaryGunlukIstNo: number;
  readonly hourlyAlaro: ReadonlyMap<string, MgmNationalHourlyStep>;
  readonly dailyDistrict: ReadonlyMap<string, MgmNationalDailyDistrictDay>;
  readonly todayObservedMinC: number | null;
  readonly todayObservedMaxC: number | null;
}

export interface ProvinceMgmQueryOptions {
  readonly nowMs?: number;
  readonly timeoutMs?: number;
  readonly targetLat?: number;
  readonly targetLon?: number;
  readonly targetElevationM?: number;
  readonly pointInProvinceFn?: PointInProvinceHook;
  readonly demElevationResolver?: DemElevationResolverHook;
  readonly stationOverrides?: Readonly<Record<string, ProvinceStationOverride>>;
  readonly qcBounds?: RegionalQcAndMosBounds;
  readonly solarRadiationWm2?: number;
  readonly isNight?: boolean;
  readonly cloudCoverPct?: number;
  readonly wind850DirDeg?: number;
  readonly wind850SpeedKt?: number;
}

// ============================================================================
// Global & Per-Province Isolated Singleflight State
// ============================================================================

let cachedSnowSnapshot: {
  expiresAtMs: number;
  rows: readonly MgmNationalSnowStation[];
} | null = null;
let inFlightSnowPromise: Promise<readonly MgmNationalSnowStation[]> | null = null;

let cachedMarineSnapshot: {
  expiresAtMs: number;
  rows: readonly MgmNationalMarineStation[];
} | null = null;
let inFlightMarinePromise: Promise<readonly MgmNationalMarineStation[]> | null = null;

const cachedProvinceCenters = new Map<
  TrProvinceCode,
  { expiresAtMs: number; centers: readonly VerifiedMgmProvinceCenter[] }
>();
const inFlightProvinceCenters = new Map<
  TrProvinceCode,
  Promise<readonly VerifiedMgmProvinceCenter[]>
>();

const cachedStationObservations = new Map<
  number,
  { expiresAtMs: number; row: Record<string, unknown> | null }
>();
const inFlightStationObservations = new Map<
  number,
  Promise<Record<string, unknown> | null>
>();

const cachedProvinceMeshes = new Map<
  string,
  { expiresAtMs: number; snapshot: NationalProvinceMeshSnapshot }
>();
const inFlightProvinceMeshes = new Map<
  string,
  Promise<NationalProvinceMeshSnapshot>
>();

const cachedProvinceForecasts = new Map<
  string,
  { expiresAtMs: number; bundle: MgmProvinceForecastBundle }
>();
const inFlightProvinceForecasts = new Map<
  string,
  Promise<MgmProvinceForecastBundle | null>
>();

export function resetMgmNationalCachesForTests(): void {
  cachedSnowSnapshot = null;
  inFlightSnowPromise = null;
  cachedMarineSnapshot = null;
  inFlightMarinePromise = null;
  cachedProvinceCenters.clear();
  inFlightProvinceCenters.clear();
  cachedStationObservations.clear();
  inFlightStationObservations.clear();
  cachedProvinceMeshes.clear();
  inFlightProvinceMeshes.clear();
  cachedProvinceForecasts.clear();
  inFlightProvinceForecasts.clear();
}

function cloneSnowStations(rows: readonly MgmNationalSnowStation[]): MgmNationalSnowStation[] {
  return rows.map((r) => Object.freeze({ ...r }));
}

function cloneMarineStations(rows: readonly MgmNationalMarineStation[]): MgmNationalMarineStation[] {
  return rows.map((r) => Object.freeze({ ...r }));
}

function cloneVerifiedCenters(
  centers: readonly VerifiedMgmProvinceCenter[]
): VerifiedMgmProvinceCenter[] {
  return centers.map((c) => Object.freeze({ ...c }));
}

function cloneMeshSnapshot(snap: NationalProvinceMeshSnapshot): NationalProvinceMeshSnapshot {
  return Object.freeze({
    ...snap,
    selectedStationIds: Object.freeze([...snap.selectedStationIds]),
    stations: Object.freeze(
      snap.stations.map((s) =>
        Object.freeze({
          ...s,
          station: Object.freeze({ ...s.station }),
          qcFlags: Object.freeze([...s.qcFlags])
        })
      )
    ),
    marineStations: Object.freeze(cloneMarineStations(snap.marineStations)),
    verticalProfile: Object.freeze({ ...snap.verticalProfile })
  });
}

function cloneForecastBundle(bundle: MgmProvinceForecastBundle): MgmProvinceForecastBundle {
  const hourlyCopy = new Map<string, MgmNationalHourlyStep>();
  for (const [k, v] of bundle.hourlyAlaro.entries()) {
    hourlyCopy.set(k, Object.freeze({ ...v }));
  }
  const dailyCopy = new Map<string, MgmNationalDailyDistrictDay>();
  for (const [k, v] of bundle.dailyDistrict.entries()) {
    dailyCopy.set(k, Object.freeze({ ...v }));
  }
  return Object.freeze({
    ...bundle,
    hourlyAlaro: hourlyCopy,
    dailyDistrict: dailyCopy
  });
}

// ============================================================================
// 1. Global Singleflight `/sondurumlar/kar` & `/sondurumlar/denizler` (TTL = 8m)
// ============================================================================

export async function fetchNationalMgmSnowStations(opts?: {
  nowMs?: number;
  timeoutMs?: number;
}): Promise<ReadonlyArray<MgmNationalSnowStation>> {
  const nowMs = opts?.nowMs ?? Date.now();
  if (cachedSnowSnapshot && cachedSnowSnapshot.expiresAtMs > nowMs) {
    return Object.freeze(cloneSnowStations(cachedSnowSnapshot.rows));
  }

  if (!inFlightSnowPromise) {
    const timeoutMs = opts?.timeoutMs ?? 5500;
    inFlightSnowPromise = (async (): Promise<readonly MgmNationalSnowStation[]> => {
      try {
        const raw = await mgmFetchJson<Array<Record<string, unknown>>>(
          "https://servis.mgm.gov.tr/web/sondurumlar/kar",
          timeoutMs
        );
        if (!Array.isArray(raw)) {
          return cachedSnowSnapshot?.rows ?? Object.freeze([]);
        }
        const parsed: MgmNationalSnowStation[] = [];
        for (const r of raw) {
          const istNo = Number(r.istNo);
          const snowDepthCm = cleanMgmNumber(r.karYukseklik);
          const lat = Number(r.enlem);
          const lon = Number(r.boylam);
          if (
            !Number.isFinite(istNo) ||
            istNo <= 0 ||
            snowDepthCm === null ||
            snowDepthCm < 0 ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lon)
          ) {
            continue;
          }
          const il = typeof r.il === "string" ? r.il.normalize("NFC").trim() : "";
          const ilce = typeof r.ilce === "string" ? r.ilce.normalize("NFC").trim() : "";
          const stationName =
            typeof r.istAd === "string"
              ? r.istAd.normalize("NFC").trim()
              : `${il} ${ilce}`.trim();
          const observedAtIso =
            typeof r.veriZamani === "string" ? r.veriZamani : new Date(nowMs).toISOString();

          parsed.push(
            Object.freeze({
              istNo,
              snowDepthCm,
              observedAtIso,
              stationName,
              lat,
              lon,
              il,
              ilce,
              provinceCode: resolveProvinceCodeFromTrName(il)
            })
          );
        }
        const frozen = Object.freeze(parsed);
        cachedSnowSnapshot = {
          expiresAtMs: (opts?.nowMs ?? Date.now()) + SNOW_MARINE_CACHE_TTL_MS,
          rows: frozen
        };
        return frozen;
      } catch {
        return cachedSnowSnapshot?.rows ?? Object.freeze([]);
      } finally {
        inFlightSnowPromise = null;
      }
    })();
  }

  const resolved = await inFlightSnowPromise;
  return Object.freeze(cloneSnowStations(resolved));
}

export async function fetchNationalMgmMarineStations(opts?: {
  nowMs?: number;
  timeoutMs?: number;
}): Promise<ReadonlyArray<MgmNationalMarineStation>> {
  const nowMs = opts?.nowMs ?? Date.now();
  if (cachedMarineSnapshot && cachedMarineSnapshot.expiresAtMs > nowMs) {
    return Object.freeze(cloneMarineStations(cachedMarineSnapshot.rows));
  }

  if (!inFlightMarinePromise) {
    const timeoutMs = opts?.timeoutMs ?? 5500;
    inFlightMarinePromise = (async (): Promise<readonly MgmNationalMarineStation[]> => {
      try {
        const raw = await mgmFetchJson<Array<Record<string, unknown>>>(
          "https://servis.mgm.gov.tr/web/sondurumlar/denizler",
          timeoutMs
        );
        if (!Array.isArray(raw)) {
          return cachedMarineSnapshot?.rows ?? Object.freeze([]);
        }
        const parsed: MgmNationalMarineStation[] = [];
        for (const r of raw) {
          const istNo = Number(r.istNo);
          const waterTempC = cleanMgmNumber(r.denizSicaklik);
          const lat = Number(r.enlem);
          const lon = Number(r.boylam);
          if (
            !Number.isFinite(istNo) ||
            istNo <= 0 ||
            waterTempC === null ||
            waterTempC < -4 ||
            waterTempC > 40 ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lon)
          ) {
            continue;
          }
          const il = typeof r.il === "string" ? r.il.normalize("NFC").trim() : "";
          const ilce = typeof r.ilce === "string" ? r.ilce.normalize("NFC").trim() : "";
          const stationName =
            typeof r.istAd === "string"
              ? r.istAd.normalize("NFC").trim()
              : `${il} ${ilce}`.trim();
          const observedAtIso =
            typeof r.denizVeriZamani === "string"
              ? r.denizVeriZamani
              : new Date(nowMs).toISOString();

          parsed.push(
            Object.freeze({
              istNo,
              waterTempC,
              observedAtIso,
              stationName,
              lat,
              lon,
              il,
              ilce,
              provinceCode: resolveProvinceCodeFromTrName(il)
            })
          );
        }
        const frozen = Object.freeze(parsed);
        cachedMarineSnapshot = {
          expiresAtMs: (opts?.nowMs ?? Date.now()) + SNOW_MARINE_CACHE_TTL_MS,
          rows: frozen
        };
        return frozen;
      } catch {
        return cachedMarineSnapshot?.rows ?? Object.freeze([]);
      } finally {
        inFlightMarinePromise = null;
      }
    })();
  }

  const resolved = await inFlightMarinePromise;
  return Object.freeze(cloneMarineStations(resolved));
}

// ============================================================================
// 2. 3-Gate Station Ownership Firewall (`verifyMgmStationOwnership`)
// ============================================================================

export function verifyMgmStationOwnership(params: {
  targetProvinceCode: TrProvinceCode;
  rawIlPlaka?: unknown;
  rawIl?: unknown;
  sondurumIstNo: number;
  aciklama?: unknown;
  lat: number;
  lon: number;
  pointInProvinceFn?: PointInProvinceHook;
}): OwnershipVerificationResult {
  if (params.targetProvinceCode === "TR-16") {
    return { accepted: false, isIntraProvinceBorrowed: false, rejectReason: "BURSA_VAULT_SEALED" };
  }
  const targetMeta = TR_PROVINCE_MGM_REGISTRY[params.targetProvinceCode];
  if (
    !targetMeta ||
    !Number.isFinite(params.sondurumIstNo) ||
    params.sondurumIstNo <= 0 ||
    !Number.isFinite(params.lat) ||
    !Number.isFinite(params.lon)
  ) {
    return { accepted: false, isIntraProvinceBorrowed: false, rejectReason: "MISSING_IDENTIFIERS" };
  }

  // Gate 1: Mandatory ilPlaka & province-name check
  if (params.rawIlPlaka !== undefined && params.rawIlPlaka !== null) {
    if (Number(params.rawIlPlaka) !== targetMeta.plateNumber) {
      return { accepted: false, isIntraProvinceBorrowed: false, rejectReason: "PLATE_MISMATCH" };
    }
  }
  if (typeof params.rawIl === "string" && params.rawIl.trim().length > 0) {
    const resolvedFromName = resolveProvinceCodeFromTrName(params.rawIl);
    if (resolvedFromName !== params.targetProvinceCode) {
      return {
        accepted: false,
        isIntraProvinceBorrowed: false,
        rejectReason: "PROVINCE_NAME_MISMATCH"
      };
    }
  }

  // Gate 2A: Empirically known cross-province proxy stations (18559, 17775, 18223)
  const knownOwner = KNOWN_CROSS_PROVINCE_STATION_OWNERS[params.sondurumIstNo];
  if (knownOwner && knownOwner !== params.targetProvinceCode) {
    return {
      accepted: false,
      isIntraProvinceBorrowed: false,
      rejectReason: "KNOWN_CROSS_PROVINCE_PROXY"
    };
  }

  // Gate 2B: Dynamic `aciklama` proxy text inspection
  let isIntraProvinceBorrowed = false;
  if (typeof params.aciklama === "string" && params.aciklama.trim().length > 0) {
    const note = params.aciklama.normalize("NFC");
    const noteAscii = normalizeTrAsciiKey(note);
    const isProxyNote =
      noteAscii.includes("almaktadir") ||
      noteAscii.includes("istasyonundan") ||
      noteAscii.includes("merkezinden");

    if (isProxyNote) {
      isIntraProvinceBorrowed = true;
      for (const other of Object.values(TR_PROVINCE_MGM_REGISTRY)) {
        if (other.provinceCode === params.targetProvinceCode) continue;
        const otherKey = normalizeTrAsciiKey(other.mgmProvinceName);
        if (otherKey.length >= 3) {
          const tokenRegex = new RegExp(
            `(^|[^a-zçğıöşü])${other.mgmProvinceName.toLocaleLowerCase("tr-TR")}([^a-zçğıöşü]|$)`,
            "i"
          );
          if (tokenRegex.test(note.toLocaleLowerCase("tr-TR")) || noteAscii.includes(`${otherKey}/`)) {
            return {
              accepted: false,
              isIntraProvinceBorrowed: true,
              rejectReason: "ACIKLAMA_CROSS_PROVINCE_PROXY"
            };
          }
        }
      }
      // Catch district-only cross-border references like "OF/Fidanlık" inside Rize (TR-53)
      if (
        params.targetProvinceCode === "TR-53" &&
        /\bof\s*\//i.test(note)
      ) {
        return {
          accepted: false,
          isIntraProvinceBorrowed: true,
          rejectReason: "ACIKLAMA_CROSS_PROVINCE_PROXY"
        };
      }
    }
  }

  // Gate 3: Optional strict geometric Point-in-Polygon hook
  if (params.pointInProvinceFn) {
    if (!params.pointInProvinceFn(params.lat, params.lon, params.targetProvinceCode)) {
      return {
        accepted: false,
        isIntraProvinceBorrowed,
        rejectReason: "OUTSIDE_PROVINCE_POLYGON"
      };
    }
  }

  return {
    accepted: true,
    isIntraProvinceBorrowed
  };
}

function sanitizeStationElevationM(params: {
  provinceMeta: CanonicalProvinceMgmMeta;
  sondurumIstNo: number;
  merkezId: number;
  rawElevationM: number;
  lat: number;
  lon: number;
  ilce: string;
  demElevationResolver?: DemElevationResolverHook;
  override?: ProvinceStationOverride;
}): number {
  if (params.override && Number.isFinite(params.override.demElevationM)) {
    return Math.round(params.override.demElevationM);
  }
  if (params.demElevationResolver) {
    const resolved = params.demElevationResolver(
      params.sondurumIstNo,
      params.merkezId,
      params.rawElevationM,
      params.lat,
      params.lon
    );
    if (Number.isFinite(resolved) && resolved >= 0) {
      return Math.round(resolved);
    }
  }

  const builtinFix =
    BUILTIN_MGM_ZERO_ELEVATION_DEM_M[params.sondurumIstNo] ??
    BUILTIN_MGM_ZERO_ELEVATION_DEM_M[params.merkezId];
  if (builtinFix !== undefined && params.rawElevationM <= 2) {
    return builtinFix;
  }

  if (Number.isFinite(params.rawElevationM) && params.rawElevationM > 0) {
    return Math.round(params.rawElevationM);
  }

  // Inland province with broken yukseklik <= 0 fallback
  if (!params.provinceMeta.isCoastalOrMajorLake) {
    return params.provinceMeta.defaultElevationM;
  }
  return Math.max(0, Math.round(params.rawElevationM || 0));
}

function inferStationRoleAndZone(params: {
  provinceMeta: CanonicalProvinceMgmMeta;
  ilce: string;
  elevationM: number;
  baseFloorElevM: number;
  isPrimaryCenter: boolean;
  sourceKind: "MGM_ILILCESI" | "MGM_KAR_OMGI";
  override?: ProvinceStationOverride;
}): {
  stratumRole: VerticalStratumRole;
  zone: ProvinceZoneKind;
  subBasinId: string;
  urbanFraction: number;
  coldPoolSusceptibility: number;
} {
  const nameUpper = params.ilce.toLocaleUpperCase("tr-TR");
  const relElevM = params.elevationM - params.baseFloorElevM;
  const isSummitOrSkiName = /KAYAK|ZİRVE|ZIRVE|DAĞ|DAGI|YAYLA|GEÇİT|GECIT|TEPE/i.test(nameUpper);
  const isCoastalOrGapName =
    /LİMAN|LIMAN|FENER|İSKELE|ISKELE|SAHİL|SAHIL|BOĞAZ|BOGAZ|ADALAR|ADA|KÖRFEZ|KORFEZ|HAVALİMAN|HAVALIMAN|MEYDAN/i.test(
      nameUpper
    );

  let stratumRole: VerticalStratumRole = "basin_floor";
  if (params.override?.verticalStratumRole) {
    stratumRole = params.override.verticalStratumRole;
  } else if (
    params.sourceKind === "MGM_KAR_OMGI" ||
    isSummitOrSkiName ||
    relElevM >= 1200 ||
    params.elevationM >= 2150
  ) {
    stratumRole = "alpine_snow";
  } else if (relElevM >= 400 && relElevM < 1200) {
    stratumRole = "mid_slope";
  } else if (
    isCoastalOrGapName ||
    (params.provinceMeta.isCoastalOrMajorLake &&
      params.elevationM <= 45 &&
      !params.isPrimaryCenter)
  ) {
    stratumRole = "coastal_or_gap";
  }

  let zone: ProvinceZoneKind = "urban_plain";
  if (stratumRole === "alpine_snow") {
    zone = "alpine_summit";
  } else if (stratumRole === "mid_slope") {
    zone = "mountain_slope";
  } else if (
    params.provinceMeta.isCoastalOrMajorLake &&
    params.elevationM <= 65 &&
    !/HAVALİMAN|HAVALIMAN/.test(nameUpper)
  ) {
    zone = "coastal_marine";
  } else if (/HAVALİMAN|HAVALIMAN|OVA/.test(nameUpper) && !params.isPrimaryCenter) {
    zone = "rural_closed_basin";
  } else if (params.elevationM >= 850) {
    zone = "high_plateau";
  } else if (relElevM >= 120) {
    zone = "urban_foothill";
  }

  const subBasinId =
    params.override?.subBasinId ??
    `${params.provinceMeta.provinceCode}_${stratumRole.toUpperCase()}`;
  const urbanFraction =
    params.override?.urbanFraction ??
    (params.isPrimaryCenter
      ? 0.78
      : stratumRole === "alpine_snow"
        ? 0.05
        : stratumRole === "mid_slope"
          ? 0.16
          : zone === "rural_closed_basin"
            ? 0.12
            : 0.45);
  const coldPoolSusceptibility =
    params.override?.coldPoolSusceptibility ??
    (zone === "rural_closed_basin"
      ? 0.78
      : stratumRole === "alpine_snow" || stratumRole === "mid_slope"
        ? 0.08
        : stratumRole === "coastal_or_gap"
          ? 0.12
          : 0.30);

  return {
    stratumRole,
    zone,
    subBasinId,
    urbanFraction,
    coldPoolSusceptibility
  };
}

function computePercentile(sortedNums: readonly number[], p: number): number {
  if (sortedNums.length === 0) return 0;
  const idx = Math.min(
    sortedNums.length - 1,
    Math.max(0, Math.floor((sortedNums.length - 1) * p))
  );
  return sortedNums[idx];
}

// ============================================================================
// 3. Per-Province 12h `ililcesi` Registry + Deduplication (`getProvinceMgmCenters`)
// ============================================================================

export async function getProvinceMgmCenters(
  provinceCode: TrProvinceCode,
  opts?: ProvinceMgmQueryOptions
): Promise<ReadonlyArray<VerifiedMgmProvinceCenter>> {
  const provinceMeta = assertNationalNonBursaProvince(provinceCode);
  const nowMs = opts?.nowMs ?? Date.now();
  const hasCustomGeoHooks = Boolean(
    opts?.pointInProvinceFn || opts?.demElevationResolver || opts?.stationOverrides
  );

  if (!hasCustomGeoHooks) {
    const hit = cachedProvinceCenters.get(provinceCode);
    if (hit && hit.expiresAtMs > nowMs) {
      return Object.freeze(cloneVerifiedCenters(hit.centers));
    }
  }

  const runFetch = async (): Promise<readonly VerifiedMgmProvinceCenter[]> => {
    const timeoutMs = opts?.timeoutMs ?? 5500;
    const canonicalIl = resolveCanonicalMgmProvinceName(provinceCode);
    const url = `https://servis.mgm.gov.tr/web/merkezler/ililcesi?il=${encodeURIComponent(canonicalIl)}`;

    let rawCenters: Array<Record<string, unknown>> | null = null;
    try {
      rawCenters = await mgmFetchJson<Array<Record<string, unknown>>>(url, timeoutMs);
    } catch {
      rawCenters = null;
    }

    interface CandidateRawCenter {
      merkezId: number;
      sondurumIstNo: number;
      gunlukTahminIstNo: number;
      saatlikTahminIstNo: number | null;
      il: string;
      ilce: string;
      lat: number;
      lon: number;
      rawElevationM: number;
      sanitizedElevM: number;
      priority: number;
      isPrimaryCenter: boolean;
      isIntraProvinceBorrowed: boolean;
      override?: ProvinceStationOverride;
    }

    const validCandidates: CandidateRawCenter[] = [];

    if (Array.isArray(rawCenters)) {
      for (const c of rawCenters) {
        const merkezId = Number(c.merkezId);
        const sondurumIstNo = Number(c.sondurumIstNo || c.saatlikTahminIstNo);
        const gunlukTahminIstNo = Number(c.gunlukTahminIstNo || merkezId);
        const saatlikRaw = Number(c.saatlikTahminIstNo);
        const lat = Number(c.enlem);
        const lon = Number(c.boylam);
        const rawElevationM = Number(c.yukseklik ?? 0);
        const priority = Number(c.oncelik ?? 0);
        const il = typeof c.il === "string" ? c.il.normalize("NFC").trim() : canonicalIl;
        const ilce = typeof c.ilce === "string" ? c.ilce.normalize("NFC").trim() : "Merkez";

        if (!Number.isFinite(merkezId) || !Number.isFinite(sondurumIstNo) || sondurumIstNo <= 0) {
          continue;
        }

        const ownership = verifyMgmStationOwnership({
          targetProvinceCode: provinceCode,
          rawIlPlaka: c.ilPlaka,
          rawIl: il,
          sondurumIstNo,
          aciklama: c.aciklama,
          lat,
          lon,
          pointInProvinceFn: opts?.pointInProvinceFn
        });
        if (!ownership.accepted) continue;

        const override =
          opts?.stationOverrides?.[String(sondurumIstNo)] ??
          opts?.stationOverrides?.[String(merkezId)];
        const effLat = override?.lat ?? lat;
        const effLon = override?.lon ?? lon;

        const sanitizedElevM = sanitizeStationElevationM({
          provinceMeta,
          sondurumIstNo,
          merkezId,
          rawElevationM,
          lat: effLat,
          lon: effLon,
          ilce,
          demElevationResolver: opts?.demElevationResolver,
          override
        });

        const isPrimaryCenter =
          priority === 1 ||
          merkezId === provinceMeta.primaryMerkezId ||
          sondurumIstNo === provinceMeta.primarySondurumIstNo;

        validCandidates.push({
          merkezId,
          sondurumIstNo,
          gunlukTahminIstNo: Number.isFinite(gunlukTahminIstNo) ? gunlukTahminIstNo : merkezId,
          saatlikTahminIstNo:
            Number.isFinite(saatlikRaw) && saatlikRaw > 0 ? saatlikRaw : null,
          il,
          ilce: override?.nameTr ? override.nameTr.normalize("NFC") : ilce,
          lat: effLat,
          lon: effLon,
          rawElevationM,
          sanitizedElevM,
          priority,
          isPrimaryCenter,
          isIntraProvinceBorrowed: ownership.isIntraProvinceBorrowed,
          override
        });
      }
    }

    // Deduplicate intra-province shared `sondurumIstNo`: strictly prefer physical owner (!isIntraProvinceBorrowed),
    // primary center (`priority === 1`), and valid positive elevation!
    const bestByIstNo = new Map<number, CandidateRawCenter>();
    for (const cand of validCandidates) {
      const prev = bestByIstNo.get(cand.sondurumIstNo);
      if (!prev) {
        bestByIstNo.set(cand.sondurumIstNo, cand);
        continue;
      }
      const scoreCand =
        (cand.isIntraProvinceBorrowed ? 0 : 100) +
        (cand.isPrimaryCenter ? 50 : 0) +
        (cand.rawElevationM > 0 ? 20 : 0) +
        (cand.saatlikTahminIstNo !== null ? 5 : 0);
      const scorePrev =
        (prev.isIntraProvinceBorrowed ? 0 : 100) +
        (prev.isPrimaryCenter ? 50 : 0) +
        (prev.rawElevationM > 0 ? 20 : 0) +
        (prev.saatlikTahminIstNo !== null ? 5 : 0);
      if (scoreCand > scorePrev) {
        bestByIstNo.set(cand.sondurumIstNo, cand);
      } else if (prev.saatlikTahminIstNo === null && cand.saatlikTahminIstNo !== null) {
        bestByIstNo.set(cand.sondurumIstNo, {
          ...prev,
          saatlikTahminIstNo: cand.saatlikTahminIstNo
        });
      }
    }

    const dedupedList = Array.from(bestByIstNo.values());
    const sortedElevs = dedupedList
      .map((x) => x.sanitizedElevM)
      .sort((a, b) => a - b);
    const baseFloorElevM =
      sortedElevs.length > 0
        ? computePercentile(sortedElevs, 0.15)
        : provinceMeta.defaultElevationM;

    const finalized: VerifiedMgmProvinceCenter[] = dedupedList.map((c) => {
      const meta = inferStationRoleAndZone({
        provinceMeta,
        ilce: c.ilce,
        elevationM: c.sanitizedElevM,
        baseFloorElevM,
        isPrimaryCenter: c.isPrimaryCenter,
        sourceKind: "MGM_ILILCESI",
        override: c.override
      });
      return Object.freeze({
        provinceCode,
        plateNumber: provinceMeta.plateNumber,
        merkezId: c.merkezId,
        sondurumIstNo: c.sondurumIstNo,
        gunlukTahminIstNo: c.gunlukTahminIstNo,
        saatlikTahminIstNo: c.saatlikTahminIstNo,
        il: c.il,
        ilce: c.ilce,
        lat: c.lat,
        lon: c.lon,
        elevationM: c.sanitizedElevM,
        rawElevationM: c.rawElevationM,
        priority: c.priority,
        isPrimaryCenter: c.isPrimaryCenter,
        isIntraProvinceBorrowed: c.isIntraProvinceBorrowed,
        stratumRole: meta.stratumRole,
        zone: meta.zone,
        subBasinId: meta.subBasinId,
        urbanFraction: meta.urbanFraction,
        coldPoolSusceptibility: meta.coldPoolSusceptibility,
        sourceKind: "MGM_ILILCESI",
        preReportedSnowDepthCm: null
      });
    });

    const frozen = Object.freeze(finalized);
    if (!hasCustomGeoHooks && frozen.length > 0) {
      cachedProvinceCenters.set(provinceCode, {
        expiresAtMs: (opts?.nowMs ?? Date.now()) + PROVINCE_CENTERS_CACHE_TTL_MS,
        centers: frozen
      });
    }
    return frozen;
  };

  if (hasCustomGeoHooks) {
    const direct = await runFetch();
    return Object.freeze(cloneVerifiedCenters(direct));
  }

  let pending = inFlightProvinceCenters.get(provinceCode);
  if (!pending) {
    pending = runFetch().finally(() => {
      inFlightProvinceCenters.delete(provinceCode);
    });
    inFlightProvinceCenters.set(provinceCode, pending);
  }
  const res = await pending;
  return Object.freeze(cloneVerifiedCenters(res));
}

// ============================================================================
// 4. `5 + 3 + 2 + 2` Stratified Top-12 Smart Station Selector
// ============================================================================

export function selectStratifiedTop12Stations(params: {
  candidates: readonly VerifiedMgmProvinceCenter[];
  targetLat: number;
  targetLon: number;
  targetElevationM: number;
  maxTotal?: number;
}): VerifiedMgmProvinceCenter[] {
  const maxTotal = params.maxTotal ?? MAX_PROVINCE_FANOUT_STATIONS;
  if (params.candidates.length <= maxTotal) {
    return [...params.candidates];
  }

  const selectedIds = new Set<number>();
  const selected: VerifiedMgmProvinceCenter[] = [];

  const scoreDistElev = (c: VerifiedMgmProvinceCenter): number => {
    const dKm = haversineKm(params.targetLat, params.targetLon, c.lat, c.lon);
    const dElevPenKm = Math.abs(params.targetElevationM - c.elevationM) * 0.03;
    return dKm + dElevPenKm;
  };

  const addStation = (c: VerifiedMgmProvinceCenter | undefined): boolean => {
    if (!c || selected.length >= maxTotal || selectedIds.has(c.sondurumIstNo)) {
      return false;
    }
    selectedIds.add(c.sondurumIstNo);
    selected.push(c);
    return true;
  };

  const floorPool = params.candidates
    .filter((c) => c.stratumRole === "basin_floor")
    .sort((a, b) => scoreDistElev(a) - scoreDistElev(b));

  const coastalOrGapPool = params.candidates
    .filter((c) => c.stratumRole === "coastal_or_gap")
    .sort((a, b) => scoreDistElev(a) - scoreDistElev(b));

  const midSlopePool = params.candidates
    .filter((c) => c.stratumRole === "mid_slope")
    .sort(
      (a, b) =>
        haversineKm(params.targetLat, params.targetLon, a.lat, a.lon) -
        haversineKm(params.targetLat, params.targetLon, b.lat, b.lon)
    );

  // Alpine / snow OMGI pool: prioritize active snow-reporting stations & highest physical peaks!
  const alpinePool = params.candidates
    .filter((c) => c.stratumRole === "alpine_snow")
    .sort((a, b) => {
      const aSnow = (a.preReportedSnowDepthCm ?? 0) > 0 ? 1 : 0;
      const bSnow = (b.preReportedSnowDepthCm ?? 0) > 0 ? 1 : 0;
      if (bSnow !== aSnow) return bSnow - aSnow;
      if (Math.abs(b.elevationM - a.elevationM) >= 80) return b.elevationM - a.elevationM;
      return (
        haversineKm(params.targetLat, params.targetLon, a.lat, a.lon) -
        haversineKm(params.targetLat, params.targetLon, b.lat, b.lon)
      );
    });

  // Bucket 1 (Quota = 5): Canonical primary center + 4 nearest basin_floor / district stations
  const primary = params.candidates.find((c) => c.isPrimaryCenter);
  if (primary) addStation(primary);
  for (const c of floorPool) {
    if (selected.length >= 5) break;
    addStation(c);
  }

  // Bucket 2 (Quota = 3): Coastal / Gap / Sub-basin diversity stations
  let addedCoastal = 0;
  for (const c of coastalOrGapPool) {
    if (addedCoastal >= 3 || selected.length >= maxTotal) break;
    if (addStation(c)) addedCoastal++;
  }

  // Bucket 3 (Quota = 2): Mid-slope (400-1200m above floor) lapse anchors
  let addedMid = 0;
  for (const c of midSlopePool) {
    if (addedMid >= 2 || selected.length >= maxTotal) break;
    if (addStation(c)) addedMid++;
  }

  // Bucket 4 (Quota = 2): Highest Alpine / `/sondurumlar/kar` snow stations
  let addedAlpine = 0;
  for (const c of alpinePool) {
    if (addedAlpine >= 2 || selected.length >= maxTotal) break;
    if (addStation(c)) addedAlpine++;
  }
  // If fewer than 2 explicit `alpine_snow` stations exist, ensure top elevated stations in the province aren't dropped!
  if (addedAlpine < 2 && selected.length < maxTotal) {
    const byHighestElev = [...params.candidates].sort((a, b) => b.elevationM - a.elevationM);
    for (const hi of byHighestElev) {
      if (addedAlpine >= 2 || selected.length >= maxTotal) break;
      if (hi.elevationM >= params.targetElevationM + 300 && addStation(hi)) {
        addedAlpine++;
      }
    }
  }

  // Backfill remaining slots up to 12 with nearest unselected stations to target
  if (selected.length < maxTotal) {
    const remainingByProximity = [...params.candidates].sort(
      (a, b) => scoreDistElev(a) - scoreDistElev(b)
    );
    for (const rem of remainingByProximity) {
      if (selected.length >= maxTotal) break;
      addStation(rem);
    }
  }

  return selected;
}

// ============================================================================
// 5. Adaptive 3-Layer National Vertical Profile & Regional Observation QC
// ============================================================================

function medianSlopeBetween(
  lowGroup: readonly NationalRawObservation[],
  highGroup: readonly NationalRawObservation[],
  minDzKm: number,
  maxHorizDistKm = 65
): number | null {
  const slopes: number[] = [];
  for (const lo of lowGroup) {
    for (const hi of highGroup) {
      const dzKm = (hi.station.elevationM - lo.station.elevationM) / 1000;
      if (dzKm < minDzKm || lo.tempC === null || hi.tempC === null) continue;
      const dKm = haversineKm(lo.station.lat, lo.station.lon, hi.station.lat, hi.station.lon);
      if (dKm <= maxHorizDistKm) {
        slopes.push((hi.tempC - lo.tempC) / dzKm);
      }
    }
  }
  if (slopes.length === 0) return null;
  slopes.sort((a, b) => a - b);
  return Math.max(-11.0, Math.min(10.5, slopes[Math.floor(slopes.length / 2)]));
}

export function integrateNationalPiecewiseVerticalDeltaC(
  fromElevationM: number,
  toElevationM: number,
  profile: NationalVerticalProfile
): number {
  if (Math.abs(toElevationM - fromElevationM) < 0.5) return 0;
  const sign = toElevationM >= fromElevationM ? 1 : -1;
  const z0 = Math.min(fromElevationM, toElevationM);
  const z1 = Math.max(fromElevationM, toElevationM);

  const k1 = profile.lowerKnotM;
  const k2 = profile.upperKnotM;

  const segLowM = Math.max(0, Math.min(z1, k1) - Math.min(z0, k1));
  const segMidM = Math.max(0, Math.min(z1, k2) - Math.max(k1, Math.min(z0, k2)));
  const segHighM = Math.max(0, z1 - Math.max(k2, z0));

  return (
    sign *
    ((segLowM * profile.lowerLapseCPerKm +
      segMidM * profile.midLapseCPerKm +
      segHighM * profile.upperLapseCPerKm) /
      1000)
  );
}

export function computeNationalVerticalProfile(
  observations: readonly NationalRawObservation[],
  qcBounds: RegionalQcAndMosBounds = DEFAULT_NATIONAL_QC_BOUNDS,
  ambient?: {
    defaultFloorElevM?: number;
    isNight?: boolean;
    cloudCoverPct?: number;
    wind850DirDeg?: number;
    wind850SpeedKt?: number;
  }
): NationalVerticalProfile {
  const valid = observations.filter(
    (o) =>
      o.tier <= 2 &&
      o.tempC !== null &&
      o.tempC >= qcBounds.minPlausibleTempC &&
      o.tempC <= qcBounds.maxPlausibleTempC
  );

  const sortedElevs = valid.map((o) => o.station.elevationM).sort((a, b) => a - b);
  const baseFloorElevationM =
    sortedElevs.length > 0
      ? computePercentile(sortedElevs, 0.15)
      : ambient?.defaultFloorElevM ?? 100;
  const lowerKnotM = baseFloorElevationM + 400;
  const upperKnotM = baseFloorElevationM + 1150;

  const floorGroup = valid.filter((o) => o.station.elevationM <= lowerKnotM);
  const midGroup = valid.filter(
    (o) => o.station.elevationM > lowerKnotM && o.station.elevationM <= upperKnotM
  );
  const alpineGroup = valid.filter((o) => o.station.elevationM > upperKnotM);
  const upperCombined = valid.filter((o) => o.station.elevationM >= baseFloorElevationM + 350);

  if (floorGroup.length > 0 && upperCombined.length > 0) {
    const allSlopes: number[] = [];
    for (const lo of floorGroup) {
      for (const hi of upperCombined) {
        const dzKm = (hi.station.elevationM - lo.station.elevationM) / 1000;
        if (dzKm >= 0.25 && lo.tempC !== null && hi.tempC !== null) {
          allSlopes.push((hi.tempC - lo.tempC) / dzKm);
        }
      }
    }

    if (allSlopes.length > 0) {
      allSlopes.sort((a, b) => a - b);
      const lapseRateCPerKm = Math.max(
        -10.8,
        Math.min(10.0, allSlopes[Math.floor(allSlopes.length / 2)])
      );
      const lowerLapse =
        medianSlopeBetween(floorGroup, midGroup.length > 0 ? midGroup : upperCombined, 0.22, 75) ??
        lapseRateCPerKm;
      const midLapse =
        medianSlopeBetween(
          midGroup.length > 0 ? midGroup : floorGroup,
          alpineGroup.length > 0 ? alpineGroup : upperCombined,
          0.35,
          85
        ) ?? lapseRateCPerKm;
      const upperLapse =
        alpineGroup.length >= 2
          ? medianSlopeBetween(
              alpineGroup.slice(0, Math.ceil(alpineGroup.length / 2)),
              alpineGroup.slice(Math.floor(alpineGroup.length / 2)),
              0.18,
              90
            ) ?? midLapse
          : midLapse;

      const floorMean =
        floorGroup.reduce((acc, s) => acc + (s.tempC ?? 0), 0) / floorGroup.length;
      const mtnMean =
        upperCombined.reduce((acc, s) => acc + (s.tempC ?? 0), 0) / upperCombined.length;
      const inversionStrengthC = Math.max(0, mtnMean - floorMean);

      let boundaryLayerState: NationalBoundaryLayerState = "STANDARD_MIXED";
      if (lapseRateCPerKm >= 1.5 || lowerLapse >= 2.0 || inversionStrengthC >= 1.2) {
        boundaryLayerState = "STRONG_INVERSION";
      } else if (lapseRateCPerKm >= -1.8 || lowerLapse >= -0.8) {
        boundaryLayerState = "SHALLOW_INVERSION";
      } else if (lapseRateCPerKm <= -8.2) {
        boundaryLayerState = "FOEHN_MIXED";
      } else if (
        lapseRateCPerKm >= -5.6 &&
        floorGroup.some((s) => (s.relHumidityPct ?? 0) >= 85 || s.isPrecipitating)
      ) {
        boundaryLayerState = "MOIST_OROGRAPHIC";
      }

      return Object.freeze({
        baseFloorElevationM,
        lowerKnotM,
        upperKnotM,
        lapseRateCPerKm,
        lowerLapseCPerKm: lowerLapse,
        midLapseCPerKm: midLapse,
        upperLapseCPerKm: upperLapse,
        inversionStrengthC,
        boundaryLayerState,
        floorRefTempC: floorMean,
        mountainRefTempC: mtnMean,
        measuredPairCount: allSlopes.length,
        isDirectlyMeasured: true
      });
    }
  }

  const isNight = ambient?.isNight ?? false;
  const clouds = ambient?.cloudCoverPct ?? 40;
  const w850Kt = ambient?.wind850SpeedKt ?? 10;

  if (isNight && clouds < 35 && w850Kt < 12) {
    return Object.freeze({
      baseFloorElevationM,
      lowerKnotM,
      upperKnotM,
      lapseRateCPerKm: 2.0,
      lowerLapseCPerKm: 3.2,
      midLapseCPerKm: -4.6,
      upperLapseCPerKm: -6.1,
      inversionStrengthC: 1.6,
      boundaryLayerState: "SHALLOW_INVERSION",
      floorRefTempC: null,
      mountainRefTempC: null,
      measuredPairCount: 0,
      isDirectlyMeasured: false
    });
  }

  return Object.freeze({
    baseFloorElevationM,
    lowerKnotM,
    upperKnotM,
    lapseRateCPerKm: -6.2,
    lowerLapseCPerKm: -6.2,
    midLapseCPerKm: -6.2,
    upperLapseCPerKm: -6.4,
    inversionStrengthC: 0,
    boundaryLayerState: "STANDARD_MIXED",
    floorRefTempC: null,
    mountainRefTempC: null,
    measuredPairCount: 0,
    isDirectlyMeasured: false
  });
}

function weightedMedian(items: ReadonlyArray<{ value: number; weight: number }>): number {
  if (items.length === 0) return 0;
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const totalW = sorted.reduce((acc, x) => acc + x.weight, 0);
  let cumW = 0;
  for (const item of sorted) {
    cumW += item.weight;
    if (cumW >= totalW * 0.5) return item.value;
  }
  return sorted[sorted.length - 1].value;
}

export function runNationalObservationQC(
  rawObservations: readonly NationalRawObservation[],
  opts?: {
    nowMs?: number;
    referenceElevationM?: number;
    qcBounds?: RegionalQcAndMosBounds;
    solarRadiationWm2?: number;
    isNight?: boolean;
    cloudCoverPct?: number;
    wind850DirDeg?: number;
    wind850SpeedKt?: number;
  }
): {
  stations: NationalQcObservation[];
  verticalProfile: NationalVerticalProfile;
} {
  const nowMs = opts?.nowMs ?? Date.now();
  const qcBounds = opts?.qcBounds ?? DEFAULT_NATIONAL_QC_BOUNDS;
  const solarWm2 = opts?.solarRadiationWm2 ?? 0;

  const verticalProfile = computeNationalVerticalProfile(rawObservations, qcBounds, {
    defaultFloorElevM: opts?.referenceElevationM,
    isNight: opts?.isNight,
    cloudCoverPct: opts?.cloudCoverPct,
    wind850DirDeg: opts?.wind850DirDeg,
    wind850SpeedKt: opts?.wind850SpeedKt
  });

  const refElevM = opts?.referenceElevationM ?? verticalProfile.baseFloorElevationM;

  interface MutableQcObs {
    base: NationalRawObservation;
    ageMinutes: number;
    freshnessWeight: number;
    qcWeight: number;
    qcFlags: NationalQcFlag[];
    reducedTempAtRefC: number | null;
    madZScore: number | null;
  }

  const stage1: MutableQcObs[] = rawObservations.map((obs) => {
    const flags: NationalQcFlag[] = [];
    const obsMs = Date.parse(obs.observedAtIso);
    const ageMinutes = Number.isFinite(obsMs) ? Math.max(0, (nowMs - obsMs) / 60000) : 999;

    const maxAgeMin = obs.tier === 3 ? 45 : 120;
    const tauMin = obs.source === "MGM_10MIN" || obs.tier === 3 ? 28 : 55;
    const freshnessWeight = ageMinutes <= maxAgeMin ? Math.exp(-ageMinutes / tauMin) : 0;

    if (obs.tempC === null || !Number.isFinite(obs.tempC)) {
      return {
        base: obs,
        ageMinutes,
        freshnessWeight: 0,
        qcWeight: 0,
        qcFlags: ["MISSING_TEMP"],
        reducedTempAtRefC: null,
        madZScore: null
      };
    }

    if (ageMinutes > maxAgeMin) {
      flags.push("STALE_OBSERVATION");
    }

    // Regional bounds check (supports -48°C & 1068 hPa in Eastern Anatolia, +52°C in Southeast!)
    if (
      obs.tempC < qcBounds.minPlausibleTempC ||
      obs.tempC > qcBounds.maxPlausibleTempC ||
      (obs.relHumidityPct !== null && (obs.relHumidityPct < 1 || obs.relHumidityPct > 100)) ||
      (obs.pressureMslHpa !== null &&
        (obs.pressureMslHpa < qcBounds.minPlausibleMslpHpa ||
          obs.pressureMslHpa > qcBounds.maxPlausibleMslpHpa))
    ) {
      flags.push("GROSS_LIMIT_REJECT");
    }

    const reducedTempAtRefC =
      obs.tempC +
      integrateNationalPiecewiseVerticalDeltaC(obs.station.elevationM, refElevM, verticalProfile);

    const tierBaseWeight = obs.tier === 1 ? 1.0 : obs.tier === 2 ? 0.82 : 0.45;
    const precisionFactor = obs.hasTenthDegreePrecision ? 1.0 : 0.88;
    const initialOk = flags.length === 0;

    return {
      base: obs,
      ageMinutes,
      freshnessWeight,
      qcWeight: initialOk ? tierBaseWeight * precisionFactor * freshnessWeight : 0,
      qcFlags: initialOk ? [] : flags,
      reducedTempAtRefC,
      madZScore: null
    };
  });

  const nonFrostBasinPool = stage1.filter(
    (s) =>
      s.qcWeight > 0 &&
      s.reducedTempAtRefC !== null &&
      s.base.station.coldPoolSusceptibility < 0.72
  );
  const buddyPool =
    nonFrostBasinPool.length >= 2
      ? nonFrostBasinPool
      : stage1.filter((s) => s.qcWeight > 0 && s.reducedTempAtRefC !== null);

  if (buddyPool.length >= 2) {
    const refMedianC = weightedMedian(
      buddyPool.map((s) => ({
        value: s.reducedTempAtRefC as number,
        weight: s.base.tier <= 2 ? s.qcWeight * 2.5 : s.qcWeight
      }))
    );

    const absDevs = buddyPool.map((s) => ({
      value: Math.abs((s.reducedTempAtRefC as number) - refMedianC),
      weight: s.qcWeight
    }));
    const robustScaleC = Math.max(0.65, 1.4826 * weightedMedian(absDevs));

    for (const s of stage1) {
      if (s.qcWeight <= 0 || s.reducedTempAtRefC === null) continue;
      const diffC = s.reducedTempAtRefC - refMedianC;
      const zMad = diffC / robustScaleC;
      s.madZScore = zMad;

      const windMs = (s.base.windSpeedKt ?? 2.0) * 0.514444;
      if (
        s.base.tier === 3 &&
        !(opts?.isNight ?? false) &&
        solarWm2 >= 220 &&
        windMs < 3.0 &&
        diffC > 1.65
      ) {
        s.qcFlags.push("SOLAR_RADIATION_SPIKE");
        s.qcWeight = 0;
        continue;
      }

      if (s.base.station.coldPoolSusceptibility >= 0.72 && nonFrostBasinPool.length >= 1) {
        if (Math.abs(diffC) > 2.2) s.qcFlags.push("RURAL_BASIN_ISOLATED");
        if (s.qcFlags.length === 0) s.qcFlags.push("OK");
        continue;
      }

      const absZ = Math.abs(zMad);
      const hardThreshold = s.base.tier === 1 ? 4.5 : s.base.tier === 2 ? 3.8 : 2.8;
      const softThreshold = s.base.tier === 1 ? 3.0 : 2.2;

      if (absZ > hardThreshold) {
        s.qcFlags.push("SPATIAL_BUDDY_OUTLIER");
        s.qcWeight = 0;
      } else if (absZ > softThreshold) {
        s.qcFlags.push("SPATIAL_BUDDY_SOFT_CLIP");
        s.qcWeight *= softThreshold / absZ;
      } else {
        s.qcFlags.push("OK");
      }
    }
  } else {
    for (const s of stage1) {
      if (s.qcWeight > 0 && s.qcFlags.length === 0) {
        s.qcFlags.push("OK");
      }
    }
  }

  const finalized: NationalQcObservation[] = stage1.map((s) =>
    Object.freeze({
      ...s.base,
      ageMinutes: s.ageMinutes,
      freshnessWeight: s.freshnessWeight,
      qcWeight: s.qcWeight,
      qcFlags: Object.freeze([...s.qcFlags]),
      reducedTempAtRefC: s.reducedTempAtRefC,
      madZScore: s.madZScore
    })
  );

  return { stations: finalized, verticalProfile };
}

// ============================================================================
// 6. Per-Station Singleflight Fetcher & `fetchProvinceMgmMesh` (TTL = 5m)
// ============================================================================

async function fetchSingleMgmSondurumRow(
  istNo: number,
  nowMs: number,
  timeoutMs: number
): Promise<Record<string, unknown> | null> {
  const cached = cachedStationObservations.get(istNo);
  if (cached && cached.expiresAtMs > nowMs) {
    return cached.row ? { ...cached.row } : null;
  }

  let pending = inFlightStationObservations.get(istNo);
  if (!pending) {
    pending = (async (): Promise<Record<string, unknown> | null> => {
      try {
        const arr = await mgmFetchJson<Array<Record<string, unknown>>>(
          `https://servis.mgm.gov.tr/web/sondurumlar?istno=${istNo}`,
          timeoutMs
        );
        const row = Array.isArray(arr) && arr.length > 0 && arr[0] ? arr[0] : null;
        cachedStationObservations.set(istNo, {
          expiresAtMs: nowMs + PROVINCE_MESH_CACHE_TTL_MS,
          row: row ? Object.freeze({ ...row }) : null
        });
        return row;
      } catch {
        return null;
      } finally {
        inFlightStationObservations.delete(istNo);
      }
    })();
    inFlightStationObservations.set(istNo, pending);
  }

  const resolved = await pending;
  return resolved ? { ...resolved } : null;
}

function deriveHypsometricElevationM(
  stationPressureHpa: number | null,
  mslPressureHpa: number | null,
  tempC: number | null
): number | null {
  if (
    stationPressureHpa === null ||
    mslPressureHpa === null ||
    stationPressureHpa <= 400 ||
    mslPressureHpa <= stationPressureHpa
  ) {
    return null;
  }
  const tMeanK = (tempC ?? 8) + 273.15;
  const elev = (tMeanK / 0.0065) * ((mslPressureHpa / stationPressureHpa) ** 0.190263 - 1);
  return Number.isFinite(elev) && elev >= 0 && elev <= 4500 ? Math.round(elev) : null;
}

export async function fetchProvinceMgmMesh(
  provinceCode: TrProvinceCode,
  opts?: ProvinceMgmQueryOptions
): Promise<NationalProvinceMeshSnapshot> {
  const provinceMeta = assertNationalNonBursaProvince(provinceCode);
  const nowMs = opts?.nowMs ?? Date.now();
  const timeoutMs = opts?.timeoutMs ?? 5500;

  const latGrid =
    opts?.targetLat !== undefined ? (Math.round(opts.targetLat * 4) / 4).toFixed(2) : "CENTER";
  const lonGrid =
    opts?.targetLon !== undefined ? (Math.round(opts.targetLon * 4) / 4).toFixed(2) : "CENTER";
  const meshCacheKey = `${provinceCode}:${latGrid}:${lonGrid}`;

  const hasCustomHooks = Boolean(
    opts?.pointInProvinceFn || opts?.demElevationResolver || opts?.stationOverrides
  );

  if (!hasCustomHooks) {
    const hit = cachedProvinceMeshes.get(meshCacheKey);
    if (hit && hit.expiresAtMs > nowMs) {
      return cloneMeshSnapshot(hit.snapshot);
    }
  }

  const executeMeshPipeline = async (): Promise<NationalProvinceMeshSnapshot> => {
    const [ililcesiCenters, nationalSnow, nationalMarine] = await Promise.all([
      getProvinceMgmCenters(provinceCode, opts),
      fetchNationalMgmSnowStations({ nowMs, timeoutMs }),
      fetchNationalMgmMarineStations({ nowMs, timeoutMs })
    ]);

    // Determine target coordinates (defaults to canonical primary center if omitted)
    const primaryCenter =
      ililcesiCenters.find((c) => c.isPrimaryCenter) ?? ililcesiCenters[0];
    const targetLat = opts?.targetLat ?? primaryCenter?.lat ?? 39.0;
    const targetLon = opts?.targetLon ?? primaryCenter?.lon ?? 35.0;
    const targetElevationM =
      opts?.targetElevationM ?? primaryCenter?.elevationM ?? provinceMeta.defaultElevationM;

    // Filter national marine buoys strictly to target province
    const provinceMarine = nationalMarine.filter((m) => {
      if (m.provinceCode !== provinceCode) return false;
      const check = verifyMgmStationOwnership({
        targetProvinceCode: provinceCode,
        rawIl: m.il,
        sondurumIstNo: m.istNo,
        lat: m.lat,
        lon: m.lon,
        pointInProvinceFn: opts?.pointInProvinceFn
      });
      return check.accepted;
    });

    const marineWaterByIstNo = new Map<number, number>();
    for (const m of provinceMarine) {
      marineWaterByIstNo.set(m.istNo, m.waterTempC);
    }

    let nearestWaterTempC: number | null = null;
    if (provinceMarine.length > 0) {
      const sortedMarine = [...provinceMarine].sort(
        (a, b) =>
          haversineKm(targetLat, targetLon, a.lat, a.lon) -
          haversineKm(targetLat, targetLon, b.lat, b.lon)
      );
      nearestWaterTempC = sortedMarine[0].waterTempC;
    }

    // Merge province-verified `/sondurumlar/kar` high-mountain OMGI stations into candidate pool
    const byIstNo = new Map<number, VerifiedMgmProvinceCenter>();
    for (const c of ililcesiCenters) {
      byIstNo.set(c.sondurumIstNo, c);
    }

    const maxCenterElevM = ililcesiCenters.reduce(
      (mx, c) => Math.max(mx, c.elevationM),
      provinceMeta.defaultElevationM
    );

    for (const snowSt of nationalSnow) {
      if (snowSt.provinceCode !== provinceCode) continue;
      const ownership = verifyMgmStationOwnership({
        targetProvinceCode: provinceCode,
        rawIl: snowSt.il,
        sondurumIstNo: snowSt.istNo,
        lat: snowSt.lat,
        lon: snowSt.lon,
        pointInProvinceFn: opts?.pointInProvinceFn
      });
      if (!ownership.accepted) continue;

      const existing = byIstNo.get(snowSt.istNo);
      if (existing) {
        byIstNo.set(
          snowSt.istNo,
          Object.freeze({
            ...existing,
            preReportedSnowDepthCm: snowSt.snowDepthCm,
            stratumRole:
              existing.elevationM >= provinceMeta.defaultElevationM + 500
                ? "alpine_snow"
                : existing.stratumRole
          })
        );
      } else {
        const override = opts?.stationOverrides?.[String(snowSt.istNo)];
        const fallbackAlpineElev = Math.max(
          provinceMeta.defaultElevationM + 750,
          Math.min(2850, maxCenterElevM + 200)
        );
        const resolvedElev = override?.demElevationM
          ? Math.round(override.demElevationM)
          : opts?.demElevationResolver
            ? Math.round(
                opts.demElevationResolver(
                  snowSt.istNo,
                  snowSt.istNo,
                  fallbackAlpineElev,
                  snowSt.lat,
                  snowSt.lon
                )
              )
            : fallbackAlpineElev;

        byIstNo.set(
          snowSt.istNo,
          Object.freeze({
            provinceCode,
            plateNumber: provinceMeta.plateNumber,
            merkezId: snowSt.istNo,
            sondurumIstNo: snowSt.istNo,
            gunlukTahminIstNo: provinceMeta.primaryGunlukIstNo,
            saatlikTahminIstNo: null,
            il: snowSt.il,
            ilce: snowSt.stationName,
            lat: override?.lat ?? snowSt.lat,
            lon: override?.lon ?? snowSt.lon,
            elevationM: resolvedElev,
            rawElevationM: resolvedElev,
            priority: 0,
            isPrimaryCenter: false,
            isIntraProvinceBorrowed: false,
            stratumRole: "alpine_snow",
            zone: "alpine_summit",
            subBasinId: override?.subBasinId ?? `${provinceCode}_ALPINE_SNOW`,
            urbanFraction: override?.urbanFraction ?? 0.04,
            coldPoolSusceptibility: override?.coldPoolSusceptibility ?? 0.05,
            sourceKind: "MGM_KAR_OMGI",
            preReportedSnowDepthCm: snowSt.snowDepthCm
          })
        );
      }
    }

    // Stratified `5 + 3 + 2 + 2` Top-12 Selection (hard ceiling of 12 unique sondurumIstNo!)
    const selectedCenters = selectStratifiedTop12Stations({
      candidates: Array.from(byIstNo.values()),
      targetLat,
      targetLon,
      targetElevationM,
      maxTotal: MAX_PROVINCE_FANOUT_STATIONS
    });

    const rawRows = await Promise.all(
      selectedCenters.map(async (center): Promise<NationalRawObservation | null> => {
        const row = await fetchSingleMgmSondurumRow(center.sondurumIstNo, nowMs, timeoutMs);
        if (!row) return null;

        const tempC = cleanMgmNumber(row.sicaklik);
        const apparentTempC = cleanMgmNumber(row.hissedilenSicaklik);
        const rhPct = cleanMgmNumber(row.nem);
        const dewPointC =
          tempC !== null && rhPct !== null ? computeMagnusDewPointC(tempC, rhPct) : null;
        const pressureMslHpa = cleanMgmNumber(row.denizeIndirgenmisBasinc);
        const pressureStationHpa = cleanMgmNumber(row.aktuelBasinc);
        const windKmh = cleanMgmNumber(row.ruzgarHiz);
        const windSpeedKt = windKmh !== null ? windKmh / 1.852 : null;
        const precip10MinMm = cleanMgmNumber(row.yagis10Dk);
        const precip1HrMm = cleanMgmNumber(row.yagis1Saat);
        const precip24HrMm = cleanMgmNumber(row.yagis24Saat);
        const precipToday00Mm = cleanMgmNumber(row.yagis00Now);
        const hadise = typeof row.hadiseKodu === "string" ? row.hadiseKodu.trim() : "";
        const isPrecipitating =
          (precip10MinMm !== null && precip10MinMm > 0.04) ||
          (precip1HrMm !== null && precip1HrMm > 0.08) ||
          MGM_PRECIP_CODES.has(hadise);

        const rowSnowCm = cleanMgmNumber(row.karYukseklik);
        const snowDepthCm = rowSnowCm ?? center.preReportedSnowDepthCm;
        const rowSeaC = cleanMgmNumber(row.denizSicaklik);
        const seaTempC = rowSeaC ?? marineWaterByIstNo.get(center.sondurumIstNo) ?? null;

        // Refine OMGI snow station elevation hypsometrically if no explicit override/DEM hook was supplied
        let finalCenter = center;
        if (
          center.sourceKind === "MGM_KAR_OMGI" &&
          !opts?.demElevationResolver &&
          !opts?.stationOverrides?.[String(center.sondurumIstNo)]
        ) {
          const hypsoElev = deriveHypsometricElevationM(pressureStationHpa, pressureMslHpa, tempC);
          if (hypsoElev !== null) {
            finalCenter = Object.freeze({
              ...center,
              elevationM: hypsoElev,
              rawElevationM: hypsoElev
            });
          }
        }

        return Object.freeze({
          station: finalCenter,
          observedAtIso:
            typeof row.veriZamani === "string" ? row.veriZamani : new Date(nowMs).toISOString(),
          tempC,
          apparentTempC,
          dewPointC,
          relHumidityPct: rhPct,
          pressureMslHpa,
          pressureStationHpa,
          windSpeedKt,
          windDirDeg: cleanMgmNumber(row.ruzgarYon),
          precip10MinMm,
          precip1HrMm,
          precip24HrMm,
          precipToday00Mm,
          visibilityM: cleanMgmNumber(row.gorus),
          snowDepthCm,
          seaTempC,
          isPrecipitating,
          wxCodeRaw: hadise || undefined,
          tier: 1,
          hasTenthDegreePrecision: true,
          source: center.sourceKind === "MGM_KAR_OMGI" ? "MGM_KAR_OMGI" : "MGM_10MIN"
        });
      })
    );

    const nonNullObs = rawRows.filter((x): x is NationalRawObservation => x !== null);
    const { stations: qcStations, verticalProfile } = runNationalObservationQC(nonNullObs, {
      nowMs,
      referenceElevationM: targetElevationM,
      qcBounds: opts?.qcBounds,
      solarRadiationWm2: opts?.solarRadiationWm2,
      isNight: opts?.isNight,
      cloudCoverPct: opts?.cloudCoverPct,
      wind850DirDeg: opts?.wind850DirDeg,
      wind850SpeedKt: opts?.wind850SpeedKt
    });

    const acceptedCount = qcStations.filter((s) => s.qcWeight > 0).length;
    const snapshot: NationalProvinceMeshSnapshot = Object.freeze({
      provinceCode,
      provinceName: provinceMeta.mgmProvinceName,
      fetchedAtIso: new Date(nowMs).toISOString(),
      selectedStationIds: Object.freeze(selectedCenters.map((c) => c.sondurumIstNo)),
      stations: Object.freeze(qcStations),
      acceptedCount,
      rejectedCount: qcStations.length - acceptedCount,
      marineStations: Object.freeze(provinceMarine),
      nearestWaterTempC,
      verticalProfile
    });

    if (!hasCustomHooks) {
      cachedProvinceMeshes.set(meshCacheKey, {
        expiresAtMs: (opts?.nowMs ?? Date.now()) + PROVINCE_MESH_CACHE_TTL_MS,
        snapshot
      });
    }
    return snapshot;
  };

  if (hasCustomHooks) {
    const snap = await executeMeshPipeline();
    return cloneMeshSnapshot(snap);
  }

  let pending = inFlightProvinceMeshes.get(meshCacheKey);
  if (!pending) {
    pending = executeMeshPipeline().finally(() => {
      inFlightProvinceMeshes.delete(meshCacheKey);
    });
    inFlightProvinceMeshes.set(meshCacheKey, pending);
  }

  const resolved = await pending;
  return cloneMeshSnapshot(resolved);
}

// ============================================================================
// 7. MGM ALARO 4.5 km Hourly (`saatlikTahminIstNo`) + District Daily (`gunlukTahminIstNo`)
// ============================================================================

export async function fetchProvinceMgmForecasts(
  provinceCode: TrProvinceCode,
  opts?: {
    nowMs?: number;
    timeoutMs?: number;
    targetLat?: number;
    targetLon?: number;
    targetElevationM?: number;
    pointInProvinceFn?: PointInProvinceHook;
    demElevationResolver?: DemElevationResolverHook;
    stationOverrides?: Readonly<Record<string, ProvinceStationOverride>>;
  }
): Promise<MgmProvinceForecastBundle | null> {
  const provinceMeta = assertNationalNonBursaProvince(provinceCode);
  const nowMs = opts?.nowMs ?? Date.now();
  const timeoutMs = opts?.timeoutMs ?? 5000;

  const centers = await getProvinceMgmCenters(provinceCode, opts);
  const primaryCenter = centers.find((c) => c.isPrimaryCenter) ?? centers[0] ?? null;

  const targetLat = opts?.targetLat ?? primaryCenter?.lat ?? 39.0;
  const targetLon = opts?.targetLon ?? primaryCenter?.lon ?? 35.0;
  const targetElevM =
    opts?.targetElevationM ?? primaryCenter?.elevationM ?? provinceMeta.defaultElevationM;

  let bestCenter = primaryCenter;
  let bestScore = Infinity;
  for (const c of centers) {
    const dKm = haversineKm(targetLat, targetLon, c.lat, c.lon);
    const elevPenKm = Math.abs(targetElevM - c.elevationM) * 0.035;
    const score = dKm + elevPenKm;
    if (score < bestScore) {
      bestScore = score;
      bestCenter = c;
    }
  }

  // Strictly resolve `gunlukTahminIstNo` and `saatlikTahminIstNo` (NEVER blindly pass merkezId!)
  const targetGunlukIstNo =
    bestCenter?.gunlukTahminIstNo ?? provinceMeta.primaryGunlukIstNo;
  const primaryGunlukIstNo =
    primaryCenter?.gunlukTahminIstNo ?? provinceMeta.primaryGunlukIstNo;

  let saatlikIstNo = bestCenter?.saatlikTahminIstNo ?? null;
  if (saatlikIstNo === null) {
    const withHourly = centers
      .filter((c) => c.saatlikTahminIstNo !== null && c.saatlikTahminIstNo > 0)
      .sort(
        (a, b) =>
          haversineKm(targetLat, targetLon, a.lat, a.lon) -
          haversineKm(targetLat, targetLon, b.lat, b.lon)
      );
    saatlikIstNo = withHourly[0]?.saatlikTahminIstNo ?? provinceMeta.primarySaatlikIstNo;
  }

  const forecastKey = `${provinceCode}:${saatlikIstNo}:${targetGunlukIstNo}`;
  const hit = cachedProvinceForecasts.get(forecastKey);
  if (hit && hit.expiresAtMs > nowMs) {
    return cloneForecastBundle(hit.bundle);
  }

  let pending = inFlightProvinceForecasts.get(forecastKey);
  if (!pending) {
    pending = (async (): Promise<MgmProvinceForecastBundle | null> => {
      try {
        const needSeparatePrimaryDaily = targetGunlukIstNo !== primaryGunlukIstNo;
        const [saatlikArr, targetGunlukArr, primaryGunlukArr] = await Promise.all([
          mgmFetchJson<Array<{ tahmin?: Array<Record<string, unknown>> }>>(
            `https://servis.mgm.gov.tr/web/tahminler/saatlik?istno=${saatlikIstNo}`,
            timeoutMs
          ).catch(() => null),
          mgmFetchJson<Array<Record<string, unknown>>>(
            `https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=${targetGunlukIstNo}`,
            timeoutMs
          ).catch(() => null),
          needSeparatePrimaryDaily
            ? mgmFetchJson<Array<Record<string, unknown>>>(
                `https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=${primaryGunlukIstNo}`,
                timeoutMs
              ).catch(() => null)
            : Promise.resolve(null)
        ]);

        const hourlyAlaro = new Map<string, MgmNationalHourlyStep>();
        const rawSteps = Array.isArray(saatlikArr?.[0]?.tahmin) ? saatlikArr![0].tahmin! : [];
        const parsedNodes: Array<{ ms: number; step: MgmNationalHourlyStep }> = [];

        for (const st of rawSteps) {
          const iso = typeof st.tarih === "string" ? st.tarih : null;
          const t = cleanMgmNumber(st.sicaklik);
          if (!iso || t === null) continue;
          const ms = Date.parse(iso);
          if (!Number.isFinite(ms)) continue;
          const wx = typeof st.hadise === "string" ? st.hadise.trim() : "";
          const uKey = new Date(ms).toISOString().slice(0, 16);
          const wspd = cleanMgmNumber(st.ruzgarHizi) ?? 0;
          const wgst = cleanMgmNumber(st.maksimumRuzgarHizi) ?? wspd;
          const step: MgmNationalHourlyStep = Object.freeze({
            utcHourKey: uKey,
            tempC: t,
            apparentTempC: cleanMgmNumber(st.hissedilenSicaklik) ?? t,
            rhPct: cleanMgmNumber(st.nem) ?? 65,
            windDirDeg: cleanMgmNumber(st.ruzgarYonu) ?? 0,
            windSpeedKmh: wspd,
            windGustKmh: Math.max(wspd, wgst),
            isWet: MGM_PRECIP_CODES.has(wx),
            isSnow: MGM_SNOW_CODES.has(wx),
            isStorm: MGM_STORM_CODES.has(wx),
            wxCode: wx
          });
          parsedNodes.push({ ms, step });
          hourlyAlaro.set(uKey, step);
        }

        // Linearly interpolate MGM 3-hourly ALARO nodes to continuous 1-hour UTC keys
        parsedNodes.sort((a, b) => a.ms - b.ms);
        for (let i = 0; i < parsedNodes.length - 1; i++) {
          const a = parsedNodes[i];
          const b = parsedNodes[i + 1];
          const diffH = Math.round((b.ms - a.ms) / 3_600_000);
          if (diffH >= 2 && diffH <= 6) {
            for (let h = 1; h < diffH; h++) {
              const frac = h / diffH;
              const mMs = a.ms + h * 3_600_000;
              const uKey = new Date(mMs).toISOString().slice(0, 16);
              if (!hourlyAlaro.has(uKey)) {
                const nearest = frac < 0.5 ? a.step : b.step;
                hourlyAlaro.set(
                  uKey,
                  Object.freeze({
                    utcHourKey: uKey,
                    tempC: Number((a.step.tempC + (b.step.tempC - a.step.tempC) * frac).toFixed(2)),
                    apparentTempC: Number(
                      (
                        a.step.apparentTempC +
                        (b.step.apparentTempC - a.step.apparentTempC) * frac
                      ).toFixed(2)
                    ),
                    rhPct: Math.round(a.step.rhPct + (b.step.rhPct - a.step.rhPct) * frac),
                    windDirDeg: nearest.windDirDeg,
                    windSpeedKmh: Number(
                      (
                        a.step.windSpeedKmh +
                        (b.step.windSpeedKmh - a.step.windSpeedKmh) * frac
                      ).toFixed(1)
                    ),
                    windGustKmh: Number(
                      (
                        a.step.windGustKmh +
                        (b.step.windGustKmh - a.step.windGustKmh) * frac
                      ).toFixed(1)
                    ),
                    isWet: a.step.isWet && b.step.isWet ? true : nearest.isWet,
                    isSnow: nearest.isSnow,
                    isStorm: nearest.isStorm,
                    wxCode: nearest.wxCode
                  })
                );
              }
            }
          }
        }

        const dailyDistrict = new Map<string, MgmNationalDailyDistrictDay>();
        let todayObservedMinC: number | null = null;
        let todayObservedMaxC: number | null = null;

        const targetRow = Array.isArray(targetGunlukArr) ? targetGunlukArr[0] : null;
        const primaryRow = needSeparatePrimaryDaily
          ? Array.isArray(primaryGunlukArr)
            ? primaryGunlukArr[0]
            : targetRow
          : targetRow;

        if (targetRow) {
          for (let d = 0; d <= 5; d++) {
            const rawDate = targetRow[`tarihGun${d}`];
            const tMin = cleanMgmNumber(targetRow[`enDusukGun${d}`]);
            const tMax = cleanMgmNumber(targetRow[`enYuksekGun${d}`]);
            if (typeof rawDate !== "string" || tMin === null || tMax === null) continue;

            const dateYmd = rawDate.slice(0, 10);
            const pMin = primaryRow ? cleanMgmNumber(primaryRow[`enDusukGun${d}`]) : tMin;
            const pMax = primaryRow ? cleanMgmNumber(primaryRow[`enYuksekGun${d}`]) : tMax;
            const wx =
              typeof targetRow[`hadiseGun${d}`] === "string"
                ? String(targetRow[`hadiseGun${d}`]).trim()
                : "";

            if (d === 0) {
              todayObservedMinC = tMin;
              todayObservedMaxC = tMax;
            }

            dailyDistrict.set(
              dateYmd,
              Object.freeze({
                dateYmd,
                dayOffset: d,
                tempMinC: tMin,
                tempMaxC: tMax,
                rhMinPct: cleanMgmNumber(targetRow[`enDusukNemGun${d}`]),
                rhMaxPct: cleanMgmNumber(targetRow[`enYuksekNemGun${d}`]),
                windSpeedKmh: cleanMgmNumber(targetRow[`ruzgarHizGun${d}`]),
                windDirDeg: cleanMgmNumber(targetRow[`ruzgarYonGun${d}`]),
                wxCode: wx,
                isWet: MGM_PRECIP_CODES.has(wx),
                deltaMinVsPrimaryC: pMin !== null ? Number((tMin - pMin).toFixed(2)) : 0,
                deltaMaxVsPrimaryC: pMax !== null ? Number((tMax - pMax).toFixed(2)) : 0
              })
            );
          }
        }

        if (hourlyAlaro.size === 0 && dailyDistrict.size === 0) {
          return null;
        }

        const bundle: MgmProvinceForecastBundle = Object.freeze({
          provinceCode,
          fetchedAtIso: new Date(nowMs).toISOString(),
          targetDistrict: bestCenter?.ilce ?? provinceMeta.mgmProvinceName,
          saatlikIstNo,
          targetGunlukIstNo,
          primaryGunlukIstNo,
          hourlyAlaro,
          dailyDistrict,
          todayObservedMinC,
          todayObservedMaxC
        });

        cachedProvinceForecasts.set(forecastKey, {
          expiresAtMs: (opts?.nowMs ?? Date.now()) + PROVINCE_FORECAST_CACHE_TTL_MS,
          bundle
        });
        return bundle;
      } catch {
        return null;
      } finally {
        inFlightProvinceForecasts.delete(forecastKey);
      }
    })();
    inFlightProvinceForecasts.set(forecastKey, pending);
  }

  const resolved = await pending;
  return resolved ? cloneForecastBundle(resolved) : null;
}

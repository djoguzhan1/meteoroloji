import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CORE_MODEL_META } from "../lib/model-registry";
import {
  evictSnapshotMemoryForTests,
  resetSnapshotStoreForTests,
  resolveSnapshotVaultShardPath
} from "../lib/snapshot-store";
import {
  evictStateLedgerMemoryForTests,
  resetStateLedgerForTests,
  resolveLedgerShardPath
} from "../lib/state-ledger";
import {
  fetchMultiModelBundle,
  fetchWeatherBundle,
  getWeatherBundle,
  resetWeatherRuntimeCachesForTests
} from "../lib/weather";
import type { GeoLocation } from "../lib/weather-types";

interface MockEnvironmentOptions {
  /** Ambient 2m temperature offset (°C) applied by latitude/longitude so each city has distinct NWP values */
  coldPolarOutbreak?: boolean;
  /** Simulate Erzurum 17095 center sensor offline on a -35°C Siberian winter night at LTCE */
  erzurumCenterOfflineNight?: boolean;
}

function buildHourlyIsoSeries(startUtcMs: number, count: number, offsetHours: number): string[] {
  const out: string[] = [];
  for (let h = 0; h < count; h++) {
    const d = new Date(startUtcMs + (h + offsetHours) * 3600_000);
    out.push(d.toISOString().slice(0, 16));
  }
  return out;
}

function createNationalMockFetch(
  nowUtcMs: number,
  recordedUrls: string[],
  opts?: MockEnvironmentOptions
) {
  const baseFloorUtcMs = Math.floor(nowUtcMs / 3600_000) * 3600_000;
  const nowIso = new Date(nowUtcMs).toISOString();

  return vi.fn(async (input: string | URL | Request) => {
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    recordedUrls.push(rawUrl);
    const parsed = new URL(rawUrl);

    // 1. RainViewer radar metadata (offline-clean empty frames so tests never fetch binary PNG tiles)
    if (parsed.hostname.includes("rainviewer.com")) {
      return new Response(
        JSON.stringify({
          host: "https://tilecache.rainviewer.com",
          generated: Math.floor(nowUtcMs / 1000),
          radar: { past: [], nowcast: [] }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Copernicus / Open-Meteo Marine API
    if (parsed.hostname.includes("marine-api.open-meteo.com")) {
      const mTimes = buildHourlyIsoSeries(baseFloorUtcMs, 48, 0);
      return new Response(
        JSON.stringify({
          current: { sea_surface_temperature: 13.4 },
          hourly: {
            time: mTimes,
            sea_surface_temperature: mTimes.map(() => 13.4)
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. AviationWeather METAR API (deliberately returns hostile cross-province ICAOs if requested!)
    if (parsed.hostname.includes("aviationweather.gov")) {
      const idsParam = (parsed.searchParams.get("ids") ?? "").toUpperCase();
      const hasBbox = parsed.searchParams.has("bbox");
      const allRecords = [
        {
          icaoId: "LTBR",
          name: "Bursa Yenisehir",
          lat: 40.255,
          lon: 29.563,
          elev: 233,
          reportTime: nowIso,
          temp: 9.4,
          dewp: 5.2,
          wdir: 40,
          wspd: 8,
          altim: 1019.2,
          rawOb: "LTBR 281450Z 04008KT 9999 FEW035 09/05 Q1019"
        },
        {
          icaoId: "LTFJ",
          name: "Istanbul Sabiha Gokcen",
          lat: 40.898,
          lon: 29.309,
          elev: 95,
          reportTime: nowIso,
          temp: 11.8,
          dewp: 7.4,
          wdir: 30,
          wspd: 14,
          altim: 1018.5,
          rawOb: "LTFJ 281450Z 03014KT 9999 SCT030 12/07 Q1018"
        },
        {
          icaoId: "LTBG",
          name: "Bandirma",
          lat: 40.318,
          lon: 27.978,
          elev: 52,
          reportTime: nowIso,
          temp: 12.2,
          dewp: 8.1,
          wdir: 35,
          wspd: 16,
          altim: 1018.8,
          rawOb: "LTBG 281450Z 03516KT 9999 SCT035 12/08 Q1019"
        },
        {
          icaoId: "LTBQ",
          name: "Kocaeli Cengiz Topel",
          lat: 40.735,
          lon: 30.083,
          elev: 55,
          reportTime: nowIso,
          temp: 10.6,
          dewp: 6.5,
          wdir: 25,
          wspd: 10,
          altim: 1019.0,
          rawOb: "LTBQ 281450Z 02510KT 9999 SCT035 11/07 Q1019"
        },
        {
          icaoId: "LTAC",
          name: "Ankara Esenboga",
          lat: 40.128,
          lon: 32.995,
          elev: 953,
          reportTime: nowIso,
          temp: opts?.coldPolarOutbreak ? -2.4 : 5.2,
          dewp: opts?.coldPolarOutbreak ? -5.1 : 0.4,
          wdir: 20,
          wspd: 12,
          altim: 1022.4,
          rawOb: "LTAC 281450Z 02012KT 9999 BKN030 M02/M05 Q1022"
        },
        {
          icaoId: "LTCE",
          name: "Erzurum Airport",
          lat: 39.953,
          lon: 41.19,
          elev: 1758,
          reportTime: nowIso,
          temp: opts?.erzurumCenterOfflineNight ? -35.0 : -29.4,
          dewp: opts?.erzurumCenterOfflineNight ? -38.2 : -32.8,
          wdir: 70,
          wspd: 3,
          altim: 1044.0,
          rawOb: "LTCE 281450Z 07003KT CAVOK M29/M33 Q1044"
        },
        {
          icaoId: "LTCI",
          name: "Van Ferit Melen",
          lat: 38.468,
          lon: 43.332,
          elev: 1670,
          reportTime: nowIso,
          temp: -1.2,
          dewp: -3.0,
          wdir: 260,
          wspd: 18,
          altim: 1021.0,
          wxString: "-SN",
          rawOb: "LTCI 281450Z 26018KT 3000 -SN BKN018 M01/M03 Q1021"
        },
        {
          icaoId: "LTFO",
          name: "Rize Artvin",
          lat: 41.169,
          lon: 40.829,
          elev: 5,
          reportTime: nowIso,
          temp: 8.6,
          dewp: 6.9,
          wdir: 315,
          wspd: 15,
          altim: 1017.5,
          wxString: "RA",
          rawOb: "LTFO 281450Z 31515KT 6000 RA BKN020 09/07 Q1018"
        },
        {
          icaoId: "EGLL",
          name: "London Heathrow",
          lat: 51.477,
          lon: -0.461,
          elev: 25,
          reportTime: nowIso,
          temp: 7.8,
          dewp: 5.1,
          wdir: 240,
          wspd: 12,
          altim: 1014.0,
          rawOb: "EGLL 281450Z 24012KT 9999 SCT025 08/05 Q1014"
        }
      ];

      if (hasBbox) {
        return new Response(JSON.stringify([allRecords[8]]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const reqSet = new Set(
        idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      return new Response(
        JSON.stringify(allRecords.filter((r) => reqSet.has(r.icaoId))),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. MGM Official Servis API (`servis.mgm.gov.tr`)
    if (parsed.hostname.includes("servis.mgm.gov.tr")) {
      const pName = parsed.pathname;

      if (pName.endsWith("/sondurumlar/kar")) {
        return new Response(
          JSON.stringify([
            {
              istNo: 17777,
              istAd: "Palandöken Kayak Merkezi",
              il: "Erzurum",
              ilce: "Palandöken",
              enlem: 39.8446,
              boylam: 41.2905,
              karYukseklik: 62,
              veriZamani: nowIso
            },
            {
              istNo: 17676,
              istAd: "Uludağ Zirve",
              il: "Bursa",
              ilce: "Osmangazi",
              enlem: 40.1069,
              boylam: 29.1292,
              karYukseklik: 45,
              veriZamani: nowIso
            }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (pName.endsWith("/sondurumlar/denizler")) {
        return new Response(
          JSON.stringify([
            {
              istNo: 17482,
              istAd: "Tatvan / Van Gölü Şamandıra",
              il: "Van",
              ilce: "Tuşba",
              enlem: 38.52,
              boylam: 43.28,
              denizSicaklik: 8.4,
              veriZamani: nowIso
            },
            {
              istNo: 17040,
              istAd: "Rize Liman",
              il: "Rize",
              ilce: "Merkez",
              enlem: 41.04,
              boylam: 40.52,
              denizSicaklik: 14.8,
              veriZamani: nowIso
            },
            {
              istNo: 17119,
              istAd: "Yalova İskele",
              il: "Yalova",
              ilce: "Merkez",
              enlem: 40.66,
              boylam: 29.27,
              denizSicaklik: 13.6,
              veriZamani: nowIso
            }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (pName.endsWith("/merkezler/ililcesi")) {
        const ilParam = (parsed.searchParams.get("il") ?? "").toLowerCase();
        const centersByIl: Record<string, unknown[]> = {
          bursa: [
            {
              merkezId: 91601,
              ilPlaka: 16,
              il: "Bursa",
              ilce: "Osmangazi",
              enlem: 40.2308,
              boylam: 29.0133,
              yukseklik: 100,
              sondurumIstNo: 17116,
              saatlikTahminIstNo: 17116,
              gunlukTahminIstNo: 91601
            }
          ],
          yalova: [
            {
              merkezId: 97701,
              ilPlaka: 77,
              il: "Yalova",
              ilce: "Merkez",
              enlem: 40.655,
              boylam: 29.276,
              yukseklik: 4,
              sondurumIstNo: 17119,
              saatlikTahminIstNo: 17119,
              gunlukTahminIstNo: 97701
            }
          ],
          kocaeli: [
            {
              merkezId: 94101,
              ilPlaka: 41,
              il: "Kocaeli",
              ilce: "İzmit",
              enlem: 40.766,
              boylam: 29.917,
              yukseklik: 67,
              sondurumIstNo: 17066,
              saatlikTahminIstNo: 17066,
              gunlukTahminIstNo: 94101
            },
            {
              merkezId: 94104,
              ilPlaka: 41,
              il: "Kocaeli",
              ilce: "Gebze",
              enlem: 40.802,
              boylam: 29.43,
              yukseklik: 130,
              sondurumIstNo: 17066,
              saatlikTahminIstNo: 17066,
              gunlukTahminIstNo: 94104
            }
          ],
          bilecik: [
            {
              merkezId: 91101,
              ilPlaka: 11,
              il: "Bilecik",
              ilce: "Merkez",
              enlem: 40.145,
              boylam: 29.979,
              yukseklik: 539,
              sondurumIstNo: 17120,
              saatlikTahminIstNo: 17120,
              gunlukTahminIstNo: 91101
            }
          ],
          "balıkesir": [
            {
              merkezId: 91003,
              ilPlaka: 10,
              il: "Balıkesir",
              ilce: "Bandırma",
              enlem: 40.352,
              boylam: 27.977,
              yukseklik: 52,
              sondurumIstNo: 17114,
              saatlikTahminIstNo: 17114,
              gunlukTahminIstNo: 91003
            }
          ],
          ankara: [
            {
              merkezId: 90601,
              ilPlaka: 6,
              il: "Ankara",
              ilce: "Keçiören",
              enlem: 39.972,
              boylam: 32.864,
              yukseklik: 891,
              sondurumIstNo: 17130,
              saatlikTahminIstNo: 17130,
              gunlukTahminIstNo: 90601
            }
          ],
          erzurum: [
            {
              merkezId: 92501,
              ilPlaka: 25,
              il: "Erzurum",
              ilce: "Yakutiye",
              enlem: 39.9058,
              boylam: 41.2544,
              yukseklik: 1895,
              sondurumIstNo: 17095,
              saatlikTahminIstNo: 17095,
              gunlukTahminIstNo: 92501
            },
            {
              merkezId: 92518,
              ilPlaka: 25,
              il: "Erzurum",
              ilce: "Aziziye",
              enlem: 39.9529,
              boylam: 41.1897,
              yukseklik: 1758,
              sondurumIstNo: 17096,
              saatlikTahminIstNo: 17095,
              gunlukTahminIstNo: 92518
            }
          ],
          van: [
            {
              merkezId: 96501,
              ilPlaka: 65,
              il: "Van",
              ilce: "İpekyolu",
              enlem: 38.494,
              boylam: 43.38,
              yukseklik: 1675,
              sondurumIstNo: 17172,
              saatlikTahminIstNo: 17170,
              gunlukTahminIstNo: 96501
            }
          ],
          rize: [
            {
              merkezId: 95301,
              ilPlaka: 53,
              il: "Rize",
              ilce: "Merkez",
              enlem: 41.025,
              boylam: 40.517,
              yukseklik: 8,
              sondurumIstNo: 17040,
              saatlikTahminIstNo: 17040,
              gunlukTahminIstNo: 95301
            },
            // Hostile cross-province proxy مرکز (95305 İyidere -> 17775 Of/Trabzon) — must be quarantined!
            {
              merkezId: 95305,
              ilPlaka: 53,
              il: "Rize",
              ilce: "İyidere",
              enlem: 41.01,
              boylam: 40.36,
              yukseklik: 10,
              sondurumIstNo: 17775,
              aciklama: "Trabzon Of istasyonundan veri almaktadır",
              saatlikTahminIstNo: 17040,
              gunlukTahminIstNo: 95305
            }
          ],
          bayburt: [
            {
              merkezId: 96901,
              ilPlaka: 69,
              il: "Bayburt",
              ilce: "Merkez",
              enlem: 40.2547,
              boylam: 40.2207,
              yukseklik: 1582,
              sondurumIstNo: 17089,
              saatlikTahminIstNo: 17089,
              gunlukTahminIstNo: 96901
            }
          ]
        };
        return new Response(JSON.stringify(centersByIl[ilParam] ?? []), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (pName.endsWith("/sondurumlar")) {
        const istNo = Number(parsed.searchParams.get("istno") ?? parsed.searchParams.get("istNo") ?? parsed.searchParams.get("merkezid") ?? 0);
        const obsByIst: Record<number, Record<string, unknown>> = {
          17116: { istNo: 17116, sicaklik: 10.8, nem: 72, aktuelBasinc: 1007, denizeIndirgenmisBasinc: 1019.2, ruzgarHiz: 9, ruzgarYon: 45, yagis00Now: 0, hadiseKodu: "PB", veriZamani: nowIso },
          17676: { istNo: 17676, sicaklik: -1.4, nem: 88, aktuelBasinc: 812, denizeIndirgenmisBasinc: 1018.8, ruzgarHiz: 24, ruzgarYon: 35, karYukseklik: 45, yagis00Now: 0, hadiseKodu: "CB", veriZamani: nowIso },
          17119: { istNo: 17119, sicaklik: 12.1, nem: 76, aktuelBasinc: 1018.6, denizeIndirgenmisBasinc: 1019.1, ruzgarHiz: 14, ruzgarYon: 30, yagis00Now: 0, hadiseKodu: "PB", veriZamani: nowIso },
          17066: { istNo: 17066, sicaklik: 11.4, nem: 74, aktuelBasinc: 1011, denizeIndirgenmisBasinc: 1019.0, ruzgarHiz: 12, ruzgarYon: 35, yagis00Now: 0, hadiseKodu: "PB", veriZamani: nowIso },
          17120: { istNo: 17120, sicaklik: 7.2, nem: 70, aktuelBasinc: 954, denizeIndirgenmisBasinc: 1020.1, ruzgarHiz: 8, ruzgarYon: 20, yagis00Now: 0, hadiseKodu: "AB", veriZamani: nowIso },
          17114: { istNo: 17114, sicaklik: 12.4, nem: 78, aktuelBasinc: 1012, denizeIndirgenmisBasinc: 1018.9, ruzgarHiz: 18, ruzgarYon: 40, yagis00Now: 0, hadiseKodu: "PB", veriZamani: nowIso },
          17130: { istNo: 17130, sicaklik: opts?.coldPolarOutbreak ? -2.1 : 5.6, nem: 68, aktuelBasinc: 916, denizeIndirgenmisBasinc: 1022.4, ruzgarHiz: 11, ruzgarYon: 15, yagis00Now: 0, hadiseKodu: "PB", veriZamani: nowIso },
          17095: { istNo: 17095, sicaklik: -21.8, nem: 76, aktuelBasinc: 814, denizeIndirgenmisBasinc: 1043.5, ruzgarHiz: 5, ruzgarYon: 80, karYukseklik: 28, yagis00Now: 0, hadiseKodu: "A", veriZamani: nowIso },
          17096: { istNo: 17096, sicaklik: opts?.erzurumCenterOfflineNight ? -35.0 : -29.4, nem: 84, aktuelBasinc: 828, denizeIndirgenmisBasinc: 1044.2, ruzgarHiz: 3, ruzgarYon: 75, karYukseklik: 34, yagis00Now: 0, hadiseKodu: "A", veriZamani: nowIso },
          17777: { istNo: 17777, sicaklik: -25.6, nem: 70, aktuelBasinc: 742, denizeIndirgenmisBasinc: 1039.0, ruzgarHiz: 18, ruzgarYon: 210, karYukseklik: 62, yagis00Now: 0, hadiseKodu: "A", veriZamani: nowIso },
          17172: { istNo: 17172, sicaklik: -1.1, nem: 86, aktuelBasinc: 832, denizeIndirgenmisBasinc: 1021.2, ruzgarHiz: 26, ruzgarYon: 265, karYukseklik: 14, yagis1Saat: 1.4, hadiseKodu: "K", veriZamani: nowIso },
          17040: { istNo: 17040, sicaklik: 9.1, nem: 88, aktuelBasinc: 1016.8, denizeIndirgenmisBasinc: 1017.8, ruzgarHiz: 19, ruzgarYon: 320, yagis1Saat: 2.6, hadiseKodu: "KY", veriZamani: nowIso },
          17089: { istNo: 17089, sicaklik: -8.6, nem: 74, aktuelBasinc: 842, denizeIndirgenmisBasinc: 1028.4, ruzgarHiz: 10, ruzgarYon: 15, karYukseklik: 18, yagis00Now: 0, hadiseKodu: "PB", veriZamani: nowIso }
        };
        const row = opts?.erzurumCenterOfflineNight && istNo === 17095 ? undefined : obsByIst[istNo];
        return new Response(JSON.stringify(row ? [row] : []), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (pName.endsWith("/tahminler/saatlik")) {
        const istNo = Number(parsed.searchParams.get("istno") ?? parsed.searchParams.get("istNo") ?? 0);
        const baseT = istNo === 17089 ? -7.5 : istNo === 17095 ? -18.0 : 9.0;
        const tahmin = Array.from({ length: 12 }, (_, idx) => ({
          tarih: new Date(baseFloorUtcMs + idx * 3 * 3600_000).toISOString(),
          sicaklik: baseT + Math.sin(idx / 4) * 2,
          hissedilenSicaklik: baseT - 1,
          nem: 72,
          ruzgarYon: 30,
          ruzgarHizi: 12,
          maksimumRuzgarHizi: 20,
          hadise: "PB"
        }));
        return new Response(JSON.stringify([{ merkezId: istNo, tahmin }]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (pName.endsWith("/tahminler/gunluk")) {
        return new Response(JSON.stringify([{}]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 5. Open-Meteo Air Quality
    if (parsed.hostname.includes("air-quality-api.open-meteo.com")) {
      return new Response(
        JSON.stringify({
          current: {
            european_aqi: 24,
            pm2_5: 8.2,
            pm10: 15.0,
            ozone: 42,
            nitrogen_dioxide: 11.4,
            sulphur_dioxide: 2.1,
            dust: 4
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Open-Meteo Seasonal / Subseasonal API
    if (parsed.hostname.includes("seasonal-api.open-meteo.com")) {
      const dates = Array.from({ length: 34 }, (_, d) => {
        const dt = new Date(baseFloorUtcMs + d * 86400_000);
        return dt.toISOString().slice(0, 10);
      });
      const daily: Record<string, unknown> = { time: dates };
      for (let m = 1; m <= 6; m++) {
        daily[`temperature_2m_max_member0${m}`] = dates.map(() => 10 + m * 0.2);
        daily[`temperature_2m_min_member0${m}`] = dates.map(() => 2 + m * 0.2);
        daily[`precipitation_sum_member0${m}`] = dates.map(() => 0.4);
      }
      return new Response(JSON.stringify({ daily }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 7. Open-Meteo 212-Member Ensemble API
    if (parsed.hostname.includes("ensemble-api.open-meteo.com")) {
      const lat = Number(parsed.searchParams.get("latitude") ?? 40);
      const lon = Number(parsed.searchParams.get("longitude") ?? 29);
      const baseTemp =
        lon > 42 ? -1.0 : lon > 40.8 && lat < 40.3 ? -18.0 : opts?.coldPolarOutbreak ? -1.8 : 11.0 - (lon - 29) * 0.35;
      const eTimes = buildHourlyIsoSeries(baseFloorUtcMs, 384, 0);
      const hourly: Record<string, unknown> = { time: eTimes };
      for (let m = 1; m <= 20; m++) {
        const tag = String(m).padStart(2, "0");
        hourly[`temperature_2m_ecmwf_ifs025_member${tag}`] = eTimes.map(
          (_, h) => Number((baseTemp + Math.sin(h / 4) * 2.2 + (m - 10) * 0.08).toFixed(2))
        );
        hourly[`precipitation_ecmwf_ifs025_member${tag}`] = eTimes.map(() =>
          opts?.coldPolarOutbreak || lon > 40.4 ? 0.8 : 0.0
        );
        hourly[`wind_gusts_10m_ecmwf_ifs025_member${tag}`] = eTimes.map(() => 26);
        hourly[`cape_ecmwf_ifs025_member${tag}`] = eTimes.map(() => 40);
      }
      return new Response(JSON.stringify({ hourly }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 8. Open-Meteo Previous Runs (dProg/dt) API
    if (parsed.hostname.includes("previous-runs-api.open-meteo.com")) {
      return new Response(JSON.stringify({ hourly: { time: [] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 9. Open-Meteo Forecast & Multi-Model Hybrid API (`api.open-meteo.com`)
    const lat = Number(parsed.searchParams.get("latitude") ?? 40);
    const lon = Number(parsed.searchParams.get("longitude") ?? 29);
    const modelsParam = parsed.searchParams.get("models");
    const isLondon = lon < 5;
    const isVan = lon > 42.5 && lat < 39.2;
    const isErzurum = lon > 40.8 && lat >= 39.4 && lat <= 40.6;
    const isRize = lon > 40.3 && lat > 40.8;
    const isBayburt = lon > 39.9 && lon < 40.6 && lat > 40.0 && lat < 40.5;

    const baseCityTemp = isLondon
      ? 8.0
      : isErzurum
        ? -19.5
        : isVan
          ? -0.8
          : isBayburt
            ? -7.8
            : isRize
              ? 9.2
              : opts?.coldPolarOutbreak
                ? -1.6
                : Number((12.5 - (lon - 28.5) * 0.45).toFixed(2));

    const defaultElev = isLondon
      ? 25
      : isErzurum
        ? 1895
        : isVan
          ? 1675
          : isBayburt
            ? 1582
            : isRize
              ? 8
              : Number(parsed.searchParams.get("elevation") ?? 100);

    if (modelsParam) {
      const pastDays = Number(parsed.searchParams.get("past_days") ?? 0);
      const totalH = (pastDays + 16) * 24;
      const startMs = baseFloorUtcMs - pastDays * 86400_000;
      const uTimes = buildHourlyIsoSeries(startMs, totalH, 0);
      const hourly: Record<string, unknown> = { time: uTimes };
      const apiModels = [
        CORE_MODEL_META.ecmwfIfs.apiModel,
        CORE_MODEL_META.ecmwfAifs.apiModel,
        CORE_MODEL_META.icon.apiModel,
        CORE_MODEL_META.ukmo.apiModel,
        CORE_MODEL_META.meteofrance.apiModel,
        CORE_MODEL_META.gfs.apiModel,
        CORE_MODEL_META.gem.apiModel,
        CORE_MODEL_META.jma.apiModel,
        "ecmwf_ifs025",
        "icon_global"
      ];
      for (const mKey of apiModels) {
        hourly[`temperature_2m_${mKey}`] = uTimes.map((_, h) =>
          Number((baseCityTemp + Math.sin(h / 4) * 2.0).toFixed(2))
        );
        hourly[`dew_point_2m_${mKey}`] = uTimes.map((_, h) =>
          Number((baseCityTemp - 3.2 + Math.sin(h / 4) * 1.5).toFixed(2))
        );
        hourly[`precipitation_${mKey}`] = uTimes.map(() =>
          isVan || isRize || opts?.coldPolarOutbreak ? 0.9 : 0.0
        );
        hourly[`snowfall_${mKey}`] = uTimes.map(() =>
          isVan || opts?.coldPolarOutbreak ? 0.8 : 0.0
        );
        hourly[`weather_code_${mKey}`] = uTimes.map(() =>
          isVan || opts?.coldPolarOutbreak ? 73 : isRize ? 61 : 1
        );
        hourly[`wind_speed_10m_${mKey}`] = uTimes.map(() => (isVan ? 24 : 14));
        hourly[`wind_gusts_10m_${mKey}`] = uTimes.map(() => (isVan ? 38 : 22));
        hourly[`wind_direction_10m_${mKey}`] = uTimes.map(() =>
          isVan ? 265 : isRize ? 320 : 20
        );
        hourly[`pressure_msl_${mKey}`] = uTimes.map(() => (isErzurum ? 1043 : 1019));
        hourly[`cloud_cover_${mKey}`] = uTimes.map(() =>
          isErzurum ? 10 : isVan || isRize || opts?.coldPolarOutbreak ? 92 : 30
        );
        hourly[`shortwave_radiation_${mKey}`] = uTimes.map((_, h) =>
          h % 24 >= 8 && h % 24 <= 16 ? 260 : 0
        );
        hourly[`temperature_850hPa_${mKey}`] = uTimes.map(() =>
          opts?.coldPolarOutbreak ? -12.5 : baseCityTemp - 7.5
        );
        hourly[`cape_${mKey}`] = uTimes.map(() => 35);
        hourly[`lifted_index_${mKey}`] = uTimes.map(() => 2.5);
      }

      return new Response(
        JSON.stringify({
          elevation: defaultElev,
          timezone: parsed.searchParams.get("timezone") === "GMT" ? "GMT" : isLondon ? "Europe/London" : "Europe/Istanbul",
          utc_offset_seconds:
            parsed.searchParams.get("timezone") === "GMT" ? 0 : isLondon ? 0 : 10800,
          current: {
            time: uTimes[pastDays * 24],
            temperature_2m: baseCityTemp
          },
          hourly
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Single-model vertical sounding & 16-day forecast
    const utcOffsetSec = isLondon ? 0 : 10800;
    const tzName = isLondon ? "Europe/London" : "Europe/Istanbul";
    const localTimes = buildHourlyIsoSeries(baseFloorUtcMs, 384, utcOffsetSec / 3600);
    const dailyDates = Array.from({ length: 16 }, (_, d) =>
      new Date(baseFloorUtcMs + utcOffsetSec * 1000 + d * 86400_000)
        .toISOString()
        .slice(0, 10)
    );
    const min15Times = Array.from({ length: 24 }, (_, q) =>
      new Date(baseFloorUtcMs + utcOffsetSec * 1000 + q * 900_000)
        .toISOString()
        .slice(0, 16)
    );

    const pLevels = [1000, 925, 850, 700, 500, 400, 300];
    const stdGph: Record<number, number> = {
      1000: 120,
      925: 780,
      850: 1490,
      700: 3020,
      500: 5580,
      400: 7220,
      300: 9180
    };
    const hourlyPayload: Record<string, unknown> = {
      time: localTimes,
      temperature_2m: localTimes.map((_, h) =>
        Number((baseCityTemp + Math.sin(h / 4) * 2.0).toFixed(2))
      ),
      apparent_temperature: localTimes.map((_, h) =>
        Number((baseCityTemp - 1.5 + Math.sin(h / 4) * 2.0).toFixed(2))
      ),
      relative_humidity_2m: localTimes.map(() => (isVan || isRize ? 86 : 70)),
      dew_point_2m: localTimes.map(() => Number((baseCityTemp - 3.0).toFixed(2))),
      pressure_msl: localTimes.map(() => (isErzurum ? 1043 : 1019)),
      cloud_cover: localTimes.map(() =>
        isErzurum ? 10 : isVan || isRize || opts?.coldPolarOutbreak ? 92 : 30
      ),
      shortwave_radiation: localTimes.map((_, h) => (h % 24 >= 8 && h % 24 <= 16 ? 250 : 0)),
      visibility: localTimes.map(() => 16000),
      uv_index: localTimes.map((_, h) => (h % 24 >= 10 && h % 24 <= 14 ? 3 : 0)),
      wind_speed_10m: localTimes.map(() => (isVan ? 24 : 14)),
      wind_gusts_10m: localTimes.map(() => (isVan ? 38 : 22)),
      wind_direction_10m: localTimes.map(() => (isVan ? 265 : isRize ? 320 : 20)),
      precipitation: localTimes.map(() =>
        isVan || isRize || opts?.coldPolarOutbreak ? 0.9 : 0.0
      ),
      precipitation_probability: localTimes.map(() =>
        isVan || isRize || opts?.coldPolarOutbreak ? 82 : 10
      ),
      rain: localTimes.map(() => (isRize ? 0.9 : 0.0)),
      snowfall: localTimes.map(() => (isVan || opts?.coldPolarOutbreak ? 0.8 : 0.0)),
      weather_code: localTimes.map(() =>
        isVan || opts?.coldPolarOutbreak ? 73 : isRize ? 61 : 1
      ),
      cape: localTimes.map(() => 40),
      lifted_index: localTimes.map(() => 2.2),
      convective_inhibition: localTimes.map(() => -15),
      freezing_level_height: localTimes.map(() =>
        isVan ? 1400 : opts?.coldPolarOutbreak ? 400 : 2200
      )
    };

    for (const hpa of pLevels) {
      const tLvl =
        hpa === 700 && isVan
          ? -14.8 // Lake Van 8.4°C - (-14.8°C) = 23.2°C >= 12°C -> true high-altitude LES!
          : hpa === 850 && opts?.coldPolarOutbreak
            ? -12.5
            : baseCityTemp - ((stdGph[hpa] - defaultElev) / 1000) * 6.0;
      hourlyPayload[`temperature_${hpa}hPa`] = localTimes.map(() => Number(tLvl.toFixed(1)));
      hourlyPayload[`relative_humidity_${hpa}hPa`] = localTimes.map(() => 75);
      hourlyPayload[`wind_speed_${hpa}hPa`] = localTimes.map(() => (isVan ? 32 : 24));
      hourlyPayload[`wind_direction_${hpa}hPa`] = localTimes.map(() =>
        isVan ? 265 : isRize ? 320 : 20
      );
      hourlyPayload[`geopotential_height_${hpa}hPa`] = localTimes.map(() => stdGph[hpa]);
    }

    return new Response(
      JSON.stringify({
        elevation: defaultElev,
        timezone: tzName,
        utc_offset_seconds: utcOffsetSec,
        current: {
          time: localTimes[0],
          temperature_2m: baseCityTemp,
          apparent_temperature: baseCityTemp - 1.5,
          relative_humidity_2m: 72,
          dew_point_2m: baseCityTemp - 3.0,
          pressure_msl: isErzurum ? 1043 : 1019,
          cloud_cover: isErzurum ? 10 : 30,
          wind_speed_10m: isVan ? 24 : 14,
          wind_gusts_10m: isVan ? 38 : 22,
          wind_direction_10m: isVan ? 265 : isRize ? 320 : 20,
          precipitation: isVan || isRize || opts?.coldPolarOutbreak ? 0.9 : 0.0,
          rain: isRize ? 0.9 : 0,
          snowfall: isVan || opts?.coldPolarOutbreak ? 0.8 : 0,
          weather_code: isVan || opts?.coldPolarOutbreak ? 73 : isRize ? 61 : 1,
          is_day: 1
        },
        minutely_15: {
          time: min15Times,
          temperature_2m: min15Times.map(() => baseCityTemp),
          precipitation: min15Times.map(() =>
            isVan || isRize || opts?.coldPolarOutbreak ? 0.22 : 0
          ),
          rain: min15Times.map(() => (isRize ? 0.22 : 0)),
          snowfall: min15Times.map(() => (isVan || opts?.coldPolarOutbreak ? 0.2 : 0)),
          weather_code: min15Times.map(() =>
            isVan || opts?.coldPolarOutbreak ? 73 : isRize ? 61 : 1
          ),
          wind_gusts_10m: min15Times.map(() => 22),
          lightning_potential: min15Times.map(() => 0),
          cape: min15Times.map(() => 35)
        },
        hourly: hourlyPayload,
        daily: {
          time: dailyDates,
          weather_code: dailyDates.map(() => 1),
          temperature_2m_max: dailyDates.map(() => baseCityTemp + 3),
          temperature_2m_min: dailyDates.map(() => baseCityTemp - 3),
          precipitation_sum: dailyDates.map(() =>
            isVan || isRize || opts?.coldPolarOutbreak ? 8.4 : 0
          ),
          precipitation_probability_max: dailyDates.map(() =>
            isVan || isRize || opts?.coldPolarOutbreak ? 85 : 10
          ),
          wind_speed_10m_max: dailyDates.map(() => 22),
          uv_index_max: dailyDates.map(() => 3),
          sunrise: dailyDates.map((d) => `${d}T07:55`),
          sunset: dailyDates.map((d) => `${d}T17:35`)
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  });
}

describe("Wave 6 — ARC-05: TR-81 Ana Orkestratör Egemenlik, Poligon Kilidi & %0.00 Çapraz-Şehir Sızıntısı", () => {
  let tmpVaultDir: string;
  const fixedNowMs = Date.parse("2026-11-28T12:00:00.000Z");

  beforeEach(() => {
    tmpVaultDir = fs.mkdtempSync(path.join(os.tmpdir(), "atmos-tr81-orch-"));
    process.env.ATMOS_DATA_DIR = tmpVaultDir;
    vi.useFakeTimers();
    vi.setSystemTime(new Date(fixedNowMs));
    resetWeatherRuntimeCachesForTests();
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    evictSnapshotMemoryForTests();
    evictStateLedgerMemoryForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    resetWeatherRuntimeCachesForTests();
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    delete process.env.ATMOS_DATA_DIR;
    fs.rmSync(tmpVaultDir, { recursive: true, force: true });
  });

  it("1. Dikdörtgen Kutu Sızıntısının Kapatılması: Yalova (TR-77), Gebze (TR-41), Bilecik (TR-11) ve Bandırma (TR-10) ASLA TR-16 Bursa motoruna veya WMO-17116 pinine düşmez", async () => {
    const perimeterNeighbors: Array<{
      loc: GeoLocation;
      expectedCode: string;
      expectedName: string;
      expectedEngineTier: "TIER_A_EMPIRICAL_WMO" | "TIER_B_DONOR_ALARO";
    }> = [
      {
        loc: { id: "yalova-tr", name: "Yalova", country: "Türkiye", lat: 40.655, lon: 29.276, elevation: 4 },
        expectedCode: "TR-77",
        expectedName: "Yalova",
        expectedEngineTier: "TIER_A_EMPIRICAL_WMO"
      },
      {
        loc: { id: "gebze-tr", name: "Gebze", country: "Türkiye", lat: 40.802, lon: 29.43, elevation: 130 },
        expectedCode: "TR-41",
        expectedName: "Kocaeli",
        expectedEngineTier: "TIER_A_EMPIRICAL_WMO"
      },
      {
        loc: { id: "bilecik-tr", name: "Bilecik", country: "Türkiye", lat: 40.145, lon: 29.979, elevation: 539 },
        expectedCode: "TR-11",
        expectedName: "Bilecik",
        expectedEngineTier: "TIER_B_DONOR_ALARO"
      },
      {
        loc: { id: "bandirma-tr", name: "Bandırma", country: "Türkiye", lat: 40.352, lon: 27.977, elevation: 52 },
        expectedCode: "TR-10",
        expectedName: "Balıkesir",
        expectedEngineTier: "TIER_A_EMPIRICAL_WMO"
      }
    ];

    for (const item of perimeterNeighbors) {
      const urls: string[] = [];
      vi.stubGlobal("fetch", createNationalMockFetch(fixedNowMs, urls));

      const bundle = await getWeatherBundle(item.loc);

      expect(bundle.location.provinceCode).toBe(item.expectedCode);
      expect(bundle.provinceSummary?.provinceCode).toBe(item.expectedCode);
      expect(bundle.provinceSummary?.provinceName).toBe(item.expectedName);
      expect(bundle.hybrid.engineMeta?.provinceCode).toBe(item.expectedCode);
      expect(bundle.hybrid.engineMeta?.provinceName).toBe(item.expectedName);
      expect(bundle.hybrid.engineMeta?.calibrationTier).toBe(item.expectedEngineTier);

      // Hiçbir komşu il isteğinde Bursa WMO 17116 koordinatı (40.2308, 29.0133) veya MGM il=Bursa sorgulanamaz!
      const pinnedToBursa17116 = urls.some(
        (u) => u.includes("latitude=40.2308") || u.includes("longitude=29.0133")
      );
      expect(pinnedToBursa17116, `${item.expectedCode} leaked 17116 pin`).toBe(false);
      expect(urls.some((u) => u.toLowerCase().includes("il=bursa"))).toBe(false);

      // Attributions içinde "Bursa", "Uludağ" veya "17116" sabit metni görünemez!
      const attrJson = JSON.stringify(bundle.hybrid.attributions);
      expect(attrJson).not.toContain("Bursa");
      expect(attrJson).not.toContain("Uludağ");
      expect(attrJson).not.toContain("17116");
    }
  });

  it("2. Bursa (TR-16) Egemenliği & Çevre Temizliği: Bursa Merkez ve Uludağ TR-16 motorunda kalır; LTFJ ve LTBG kesinlikle elenir", async () => {
    const urls: string[] = [];
    vi.stubGlobal("fetch", createNationalMockFetch(fixedNowMs, urls));

    const bursaCenter = await getWeatherBundle({
      id: "bursa-tr",
      name: "Bursa",
      country: "Türkiye",
      lat: 40.1885,
      lon: 29.061
    });

    expect(bursaCenter.location.provinceCode).toBe("TR-16");
    expect(bursaCenter.location.lat).toBeCloseTo(40.2308, 4);
    expect(bursaCenter.location.lon).toBeCloseTo(29.0133, 4);
    expect(bursaCenter.provinceSummary?.provinceCode).toBe("TR-16");
    expect(bursaCenter.provinceSummary?.calibrationTier).toBe("TIER_0_BURSA");
    expect(bursaCenter.hybrid.engineMeta?.provinceCode).toBe("TR-16");
    expect(bursaCenter.hybrid.engineMeta?.calibrationTier).toBe("BURSA_FROZEN_V5");

    // Komşu il havalimanları LTFJ (İstanbul) ve LTBG (Balıkesir) Bursa doğrulama listesine sızamaz!
    const bursaStationIds = (bursaCenter.hybrid.verification.stations ?? []).map((s) =>
      s.icaoId.toUpperCase()
    );
    expect(bursaStationIds).not.toContain("LTFJ");
    expect(bursaStationIds).not.toContain("LTBG");
    expect(bursaStationIds).not.toContain("ICAO_LTFJ");
    expect(bursaStationIds).not.toContain("ICAO_LTBG");

    // Uludağ (40.1075, 29.1278, 1850m) TR-16 içinde kalır ama 100m ova EMOS pinine zorlanmaz
    const uludagUrls: string[] = [];
    vi.stubGlobal("fetch", createNationalMockFetch(fixedNowMs, uludagUrls));
    const uludag = await fetchWeatherBundle({
      id: "bursa-uludag-tr",
      name: "Uludağ",
      country: "Türkiye",
      lat: 40.1075,
      lon: 29.1278,
      elevation: 1850
    });
    expect(uludag.location.provinceCode).toBe("TR-16");
    expect(uludag.provinceSummary?.provinceCode).toBe("TR-16");
    expect(
      uludagUrls.some((u) => u.includes("latitude=40.2308") && u.includes("elevation=100"))
    ).toBe(false);
  });

  it("3. Çoklu-İl Bespoke Orkestrasyon & %0.00 Çapraz Sızıntı: Ankara (DEK=none), Erzurum (LTCE ayaz izolasyonu + 700 hPa), Van (1648 m Van Gölü LES), Rize (Doğu Karadeniz + İyidere/Of vekil engeli), Bayburt (Tier-B ALARO) ve Londra (GLOBAL)", async () => {
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      createNationalMockFetch(fixedNowMs, urls, { coldPolarOutbreak: true })
    );

    const [bursa, ankara, erzurum, van, rize, bayburt, london] = await Promise.all([
      getWeatherBundle({ id: "bursa-tr", name: "Bursa", country: "Türkiye", lat: 40.2308, lon: 29.0133, elevation: 100 }),
      getWeatherBundle({ id: "ankara-tr", name: "Ankara", country: "Türkiye", lat: 39.9334, lon: 32.8597, elevation: 891 }),
      getWeatherBundle({ id: "erzurum-tr", name: "Erzurum", country: "Türkiye", lat: 39.9058, lon: 41.2544, elevation: 1895 }),
      getWeatherBundle({ id: "van-tr", name: "Van", country: "Türkiye", lat: 38.4942, lon: 43.38, elevation: 1675 }),
      getWeatherBundle({ id: "rize-tr", name: "Rize", country: "Türkiye", lat: 41.0255, lon: 40.5177, elevation: 8 }),
      getWeatherBundle({ id: "bayburt-tr", name: "Bayburt", country: "Türkiye", lat: 40.2547, lon: 40.2207, elevation: 1582 }),
      getWeatherBundle({ id: "london-gb", name: "Londra", country: "Birleşik Krallık", countryCode: "GB", lat: 51.5074, lon: -0.1278, elevation: 25 })
    ]);

    // 1) Ankara (TR-06): T850 = -12.5°C kuzeyli kutup soğuğunda dahi karasal olduğu için sahte DEK üretmez!
    expect(ankara.provinceSummary?.provinceCode).toBe("TR-06");
    expect(ankara.snowAndLightning?.dekStatus15d).toBe("none");
    expect(JSON.stringify(ankara.hybrid.attributions)).toContain("Ankara");
    expect(JSON.stringify(ankara.hybrid.attributions)).not.toContain("Marmara");
    expect(JSON.stringify(ankara.hybrid.attributions)).not.toContain("Bursa");

    // 2) Erzurum (TR-25): 17095 Yakutiye Merkez (-21.8°C) aktifken LTCE (-29.4°C, excludeFromCenterHeadline) merkezi -29°C'ye çekmez!
    expect(erzurum.provinceSummary?.provinceCode).toBe("TR-25");
    expect(erzurum.hybrid.engineMeta?.calibrationTier).toBe("TIER_A_EMPIRICAL_WMO");
    expect(erzurum.current.temperature).toBeGreaterThan(-25.0);
    expect(JSON.stringify(erzurum.hybrid.attributions)).toContain("700 hPa");
    expect(JSON.stringify(erzurum.hybrid.attributions)).not.toContain("Uludağ");

    // 3) Van (TR-65): 1648 m sodalı Van Gölü canlı su sıcaklığı (8.4°C) ve 700 hPa göl etkisi kar (LES) aktif!
    expect(van.provinceSummary?.provinceCode).toBe("TR-65");
    expect(van.hybrid.engineMeta?.seaOrLakeTempC).toBeCloseTo(8.4, 1);
    expect(van.snowAndLightning?.dekStatus15d).not.toBe("none");
    expect(JSON.stringify(van.hybrid.attributions)).not.toContain("Marmara");

    // 4) Rize (TR-53): Canlı Karadeniz SST (14.8°C) alınır; vekil Trabzon/Of (17775) istasyonu Rize listesine sızmaz!
    expect(rize.provinceSummary?.provinceCode).toBe("TR-53");
    expect(rize.hybrid.engineMeta?.seaOrLakeTempC).toBeCloseTo(14.8, 1);
    const rizeStations = (rize.hybrid.verification.stations ?? []).map((s) => s.icaoId);
    expect(rizeStations).toContain("MGM_17040");
    expect(rizeStations).not.toContain("MGM_17775");

    // 5) Bayburt (TR-69): Dürüst TIER_B_DONOR_KALMAN / TIER_B_DONOR_ALARO + sıfır yabancı METAR
    expect(bayburt.provinceSummary?.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(bayburt.hybrid.engineMeta?.calibrationTier).toBe("TIER_B_DONOR_ALARO");
    const bayburtStations = (bayburt.hybrid.verification.stations ?? []).map((s) => s.icaoId);
    expect(bayburtStations).toContain("MGM_17089");
    expect(bayburtStations.some((id) => id.startsWith("LT"))).toBe(false);

    // 6) Londra (GLOBAL): provinceSummary === null, engineMeta.calibrationTier === "GLOBAL", sıfır Türkiye metni sızıntısı
    expect(london.location.provinceCode).toBeUndefined();
    expect(london.provinceSummary).toBeNull();
    expect(london.hybrid.engineMeta?.calibrationTier).toBe("GLOBAL");
    expect(JSON.stringify(london.hybrid.attributions)).not.toContain("Bursa");
    expect(JSON.stringify(london.hybrid.attributions)).not.toContain("Marmara");

    // 7) Disk Kasa İzolasyonu: Her il kendi dizinine yazar; hiçbir il diğerinin anlık görüntüsünü veya defterini kirletmez
    expect(bursa.provinceSummary?.provinceCode).toBe("TR-16");
    const multiYalova = await fetchMultiModelBundle({
      id: "yalova-tr",
      name: "Yalova",
      country: "Türkiye",
      lat: 40.655,
      lon: 29.276,
      elevation: 4
    });
    expect(multiYalova.provinceCode).toBe("TR-77");

    expect(resolveLedgerShardPath("TR-16")).not.toBe(resolveLedgerShardPath("TR-06"));
    expect(resolveSnapshotVaultShardPath("TR-16")).not.toBe(
      resolveSnapshotVaultShardPath("TR-25")
    );
  });

  it("4. Erzurum Açık Kış Gecesi LTCE (-35.0°C) Soğuk Havuz Düzeltmesi & TR-16 Sabitlenmiş Önbellek Koruması", async () => {
    const nightUtcMs = Date.parse("2026-11-28T01:00:00.000Z"); // 04:00 TRT açık Sibirya gecesi
    vi.setSystemTime(new Date(nightUtcMs));
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      createNationalMockFetch(nightUtcMs, urls, { erzurumCenterOfflineNight: true })
    );

    const erzurumNight = await getWeatherBundle({
      id: "erzurum-tr",
      name: "Erzurum",
      country: "Türkiye",
      lat: 39.9058,
      lon: 41.2544,
      elevation: 1895
    });

    // 17095 çevrimdışı olsa bile Z_base (1758 m) enversiyonu + kentsel etek ısı adası sayesinde
    // Erzurum Şehir Merkezi (1895 m) Karasu tabanındaki -35.0°C LTCE değerinden belirgin şekilde ılıktır!
    expect(erzurumNight.provinceSummary?.provinceCode).toBe("TR-25");
    expect(erzurumNight.current.temperature).toBeGreaterThan(-31.0);
    expect(erzurumNight.current.temperature).toBeLessThan(-18.0);
  });
});

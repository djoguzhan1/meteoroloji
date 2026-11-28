import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as getWindGridRoute } from "../app/api/wind-grid/route";
import {
  NATIVE_RADAR_MAX_ZOOM,
  RADAR_TILE_REQUEST_SIZE
} from "../components/LiveRadarMap";
import {
  sampleWindFast,
  stepAndBatchWindParticles,
  type WindParticleState
} from "../lib/perf-budgets";
import {
  isGrayscaleErrorTile,
  RAINVIEWER_HD_TILE_SIZE,
  RAINVIEWER_NATIVE_MAX_ZOOM,
  rgbaPixelToDbz,
  tileToDbzGrid
} from "../lib/radar-nowcast";
import {
  buildRainViewerTileUrl,
  dbzToRainRateMmHr,
  projectRgbToScheme2Dbz,
  RAINVIEWER_COLOR_SCHEME,
  RAINVIEWER_DBZ_ANCHORS,
  RAINVIEWER_SMOOTH_OPTIONS,
  rgbaPixelToScheme2Dbz,
  rgbaPixelToScheme2DbzFast
} from "../lib/radar-palette";
import {
  resetWeatherRuntimeCachesForTests,
  snapWindGridBounds
} from "../lib/weather";
import { formatPrecip, formatRadarClock } from "../lib/weather-client";
import type { WindGridBundle } from "../lib/weather-types";

const REPO_ROOT = path.resolve(__dirname, "..");

function parseClockMinutes(clockLabel: string): { minutes: number; zone: string } {
  const m = /^(\d{2}):(\d{2})\s+(.+)$/.exec(clockLabel.trim());
  if (!m) {
    throw new Error(`Unexpected radar clock format: ${clockLabel}`);
  }
  return {
    minutes: Number(m[1]) * 60 + Number(m[2]),
    zone: m[3]
  };
}

describe("Radar Paleti (Scheme 2), Marshall-Palmer Z-R, Saat Dilimi, Antimeridyen ve WorldView/LiveRadarMap Değişmezlikleri", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetWeatherRuntimeCachesForTests();
  });

  it("1. Scheme 2 12-Çapa Monoton dBZ Eğrisi: tüm çapalarda ve ara segmentlerde dBZ kesin monoton artar", () => {
    expect(RAINVIEWER_DBZ_ANCHORS.length).toBe(12);
    expect(RAINVIEWER_DBZ_ANCHORS[0].dbz).toBe(10.0);
    expect(RAINVIEWER_DBZ_ANCHORS[RAINVIEWER_DBZ_ANCHORS.length - 1].dbz).toBe(65.0);

    for (let i = 0; i < RAINVIEWER_DBZ_ANCHORS.length; i++) {
      const anchor = RAINVIEWER_DBZ_ANCHORS[i];
      if (i > 0) {
        expect(anchor.dbz).toBeGreaterThan(RAINVIEWER_DBZ_ANCHORS[i - 1].dbz);
      }
      const projected = rgbaPixelToScheme2Dbz(anchor.r, anchor.g, anchor.b, 255);
      expect(projected).toBeCloseTo(anchor.dbz, 1);

      const fastProjected = rgbaPixelToScheme2DbzFast(anchor.r, anchor.g, anchor.b, 255);
      expect(Math.abs(fastProjected - anchor.dbz)).toBeLessThan(2.5);
    }

    // Ardışık renk çapaları arasındaki doğrusal RGB geçiş örnekleri de monoton dBZ üretmelidir
    let prevMidDbz = -Infinity;
    for (let k = 0; k < RAINVIEWER_DBZ_ANCHORS.length - 1; k++) {
      const c0 = RAINVIEWER_DBZ_ANCHORS[k];
      const c1 = RAINVIEWER_DBZ_ANCHORS[k + 1];
      const mr = Math.round((c0.r + c1.r) / 2);
      const mg = Math.round((c0.g + c1.g) / 2);
      const mb = Math.round((c0.b + c1.b) / 2);
      const midDbz = projectRgbToScheme2Dbz(mr, mg, mb, 255);
      expect(midDbz).toBeGreaterThan(prevMidDbz);
      expect(midDbz).toBeGreaterThanOrEqual(c0.dbz - 0.5);
      expect(midDbz).toBeLessThanOrEqual(c1.dbz + 0.5);
      prevMidDbz = midDbz;
    }
  });

  it("2. Eski Ölü-Bant #f97316 (RGB 249, 115, 22, 240) Turuncu Sağanak Pikseli: 41..44 dBZ (~42.5 dBZ) döner, asla 14 dBZ dönmez", () => {
    const exactOrangeDbz = rgbaPixelToScheme2Dbz(249, 115, 22, 240);
    const fastOrangeDbz = rgbaPixelToScheme2DbzFast(249, 115, 22, 240);
    const nowcastOrangeDbz = rgbaPixelToDbz(249, 115, 22, 240);

    expect(exactOrangeDbz).not.toBeCloseTo(14, 0);
    expect(fastOrangeDbz).not.toBeCloseTo(14, 0);

    expect(exactOrangeDbz).toBeGreaterThanOrEqual(41);
    expect(exactOrangeDbz).toBeLessThanOrEqual(44);
    expect(exactOrangeDbz).toBeCloseTo(42.5, 1);

    expect(fastOrangeDbz).toBeGreaterThanOrEqual(41);
    expect(fastOrangeDbz).toBeLessThanOrEqual(44);
    expect(nowcastOrangeDbz).toBeCloseTo(exactOrangeDbz, 5);

    // Komşu turuncu sağanak pikselleri de ölü banda düşmemelidir
    for (const [r, g, b] of [
      [251, 146, 60], // #fb923c
      [234, 88, 12], // #ea580c
      [245, 130, 25]
    ]) {
      const dbz = rgbaPixelToScheme2Dbz(r, g, b, 240);
      expect(dbz).toBeGreaterThan(39);
      expect(dbz).toBeLessThan(47);
    }
  });

  it("3. Akromatik Gri Karolar (chroma <= 10): hem tam çözücüde hem RGB555 LUT (rgbaPixelToScheme2DbzFast) içinde kesin 0 dBZ döner", () => {
    // 0..255 arası tüm saf griler
    for (let v = 0; v <= 255; v++) {
      expect(rgbaPixelToScheme2Dbz(v, v, v, 255)).toBe(0);
      expect(rgbaPixelToScheme2DbzFast(v, v, v, 255)).toBe(0);
    }

    // 5-bit kuantizasyon sınırlarını (ör. 103>>3=12 vs 112>>3=14) aşan hafif tonlu akromatik griler (chroma <= 10)
    const borderlineAchromatics: Array<[number, number, number, number]> = [
      [103, 108, 113, 255], // chroma = 10
      [110, 115, 105, 220], // chroma = 10
      [143, 144, 152, 180], // chroma = 9, 143>>3=17 vs 152>>3=19
      [199, 204, 209, 240], // chroma = 10, 199>>3=24 vs 209>>3=26
      [38, 44, 48, 165] // chroma = 10
    ];
    for (const [r, g, b, a] of borderlineAchromatics) {
      expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(10);
      expect(rgbaPixelToScheme2Dbz(r, g, b, a)).toBe(0);
      expect(rgbaPixelToScheme2DbzFast(r, g, b, a)).toBe(0);
    }

    // Tamamı chroma <= 10 piksellerden oluşan bir karonun tileToDbzGrid çıktısı tamamen 0 olmalı
    const w = 16;
    const h = 16;
    const rgba = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const base = (i * 7) % 230;
      rgba[i * 4] = base;
      rgba[i * 4 + 1] = base + 5;
      rgba[i * 4 + 2] = base + 10;
      rgba[i * 4 + 3] = 210;
    }
    const tile = { width: w, height: h, rgba };
    expect(isGrayscaleErrorTile(tile)).toBe(true);
    const grid = tileToDbzGrid(tile);
    expect(grid.every((val) => val === 0)).toBe(true);
  });

  it("4. LiveRadarMap.tsx ve lib/radar-nowcast.ts karo URL'leri birebir aynı Scheme 2 (2/1_1.png) ve 512px Z7 sözleşmesini üretir", () => {
    expect(RAINVIEWER_COLOR_SCHEME).toBe(2);
    expect(RAINVIEWER_SMOOTH_OPTIONS).toBe("1_1");
    expect(RADAR_TILE_REQUEST_SIZE).toBe(512);
    expect(RAINVIEWER_HD_TILE_SIZE).toBe(512);
    expect(NATIVE_RADAR_MAX_ZOOM).toBe(7);
    expect(RAINVIEWER_NATIVE_MAX_ZOOM).toBe(7);

    const url1 = buildRainViewerTileUrl(
      "https://tilecache.rainviewer.com/",
      "/v2/radar/1764244800/",
      RADAR_TILE_REQUEST_SIZE,
      NATIVE_RADAR_MAX_ZOOM,
      74,
      48
    );
    const url2 = buildRainViewerTileUrl(
      "https://tilecache.rainviewer.com",
      "v2/radar/1764244800",
      RAINVIEWER_HD_TILE_SIZE,
      RAINVIEWER_NATIVE_MAX_ZOOM,
      74,
      48
    );

    expect(url1).toBe(
      "https://tilecache.rainviewer.com/v2/radar/1764244800/512/7/74/48/2/1_1.png"
    );
    expect(url2).toBe(url1);

    const liveRadarSrc = fs.readFileSync(
      path.join(REPO_ROOT, "components/LiveRadarMap.tsx"),
      "utf-8"
    );
    const radarNowcastSrc = fs.readFileSync(
      path.join(REPO_ROOT, "lib/radar-nowcast.ts"),
      "utf-8"
    );
    expect(liveRadarSrc).toContain("buildRainViewerTileUrl(");
    expect(radarNowcastSrc).toContain("buildRainViewerTileUrl(");
  });

  it("5. Marshall-Palmer & Konvektif Z-R Lejant Eşitliği: 20 dBZ (~0.65 mm/sa), 50 dBZ (~63.4 mm/sa) ve eski ~48 mm/sa dizgesinin silinmesi", () => {
    // 20 dBZ -> Z = 100, Marshall-Palmer Z = 200 * R^1.6 => R = (0.5)^(1/1.6) ≈ 0.6484 mm/sa
    const rate20 = dbzToRainRateMmHr(20);
    expect(rate20).toBeCloseTo(Math.pow(100 / 200, 1 / 1.6), 5);
    expect(rate20).toBeGreaterThan(0.64);
    expect(rate20).toBeLessThan(0.66);

    // 50 dBZ -> Z = 100000, Konvektif Z = 300 * R^1.4 => R = (100000/300)^(1/1.4) ≈ 63.3957 mm/sa
    const rate50 = dbzToRainRateMmHr(50);
    expect(rate50).toBeCloseTo(Math.pow(100_000 / 300, 1 / 1.4), 5);
    expect(rate50).toBeGreaterThan(63.3);
    expect(rate50).toBeLessThan(63.5);

    // Eşik altı (< 13 dBZ) sıfır ve dolu çekirdeği tavanı (85 mm/sa)
    expect(dbzToRainRateMmHr(12.9)).toBe(0);
    expect(dbzToRainRateMmHr(65)).toBe(85);

    expect(formatPrecip(rate20, "metric", { per: "hour" })).toContain("0.6");
    expect(formatPrecip(rate50, "metric", { per: "hour" })).toContain("63.4");

    const liveRadarSrc = fs.readFileSync(
      path.join(REPO_ROOT, "components/LiveRadarMap.tsx"),
      "utf-8"
    );
    expect(liveRadarSrc).toContain("dbzToRainRateMmHr(20)");
    expect(liveRadarSrc).toContain("dbzToRainRateMmHr(50)");
    expect(liveRadarSrc).not.toContain("48 mm/sa");
    expect(liveRadarSrc).not.toContain("~48");
  });

  it("6. Hedef Şehir Saat Dilimi (formatRadarClock): Europe/Istanbul (TRT), Asia/Tokyo (JST), America/New_York (EST/EDT) saat farkları ve geçersiz saat dilimi yedeği", () => {
    // Kış: 2026-01-15T12:00:00Z
    const winterUnixSec = Math.floor(Date.parse("2026-01-15T12:00:00Z") / 1000);
    const istWinter = formatRadarClock(winterUnixSec, "Europe/Istanbul", 10800);
    const tokWinter = formatRadarClock(winterUnixSec, "Asia/Tokyo", 32400);
    const nycWinter = formatRadarClock(winterUnixSec, "America/New_York", -18000);

    expect(istWinter).toBe("15:00 TRT");
    expect(tokWinter).toBe("21:00 JST");
    expect(nycWinter).toBe("07:00 EST");

    const istMinW = parseClockMinutes(istWinter);
    const tokMinW = parseClockMinutes(tokWinter);
    const nycMinW = parseClockMinutes(nycWinter);
    expect(tokMinW.minutes - istMinW.minutes).toBe(6 * 60); // Tokyo = İstanbul + 6 saat
    expect(istMinW.minutes - nycMinW.minutes).toBe(8 * 60); // İstanbul = New York (EST) + 8 saat

    // Yaz (DST): 2026-07-15T12:00:00Z
    const summerUnixSec = Math.floor(Date.parse("2026-07-15T12:00:00Z") / 1000);
    const istSummer = formatRadarClock(summerUnixSec, "Europe/Istanbul", 10800);
    const tokSummer = formatRadarClock(summerUnixSec, "Asia/Tokyo", 32400);
    const nycSummer = formatRadarClock(summerUnixSec, "America/New_York", -14400);

    expect(istSummer).toBe("15:00 TRT");
    expect(tokSummer).toBe("21:00 JST");
    expect(nycSummer).toBe("08:00 EDT");

    const istMinS = parseClockMinutes(istSummer);
    const nycMinS = parseClockMinutes(nycSummer);
    expect(istMinS.minutes - nycMinS.minutes).toBe(7 * 60); // İstanbul = New York (EDT) + 7 saat

    // Geçersiz IANA saat diliminde veya "UTC" + sıfır-dışı utcOffsetSeconds durumunda güvenli yedek
    expect(formatRadarClock(winterUnixSec, "Invalid/Timezone_Name", 19800)).toBe(
      "17:30 UTC+5:30"
    );
    expect(formatRadarClock(winterUnixSec, "Invalid/Timezone_Name", -10800)).toBe(
      "09:00 UTC-3"
    );
    expect(formatRadarClock(winterUnixSec, "UTC", 10800)).toBe("15:00 UTC+3");
    expect(formatRadarClock(winterUnixSec, undefined, 0)).toBe("12:00 UTC+0");
  });

  it("7. Antimeridyen (±180°, east < west) Sürekliliği: /api/wind-grid doğrulaması, snapWindGridBounds ve sampleWindFast sıçramasız enterpolasyonu", async () => {
    // 7a. snapWindGridBounds: antimeridyen aşan kutuda (west=170, south=-25, east=-170, north=-10) east > west sürekli kutu üretir
    const antiSnapped = snapWindGridBounds({
      west: 170,
      south: -25,
      east: -170,
      north: -10
    });
    expect(antiSnapped.west).toBe(170);
    expect(antiSnapped.east).toBe(190);
    expect(antiSnapped.east).toBeGreaterThan(antiSnapped.west);
    expect(antiSnapped.east - antiSnapped.west).toBe(20);
    expect(antiSnapped.south).toBe(-25);
    expect(antiSnapped.north).toBe(-10);

    // Normal kutularda geriye dönük tam eşitlik korunur
    const normalSnapped = snapWindGridBounds({
      west: 28.0,
      south: 39.5,
      east: 30.5,
      north: 41.0
    });
    expect(normalSnapped).toEqual({
      south: 39.5,
      west: 28.0,
      north: 41.0,
      east: 30.5,
      cacheKey: "39.50,28.00,41.00,30.50"
    });

    // 7b. /api/wind-grid route handler: east < west antimeridyen kutusunu 200 OK ile çözer, aşırı geniş kutuyu 400 ile reddeder
    const capturedUrls: string[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      capturedUrls.push(urlStr);
      const mockPoints = Array.from({ length: 25 }, (_, idx) => ({
        current: {
          wind_speed_10m: 20 + (idx % 5) * 4,
          wind_direction_10m: 270
        }
      }));
      return new Response(JSON.stringify(mockPoints), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });

    const validAntiReq = new NextRequest(
      "https://atmos.example.com/api/wind-grid?south=-25&west=170&north=-10&east=-170"
    );
    const validAntiRes = await getWindGridRoute(validAntiReq);
    expect(validAntiRes.status).toBe(200);
    const gridData: WindGridBundle = await validAntiRes.json();
    expect(gridData.west).toBe(170);
    expect(gridData.east).toBe(190);
    expect(gridData.u.length).toBe(25);
    expect(capturedUrls.length).toBe(1);
    const openMeteoUrl = new URL(capturedUrls[0]);
    const sentLons = (openMeteoUrl.searchParams.get("longitude") ?? "")
      .split(",")
      .map(Number);
    expect(sentLons.length).toBe(25);
    expect(sentLons.every((l) => l >= -180 && l <= 180)).toBe(true);

    const tooWideReq = new NextRequest(
      "https://atmos.example.com/api/wind-grid?south=-25&west=170&north=-10&east=0"
    );
    const tooWideRes = await getWindGridRoute(tooWideReq);
    expect(tooWideRes.status).toBe(400);

    // 7c. sampleWindFast: +179.5°, ±180° ve -179.5° boylamları arasında sıçramasız sürekli rüzgar enterpolasyonu
    // 5 sütun: 170°, 175°, 180°, 185° (-175°), 190° (-170°); doğrusal u = [10, 20, 30, 40, 50]
    const cols = 5;
    const rows = 5;
    const uVals: number[] = [];
    const vVals: number[] = [];
    const spdVals: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = 10 + c * 10;
        const v = -5 + c * 2;
        uVals.push(u);
        vVals.push(v);
        spdVals.push(Math.hypot(u, v));
      }
    }

    const unwrappedGrid: WindGridBundle = {
      rows,
      cols,
      south: -25,
      north: -10,
      west: 170,
      east: 190,
      u: uVals,
      v: vVals,
      speedKmh: spdVals,
      maxSpeedKmh: Math.max(...spdVals),
      fetchedAt: "2026-11-27T12:00:00Z"
    };
    const wrappedGrid: WindGridBundle = {
      ...unwrappedGrid,
      east: -170
    };

    for (const testGrid of [unwrappedGrid, wrappedGrid]) {
      const sWestOfIdl = sampleWindFast(testGrid, -17.5, 179.5); // dLon = 9.5 -> u = 29.0
      const sAtIdlPos = sampleWindFast(testGrid, -17.5, 180.0); // dLon = 10.0 -> u = 30.0
      const sAtIdlNeg = sampleWindFast(testGrid, -17.5, -180.0); // dLon = 10.0 -> u = 30.0
      const sEastOfIdl = sampleWindFast(testGrid, -17.5, -179.5); // dLon = 10.5 -> u = 31.0

      expect(sWestOfIdl.u).toBeCloseTo(29.0, 4);
      expect(sAtIdlPos.u).toBeCloseTo(30.0, 4);
      expect(sAtIdlNeg.u).toBeCloseTo(30.0, 4);
      expect(sEastOfIdl.u).toBeCloseTo(31.0, 4);

      // +179.5° ile -179.5° arasında sıçrama yok; tam orta değer ±180° değerine eşittir
      expect(Math.abs(sEastOfIdl.u - sWestOfIdl.u)).toBeCloseTo(2.0, 4);
      expect(0.5 * (sWestOfIdl.u + sEastOfIdl.u)).toBeCloseTo(sAtIdlPos.u, 4);
    }

    // Parçacık adımlayıcı da antimeridyen sınırında NaN üretmeden çalışır
    const particles: WindParticleState[] = [{ x: 250, y: 150, age: 5, maxAge: 100 }];
    const buckets = stepAndBatchWindParticles({
      particles,
      grid: unwrappedGrid,
      width: 500,
      height: 300,
      bounds: { northLat: -10, southLat: -25, westLon: 170, eastLon: -170 },
      dtSec: 1 / 60,
      zoom: 5
    });
    expect(Number.isFinite(particles[0].x)).toBe(true);
    expect(Number.isFinite(particles[0].y)).toBe(true);
    expect(buckets.some((b) => b.length === 4)).toBe(true);
  });

  it("8. WorldView & LiveRadarMap Birim SSOT ve Mobil İki Parmak Pinch-to-Zoom + hadMultiTouch Tıklama Kilitleri", () => {
    const worldViewSrc = fs.readFileSync(
      path.join(REPO_ROOT, "components/WorldView.tsx"),
      "utf-8"
    );
    expect(worldViewSrc).toContain("resolveActiveTemporalView(pointBundle, 0)");
    expect(worldViewSrc).toContain("promoteLocationWithBundle(selectedLoc, pointBundle)");
    expect(worldViewSrc).toContain('buildLocationHref("/", selectedLoc)');
    expect(worldViewSrc).toContain("buildWeatherApiUrl(loc)");
    expect(worldViewSrc).toContain("formatTemperature(");
    expect(worldViewSrc).toContain("formatWindSpeed(");
    expect(worldViewSrc).toContain("formatPressure(");
    expect(worldViewSrc).toContain("formatElevation(");

    const liveRadarSrc = fs.readFileSync(
      path.join(REPO_ROOT, "components/LiveRadarMap.tsx"),
      "utf-8"
    );
    // İki parmak işaretçi haritası ve logaritmik pinch-to-zoom hesabı
    expect(liveRadarSrc).toContain("pointersRef = useRef<Map<number, ActivePointerSample>>");
    expect(liveRadarSrc).toContain("pointersRef.current.size >= 2");
    expect(liveRadarSrc).toContain("Math.log2(dist / pinchRef.current.startDist)");
    expect(liveRadarSrc).toContain("hadMultiTouchRef.current = true");
    // Çoklu dokunuş sonrası parmak kaldırılırken yanlışlıkla koordinat seçilmesini önleyen hadMultiTouch kilidi
    expect(liveRadarSrc).toContain("const hadMultiTouch = hadMultiTouchRef.current");
    expect(liveRadarSrc).toContain("!hadMultiTouch");
    expect(liveRadarSrc).toContain("maxTravel <= 6");
  });
});

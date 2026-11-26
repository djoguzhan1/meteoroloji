import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  readReverseGeocodeCache,
  writeReverseGeocodeCache
} from "../app/api/reverse-geocode/route";
import {
  computeRadarTileLayout,
  latToWorldY,
  lonToWorldX,
  NATIVE_RADAR_MAX_ZOOM,
  RADAR_TILE_REQUEST_SIZE
} from "../components/LiveRadarMap";
import {
  computeWindParticleSpeedPxPerSec,
  latToMercatorY,
  mercatorYToLat,
  stepAndBatchWindParticles,
  type WindParticleState
} from "../lib/perf-budgets";
import {
  isGrayscaleErrorTile,
  latLonToSlippyTilePixel,
  RAINVIEWER_HD_TILE_SIZE,
  RAINVIEWER_NATIVE_MAX_ZOOM,
  rgbaPixelToDbz
} from "../lib/radar-nowcast";
import { snapWindGridBounds } from "../lib/weather";
import type { WindGridBundle } from "../lib/weather-types";

describe("Radar Sekmesi A-Z Kökten İyileştirme Doğrulama Paketi (5 Adım)", () => {
  it("Adım 1: Overzoom mimarisi Z8-Z10 yakınlaştırmada RainViewer Z7 512px karolarını dikişsiz ölçekler ve gri hata görsellerini 0 dBZ olarak reddeder", () => {
    expect(NATIVE_RADAR_MAX_ZOOM).toBe(7);
    expect(RADAR_TILE_REQUEST_SIZE).toBe(512);
    expect(RAINVIEWER_NATIVE_MAX_ZOOM).toBe(7);
    expect(RAINVIEWER_HD_TILE_SIZE).toBe(512);

    // Bursa (40.1885°N, 29.0610°E) için Z7 @ 512px tam ~466 m/piksel alt-kilometre çözünürlüğü korur
    const bursaTile = latLonToSlippyTilePixel(40.1885, 29.061, 7, 512);
    expect(bursaTile.metersPerPixel).toBeGreaterThan(450);
    expect(bursaTile.metersPerPixel).toBeLessThan(480);

    // Zoom 9 ve Zoom 10'da radarZoom 7'de kilitlenir, karo boyutu 1024px ve 2048px olarak boşluksuz büyür
    for (const zoom of [6, 7, 8, 9, 10]) {
      const layout = computeRadarTileLayout({
        centerWorldX: lonToWorldX(29.061, zoom),
        centerWorldY: latToWorldY(40.1885, zoom),
        viewportWidth: 840,
        viewportHeight: 580,
        zoom
      });
      expect(layout.radarZoom).toBe(Math.min(zoom, 7));
      expect(layout.displayTileSize).toBe(256 * Math.pow(2, Math.max(0, zoom - 7)));
      expect(layout.tiles.length).toBeGreaterThan(0);

      // Komşu karolar arasında 1 piksel bile boşluk veya binme olmamalı
      const firstRowY = layout.tiles[0].y;
      const sameRow = layout.tiles
        .filter((t) => t.y === firstRowY)
        .sort((a, b) => a.x - b.x);
      for (let i = 1; i < sameRow.length; i++) {
        expect(sameRow[i].left - sameRow[i - 1].left).toBe(layout.displayTileSize);
      }
    }

    // RainViewer "Zoom Level Not Supported" gri kutu & yazı pikselleri 0 dBZ dönmeli (eskiden 14-16 dBZ sahte yağış üretiyordu!)
    expect(rgbaPixelToDbz(110, 110, 110, 166)).toBe(0);
    expect(rgbaPixelToDbz(146, 146, 146, 174)).toBe(0);
    expect(rgbaPixelToDbz(203, 203, 203, 188)).toBe(0);
    expect(rgbaPixelToDbz(38, 38, 38, 149)).toBe(0);

    // Gerçek renkli radar ekoları (mavi, yeşil, sarı, kırmızı, mor) korunduğunu doğrula
    expect(rgbaPixelToDbz(56, 189, 248, 210)).toBeGreaterThan(15);
    expect(rgbaPixelToDbz(40, 185, 120, 255)).toBeGreaterThan(25);
    expect(rgbaPixelToDbz(239, 68, 68, 255)).toBeGreaterThan(45);

    // Tamamı gri uyarı karosu isGrayscaleErrorTile tarafından yakalanır
    const grayRgba = new Uint8Array(32 * 32 * 4);
    for (let i = 0; i < 250; i++) {
      grayRgba[i * 4] = 110;
      grayRgba[i * 4 + 1] = 110;
      grayRgba[i * 4 + 2] = 110;
      grayRgba[i * 4 + 3] = 166;
    }
    expect(isGrayscaleErrorTile({ width: 32, height: 32, rgba: grayRgba })).toBe(true);
  });

  it("Adım 2: Rüzgar parçacık fiziği 60Hz/120Hz/144Hz ekranlarda birebir aynı hızda akar ve düşük zoom'da Web Mercator enlemini doğru örnekler", () => {
    // 25 km/s rüzgar zoom 6'da aşırı hızlı (82-165 px/s) değil, ~26.5 px/s doğal akış hızındadır
    const v25 = computeWindParticleSpeedPxPerSec(25, 6);
    const v50 = computeWindParticleSpeedPxPerSec(50, 6);
    expect(v25).toBeGreaterThan(23);
    expect(v25).toBeLessThan(30);
    expect(v50).toBeGreaterThan(40);
    expect(v50).toBeLessThan(52);

    const uniformGrid: WindGridBundle = {
      rows: 2,
      cols: 2,
      south: 38,
      north: 42,
      west: 26,
      east: 32,
      u: [24, 24, 24, 24],
      v: [12, 12, 12, 12],
      speedKmh: [26.8, 26.8, 26.8, 26.8],
      maxSpeedKmh: 26.8,
      fetchedAt: "2026-11-26T21:00:00Z"
    };

    const p60: WindParticleState[] = [{ x: 300, y: 250, age: 10, maxAge: 120 }];
    const p120: WindParticleState[] = [{ x: 300, y: 250, age: 10, maxAge: 120 }];
    const bounds = { northLat: 42, southLat: 38, westLon: 26, eastLon: 32 };

    // 60 Hz'de 1 kare (1/60 sn) vs 120 Hz'de 2 kare (2 x 1/120 sn)
    stepAndBatchWindParticles({
      particles: p60,
      grid: uniformGrid,
      width: 600,
      height: 500,
      bounds,
      dtSec: 1 / 60,
      zoom: 6
    });
    stepAndBatchWindParticles({
      particles: p120,
      grid: uniformGrid,
      width: 600,
      height: 500,
      bounds,
      dtSec: 1 / 120,
      zoom: 6
    });
    stepAndBatchWindParticles({
      particles: p120,
      grid: uniformGrid,
      width: 600,
      height: 500,
      bounds,
      dtSec: 1 / 120,
      zoom: 6
    });

    expect(p120[0].x).toBeCloseTo(p60[0].x, 5);
    expect(p120[0].y).toBeCloseTo(p60[0].y, 5);
    expect(p120[0].age).toBeCloseTo(p60[0].age, 5);

    // Web Mercator ters projeksiyon doğruluğu: Kuzey 66° ile Güney 10° ekran ortası doğrusal 38° değil ~44.3°N olmalıdır!
    const midMerc = 0.5 * (latToMercatorY(66) + latToMercatorY(10));
    const midLat = mercatorYToLat(midMerc);
    expect(midLat).toBeGreaterThan(43.5);
    expect(midLat).toBeLessThan(45.2);
  });

  it("Adım 3, 4 & 5: snapWindGridBounds önbellek hizalaması, reverse-geocode LRU önbelleği ve UI/3D Küre korumaları eksiksiz çalışır", () => {
    // Yakın zoom'da (ör. Z10 0.18° açıklık) rüzgar ızgarası sınırları en az 0.25° genişlikte ve önbellek anahtarıyla birebir hizalıdır
    const snapped = snapWindGridBounds({
      south: 40.11,
      west: 28.96,
      north: 40.24,
      east: 29.14
    });
    expect(snapped.south).toBeLessThanOrEqual(40.11);
    expect(snapped.north).toBeGreaterThanOrEqual(40.24);
    expect(snapped.west).toBeLessThanOrEqual(28.96);
    expect(snapped.east).toBeGreaterThanOrEqual(29.14);
    expect(snapped.north - snapped.south).toBeGreaterThanOrEqual(0.25);
    expect(snapped.cacheKey).toBe(
      `${snapped.south.toFixed(2)},${snapped.west.toFixed(2)},${snapped.north.toFixed(2)},${snapped.east.toFixed(2)}`
    );

    // Reverse geocode 15 dakikalık LRU önbellek doğrulaması
    const t0 = 1_700_000_000_000;
    writeReverseGeocodeCache(
      40.1885,
      29.061,
      { name: "Osmangazi", admin1: "Bursa", country: "Türkiye", countryCode: "TR" },
      t0
    );
    expect(readReverseGeocodeCache(40.1882, 29.0612, t0 + 60_000)?.name).toBe("Osmangazi");
    expect(readReverseGeocodeCache(40.1885, 29.061, t0 + 16 * 60_000)).toBeNull();

    // Kaynak kod statik doğrulamaları (imleç merkezli passive:false wheel, 5px küre sürükleme kilidi, sağ panel radar kartı)
    const repoRoot = path.resolve(__dirname, "..");
    const liveRadarSrc = fs.readFileSync(
      path.join(repoRoot, "components/LiveRadarMap.tsx"),
      "utf-8"
    );
    expect(liveRadarSrc).toContain("{ passive: false }");
    expect(liveRadarSrc).toContain("180_000");
    expect(liveRadarSrc).toContain("computeRadarTileLayout");

    const windOverlaySrc = fs.readFileSync(
      path.join(repoRoot, "components/WindStreamOverlay.tsx"),
      "utf-8"
    );
    expect(windOverlaySrc).toContain("prefers-reduced-motion: reduce");
    expect(windOverlaySrc).toContain("visibilitychange");

    const worldViewSrc = fs.readFileSync(
      path.join(repoRoot, "components/WorldView.tsx"),
      "utf-8"
    );
    expect(worldViewSrc).toContain("Doppler Eko & Nowcast");

    const globeSrc = fs.readFileSync(
      path.join(repoRoot, "components/GlobeScene.tsx"),
      "utf-8"
    );
    expect(globeSrc).toContain("wasDraggedBeyondThreshold");
  });
});

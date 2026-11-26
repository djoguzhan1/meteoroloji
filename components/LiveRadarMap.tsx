"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CloudRain,
  Crosshair,
  Layers,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Satellite,
  Wind
} from "lucide-react";
import type {
  GeoLocation,
  RadarMetadata,
  WindGridBundle
} from "@/lib/weather-types";
import WindStreamOverlay from "./WindStreamOverlay";

const TILE_SIZE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 9;

type BasemapMode = "dark" | "satellite";
type OverlayLayerMode = "both" | "radar" | "wind";

function clampLat(lat: number): number {
  return Math.max(-82, Math.min(82, lat));
}

function wrapLon(lon: number): number {
  let l = lon;
  while (l > 180) l -= 360;
  while (l < -180) l += 360;
  return l;
}

function lonToWorldX(lon: number, zoom: number): number {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  return ((lon + 180) / 360) * scale;
}

function latToWorldY(lat: number, zoom: number): number {
  const clamped = clampLat(lat);
  const rad = (clamped * Math.PI) / 180;
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const merc = Math.log(Math.tan(Math.PI / 4 + rad / 2));
  return ((1 - merc / Math.PI) / 2) * scale;
}

function worldXToLon(wx: number, zoom: number): number {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  return wrapLon((wx / scale) * 360 - 180);
}

function worldYToLat(wy: number, zoom: number): number {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const clamped = Math.max(0, Math.min(scale, wy));
  const n = Math.PI - (2 * Math.PI * clamped) / scale;
  return clampLat((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

function formatRadarClock(unixSec: number): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(unixSec * 1000));
  } catch {
    return "--:--";
  }
}

export default function LiveRadarMap({
  selectedLat,
  selectedLon,
  presetCities,
  onPickCoords,
  onPickCity
}: {
  selectedLat: number;
  selectedLon: number;
  presetCities: GeoLocation[];
  onPickCoords: (lat: number, lon: number) => void;
  onPickCity: (city: GeoLocation) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 760, height: 540 });
  const [center, setCenter] = useState({ lat: selectedLat, lon: selectedLon });
  const [zoom, setZoom] = useState(6);
  const [basemap, setBasemap] = useState<BasemapMode>("dark");
  const [overlayMode, setOverlayMode] = useState<OverlayLayerMode>("both");

  const [radar, setRadar] = useState<RadarMetadata | null>(null);
  const [radarError, setRadarError] = useState<string | null>(null);
  const [loadingRadar, setLoadingRadar] = useState(true);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [windGrid, setWindGrid] = useState<WindGridBundle | null>(null);
  const [windLoading, setWindLoading] = useState(false);

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startWorldX: number;
    startWorldY: number;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startWorldX: 0,
    startWorldY: 0,
    moved: false
  });

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setCenter({ lat: selectedLat, lon: selectedLon });
    });
    return () => {
      active = false;
    };
  }, [selectedLat, selectedLon]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const loadRadar = useCallback(async () => {
    setLoadingRadar(true);
    setRadarError(null);
    try {
      const res = await fetch("/api/radar");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data: RadarMetadata = await res.json();
      setRadar(data);
      setFrameIdx(Math.max(0, data.frames.length - 1));
    } catch (e) {
      setRadarError(
        e instanceof Error ? e.message : "Canlı radar kareleri yüklenemedi."
      );
    } finally {
      setLoadingRadar(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadRadar();
    });
    return () => {
      active = false;
    };
  }, [loadRadar]);

  // Oynatma döngüsü
  useEffect(() => {
    if (!playing || !radar || radar.frames.length < 2) return;
    const isLast = frameIdx === radar.frames.length - 1;
    const timer = window.setTimeout(
      () => {
        setFrameIdx((prev) => (prev + 1) % radar.frames.length);
      },
      isLast ? 1250 : 560
    );
    return () => window.clearTimeout(timer);
  }, [playing, frameIdx, radar]);

  const activeFrame = radar?.frames[frameIdx] ?? null;

  const centerWorldX = lonToWorldX(center.lon, zoom);
  const centerWorldY = latToWorldY(center.lat, zoom);
  const numTiles = Math.pow(2, zoom);

  const screenToLatLon = useCallback(
    (sx: number, sy: number) => {
      const wx = centerWorldX + (sx - size.width / 2);
      const wy = centerWorldY + (sy - size.height / 2);
      return {
        lat: worldYToLat(wy, zoom),
        lon: worldXToLon(wx, zoom)
      };
    },
    [centerWorldX, centerWorldY, size.height, size.width, zoom]
  );

  // Görünür harita alanı için 25-noktalı gerçek 10m rüzgar vektör ızgarasını çek (debounced 320ms)
  useEffect(() => {
    if (overlayMode === "radar") return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const nw = screenToLatLon(0, 0);
      const se = screenToLatLon(size.width, size.height);
      const south = Math.max(-78, Math.min(nw.lat, se.lat));
      const north = Math.min(78, Math.max(nw.lat, se.lat));
      let west = nw.lon;
      let east = se.lon;
      if (east <= west) {
        west = Math.max(-180, center.lon - 14);
        east = Math.min(180, center.lon + 14);
      }
      if (north - south < 0.5 || east - west < 0.5) return;

      setWindLoading(true);
      try {
        const qs = new URLSearchParams({
          south: south.toFixed(2),
          west: west.toFixed(2),
          north: north.toFixed(2),
          east: east.toFixed(2)
        });
        const res = await fetch(`/api/wind-grid?${qs.toString()}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data: WindGridBundle = await res.json();
          setWindGrid(data);
        }
      } catch {
        // aborted or transient
      } finally {
        setWindLoading(false);
      }
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [overlayMode, center.lat, center.lon, zoom, size.width, size.height, screenToLatLon]);

  const tiles = useMemo(() => {
    const minTileX = Math.floor((centerWorldX - size.width / 2) / TILE_SIZE) - 1;
    const maxTileX = Math.floor((centerWorldX + size.width / 2) / TILE_SIZE) + 1;
    const minTileY = Math.max(
      0,
      Math.floor((centerWorldY - size.height / 2) / TILE_SIZE) - 1
    );
    const maxTileY = Math.min(
      numTiles - 1,
      Math.floor((centerWorldY + size.height / 2) / TILE_SIZE) + 1
    );

    const list: Array<{
      key: string;
      x: number;
      y: number;
      wrapX: number;
      left: number;
      top: number;
    }> = [];

    for (let tx = minTileX; tx <= maxTileX; tx++) {
      const wrapX = ((tx % numTiles) + numTiles) % numTiles;
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        const left = tx * TILE_SIZE - centerWorldX + size.width / 2;
        const top = ty * TILE_SIZE - centerWorldY + size.height / 2;
        list.push({
          key: `${zoom}-${tx}-${ty}`,
          x: tx,
          y: ty,
          wrapX,
          left,
          top
        });
      }
    }
    return list;
  }, [centerWorldX, centerWorldY, numTiles, size.height, size.width, zoom]);

  // Radar karelerini arka planda önbelleğe al
  useEffect(() => {
    if (!radar || tiles.length === 0 || overlayMode === "wind") return;
    const sampleTiles = tiles.slice(0, 16);
    for (const f of radar.frames) {
      for (const t of sampleTiles) {
        const img = new window.Image();
        img.src = `${radar.host}${f.path}/256/${zoom}/${t.wrapX}/${t.y}/6/1_1.png`;
      }
    }
  }, [radar, zoom, tiles, overlayMode]);

  const projectToScreen = useCallback(
    (lat: number, lon: number) => {
      const worldSpan = TILE_SIZE * Math.pow(2, zoom);
      let dx = lonToWorldX(lon, zoom) - centerWorldX;
      if (dx > worldSpan / 2) dx -= worldSpan;
      if (dx < -worldSpan / 2) dx += worldSpan;
      const dy = latToWorldY(lat, zoom) - centerWorldY;
      return {
        x: size.width / 2 + dx,
        y: size.height / 2 + dy
      };
    },
    [centerWorldX, centerWorldY, size.height, size.width, zoom]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startWorldX: centerWorldX,
      startWorldY: centerWorldY,
      moved: false
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.hypot(dx, dy) > 5) {
      dragRef.current.moved = true;
    }
    if (!dragRef.current.moved) return;

    const nextWX = dragRef.current.startWorldX - dx;
    const nextWY = dragRef.current.startWorldY - dy;
    setCenter({
      lat: worldYToLat(nextWY, zoom),
      lon: worldXToLon(nextWX, zoom)
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (!wasMoved && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const pt = screenToLatLon(clickX, clickY);
      onPickCoords(Number(pt.lat.toFixed(3)), Number(pt.lon.toFixed(3)));
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + delta)));
  };

  const selectedPt = projectToScreen(selectedLat, selectedLon);

  const relativeOffsetLabel = useMemo(() => {
    if (!radar || !activeFrame) return "";
    const latest = radar.frames[radar.frames.length - 1];
    if (!latest) return "";
    const diffMin = Math.round((latest.time - activeFrame.time) / 60);
    return diffMin <= 0 ? "En Güncel" : `-${diffMin} dk`;
  }, [radar, activeFrame]);

  const baseTileUrl = (z: number, y: number, x: number) =>
    basemap === "satellite"
      ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
      : `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`;

  const showRadar = overlayMode === "both" || overlayMode === "radar";
  const showWind = overlayMode === "both" || overlayMode === "wind";

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#0a0f18]">
      {/* Etkileşimli Harita Yüzeyi */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative h-full w-full cursor-crosshair active:cursor-grabbing touch-none"
        role="application"
        aria-label="Canlı yağış radarı ve rüzgar akışı haritası"
      >
        {/* Filigransız Esri Koyu Harita veya Gerçek Uydu Tabanı */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            filter:
              basemap === "satellite"
                ? "brightness(0.74) contrast(1.06) saturate(0.86)"
                : "brightness(0.90) contrast(1.08)"
          }}
        >
          {tiles.map((t) => (
            <img
              key={`base-${basemap}-${t.key}`}
              src={baseTileUrl(zoom, t.y, t.wrapX)}
              alt=""
              draggable={false}
              className="absolute block max-w-none"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: Math.round(t.left),
                top: Math.round(t.top)
              }}
            />
          ))}
        </div>

        {/* Canlı RainViewer Doppler Yağış Katmanı */}
        {showRadar && radar && activeFrame && (
          <div className="pointer-events-none absolute inset-0 opacity-85">
            {tiles.map((t) => (
              <img
                key={`radar-${activeFrame.time}-${t.key}`}
                src={`${radar.host}${activeFrame.path}/256/${zoom}/${t.wrapX}/${t.y}/6/1_1.png`}
                alt=""
                draggable={false}
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.opacity = "0";
                }}
                className="absolute block max-w-none"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  left: Math.round(t.left),
                  top: Math.round(t.top)
                }}
              />
            ))}
          </div>
        )}

        {/* 60 FPS Canlı Gerçek Rüzgar Akış Çizgileri (25-Nokta Open-Meteo Vektör Alanı) */}
        {showWind && (
          <WindStreamOverlay
            grid={windGrid}
            width={size.width}
            height={size.height}
            screenToLatLon={screenToLatLon}
          />
        )}

        {/* Üst Referans Sınır & Şehir İsimleri Katmanı */}
        <div className="pointer-events-none absolute inset-0 opacity-75">
          {tiles.map((t) => (
            <img
              key={`ref-${t.key}`}
              src={`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/${zoom}/${t.y}/${t.wrapX}`}
              alt=""
              draggable={false}
              onError={(ev) => {
                (ev.currentTarget as HTMLImageElement).style.opacity = "0";
              }}
              className="absolute block max-w-none"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: Math.round(t.left),
                top: Math.round(t.top)
              }}
            />
          ))}
        </div>

        {/* Hazır Şehir İşaretçileri */}
        {presetCities.map((city) => {
          const pt = projectToScreen(city.lat, city.lon);
          if (
            pt.x < -30 ||
            pt.x > size.width + 30 ||
            pt.y < -30 ||
            pt.y > size.height + 30
          ) {
            return null;
          }
          const isSelected =
            Math.abs(city.lat - selectedLat) < 0.15 &&
            Math.abs(city.lon - selectedLon) < 0.15;
          if (isSelected) return null;

          return (
            <button
              key={city.id}
              type="button"
              onPointerDown={(ev) => ev.stopPropagation()}
              onClick={(ev) => {
                ev.stopPropagation();
                onPickCity(city);
              }}
              style={{ left: pt.x, top: pt.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md border border-white/15 bg-obsidian-950/85 px-1.5 py-0.5 text-[11px] font-medium text-ink-secondary hover:border-signal-sky/60 hover:text-ink-primary transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-signal-sky" />
              <span>{city.name}</span>
            </button>
          );
        })}

        {/* Seçili Ölçüm Noktası Dönen Doppler Nişangâhı */}
        {selectedPt.x >= -20 &&
          selectedPt.x <= size.width + 20 &&
          selectedPt.y >= -20 &&
          selectedPt.y <= size.height + 20 && (
            <div
              style={{ left: selectedPt.x, top: selectedPt.y }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span
                  className="atmos-beacon-ring absolute h-8 w-8 rounded-full border border-[var(--atmos-accent)]"
                />
                <svg
                  viewBox="0 0 44 44"
                  className="h-11 w-11"
                  style={{ animation: "atmosIsobarSpin 14s linear infinite" }}
                  aria-hidden="true"
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="16"
                    fill="none"
                    stroke="var(--atmos-accent)"
                    strokeOpacity="0.82"
                    strokeWidth="1.2"
                    strokeDasharray="10 7"
                  />
                  <line x1="22" y1="2" x2="22" y2="8" stroke="#f8fbff" strokeWidth="1.4" />
                  <line x1="22" y1="36" x2="22" y2="42" stroke="#f8fbff" strokeWidth="1.4" />
                  <line x1="2" y1="22" x2="8" y2="22" stroke="#f8fbff" strokeWidth="1.4" />
                  <line x1="36" y1="22" x2="42" y2="22" stroke="#f8fbff" strokeWidth="1.4" />
                </svg>
                <span
                  className="absolute h-2.5 w-2.5 rounded-full bg-white"
                  style={{ boxShadow: "0 0 12px var(--atmos-accent)" }}
                />
              </div>
            </div>
          )}
      </div>

      {/* Üst Sol: Radar & Rüzgar Akışı Lejantı */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
        <div className="rounded-lg border border-white/10 bg-obsidian-950/85 px-2.5 py-1.5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-[11px] font-mono text-ink-secondary tabular">
            <span className="font-semibold text-ink-primary">
              {overlayMode === "wind"
                ? "CANLI RÜZGAR AKIŞI"
                : overlayMode === "radar"
                  ? "DOPPLER RADAR"
                  : "DOPPLER + RÜZGAR AKIŞI"}
            </span>
            {showRadar && (
              <>
                <span className="text-ink-muted">·</span>
                <span>
                  {activeFrame
                    ? `${formatRadarClock(activeFrame.time)} (${relativeOffsetLabel})`
                    : loadingRadar
                      ? "Yükleniyor..."
                      : "Çevrimdışı"}
                </span>
              </>
            )}
          </div>
          {showRadar && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-ink-muted tabular">
              <span>20 dBZ (~0.5)</span>
              <span className="h-1.5 w-24 rounded-full bg-gradient-to-r from-[#38bdf8] via-[#10b981] via-[#facc15] via-[#f97316] to-[#ef4444]" />
              <span>50+ dBZ (~48 mm/sa)</span>
            </div>
          )}
          {showWind && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-ink-muted tabular">
              <span>Rüzgar 0</span>
              <span className="h-1.5 w-24 rounded-full bg-gradient-to-r from-[#93c5fd] via-[#38bdf8] via-[#34d399] via-[#f59e0b] to-[#f87171]" />
              <span>
                {windGrid
                  ? `Maks ${Math.round(windGrid.maxSpeedKmh)} km/s`
                  : windLoading
                    ? "Alan yükleniyor..."
                    : "60+ km/s"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Üst Sağ: Katman & Taban Seçiciler + Yakınlaştır */}
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        <div className="flex flex-wrap justify-end gap-1.5">
          {/* Canlı Atmosfer Katman Seçici */}
          <div className="inline-flex rounded-lg border border-white/10 bg-obsidian-950/85 p-0.5 backdrop-blur-md text-[11px]">
            <button
              type="button"
              onClick={() => setOverlayMode("both")}
              className={`rounded-md px-2 py-1 font-medium transition-colors ${
                overlayMode === "both"
                  ? "bg-white/15 text-ink-primary"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              İkisi
            </button>
            <button
              type="button"
              onClick={() => setOverlayMode("radar")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
                overlayMode === "radar"
                  ? "bg-white/15 text-ink-primary"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <CloudRain className="h-3 w-3" />
              <span>Yağış</span>
            </button>
            <button
              type="button"
              onClick={() => setOverlayMode("wind")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
                overlayMode === "wind"
                  ? "bg-white/15 text-ink-primary"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <Wind className="h-3 w-3" />
              <span>Rüzgar</span>
            </button>
          </div>

          {/* Taban Harita Seçici */}
          <div className="inline-flex rounded-lg border border-white/10 bg-obsidian-950/85 p-0.5 backdrop-blur-md text-[11px]">
            <button
              type="button"
              onClick={() => setBasemap("dark")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
                basemap === "dark"
                  ? "bg-white/15 text-ink-primary"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Koyu</span>
            </button>
            <button
              type="button"
              onClick={() => setBasemap("satellite")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
                basemap === "satellite"
                  ? "bg-white/15 text-ink-primary"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              <Satellite className="h-3 w-3" />
              <span>Uydu</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Haritayı yakınlaştır"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/85 text-ink-primary hover:bg-obsidian-800 disabled:opacity-40 backdrop-blur-md transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Haritayı uzaklaştır"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/85 text-ink-primary hover:bg-obsidian-800 disabled:opacity-40 backdrop-blur-md transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCenter({ lat: selectedLat, lon: selectedLon });
              setZoom(6);
            }}
            aria-label="Seçili konuma odaklan"
            title="Seçili konuma odaklan"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/85 text-ink-secondary hover:text-ink-primary hover:bg-obsidian-800 backdrop-blur-md transition-colors"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Radar Hatası */}
      {showRadar && radarError && (
        <div className="absolute inset-x-4 top-24 mx-auto max-w-sm rounded-xl border border-signal-rose/40 bg-obsidian-950/90 p-3 text-xs text-ink-primary backdrop-blur-md flex items-center justify-between gap-3">
          <span>{radarError}</span>
          <button
            type="button"
            onClick={() => void loadRadar()}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Tekrar
          </button>
        </div>
      )}

      {/* Alt Zaman Oynatıcı & İpucu */}
      <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {showRadar ? (
          <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-obsidian-950/90 px-3 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              disabled={!radar || radar.frames.length < 2}
              aria-label={playing ? "Radar animasyonunu durdur" : "Radar animasyonunu oynat"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-primary text-obsidian-950 hover:bg-white disabled:opacity-40 transition-colors"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>

            <input
              type="range"
              min={0}
              max={Math.max(0, (radar?.frames.length ?? 1) - 1)}
              value={frameIdx}
              onChange={(e) => {
                setPlaying(false);
                setFrameIdx(Number(e.target.value));
              }}
              aria-label="Radar zaman karesi"
              className="meteo-range flex-1"
            />

            <span className="shrink-0 font-mono text-xs text-ink-primary tabular min-w-[44px] text-right">
              {activeFrame ? formatRadarClock(activeFrame.time) : "--:--"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian-950/85 px-3 py-2 font-mono text-[11px] text-ink-secondary backdrop-blur-md">
            <Wind className="h-3.5 w-3.5 text-signal-sky" />
            <span>Gerçek 10m Rüzgar Vektör Alanı (5×5 Bilineer Enterpolasyon · Open-Meteo)</span>
          </div>
        )}

        <div className="pointer-events-none hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian-950/85 px-2.5 py-2 text-[11px] text-ink-muted backdrop-blur-md">
          <span>Tıkla: Koordinat Ölç · Esri · RainViewer · Open-Meteo</span>
        </div>
      </div>
    </div>
  );
}

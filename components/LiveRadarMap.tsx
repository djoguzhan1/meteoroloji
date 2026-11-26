"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useWeatherStatus } from "@/context/WeatherContext";
import type {
  GeoLocation,
  RadarFrame,
  RadarMetadata,
  WindGridBundle
} from "@/lib/weather-types";
import WindStreamOverlay from "./WindStreamOverlay";

const TILE_SIZE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 10;
export const NATIVE_RADAR_MAX_ZOOM = 7;
export const RADAR_TILE_REQUEST_SIZE = 512;

type BasemapMode = "dark" | "satellite";
type OverlayLayerMode = "both" | "radar" | "wind";

export interface PositionedSlippyTile {
  key: string;
  x: number;
  y: number;
  wrapX: number;
  left: number;
  top: number;
  sizePx: number;
}

export interface RadarTileLayout {
  radarZoom: number;
  overzoomScale: number;
  displayTileSize: number;
  tiles: PositionedSlippyTile[];
}

function clampLat(lat: number): number {
  return Math.max(-82, Math.min(82, lat));
}

function wrapLon(lon: number): number {
  let l = lon;
  while (l > 180) l -= 360;
  while (l < -180) l += 360;
  return l;
}

export function lonToWorldX(lon: number, zoom: number): number {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  return ((lon + 180) / 360) * scale;
}

export function latToWorldY(lat: number, zoom: number): number {
  const clamped = clampLat(lat);
  const rad = (clamped * Math.PI) / 180;
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const merc = Math.log(Math.tan(Math.PI / 4 + rad / 2));
  return ((1 - merc / Math.PI) / 2) * scale;
}

export function worldXToLon(wx: number, zoom: number): number {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  return wrapLon((wx / scale) * 360 - 180);
}

export function worldYToLat(wy: number, zoom: number): number {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const clamped = Math.max(0, Math.min(scale, wy));
  const n = Math.PI - (2 * Math.PI * clamped) / scale;
  return clampLat((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

/**
 * Computes seamless Overzoom tile geometry for RainViewer Doppler tiles so zooming past Z7
 * (e.g. Z8, Z9, Z10) scales native 512px Z7 parent tiles smoothly instead of requesting
 * RainViewer's unsupported Z8+ grayscale error banner tiles.
 */
export function computeRadarTileLayout(params: {
  centerWorldX: number;
  centerWorldY: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
}): RadarTileLayout {
  const { centerWorldX, centerWorldY, viewportWidth, viewportHeight, zoom } = params;
  const radarZoom = Math.min(zoom, NATIVE_RADAR_MAX_ZOOM);
  const overzoomScale = Math.pow(2, zoom - radarZoom);
  const displayTileSize = TILE_SIZE * overzoomScale;
  const numRadarTiles = Math.pow(2, radarZoom);

  const cwx = Math.round(centerWorldX);
  const cwy = Math.round(centerWorldY);
  const halfW = Math.round(viewportWidth / 2);
  const halfH = Math.round(viewportHeight / 2);
  const padPx = 128;

  const minTileX = Math.floor((cwx - halfW - padPx) / displayTileSize);
  const maxTileX = Math.floor((cwx + halfW + padPx) / displayTileSize);
  const minTileY = Math.max(0, Math.floor((cwy - halfH - padPx) / displayTileSize));
  const maxTileY = Math.min(
    numRadarTiles - 1,
    Math.floor((cwy + halfH + padPx) / displayTileSize)
  );

  const tiles: PositionedSlippyTile[] = [];
  for (let tx = minTileX; tx <= maxTileX; tx++) {
    const wrapX = ((tx % numRadarTiles) + numRadarTiles) % numRadarTiles;
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      tiles.push({
        key: `${radarZoom}-${tx}-${ty}`,
        x: tx,
        y: ty,
        wrapX,
        left: tx * displayTileSize - cwx + halfW,
        top: ty * displayTileSize - cwy + halfH,
        sizePx: displayTileSize
      });
    }
  }

  return {
    radarZoom,
    overzoomScale,
    displayTileSize,
    tiles
  };
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

function resolveInitialObservedFrameIndex(data: RadarMetadata): number {
  if (
    typeof data.lastPastIndex === "number" &&
    data.lastPastIndex >= 0 &&
    data.lastPastIndex < data.frames.length
  ) {
    return data.lastPastIndex;
  }
  for (let i = data.frames.length - 1; i >= 0; i--) {
    if (!data.frames[i].isForecast) return i;
  }
  return Math.max(0, data.frames.length - 1);
}

function LiveRadarMapBase({
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
  const { recoveryCount, isOffline } = useWeatherStatus();
  const [isDragging, setIsDragging] = useState(false);
  const panRafRef = useRef<number>(0);
  const pendingCenterRef = useRef<{ lat: number; lon: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 760, height: 540 });
  const [view, setView] = useState({
    center: { lat: selectedLat, lon: selectedLon },
    zoom: 6
  });
  const { center, zoom } = view;

  const [basemap, setBasemap] = useState<BasemapMode>("dark");
  const [overlayMode, setOverlayMode] = useState<OverlayLayerMode>("both");

  const [radar, setRadar] = useState<RadarMetadata | null>(null);
  const [radarStale, setRadarStale] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);
  const [loadingRadar, setLoadingRadar] = useState(true);
  const [frameIdx, setFrameIdx] = useState(0);
  const [renderedFrame, setRenderedFrame] = useState<RadarFrame | null>(null);
  const [playing, setPlaying] = useState(false);

  const [windGrid, setWindGrid] = useState<WindGridBundle | null>(null);
  const [windStale, setWindStale] = useState(false);
  const [windLoading, setWindLoading] = useState(false);

  const radarRef = useRef<RadarMetadata | null>(null);
  const decodedFrameSetRef = useRef<Set<string>>(new Set());
  const wheelAccumRef = useRef<{ sum: number; lastMs: number }>({ sum: 0, lastMs: 0 });

  useEffect(() => {
    radarRef.current = radar;
  }, [radar]);

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
      if (active) {
        setView((prev) => ({
          ...prev,
          center: { lat: selectedLat, lon: selectedLon }
        }));
      }
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

  // Non-passive wheel listener: blocks background page scroll AND anchors zoom to cursor lat/lon!
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const nowMs = performance.now();
      if (nowMs - wheelAccumRef.current.lastMs > 160) {
        wheelAccumRef.current.sum = 0;
      }
      wheelAccumRef.current.lastMs = nowMs;
      wheelAccumRef.current.sum += e.deltaY;

      const threshold = e.deltaMode === 1 ? 1.2 : 42;
      if (Math.abs(wheelAccumRef.current.sum) < threshold) return;

      const stepDir = wheelAccumRef.current.sum < 0 ? 1 : -1;
      wheelAccumRef.current.sum = 0;

      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setView((prev) => {
        const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom + stepDir));
        if (nextZoom === prev.zoom || rect.width <= 0 || rect.height <= 0) return prev;

        const prevCWX = lonToWorldX(prev.center.lon, prev.zoom);
        const prevCWY = latToWorldY(prev.center.lat, prev.zoom);
        const anchorLon = worldXToLon(prevCWX + (cursorX - rect.width / 2), prev.zoom);
        const anchorLat = worldYToLat(prevCWY + (cursorY - rect.height / 2), prev.zoom);

        const nextAnchorWX = lonToWorldX(anchorLon, nextZoom);
        const nextAnchorWY = latToWorldY(anchorLat, nextZoom);
        const nextCWX = nextAnchorWX - (cursorX - rect.width / 2);
        const nextCWY = nextAnchorWY - (cursorY - rect.height / 2);

        return {
          zoom: nextZoom,
          center: {
            lat: worldYToLat(nextCWY, nextZoom),
            lon: worldXToLon(nextCWX, nextZoom)
          }
        };
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const loadRadar = useCallback(async (background = false) => {
    if (!background && !radarRef.current) {
      setLoadingRadar(true);
    }
    setRadarError(null);
    try {
      const res = await fetch("/api/radar", {
        cache: background || radarRef.current ? "no-store" : "default"
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data: RadarMetadata = await res.json();
      const prevRadar = radarRef.current;
      setRadar(data);
      setRadarStale((data.freshness?.status ?? "live") !== "live");
      setRadarError(null);

      const initialIdx = resolveInitialObservedFrameIndex(data);
      if (!prevRadar) {
        setFrameIdx(initialIdx);
        setRenderedFrame(data.frames[initialIdx] ?? null);
      } else {
        setFrameIdx((prev) => {
          const prevFrameTime = prevRadar.frames[prev]?.time;
          if (prevFrameTime !== undefined) {
            const matchedIdx = data.frames.findIndex((f) => f.time === prevFrameTime);
            if (matchedIdx >= 0) return matchedIdx;
          }
          return Math.min(prev, Math.max(0, data.frames.length - 1));
        });
      }
    } catch (e) {
      if (radarRef.current && radarRef.current.frames.length > 0) {
        setRadarStale(true);
        setRadarError(null);
      } else {
        setRadarError(
          e instanceof Error ? e.message : "Canlı radar kareleri yüklenemedi."
        );
      }
    } finally {
      setLoadingRadar(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadRadar(false);
    });
    return () => {
      active = false;
    };
  }, [loadRadar]);

  // Silent 180-second periodic live refresh while Radar tab stays open & visible
  useEffect(() => {
    if (isOffline) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadRadar(true);
      }
    }, 180_000);
    return () => window.clearInterval(id);
  }, [isOffline, loadRadar]);

  // Recover radar automatically when global live connectivity returns
  useEffect(() => {
    if (recoveryCount <= 0) return;
    queueMicrotask(() => {
      void loadRadar(true);
    });
  }, [recoveryCount, loadRadar]);

  // Self-healing retry timer when radar is stale or unreachable while online
  useEffect(() => {
    if (isOffline || (!radarStale && !radarError) || loadingRadar) return;
    const timer = window.setTimeout(() => {
      void loadRadar(true);
    }, 20_000);
    return () => window.clearTimeout(timer);
  }, [isOffline, radarStale, radarError, loadingRadar, loadRadar]);

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

  // Fetch 25-point real 10m wind vector grid with minimum 0.36° sampling window so Z8-Z10 pans never stall!
  useEffect(() => {
    if (overlayMode === "radar") return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const nw = screenToLatLon(0, 0);
      const se = screenToLatLon(size.width, size.height);
      const midLat = Math.max(-77.5, Math.min(77.5, (nw.lat + se.lat) / 2));
      const rawLatHalf = Math.abs(nw.lat - se.lat) / 2;
      const halfLat = Math.max(0.18, rawLatHalf);

      const south = Math.max(-78, midLat - halfLat);
      const north = Math.min(78, midLat + halfLat);

      let west = nw.lon;
      let east = se.lon;
      if (east <= west) {
        west = Math.max(-180, center.lon - 14);
        east = Math.min(180, center.lon + 14);
      } else if (east - west < 0.36) {
        const midLon = (west + east) / 2;
        west = Math.max(-180, midLon - 0.18);
        east = Math.min(180, midLon + 0.18);
      }

      setWindLoading(true);
      try {
        const qs = new URLSearchParams({
          south: south.toFixed(2),
          west: west.toFixed(2),
          north: north.toFixed(2),
          east: east.toFixed(2)
        });
        const res = await fetch(`/api/wind-grid?${qs.toString()}`, {
          signal: controller.signal,
          cache: recoveryCount > 0 ? "no-store" : "default"
        });
        if (res.ok) {
          const data: WindGridBundle = await res.json();
          setWindGrid(data);
          setWindStale((data.freshness?.status ?? "live") !== "live");
        } else {
          setWindStale(true);
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          setWindStale(true);
        }
      } finally {
        setWindLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    overlayMode,
    center.lat,
    center.lon,
    zoom,
    size.width,
    size.height,
    screenToLatLon,
    recoveryCount
  ]);

  const tiles = useMemo(() => {
    const cwx = Math.round(centerWorldX);
    const cwy = Math.round(centerWorldY);
    const halfW = Math.round(size.width / 2);
    const halfH = Math.round(size.height / 2);

    const minTileX = Math.floor((cwx - halfW) / TILE_SIZE) - 1;
    const maxTileX = Math.floor((cwx + halfW) / TILE_SIZE) + 1;
    const minTileY = Math.max(0, Math.floor((cwy - halfH) / TILE_SIZE) - 1);
    const maxTileY = Math.min(numTiles - 1, Math.floor((cwy + halfH) / TILE_SIZE) + 1);

    const list: PositionedSlippyTile[] = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      const wrapX = ((tx % numTiles) + numTiles) % numTiles;
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        list.push({
          key: `${zoom}-${tx}-${ty}`,
          x: tx,
          y: ty,
          wrapX,
          left: tx * TILE_SIZE - cwx + halfW,
          top: ty * TILE_SIZE - cwy + halfH,
          sizePx: TILE_SIZE
        });
      }
    }
    return list;
  }, [centerWorldX, centerWorldY, numTiles, size.height, size.width, zoom]);

  const radarLayout = useMemo(
    () =>
      computeRadarTileLayout({
        centerWorldX,
        centerWorldY,
        viewportWidth: size.width,
        viewportHeight: size.height,
        zoom
      }),
    [centerWorldX, centerWorldY, size.height, size.width, zoom]
  );

  const buildRadarTileUrl = useCallback(
    (host: string, framePath: string, rZoom: number, wrapX: number, ty: number) =>
      `${host}${framePath}/${RADAR_TILE_REQUEST_SIZE}/${rZoom}/${wrapX}/${ty}/6/1_1.png`,
    []
  );

  const radarViewportSig = useMemo(
    () => `${radarLayout.radarZoom}:${radarLayout.tiles.map((t) => `${t.wrapX}_${t.y}`).join(",")}`,
    [radarLayout]
  );

  // Flicker-free atomic frame promotion: decode next frame's visible tiles in memory BEFORE swapping `src`!
  useEffect(() => {
    if (!radar || !activeFrame) {
      setRenderedFrame(null);
      return;
    }
    if (overlayMode === "wind" || radarLayout.tiles.length === 0) {
      setRenderedFrame(activeFrame);
      return;
    }

    const cacheSig = `${radarViewportSig}:${activeFrame.path}`;
    if (decodedFrameSetRef.current.has(cacheSig)) {
      setRenderedFrame(activeFrame);
      return;
    }

    let cancelled = false;
    const loaders: HTMLImageElement[] = [];

    const waitAll = Promise.allSettled(
      radarLayout.tiles.map(
        (t) =>
          new Promise<void>((resolve) => {
            const img = new window.Image();
            img.decoding = "async";
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = buildRadarTileUrl(
              radar.host,
              activeFrame.path,
              radarLayout.radarZoom,
              t.wrapX,
              t.y
            );
            loaders.push(img);
          })
      )
    );

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) {
        setRenderedFrame(activeFrame);
      }
    }, 360);

    void waitAll.then(() => {
      window.clearTimeout(fallbackTimer);
      if (cancelled) return;
      decodedFrameSetRef.current.add(cacheSig);
      setRenderedFrame(activeFrame);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      for (const img of loaders) {
        if (!img.complete) img.src = "";
      }
    };
  }, [radar, activeFrame, overlayMode, radarLayout, radarViewportSig, buildRadarTileUrl]);

  // Playback loop gated on renderedFrame synchronization so frames never skip while loading
  useEffect(() => {
    if (!playing || !radar || radar.frames.length < 2) return;
    if (renderedFrame && activeFrame && renderedFrame.time !== activeFrame.time) return;

    const isLast = frameIdx === radar.frames.length - 1;
    const isObservedBoundary =
      typeof radar.lastPastIndex === "number" &&
      frameIdx === radar.lastPastIndex &&
      radar.lastPastIndex < radar.frames.length - 1;

    const delayMs = isLast ? 1300 : isObservedBoundary ? 850 : 580;
    const timer = window.setTimeout(() => {
      setFrameIdx((prev) => (prev + 1) % radar.frames.length);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [playing, frameIdx, radar, renderedFrame, activeFrame]);

  // Preload ALL visible radar tiles across ALL timeline frames after pan/zoom settles (400ms debounce)
  useEffect(() => {
    if (!radar || radarLayout.tiles.length === 0 || overlayMode === "wind" || isDragging) return;
    const visibleTiles = radarLayout.tiles.slice(0, 14);
    const orderedFrames = [...radar.frames].sort(
      (a, b) =>
        Math.abs(radar.frames.indexOf(a) - frameIdx) -
        Math.abs(radar.frames.indexOf(b) - frameIdx)
    );

    const createdImages: HTMLImageElement[] = [];
    let cancelled = false;

    const timer = window.setTimeout(() => {
      let budget = 160;
      for (const f of orderedFrames) {
        const sig = `${radarViewportSig}:${f.path}`;
        if (decodedFrameSetRef.current.has(sig)) continue;
        const framePromises: Promise<void>[] = [];
        for (const t of visibleTiles) {
          if (budget <= 0) break;
          budget--;
          framePromises.push(
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.decoding = "async";
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = buildRadarTileUrl(
                radar.host,
                f.path,
                radarLayout.radarZoom,
                t.wrapX,
                t.y
              );
              createdImages.push(img);
            })
          );
        }
        if (framePromises.length === visibleTiles.length) {
          void Promise.allSettled(framePromises).then(() => {
            if (!cancelled) decodedFrameSetRef.current.add(sig);
          });
        }
        if (budget <= 0) break;
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      for (const img of createdImages) {
        if (!img.complete) img.src = "";
      }
    };
  }, [radar, radarLayout, radarViewportSig, overlayMode, isDragging, frameIdx, buildRadarTileUrl]);

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

    if (!isDragging) setIsDragging(true);
    const nextWX = dragRef.current.startWorldX - dx;
    const nextWY = dragRef.current.startWorldY - dy;
    pendingCenterRef.current = {
      lat: worldYToLat(nextWY, zoom),
      lon: worldXToLon(nextWX, zoom)
    };
    if (!panRafRef.current) {
      panRafRef.current = window.requestAnimationFrame(() => {
        panRafRef.current = 0;
        if (pendingCenterRef.current) {
          const nextC = pendingCenterRef.current;
          pendingCenterRef.current = null;
          setView((prev) => ({ ...prev, center: nextC }));
        }
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const wasMoved = dragRef.current.moved;
    dragRef.current.active = false;
    setIsDragging(false);
    if (panRafRef.current) {
      window.cancelAnimationFrame(panRafRef.current);
      panRafRef.current = 0;
    }
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

  const selectedPt = projectToScreen(selectedLat, selectedLon);

  const frameTimingInfo = useMemo(() => {
    if (!radar || !activeFrame) {
      return { label: "", isForecast: false, isHistoricalOrFuture: false };
    }
    const anchorIdx = resolveInitialObservedFrameIndex(radar);
    const anchorFrame = radar.frames[anchorIdx] ?? radar.frames[radar.frames.length - 1];
    if (!anchorFrame) {
      return { label: "", isForecast: false, isHistoricalOrFuture: false };
    }
    const deltaMin = Math.round((activeFrame.time - anchorFrame.time) / 60);
    const isForecast = Boolean(activeFrame.isForecast || deltaMin > 0);
    if (isForecast) {
      return {
        label: `+${Math.max(5, deltaMin)} dk · Tahmin`,
        isForecast: true,
        isHistoricalOrFuture: true
      };
    }
    if (deltaMin === 0) {
      return { label: "Canlı Ölçüm", isForecast: false, isHistoricalOrFuture: false };
    }
    return {
      label: `${deltaMin} dk`,
      isForecast: false,
      isHistoricalOrFuture: true
    };
  }, [radar, activeFrame]);

  const baseTileUrl = (z: number, y: number, x: number) =>
    basemap === "satellite"
      ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
      : `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`;

  const showRadar = overlayMode === "both" || overlayMode === "radar";
  const showWind = overlayMode === "both" || overlayMode === "wind";
  const displayRadarFrame = renderedFrame ?? activeFrame;
  const isRadarArchive = Boolean(
    activeFrame && (radarStale || isOffline || radar?.freshness?.status === "stale")
  );
  const isOverzoomActive = zoom > NATIVE_RADAR_MAX_ZOOM;

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#0a0f18]">
      {/* Etkileşimli Harita Yüzeyi */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
                width: t.sizePx,
                height: t.sizePx,
                left: t.left,
                top: t.top
              }}
            />
          ))}
        </div>

        {/* Canlı RainViewer 512px HD Doppler Yağış Katmanı (Z8-Z10 Kesintisiz Overzoom Destekli) */}
        {showRadar && radar && displayRadarFrame && (
          <div className="pointer-events-none absolute inset-0 opacity-85">
            {radarLayout.tiles.map((t) => (
              <img
                key={`radar-${t.key}`}
                src={buildRadarTileUrl(
                  radar.host,
                  displayRadarFrame.path,
                  radarLayout.radarZoom,
                  t.wrapX,
                  t.y
                )}
                alt=""
                draggable={false}
                onLoad={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.opacity = "1";
                }}
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.opacity = "0";
                }}
                className="absolute block max-w-none transition-opacity duration-150"
                style={{
                  width: t.sizePx,
                  height: t.sizePx,
                  left: t.left,
                  top: t.top,
                  imageRendering: "auto"
                }}
              />
            ))}
          </div>
        )}

        {/* FPS & Merkator Kalibreli Canlı 10m Rüzgar Akış Çizgileri */}
        {showWind && (
          <WindStreamOverlay
            grid={windGrid}
            width={size.width}
            height={size.height}
            zoom={zoom}
            isInteracting={isDragging}
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
                width: t.sizePx,
                height: t.sizePx,
                left: t.left,
                top: t.top
              }}
            />
          ))}
        </div>

        {/* Hazır Şehir İşaretçileri (Üst/alt HUD barlarıyla çakışmaması için z-10 ve güvenli kenar marjı) */}
        {presetCities.map((city) => {
          const pt = projectToScreen(city.lat, city.lon);
          if (
            pt.x < 24 ||
            pt.x > size.width - 24 ||
            pt.y < 54 ||
            pt.y > size.height - 58
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
              className="atmos-hud-glass absolute z-10 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-ink-secondary hover:border-signal-sky/60 hover:text-ink-primary transition-colors"
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
                <span className="atmos-beacon-ring absolute h-8 w-8 rounded-full border border-[var(--atmos-accent)]" />
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

      {/* Birleşik Çakışmasız Üst HUD Kuşağı (Dar ekranda alt alta sarar, geniş ekranda sol-sağ ayrılır) */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="atmos-hud-glass max-w-full rounded-xl px-2.5 py-1.5 sm:max-w-[54%]">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-ink-secondary tabular">
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
                <span
                  className={
                    isRadarArchive
                      ? "text-amber-200"
                      : frameTimingInfo.isForecast
                        ? "text-sky-300"
                        : ""
                  }
                >
                  {activeFrame
                    ? `${formatRadarClock(activeFrame.time)} (${
                        isRadarArchive ? "Arşiv Kare" : frameTimingInfo.label
                      })`
                    : loadingRadar
                      ? "Yükleniyor..."
                      : "Çevrimdışı"}
                </span>
                {isOverzoomActive && (
                  <span className="rounded border border-sky-400/25 bg-sky-400/10 px-1.5 py-0.2 text-[10px] text-sky-200">
                    Z{zoom} HD Ölçekli
                  </span>
                )}
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
              <span>
                {showRadar && frameTimingInfo.isHistoricalOrFuture
                  ? "Canlı 10m"
                  : "Rüzgar 0"}
              </span>
              <span className="h-1.5 w-24 rounded-full bg-gradient-to-r from-[#93c5fd] via-[#38bdf8] via-[#34d399] via-[#f59e0b] to-[#f87171]" />
              <span className={windStale && windGrid ? "text-amber-200" : ""}>
                {windGrid
                  ? `Maks ${Math.round(windGrid.maxSpeedKmh)} km/s${
                      windStale ? " · Arşiv" : ""
                    }`
                  : windLoading
                    ? "Alan yükleniyor..."
                    : "60+ km/s"}
              </span>
            </div>
          )}
        </div>

        {/* Üst Sağ: Katman & Taban Seçiciler + Yakınlaştır */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 self-end sm:self-auto">
          <div className="flex flex-wrap justify-end gap-1.5">
          {/* Canlı Atmosfer Katman Seçici */}
          <div className="inline-flex rounded-lg border border-white/10 bg-obsidian-950/85 p-0.5 text-[11px]">
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
          <div className="inline-flex rounded-lg border border-white/10 bg-obsidian-950/85 p-0.5 text-[11px]">
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
            onClick={() =>
              setView((prev) => ({
                ...prev,
                zoom: Math.min(MAX_ZOOM, prev.zoom + 1)
              }))
            }
            disabled={zoom >= MAX_ZOOM}
            aria-label="Haritayı yakınlaştır"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/85 text-ink-primary hover:bg-obsidian-800 disabled:opacity-40 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              setView((prev) => ({
                ...prev,
                zoom: Math.max(MIN_ZOOM, prev.zoom - 1)
              }))
            }
            disabled={zoom <= MIN_ZOOM}
            aria-label="Haritayı uzaklaştır"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/85 text-ink-primary hover:bg-obsidian-800 disabled:opacity-40 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setView({
                center: { lat: selectedLat, lon: selectedLon },
                zoom: 7
              });
            }}
            aria-label="Seçili konuma odaklan"
            title="Seçili konuma odaklan"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/85 text-ink-secondary hover:text-ink-primary hover:bg-obsidian-800 transition-colors"
          >
            <Crosshair className="h-4 w-4" />
          </button>
          </div>
        </div>
      </div>

      {/* Radar Hatası (Yalnızca elde hiçbir kayıtlı kare yoksa gösterilir) */}
      {showRadar && radarError && !radar && (
        <div className="atmos-hud-glass absolute inset-x-4 top-28 z-20 mx-auto max-w-sm rounded-xl border border-signal-rose/40 bg-obsidian-950/90 p-3 text-xs text-ink-primary flex items-center justify-between gap-3">
          <span>{radarError}</span>
          <button
            type="button"
            onClick={() => void loadRadar(false)}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Tekrar
          </button>
        </div>
      )}

      {/* Alt Zaman Oynatıcı & İpucu */}
      <div className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {showRadar ? (
          <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-obsidian-950/90 px-3 py-2">
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

            <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs tabular">
              {frameTimingInfo.isForecast && (
                <span className="rounded bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
                  Tahmin
                </span>
              )}
              <span className="min-w-[44px] text-right text-ink-primary">
                {activeFrame ? formatRadarClock(activeFrame.time) : "--:--"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian-950/85 px-3 py-2 font-mono text-[11px] text-ink-secondary">
            <Wind className="h-3.5 w-3.5 text-signal-sky" />
            <span>Gerçek 10m Rüzgar Vektör Alanı (5×5 Bilineer Enterpolasyon · Open-Meteo)</span>
          </div>
        )}

        <div className="pointer-events-none hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian-950/85 px-2.5 py-2 text-[11px] text-ink-muted">
          <span>Tıkla: Koordinat Ölç · Esri · RainViewer HD · Open-Meteo</span>
        </div>
      </div>
    </div>
  );
}

const LiveRadarMap = memo(LiveRadarMapBase);
export default LiveRadarMap;

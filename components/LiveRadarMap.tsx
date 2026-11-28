"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CloudRain,
  Crosshair,
  Layers,
  Lock,
  Map as MapIcon,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Satellite,
  Unlock,
  Waves,
  Wind
} from "lucide-react";
import { useWeatherStatus } from "@/context/WeatherContext";
import { isTrProvinceCode, type TrProvinceCode } from "@/lib/provinces/types";
import {
  RAINVIEWER_LEGEND_GRADIENT,
  buildRainViewerTileUrl,
  dbzToRainRateMmHr
} from "@/lib/radar-palette";
import {
  ATMOS_REFRESH_ALL_EVENT,
  formatPrecip,
  formatRadarClock,
  formatTemperature,
  formatWindSpeed
} from "@/lib/weather-client";
import type {
  GeoLocation,
  LightningCellVector,
  MetarObservation,
  RadarFrame,
  RadarMetadata,
  UnitSystem,
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

export interface LiveRadarFrameState {
  timeSec: number;
  deltaMin: number;
  isForecast: boolean;
}

export interface TrProvinceCenterMeta {
  code: TrProvinceCode;
  plateNumber: number;
  nameTr: string;
  lat: number;
  lon: number;
  elevationM: number;
}

export interface DecodedTr81Province {
  code: TrProvinceCode;
  plateNumber: number;
  nameTr: string;
  bbox: {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  };
  centroid: {
    lat: number;
    lon: number;
  };
  rings: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
}

export interface DecodedTr81Arc {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  points: ReadonlyArray<readonly [number, number]>;
}

export interface DecodedTr81Topology {
  provinces: readonly DecodedTr81Province[];
  byCode: Readonly<Record<string, DecodedTr81Province>>;
  provinceArcs: readonly DecodedTr81Arc[];
  foreignExclusionRings: ReadonlyArray<{
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
    ring: ReadonlyArray<readonly [number, number]>;
  }>;
}

export interface LiveRadarMapProps {
  selectedLat: number;
  selectedLon: number;
  selectedProvinceCode?: string | null;
  selectedProvinceName?: string | null;
  activeWaterBody?: {
    labelTr: string;
    tempC: number;
  } | null;
  verificationStations?: MetarObservation[];
  provinceSubLocations?: ReadonlyArray<{
    id: string;
    name: string;
    role: "coast" | "plain" | "foothill" | "summit";
    lat: number;
    lon: number;
    elevationM: number;
  }>;
  presetCities: GeoLocation[];
  onPickCoords: (lat: number, lon: number) => void;
  onPickCity: (city: GeoLocation) => void;
  onPickProvince?: (province: TrProvinceCenterMeta) => void;
  unit?: UnitSystem;
  timeZone?: string;
  utcOffsetSeconds?: number;
  convectiveCells?: LightningCellVector[];
  advectionFromDeg?: number;
  advectionSpeedKmh?: number;
  onFrameStateChange?: (state: LiveRadarFrameState) => void;
}

/**
 * Compact canonical 81-province MGM/WMO center metadata (`TR-01`..`TR-81`, including `TR-16` Bursa WMO 17116).
 * Zero static polygon data (`tr-81-adm1-topo.json` is strictly lazy-fetched at runtime).
 */
const PACKED_TR81_CENTERS: ReadonlyArray<
  readonly [plate: number, nameTr: string, lat: number, lon: number, elevationM: number]
> = [
  [1, "Adana", 36.9838, 35.298, 20],
  [2, "Adıyaman", 37.7553, 38.2775, 672],
  [3, "Afyonkarahisar", 38.738, 30.5604, 1034],
  [4, "Ağrı", 39.7253, 43.0522, 1646],
  [5, "Amasya", 40.6668, 35.8353, 409],
  [6, "Ankara", 39.9727, 32.8637, 891],
  [7, "Antalya", 36.8851, 30.6828, 47],
  [8, "Artvin", 41.1752, 41.8187, 613],
  [9, "Aydın", 37.8402, 27.8379, 56],
  [10, "Balıkesir", 39.6551, 27.9207, 110],
  [11, "Bilecik", 40.1414, 29.9772, 539],
  [12, "Bingöl", 38.8847, 40.5007, 1139],
  [13, "Bitlis", 38.475, 42.1625, 1789],
  [14, "Bolu", 40.7329, 31.6022, 743],
  [15, "Burdur", 37.722, 30.294, 957],
  [16, "Bursa", 40.2308, 29.0133, 100],
  [17, "Çanakkale", 40.141, 26.3993, 6],
  [18, "Çankırı", 40.6082, 33.6102, 755],
  [19, "Çorum", 40.5461, 34.9362, 776],
  [20, "Denizli", 37.762, 29.0921, 425],
  [21, "Diyarbakır", 37.9094, 40.2133, 674],
  [22, "Edirne", 41.6767, 26.5508, 51],
  [23, "Elazığ", 38.6058, 39.2973, 881],
  [24, "Erzincan", 39.7523, 39.4868, 1216],
  [25, "Erzurum", 39.9058, 41.2544, 1860],
  [26, "Eskişehir", 39.7656, 30.5502, 801],
  [27, "Gaziantep", 36.9468, 37.4617, 700],
  [28, "Giresun", 40.9227, 38.3878, 38],
  [29, "Gümüşhane", 40.4598, 39.4653, 1216],
  [30, "Hakkari", 37.5744, 43.7388, 1727],
  [31, "Hatay", 36.3615, 36.2829, 82],
  [32, "Isparta", 37.7848, 30.7679, 997],
  [33, "Mersin", 36.812, 34.6411, 7],
  [34, "İstanbul", 40.9819, 28.8208, 33],
  [35, "İzmir", 38.4049, 27.1895, 29],
  [36, "Kars", 40.6042, 43.1073, 1795],
  [37, "Kastamonu", 41.371, 33.7756, 800],
  [38, "Kayseri", 38.687, 35.5, 1094],
  [39, "Kırklareli", 41.7382, 27.2178, 232],
  [40, "Kırşehir", 39.1639, 34.1561, 1007],
  [41, "Kocaeli", 40.7663, 29.9173, 67],
  [42, "Konya", 37.8687, 32.4713, 1029],
  [43, "Kütahya", 39.4171, 29.9891, 969],
  [44, "Malatya", 38.35, 38.25, 950],
  [45, "Manisa", 38.6153, 27.4049, 71],
  [46, "Kahramanmaraş", 37.576, 36.915, 581],
  [47, "Mardin", 37.3103, 40.7284, 1040],
  [48, "Muğla", 37.2095, 28.3668, 646],
  [49, "Muş", 38.7509, 41.5023, 1316],
  [50, "Nevşehir", 38.6163, 34.7025, 1260],
  [51, "Niğde", 37.9587, 34.6795, 1211],
  [52, "Ordu", 40.9838, 37.8858, 5],
  [53, "Rize", 41.04, 40.5013, 3],
  [54, "Sakarya", 40.7676, 30.3934, 30],
  [55, "Samsun", 41.3442, 36.2564, 4],
  [56, "Siirt", 37.9319, 41.9354, 895],
  [57, "Sinop", 42.0299, 35.1545, 27],
  [58, "Sivas", 39.7437, 37.002, 1294],
  [59, "Tekirdağ", 40.9585, 27.4965, 4],
  [60, "Tokat", 40.3312, 36.5577, 611],
  [61, "Trabzon", 40.9985, 39.7649, 39],
  [62, "Tunceli", 39.1058, 39.5408, 981],
  [63, "Şanlıurfa", 37.1608, 38.7863, 550],
  [64, "Uşak", 38.6712, 29.404, 919],
  [65, "Van", 38.4693, 43.346, 1675],
  [66, "Yozgat", 39.8243, 34.8159, 1301],
  [67, "Zonguldak", 41.4492, 31.7779, 135],
  [68, "Aksaray", 38.3705, 33.9987, 970],
  [69, "Bayburt", 40.2547, 40.2207, 1584],
  [70, "Karaman", 37.1932, 33.2202, 1018],
  [71, "Kırıkkale", 39.8433, 33.5181, 751],
  [72, "Batman", 37.8636, 41.1562, 610],
  [73, "Şırnak", 37.5209, 42.4523, 1350],
  [74, "Bartın", 41.6248, 32.3569, 33],
  [75, "Ardahan", 41.1061, 42.7055, 1827],
  [76, "Iğdır", 39.9227, 44.0523, 856],
  [77, "Yalova", 40.6589, 29.2796, 4],
  [78, "Karabük", 41.2327, 32.6294, 485],
  [79, "Kilis", 36.7085, 37.1123, 640],
  [80, "Osmaniye", 37.1021, 36.2539, 94],
  [81, "Düzce", 40.8437, 31.1488, 146]
];

export const TR81_PROVINCE_CENTERS: Readonly<Record<TrProvinceCode, TrProvinceCenterMeta>> =
  (() => {
    const map = {} as Record<TrProvinceCode, TrProvinceCenterMeta>;
    for (const [plate, nameTr, lat, lon, elevationM] of PACKED_TR81_CENTERS) {
      const code = `TR-${String(plate).padStart(2, "0")}` as TrProvinceCode;
      map[code] = Object.freeze({
        code,
        plateNumber: plate,
        nameTr: nameTr.normalize("NFC"),
        lat,
        lon,
        elevationM
      });
    }
    return Object.freeze(map);
  })();

/**
 * Province-locked coordinates for verified Turkish METAR (`LT*`) aerodromes and Bursa Tier-1 stations.
 * Strictly tagged by `provinceCode` so cross-province station markers can NEVER bleed across borders.
 */
const TR_VERIFIED_STATION_COORDS: Readonly<
  Record<string, { provinceCode: TrProvinceCode; lat: number; lon: number; shortLabel: string }>
> = Object.freeze({
  // TR-16 Bursa Tier-1 & Tier-2 Mesh
  "17116-OSM": { provinceCode: "TR-16", lat: 40.2308, lon: 29.0133, shortLabel: "17116 Merkez" },
  "OSM-ETEK": { provinceCode: "TR-16", lat: 40.1885, lon: 29.061, shortLabel: "Osmangazi" },
  NILUFER: { provinceCode: "TR-16", lat: 40.2286, lon: 28.8585, shortLabel: "Nilüfer" },
  YILDIRIM: { provinceCode: "TR-16", lat: 40.1919, lon: 29.1086, shortLabel: "Yıldırım" },
  KESTEL: { provinceCode: "TR-16", lat: 40.1861, lon: 29.2106, shortLabel: "Kestel" },
  GURSU: { provinceCode: "TR-16", lat: 40.2489, lon: 29.2408, shortLabel: "Gürsu" },
  MUDANYA: { provinceCode: "TR-16", lat: 40.3686, lon: 28.9017, shortLabel: "Mudanya" },
  GEMLIK: { provinceCode: "TR-16", lat: 40.4401, lon: 29.1504, shortLabel: "Gemlik" },
  KARACABEY: { provinceCode: "TR-16", lat: 40.1319, lon: 28.332, shortLabel: "Karacabey" },
  ULUDAG: { provinceCode: "TR-16", lat: 40.1075, lon: 29.1292, shortLabel: "Uludağ" },
  SARIALAN: { provinceCode: "TR-16", lat: 40.138, lon: 29.108, shortLabel: "Sarıalan" },
  LTBR: { provinceCode: "TR-16", lat: 40.2553, lon: 29.5625, shortLabel: "LTBR" },
  // Official 81-Province Physical Runway METAR Whitelist
  LTAF: { provinceCode: "TR-01", lat: 36.9822, lon: 35.2804, shortLabel: "LTAF" },
  LTAG: { provinceCode: "TR-01", lat: 37.0021, lon: 35.4259, shortLabel: "LTAG" },
  LTCP: { provinceCode: "TR-02", lat: 37.7314, lon: 38.4689, shortLabel: "LTCP" },
  LTAH: { provinceCode: "TR-03", lat: 38.7264, lon: 30.6011, shortLabel: "LTAH" },
  LTCO: { provinceCode: "TR-04", lat: 39.6545, lon: 43.0271, shortLabel: "LTCO" },
  LTAP: { provinceCode: "TR-05", lat: 40.824, lon: 35.5086, shortLabel: "LTAP" },
  LTAC: { provinceCode: "TR-06", lat: 40.1281, lon: 32.9951, shortLabel: "LTAC" },
  LTAB: { provinceCode: "TR-06", lat: 39.9349, lon: 32.7408, shortLabel: "LTAB" },
  LTAD: { provinceCode: "TR-06", lat: 39.9498, lon: 32.6886, shortLabel: "LTAD" },
  LTAI: { provinceCode: "TR-07", lat: 36.8987, lon: 30.8005, shortLabel: "LTAI" },
  LTFG: { provinceCode: "TR-07", lat: 36.2992, lon: 32.3006, shortLabel: "LTFG" },
  LTBD: { provinceCode: "TR-09", lat: 37.8161, lon: 27.8892, shortLabel: "LTBD" },
  LTBF: { provinceCode: "TR-10", lat: 39.6193, lon: 27.926, shortLabel: "LTBF" },
  LTBG: { provinceCode: "TR-10", lat: 40.318, lon: 27.9777, shortLabel: "LTBG" },
  LTFD: { provinceCode: "TR-10", lat: 39.5546, lon: 27.0138, shortLabel: "LTFD" },
  LTCU: { provinceCode: "TR-12", lat: 38.8611, lon: 40.5925, shortLabel: "LTCU" },
  LTBH: { provinceCode: "TR-17", lat: 40.1377, lon: 26.4268, shortLabel: "LTBH" },
  LTFK: { provinceCode: "TR-17", lat: 40.2011, lon: 25.8822, shortLabel: "LTFK" },
  LTAY: { provinceCode: "TR-20", lat: 37.7856, lon: 29.7013, shortLabel: "LTAY" },
  LTCC: { provinceCode: "TR-21", lat: 37.8939, lon: 40.201, shortLabel: "LTCC" },
  LTCA: { provinceCode: "TR-23", lat: 38.6058, lon: 39.2973, shortLabel: "LTCA" },
  LTCD: { provinceCode: "TR-24", lat: 39.7102, lon: 39.527, shortLabel: "LTCD" },
  LTCE: { provinceCode: "TR-25", lat: 39.9565, lon: 41.1702, shortLabel: "LTCE" },
  LTBY: { provinceCode: "TR-26", lat: 39.81, lon: 30.5194, shortLabel: "LTBY" },
  LTBI: { provinceCode: "TR-26", lat: 39.7841, lon: 30.5821, shortLabel: "LTBI" },
  LTAJ: { provinceCode: "TR-27", lat: 36.9472, lon: 37.4787, shortLabel: "LTAJ" },
  LTCW: { provinceCode: "TR-30", lat: 37.55, lon: 44.2372, shortLabel: "LTCW" },
  LTDA: { provinceCode: "TR-31", lat: 36.3628, lon: 36.2822, shortLabel: "LTDA" },
  LTFC: { provinceCode: "TR-32", lat: 37.8554, lon: 30.3684, shortLabel: "LTFC" },
  LTDB: { provinceCode: "TR-33", lat: 36.8981, lon: 35.0694, shortLabel: "LTDB" },
  LTFM: { provinceCode: "TR-34", lat: 41.2753, lon: 28.7519, shortLabel: "LTFM" },
  LTFJ: { provinceCode: "TR-34", lat: 40.8986, lon: 29.3092, shortLabel: "LTFJ" },
  LTBA: { provinceCode: "TR-34", lat: 40.9769, lon: 28.8146, shortLabel: "LTBA" },
  LTBJ: { provinceCode: "TR-35", lat: 38.2924, lon: 27.157, shortLabel: "LTBJ" },
  LTBL: { provinceCode: "TR-35", lat: 38.513, lon: 27.01, shortLabel: "LTBL" },
  LTCF: { provinceCode: "TR-36", lat: 40.5622, lon: 43.115, shortLabel: "LTCF" },
  LTAL: { provinceCode: "TR-37", lat: 41.3142, lon: 33.7958, shortLabel: "LTAL" },
  LTAU: { provinceCode: "TR-38", lat: 38.7704, lon: 35.4954, shortLabel: "LTAU" },
  LTBQ: { provinceCode: "TR-41", lat: 40.735, lon: 30.0833, shortLabel: "LTBQ" },
  LTAN: { provinceCode: "TR-42", lat: 37.979, lon: 32.5619, shortLabel: "LTAN" },
  LTBZ: { provinceCode: "TR-43", lat: 39.1114, lon: 30.13, shortLabel: "LTBZ" },
  LTBN: { provinceCode: "TR-43", lat: 39.4267, lon: 30.0169, shortLabel: "LTBN" },
  LTAT: { provinceCode: "TR-44", lat: 38.4353, lon: 38.091, shortLabel: "LTAT" },
  LTBT: { provinceCode: "TR-45", lat: 38.8089, lon: 27.8339, shortLabel: "LTBT" },
  LTCN: { provinceCode: "TR-46", lat: 37.539, lon: 36.9534, shortLabel: "LTCN" },
  LTCR: { provinceCode: "TR-47", lat: 37.2233, lon: 40.6317, shortLabel: "LTCR" },
  LTBS: { provinceCode: "TR-48", lat: 36.7131, lon: 28.7925, shortLabel: "LTBS" },
  LTFE: { provinceCode: "TR-48", lat: 37.2506, lon: 27.6643, shortLabel: "LTFE" },
  LTCK: { provinceCode: "TR-49", lat: 38.7478, lon: 41.6612, shortLabel: "LTCK" },
  LTAZ: { provinceCode: "TR-50", lat: 38.7719, lon: 34.5345, shortLabel: "LTAZ" },
  LTCB: { provinceCode: "TR-52", lat: 40.967, lon: 38.0815, shortLabel: "LTCB" },
  LTFO: { provinceCode: "TR-53", lat: 41.1692, lon: 40.8289, shortLabel: "LTFO" },
  LTFH: { provinceCode: "TR-55", lat: 41.2631, lon: 36.5587, shortLabel: "LTFH" },
  LTCL: { provinceCode: "TR-56", lat: 37.9789, lon: 41.8404, shortLabel: "LTCL" },
  LTCM: { provinceCode: "TR-57", lat: 42.0209, lon: 35.079, shortLabel: "LTCM" },
  LTAR: { provinceCode: "TR-58", lat: 39.8138, lon: 36.9035, shortLabel: "LTAR" },
  LTBU: { provinceCode: "TR-59", lat: 41.1382, lon: 27.9191, shortLabel: "LTBU" },
  LTAW: { provinceCode: "TR-60", lat: 40.3117, lon: 36.3711, shortLabel: "LTAW" },
  LTCG: { provinceCode: "TR-61", lat: 40.9951, lon: 39.7897, shortLabel: "LTCG" },
  LTCS: { provinceCode: "TR-63", lat: 37.4456, lon: 38.8956, shortLabel: "LTCS" },
  LTBO: { provinceCode: "TR-64", lat: 38.6815, lon: 29.4717, shortLabel: "LTBO" },
  LTCI: { provinceCode: "TR-65", lat: 38.4682, lon: 43.3323, shortLabel: "LTCI" },
  LTAS: { provinceCode: "TR-67", lat: 41.5064, lon: 32.0886, shortLabel: "LTAS" },
  LTCJ: { provinceCode: "TR-72", lat: 37.929, lon: 41.1166, shortLabel: "LTCJ" },
  LTCV: { provinceCode: "TR-73", lat: 37.3639, lon: 42.0597, shortLabel: "LTCV" },
  LTCT: { provinceCode: "TR-76", lat: 39.9831, lon: 43.8664, shortLabel: "LTCT" }
});

interface RawTrTopoJson {
  type: string;
  transform: {
    scale: [number, number];
    translate: [number, number];
  };
  objects: {
    provinces: {
      type: string;
      geometries: Array<{
        type: string;
        id: string;
        arcs: number[][] | number[][][];
      }>;
    };
    foreign_exclusion?: {
      type: string;
      geometries: Array<{
        type: string;
        arcs: number[][] | number[][][];
      }>;
    };
  };
  arcs: number[][][];
}

type GlobalTr81TopoHolder = typeof globalThis & {
  __ATMOS_TR81_TOPO_DATA__?: DecodedTr81Topology | null;
  __ATMOS_TR81_TOPO_PROMISE__?: Promise<DecodedTr81Topology | null> | null;
};

/**
 * Pure ~25-line TopoJSON delta-arc (`transform + arcs`) decoder for `/geo/tr-81-adm1-topo.json`.
 * Returns `null` without throwing if given invalid/mocked payloads in test environments.
 */
export function decodeTr81Topology(raw: unknown): DecodedTr81Topology | null {
  if (!raw || typeof raw !== "object") return null;
  const topo = raw as Partial<RawTrTopoJson>;
  if (
    topo.type !== "Topology" ||
    !topo.transform ||
    !Array.isArray(topo.transform.scale) ||
    !Array.isArray(topo.transform.translate) ||
    !Array.isArray(topo.arcs) ||
    !topo.objects?.provinces ||
    !Array.isArray(topo.objects.provinces.geometries)
  ) {
    return null;
  }

  const [sx, sy] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;
  const decodedArcs: Array<Array<readonly [number, number]>> = topo.arcs.map((arc) => {
    let qx = 0;
    let qy = 0;
    return arc.map((pair) => {
      qx += pair[0];
      qy += pair[1];
      return [tx + qx * sx, ty + qy * sy] as const;
    });
  });

  const stitchRing = (refs: readonly number[]): Array<readonly [number, number]> => {
    const out: Array<readonly [number, number]> = [];
    for (let k = 0; k < refs.length; k++) {
      const ref = refs[k];
      const pts = ref >= 0 ? decodedArcs[ref] : decodedArcs[~ref];
      if (!pts || pts.length === 0) continue;
      if (ref >= 0) {
        for (let i = 0; i < pts.length; i++) {
          if (out.length > 0 && i === 0) continue;
          out.push(pts[i]);
        }
      } else {
        for (let i = pts.length - 1; i >= 0; i--) {
          if (out.length > 0 && i === pts.length - 1) continue;
          out.push(pts[i]);
        }
      }
    }
    return out;
  };

  const usedProvinceArcIds = new Set<number>();
  const provinces: DecodedTr81Province[] = [];
  const byCode: Record<string, DecodedTr81Province> = {};

  for (const geom of topo.objects.provinces.geometries) {
    if (!isTrProvinceCode(geom.id)) continue;
    const code = geom.id;
    const meta = TR81_PROVINCE_CENTERS[code];
    const polyList: number[][][] =
      geom.type === "Polygon"
        ? [geom.arcs as number[][]]
        : (geom.arcs as number[][][]);

    const rings: Array<ReadonlyArray<readonly [number, number]>> = [];
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;

    for (const poly of polyList) {
      if (!Array.isArray(poly)) continue;
      for (const ringRefs of poly) {
        if (!Array.isArray(ringRefs) || ringRefs.length === 0) continue;
        for (const r of ringRefs) {
          usedProvinceArcIds.add(r >= 0 ? r : ~r);
        }
        const pts = stitchRing(ringRefs);
        if (pts.length < 3) continue;
        for (const [lon, lat] of pts) {
          if (lon < minLon) minLon = lon;
          if (lon > maxLon) maxLon = lon;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        rings.push(pts);
      }
    }

    if (rings.length === 0) continue;
    const item: DecodedTr81Province = {
      code,
      plateNumber: meta?.plateNumber ?? Number(code.slice(3)),
      nameTr: meta?.nameTr ?? code,
      bbox: { minLon, minLat, maxLon, maxLat },
      centroid: {
        lat: meta?.lat ?? (minLat + maxLat) / 2,
        lon: meta?.lon ?? (minLon + maxLon) / 2
      },
      rings
    };
    provinces.push(item);
    byCode[code] = item;
  }

  if (provinces.length === 0) return null;

  const provinceArcs: DecodedTr81Arc[] = [];
  for (const arcIdx of usedProvinceArcIds) {
    const pts = decodedArcs[arcIdx];
    if (!pts || pts.length < 2) continue;
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;
    for (const [lon, lat] of pts) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    provinceArcs.push({ minLon, minLat, maxLon, maxLat, points: pts });
  }

  const foreignExclusionRings: Array<{
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
    ring: ReadonlyArray<readonly [number, number]>;
  }> = [];
  const rawForeign = topo.objects.foreign_exclusion?.geometries ?? [];
  for (const fg of rawForeign) {
    const polyList: number[][][] =
      fg.type === "Polygon" ? [fg.arcs as number[][]] : (fg.arcs as number[][][]);
    for (const poly of polyList) {
      const extRefs = poly?.[0];
      if (!Array.isArray(extRefs) || extRefs.length === 0) continue;
      const ring = stitchRing(extRefs);
      if (ring.length < 3) continue;
      let minLon = Infinity;
      let minLat = Infinity;
      let maxLon = -Infinity;
      let maxLat = -Infinity;
      for (const [lon, lat] of ring) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      foreignExclusionRings.push({ minLon, minLat, maxLon, maxLat, ring });
    }
  }

  return {
    provinces,
    byCode,
    provinceArcs,
    foreignExclusionRings
  };
}

function isPointInLonLatRing(
  lon: number,
  lat: number,
  ring: ReadonlyArray<readonly [number, number]>
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function findTrProvinceAtLatLon(
  topo: DecodedTr81Topology | null | undefined,
  lat: number,
  lon: number
): DecodedTr81Province | null {
  if (!topo || lon < 25.4 || lon > 45.0 || lat < 35.7 || lat > 42.3) return null;

  for (const fx of topo.foreignExclusionRings) {
    if (lon < fx.minLon || lon > fx.maxLon || lat < fx.minLat || lat > fx.maxLat) {
      continue;
    }
    if (isPointInLonLatRing(lon, lat, fx.ring)) {
      return null;
    }
  }

  for (const prov of topo.provinces) {
    const b = prov.bbox;
    if (lon < b.minLon || lon > b.maxLon || lat < b.minLat || lat > b.maxLat) {
      continue;
    }
    for (const ring of prov.rings) {
      if (isPointInLonLatRing(lon, lat, ring)) {
        return prov;
      }
    }
  }
  return null;
}

export function getCachedTr81TopologySync(): DecodedTr81Topology | null {
  const g = globalThis as GlobalTr81TopoHolder;
  return g.__ATMOS_TR81_TOPO_DATA__ ?? null;
}

/**
 * Lazy, singleflight browser loader for `/geo/tr-81-adm1-topo.json` (`0 KB` initial bundle cost).
 * Silently resolves to `null` if `fetch` is unavailable, mocked to non-Topology JSON, or offline.
 */
export function loadTr81Adm1Topology(): Promise<DecodedTr81Topology | null> {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return Promise.resolve(null);
  }
  const g = globalThis as GlobalTr81TopoHolder;
  if (g.__ATMOS_TR81_TOPO_DATA__) {
    return Promise.resolve(g.__ATMOS_TR81_TOPO_DATA__);
  }
  if (g.__ATMOS_TR81_TOPO_PROMISE__) {
    return g.__ATMOS_TR81_TOPO_PROMISE__;
  }

  g.__ATMOS_TR81_TOPO_PROMISE__ = window
    .fetch("/geo/tr-81-adm1-topo.json")
    .then(async (res) => {
      if (!res || !res.ok || typeof res.json !== "function") return null;
      const raw = await res.json().catch(() => null);
      const decoded = decodeTr81Topology(raw);
      if (decoded) {
        g.__ATMOS_TR81_TOPO_DATA__ = decoded;
      }
      return decoded;
    })
    .catch(() => null)
    .finally(() => {
      g.__ATMOS_TR81_TOPO_PROMISE__ = null;
    });

  return g.__ATMOS_TR81_TOPO_PROMISE__;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
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
 * Spherical forward geodesic projection (R = 6371 km) from origin (lat, lon)
 * along meteorological/compass bearing (0° = N, 90° = E) and distanceKm.
 */
export function projectGeodesicPoint(
  latDeg: number,
  lonDeg: number,
  bearingDeg: number,
  distanceKm: number
): { lat: number; lon: number } {
  const R = 6371;
  const angDist = Math.max(0, distanceKm) / R;
  const phi1 = (latDeg * Math.PI) / 180;
  const lam1 = (lonDeg * Math.PI) / 180;
  const brng = (bearingDeg * Math.PI) / 180;

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const sinD = Math.sin(angDist);
  const cosD = Math.cos(angDist);

  const sinPhi2 = sinPhi1 * cosD + cosPhi1 * sinD * Math.cos(brng);
  const phi2 = Math.asin(clamp(sinPhi2, -1, 1));
  const y = Math.sin(brng) * sinD * cosPhi1;
  const x = cosD - sinPhi1 * sinPhi2;
  const lam2 = lam1 + Math.atan2(y, x);

  return {
    lat: clampLat((phi2 * 180) / Math.PI),
    lon: wrapLon((lam2 * 180) / Math.PI)
  };
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

function normalizeTrStationToken(raw: string): string {
  return raw
    .normalize("NFC")
    .trim()
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/Ş/g, "s")
    .replace(/ş/g, "s")
    .replace(/Ğ/g, "g")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/ü/g, "u")
    .replace(/Ö/g, "o")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ç/g, "c")
    .toLowerCase();
}

interface ActivePointerSample {
  x: number;
  y: number;
  startX: number;
  startY: number;
  pointerType: string;
}

function LiveRadarMapBase({
  selectedLat,
  selectedLon,
  selectedProvinceCode,
  selectedProvinceName,
  activeWaterBody,
  verificationStations,
  provinceSubLocations,
  presetCities,
  onPickCoords,
  onPickCity,
  onPickProvince,
  unit = "metric",
  timeZone,
  utcOffsetSeconds,
  convectiveCells,
  advectionFromDeg,
  advectionSpeedKmh,
  onFrameStateChange
}: LiveRadarMapProps) {
  const { recoveryCount, isOffline } = useWeatherStatus();
  const [isDragging, setIsDragging] = useState(false);
  const [mobileHudOpen, setMobileHudOpen] = useState(false);
  const [mobileDragLock, setMobileDragLock] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const [trTopo, setTrTopo] = useState<DecodedTr81Topology | null>(() =>
    getCachedTr81TopologySync()
  );
  const [showProvinceBorders, setShowProvinceBorders] = useState(true);
  const [hoveredProvinceCode, setHoveredProvinceCode] = useState<TrProvinceCode | null>(null);

  const panRafRef = useRef<number>(0);
  const pendingCenterRef = useRef<{ lat: number; lon: number } | null>(null);
  const mobileDragLockRef = useRef<boolean>(false);
  const prevTargetRef = useRef<{
    lat: number;
    lon: number;
    provinceCode: string | null | undefined;
  }>({
    lat: selectedLat,
    lon: selectedLon,
    provinceCode: selectedProvinceCode
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 760, height: 540 });
  const [view, setView] = useState({
    center: { lat: selectedLat, lon: selectedLon },
    zoom: 6
  });
  const viewRef = useRef(view);
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
  const hoverCheckMsRef = useRef<number>(0);

  const pointersRef = useRef<Map<number, ActivePointerSample>>(new Map());
  const hadMultiTouchRef = useRef<boolean>(false);
  const maxGestureTravelRef = useRef<number>(0);
  const touchAxisRef = useRef<"horizontal" | "vertical" | null>(null);
  const touchStartRawRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    startZoom: number;
    anchorLat: number;
    anchorLon: number;
  }>({
    active: false,
    startDist: 1,
    startZoom: 6,
    anchorLat: selectedLat,
    anchorLon: selectedLon
  });

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
    radarRef.current = radar;
  }, [radar]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    mobileDragLockRef.current = mobileDragLock;
  }, [mobileDragLock]);

  // Lazy-load `/geo/tr-81-adm1-topo.json` once on `/world` mount (0 KB initial bundle impact)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let active = true;
    void loadTr81Adm1Topology()
      .then((data) => {
        if (active && data) {
          setTrTopo(data);
        }
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  // Respect prefers-reduced-motion: pause automatic playback loop by default & when enabled
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => {
      setPrefersReducedMotion(mql.matches);
      if (mql.matches) {
        setPlaying(false);
      }
    });
    const onChange = (ev: MediaQueryListEvent) => {
      setPrefersReducedMotion(ev.matches);
      if (ev.matches) {
        setPlaying(false);
      }
    };
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  // Synchronize map center and purge stale city wind-grid state whenever selected city/province changes
  useEffect(() => {
    let active = true;
    const prev = prevTargetRef.current;
    const movedFar =
      Math.hypot(selectedLat - prev.lat, selectedLon - prev.lon) > 0.03 ||
      (selectedProvinceCode &&
        prev.provinceCode &&
        selectedProvinceCode !== prev.provinceCode);
    prevTargetRef.current = {
      lat: selectedLat,
      lon: selectedLon,
      provinceCode: selectedProvinceCode
    };

    if (panRafRef.current) {
      window.cancelAnimationFrame(panRafRef.current);
      panRafRef.current = 0;
    }
    pendingCenterRef.current = null;

    queueMicrotask(() => {
      if (!active) return;
      if (movedFar) {
        setWindGrid(null);
        setWindStale(false);
        setHoveredProvinceCode(null);
      }
      setView((cur) => ({
        ...cur,
        center: { lat: selectedLat, lon: selectedLon }
      }));
    });
    return () => {
      active = false;
    };
  }, [selectedLat, selectedLon, selectedProvinceCode]);

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

  // Non-passive wheel + mobile scroll-friendly touchmove listener:
  // - Desktop wheel zooms anchored to cursor lat/lon without scrolling page.
  // - Mobile touch allows vertical page scrolling by default, while intercepting 2-finger pinch/pan,
  //   horizontal-dominant swipes (|dx| > 1.15 * |dy|), or explicit mobile drag lock.
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
        const nextZoom = clamp(prev.zoom + stepDir, MIN_ZOOM, MAX_ZOOM);
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

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        hadMultiTouchRef.current = true;
        touchAxisRef.current = "horizontal";
        return;
      }
      if (e.touches.length === 1) {
        touchStartRawRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        touchAxisRef.current = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (mobileDragLockRef.current || e.touches.length >= 2) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (e.touches.length === 1 && touchStartRawRef.current) {
        const dx = e.touches[0].clientX - touchStartRawRef.current.x;
        const dy = e.touches[0].clientY - touchStartRawRef.current.y;
        if (touchAxisRef.current === null && Math.hypot(dx, dy) > 6) {
          touchAxisRef.current =
            Math.abs(dx) > 1.15 * Math.abs(dy) ? "horizontal" : "vertical";
        }
        if (touchAxisRef.current === "horizontal" && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchStartRawRef.current = null;
        touchAxisRef.current = null;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
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

  // Global ATMOS_REFRESH_ALL_EVENT listener: refreshes both /api/radar and /api/wind-grid
  useEffect(() => {
    const onGlobalRefresh = () => {
      void loadRadar(true);
      setRefreshNonce((n) => n + 1);
    };
    window.addEventListener(ATMOS_REFRESH_ALL_EVENT, onGlobalRefresh);
    return () => window.removeEventListener(ATMOS_REFRESH_ALL_EVENT, onGlobalRefresh);
  }, [loadRadar]);

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

  // Fetch 25-point real 10m wind vector grid with AbortController cancellation on city/viewport change
  useEffect(() => {
    if (overlayMode === "radar") return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const nw = screenToLatLon(0, 0);
      const se = screenToLatLon(size.width, size.height);
      const midLat = clamp((nw.lat + se.lat) / 2, -77.5, 77.5);
      const rawLatHalf = Math.abs(nw.lat - se.lat) / 2;
      const halfLat = Math.max(0.18, rawLatHalf);

      const south = Math.max(-78, midLat - halfLat);
      const north = Math.min(78, Math.max(south + 0.36, midLat + halfLat));

      const spanLon = clamp((size.width / (256 * Math.pow(2, view.zoom))) * 360, 0.36, 140);
      const westLon = wrapLon(center.lon - spanLon / 2);
      let eastLon = wrapLon(center.lon + spanLon / 2);

      const wRounded = Number(westLon.toFixed(2));
      const eRounded = Number(eastLon.toFixed(2));
      const roundedDelta =
        eRounded > wRounded ? eRounded - wRounded : eRounded + 360 - wRounded;
      if (roundedDelta > 140) {
        eastLon = wrapLon(eastLon - 0.02);
      }

      if (controller.signal.aborted) return;
      setWindLoading(true);
      try {
        const qs = new URLSearchParams({
          south: south.toFixed(2),
          west: westLon.toFixed(2),
          north: north.toFixed(2),
          east: eastLon.toFixed(2)
        });
        const res = await fetch(`/api/wind-grid?${qs.toString()}`, {
          signal: controller.signal,
          cache: recoveryCount > 0 || refreshNonce > 0 ? "no-store" : "default"
        });
        if (controller.signal.aborted) return;
        if (res.ok) {
          const data: WindGridBundle = await res.json();
          if (controller.signal.aborted) return;
          setWindGrid(data);
          setWindStale((data.freshness?.status ?? "live") !== "live");
        } else {
          setWindStale(true);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (!(err instanceof Error && err.name === "AbortError")) {
          setWindStale(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setWindLoading(false);
        }
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
    view.zoom,
    size.width,
    size.height,
    screenToLatLon,
    recoveryCount,
    refreshNonce
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
      buildRainViewerTileUrl(
        host,
        framePath,
        RADAR_TILE_REQUEST_SIZE,
        rZoom,
        wrapX,
        ty
      ),
    []
  );

  const radarViewportSig = useMemo(
    () => `${radarLayout.radarZoom}:${radarLayout.tiles.map((t) => `${t.wrapX}_${t.y}`).join(",")}`,
    [radarLayout]
  );

  // Flicker-free atomic frame promotion: decode next frame's visible tiles in memory BEFORE swapping `src`!
  useEffect(() => {
    let cancelled = false;
    if (!radar || !activeFrame) {
      queueMicrotask(() => {
        if (!cancelled) setRenderedFrame(null);
      });
      return () => {
        cancelled = true;
      };
    }
    if (overlayMode === "wind" || radarLayout.tiles.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) setRenderedFrame(activeFrame);
      });
      return () => {
        cancelled = true;
      };
    }

    const cacheSig = `${radarViewportSig}:${activeFrame.path}`;
    if (decodedFrameSetRef.current.has(cacheSig)) {
      queueMicrotask(() => {
        if (!cancelled) setRenderedFrame(activeFrame);
      });
      return () => {
        cancelled = true;
      };
    }

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

  // Playback loop gated on renderedFrame synchronization & prefers-reduced-motion
  useEffect(() => {
    if (!playing || prefersReducedMotion || !radar || radar.frames.length < 2) return;
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
  }, [playing, prefersReducedMotion, frameIdx, radar, renderedFrame, activeFrame]);

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

  // Resolve active Turkish province (`TR-01`..`TR-81`) or `null` when outside Turkey
  const effectiveTrProvinceCode = useMemo((): TrProvinceCode | null => {
    if (isTrProvinceCode(selectedProvinceCode)) return selectedProvinceCode;
    if (selectedProvinceCode === "GLOBAL") return null;
    if (trTopo) {
      return findTrProvinceAtLatLon(trTopo, selectedLat, selectedLon)?.code ?? null;
    }
    return null;
  }, [selectedProvinceCode, trTopo, selectedLat, selectedLon]);

  const effectiveProvinceBadgeText = useMemo(() => {
    if (effectiveTrProvinceCode) {
      const name =
        selectedProvinceName || TR81_PROVINCE_CENTERS[effectiveTrProvinceCode]?.nameTr;
      return name ? `${effectiveTrProvinceCode} · ${name}` : effectiveTrProvinceCode;
    }
    if (selectedProvinceCode === "GLOBAL") {
      return "KÜRESEL";
    }
    return null;
  }, [effectiveTrProvinceCode, selectedProvinceCode, selectedProvinceName]);

  // 81-Province Vector SVG Geometry (1 combined arc path + active cyan/amber highlight + hover outline)
  const trBorderPaths = useMemo(() => {
    if (!showProvinceBorders || !trTopo || size.width <= 0 || size.height <= 0) {
      return null;
    }
    const nw = screenToLatLon(0, 0);
    const se = screenToLatLon(size.width, size.height);
    const minVisLat = Math.min(nw.lat, se.lat) - 0.6;
    const maxVisLat = Math.max(nw.lat, se.lat) + 0.6;
    const spanLon = clamp((size.width / (TILE_SIZE * Math.pow(2, zoom))) * 360, 0.4, 360);
    const minVisLon = center.lon - spanLon / 2 - 0.8;
    const maxVisLon = center.lon + spanLon / 2 + 0.8;

    // Skip SVG work when viewport does not intersect Turkey
    if (maxVisLon < 25.4 || minVisLon > 45.2 || maxVisLat < 35.5 || minVisLat > 42.4) {
      return null;
    }

    const minSegPx = zoom <= 5 ? 1.5 : zoom === 6 ? 1.0 : 0.4;
    const buildOpenPath = (pts: ReadonlyArray<readonly [number, number]>): string => {
      let d = "";
      let lastX = -9999;
      let lastY = -9999;
      for (let i = 0; i < pts.length; i++) {
        const p = projectToScreen(pts[i][1], pts[i][0]);
        if (i === 0) {
          d += `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          lastX = p.x;
          lastY = p.y;
        } else if (
          i === pts.length - 1 ||
          Math.hypot(p.x - lastX, p.y - lastY) >= minSegPx
        ) {
          d += `L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          lastX = p.x;
          lastY = p.y;
        }
      }
      return d;
    };

    const buildClosedRingsPath = (
      rings: ReadonlyArray<ReadonlyArray<readonly [number, number]>>
    ): string => {
      let d = "";
      for (const ring of rings) {
        if (ring.length < 3) continue;
        const seg = buildOpenPath(ring);
        if (seg) d += `${seg}Z`;
      }
      return d;
    };

    let allArcsD = "";
    for (const arc of trTopo.provinceArcs) {
      if (
        arc.maxLon < minVisLon ||
        arc.minLon > maxVisLon ||
        arc.maxLat < minVisLat ||
        arc.minLat > maxVisLat
      ) {
        continue;
      }
      allArcsD += buildOpenPath(arc.points);
    }

    const activeProv = effectiveTrProvinceCode
      ? trTopo.byCode[effectiveTrProvinceCode] ?? null
      : null;
    const activeD = activeProv ? buildClosedRingsPath(activeProv.rings) : "";

    const hoveredProv =
      hoveredProvinceCode &&
      hoveredProvinceCode !== effectiveTrProvinceCode &&
      !isDragging
        ? trTopo.byCode[hoveredProvinceCode] ?? null
        : null;
    const hoveredD = hoveredProv ? buildClosedRingsPath(hoveredProv.rings) : "";

    return {
      allArcsD,
      activeD,
      hoveredD,
      hoveredProv
    };
  }, [
    showProvinceBorders,
    trTopo,
    size.width,
    size.height,
    screenToLatLon,
    zoom,
    center.lon,
    projectToScreen,
    effectiveTrProvinceCode,
    hoveredProvinceCode,
    isDragging
  ]);

  // Province-locked Live Station Markers (`bundle?.hybrid?.verification?.stations`)
  const projectedVerificationStations = useMemo(() => {
    if (!verificationStations || verificationStations.length === 0) return [];
    const seen = new Set<string>();
    const out: Array<{
      id: string;
      label: string;
      tempLabel: string | null;
      x: number;
      y: number;
    }> = [];

    for (const st of verificationStations) {
      const codeKey = String(st.icaoId || "").trim().toUpperCase();
      if (!codeKey || seen.has(codeKey)) continue;

      let stLat: number | null = null;
      let stLon: number | null = null;
      let shortLabel = codeKey;

      const known = TR_VERIFIED_STATION_COORDS[codeKey];
      if (known) {
        // Strict cross-province isolation: reject stations owned by any other province
        if (effectiveTrProvinceCode && known.provinceCode !== effectiveTrProvinceCode) {
          continue;
        }
        if (selectedProvinceCode === "GLOBAL") {
          continue;
        }
        stLat = known.lat;
        stLon = known.lon;
        shortLabel = known.shortLabel;
      } else {
        const stAny = st as MetarObservation & {
          lat?: number;
          lon?: number;
          provinceCode?: string;
        };
        if (
          typeof stAny.lat === "number" &&
          Number.isFinite(stAny.lat) &&
          typeof stAny.lon === "number" &&
          Number.isFinite(stAny.lon)
        ) {
          if (
            stAny.provinceCode &&
            effectiveTrProvinceCode &&
            stAny.provinceCode !== effectiveTrProvinceCode
          ) {
            continue;
          }
          if (trTopo && effectiveTrProvinceCode) {
            const polyHit = findTrProvinceAtLatLon(trTopo, stAny.lat, stAny.lon);
            if (polyHit && polyHit.code !== effectiveTrProvinceCode) {
              continue;
            }
          }
          stLat = stAny.lat;
          stLon = stAny.lon;
          shortLabel = st.stationName ? st.stationName.split("(")[0].trim() : codeKey;
        } else if (provinceSubLocations && provinceSubLocations.length > 0) {
          const stNorm = normalizeTrStationToken(st.stationName || codeKey);
          const matchedSub = provinceSubLocations.find((sub) => {
            const subNorm = normalizeTrStationToken(sub.name);
            return stNorm.includes(subNorm) || subNorm.includes(stNorm);
          });
          if (matchedSub) {
            stLat = matchedSub.lat;
            stLon = matchedSub.lon;
            shortLabel = matchedSub.name.split("/")[0].trim();
          }
        }
      }

      if (stLat === null || stLon === null) continue;
      if (Math.hypot(stLat - selectedLat, stLon - selectedLon) < 0.012) continue;

      const pt = projectToScreen(stLat, stLon);
      if (
        pt.x < 32 ||
        pt.x > size.width - 32 ||
        pt.y < 58 ||
        pt.y > size.height - 62
      ) {
        continue;
      }

      seen.add(codeKey);
      out.push({
        id: codeKey,
        label: shortLabel,
        tempLabel:
          typeof st.tempC === "number" && Number.isFinite(st.tempC)
            ? formatTemperature(st.tempC, unit)
            : null,
        x: pt.x,
        y: pt.y
      });
      if (out.length >= 8) break;
    }

    return out;
  }, [
    verificationStations,
    effectiveTrProvinceCode,
    selectedProvinceCode,
    trTopo,
    provinceSubLocations,
    selectedLat,
    selectedLon,
    projectToScreen,
    size.width,
    size.height,
    unit
  ]);

  const initPinchState = () => {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length < 2 || !containerRef.current) return;
    const [p1, p2] = pts;
    const rect = containerRef.current.getBoundingClientRect();
    const midX = (p1.x + p2.x) / 2 - rect.left;
    const midY = (p1.y + p2.y) / 2 - rect.top;
    const curView = viewRef.current;
    const curCWX = lonToWorldX(curView.center.lon, curView.zoom);
    const curCWY = latToWorldY(curView.center.lat, curView.zoom);
    const anchorLon = worldXToLon(curCWX + (midX - rect.width / 2), curView.zoom);
    const anchorLat = worldYToLat(curCWY + (midY - rect.height / 2), curView.zoom);

    pinchRef.current = {
      active: true,
      startDist: Math.max(12, Math.hypot(p2.x - p1.x, p2.y - p1.y)),
      startZoom: curView.zoom,
      anchorLat,
      anchorLon
    };
    dragRef.current.active = false;
    dragRef.current.moved = true;
    hadMultiTouchRef.current = true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic pointer capture errors
    }

    if (pointersRef.current.size === 0) {
      hadMultiTouchRef.current = false;
      maxGestureTravelRef.current = 0;
    }

    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      pointerType: e.pointerType
    });

    if (pointersRef.current.size >= 2) {
      initPinchState();
      setIsDragging(true);
      return;
    }

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
    const rec = pointersRef.current.get(e.pointerId);
    if (rec) {
      rec.x = e.clientX;
      rec.y = e.clientY;
      const travel = Math.hypot(rec.x - rec.startX, rec.y - rec.startY);
      if (travel > maxGestureTravelRef.current) {
        maxGestureTravelRef.current = travel;
      }
    }

    // Desktop hover highlight over 81 provinces when idle (zero drag interference)
    if (
      pointersRef.current.size === 0 &&
      !dragRef.current.active &&
      e.pointerType === "mouse" &&
      showProvinceBorders &&
      trTopo &&
      containerRef.current
    ) {
      const nowMs = performance.now();
      if (nowMs - hoverCheckMsRef.current >= 32) {
        hoverCheckMsRef.current = nowMs;
        const rect = containerRef.current.getBoundingClientRect();
        const pt = screenToLatLon(e.clientX - rect.left, e.clientY - rect.top);
        const hit = findTrProvinceAtLatLon(trTopo, pt.lat, pt.lon);
        const nextCode = hit?.code ?? null;
        setHoveredProvinceCode((prev) => (prev === nextCode ? prev : nextCode));
      }
      return;
    }

    // Two-finger Pinch-to-Zoom + Midpoint Geo-Anchored Pan
    if (pointersRef.current.size >= 2 && containerRef.current) {
      if (!pinchRef.current.active) {
        initPinchState();
      }
      const pts = Array.from(pointersRef.current.values());
      const [p1, p2] = pts;
      const dist = Math.max(12, Math.hypot(p2.x - p1.x, p2.y - p1.y));
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const midX = (p1.x + p2.x) / 2 - rect.left;
      const midY = (p1.y + p2.y) / 2 - rect.top;
      const zoomFloat = clamp(
        pinchRef.current.startZoom + Math.log2(dist / pinchRef.current.startDist),
        3,
        10
      );
      const nextZoom = Math.round(zoomFloat);
      const anchorWX = lonToWorldX(pinchRef.current.anchorLon, nextZoom);
      const anchorWY = latToWorldY(pinchRef.current.anchorLat, nextZoom);
      const nextCWX = anchorWX - (midX - rect.width / 2);
      const nextCWY = anchorWY - (midY - rect.height / 2);

      if (!isDragging) setIsDragging(true);
      setView({
        zoom: nextZoom,
        center: {
          lat: worldYToLat(nextCWY, nextZoom),
          lon: worldXToLon(nextCWX, nextZoom)
        }
      });
      return;
    }

    if (!dragRef.current.active || hadMultiTouchRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (e.pointerType === "touch" && !mobileDragLockRef.current) {
      if (dist <= 6) return;
      if (touchAxisRef.current === null) {
        touchAxisRef.current =
          Math.abs(dx) > 1.15 * Math.abs(dy) ? "horizontal" : "vertical";
      }
      if (touchAxisRef.current === "vertical") {
        // Yield cleanly to native vertical page scroll without firing coordinate pick
        dragRef.current.moved = true;
        dragRef.current.active = false;
        setIsDragging(false);
        return;
      }
    }

    if (dist > 5) {
      dragRef.current.moved = true;
    }
    if (!dragRef.current.moved) return;

    if (!isDragging) setIsDragging(true);
    const curZoom = viewRef.current.zoom;
    const nextWX = dragRef.current.startWorldX - dx;
    const nextWY = dragRef.current.startWorldY - dy;
    pendingCenterRef.current = {
      lat: worldYToLat(nextWY, curZoom),
      lon: worldXToLon(nextWX, curZoom)
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

  const finalizePointerEnd = (
    e: React.PointerEvent<HTMLDivElement>,
    allowPick: boolean
  ) => {
    pointersRef.current.delete(e.pointerId);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (pointersRef.current.size === 1) {
      // Transition smoothly from 2 fingers down to 1 remaining finger without jumping
      pinchRef.current.active = false;
      const remaining = Array.from(pointersRef.current.values())[0];
      const curView = viewRef.current;
      dragRef.current = {
        active: true,
        startX: remaining.x,
        startY: remaining.y,
        startWorldX: lonToWorldX(curView.center.lon, curView.zoom),
        startWorldY: latToWorldY(curView.center.lat, curView.zoom),
        moved: true
      };
      return;
    }

    if (pointersRef.current.size > 1) {
      initPinchState();
      return;
    }

    // All pointers lifted
    const wasMoved = dragRef.current.moved;
    const hadMultiTouch = hadMultiTouchRef.current;
    const maxTravel = maxGestureTravelRef.current;

    pinchRef.current.active = false;
    dragRef.current.active = false;
    setIsDragging(false);
    if (panRafRef.current) {
      window.cancelAnimationFrame(panRafRef.current);
      panRafRef.current = 0;
    }

    if (
      allowPick &&
      !hadMultiTouch &&
      !wasMoved &&
      maxTravel <= 6 &&
      containerRef.current
    ) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const pt = screenToLatLon(clickX, clickY);
      const latRounded = Number(pt.lat.toFixed(3));
      const lonRounded = Number(pt.lon.toFixed(3));

      const hitProvince =
        showProvinceBorders && trTopo
          ? findTrProvinceAtLatLon(trTopo, latRounded, lonRounded)
          : null;

      if (hitProvince && onPickProvince && viewRef.current.zoom <= 6) {
        const centerMeta = TR81_PROVINCE_CENTERS[hitProvince.code];
        if (centerMeta) {
          onPickProvince(centerMeta);
        } else {
          onPickCoords(latRounded, lonRounded);
        }
      } else {
        onPickCoords(latRounded, lonRounded);
      }
    }

    hadMultiTouchRef.current = false;
    maxGestureTravelRef.current = 0;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    finalizePointerEnd(e, true);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    finalizePointerEnd(e, false);
  };

  const handleMapKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const panStepPx = 64;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const dx = e.key === "ArrowLeft" ? -panStepPx : e.key === "ArrowRight" ? panStepPx : 0;
      const dy = e.key === "ArrowUp" ? -panStepPx : e.key === "ArrowDown" ? panStepPx : 0;
      setView((prev) => {
        const nextWX = lonToWorldX(prev.center.lon, prev.zoom) + dx;
        const nextWY = latToWorldY(prev.center.lat, prev.zoom) + dy;
        return {
          ...prev,
          center: {
            lat: worldYToLat(nextWY, prev.zoom),
            lon: worldXToLon(nextWX, prev.zoom)
          }
        };
      });
      return;
    }
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      setView((prev) => ({ ...prev, zoom: Math.min(MAX_ZOOM, prev.zoom + 1) }));
      return;
    }
    if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      setView((prev) => ({ ...prev, zoom: Math.max(MIN_ZOOM, prev.zoom - 1) }));
      return;
    }
    if (e.key === " ") {
      if ((overlayMode === "both" || overlayMode === "radar") && radar && radar.frames.length >= 2) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onPickCoords(Number(center.lat.toFixed(3)), Number(center.lon.toFixed(3)));
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setView({
        center: { lat: selectedLat, lon: selectedLon },
        zoom: 7
      });
    }
  };

  const selectedPt = projectToScreen(selectedLat, selectedLon);

  const frameTimingInfo = useMemo(() => {
    if (!radar || !activeFrame) {
      return { label: "", deltaMin: 0, isForecast: false, isHistoricalOrFuture: false };
    }
    const anchorIdx = resolveInitialObservedFrameIndex(radar);
    const anchorFrame = radar.frames[anchorIdx] ?? radar.frames[radar.frames.length - 1];
    if (!anchorFrame) {
      return { label: "", deltaMin: 0, isForecast: false, isHistoricalOrFuture: false };
    }
    const rawDeltaMin = Math.round((activeFrame.time - anchorFrame.time) / 60);
    const isForecast = Boolean(activeFrame.isForecast || rawDeltaMin > 0);
    const deltaMin = isForecast ? Math.max(5, rawDeltaMin) : rawDeltaMin;
    if (isForecast) {
      return {
        label: `+${deltaMin} dk · Tahmin`,
        deltaMin,
        isForecast: true,
        isHistoricalOrFuture: true
      };
    }
    if (deltaMin === 0) {
      return { label: "Canlı Ölçüm", deltaMin: 0, isForecast: false, isHistoricalOrFuture: false };
    }
    return {
      label: `${deltaMin} dk`,
      deltaMin,
      isForecast: false,
      isHistoricalOrFuture: true
    };
  }, [radar, activeFrame]);

  const onFrameStateChangeRef = useRef(onFrameStateChange);
  useEffect(() => {
    onFrameStateChangeRef.current = onFrameStateChange;
  }, [onFrameStateChange]);

  useEffect(() => {
    if (!activeFrame || !onFrameStateChangeRef.current) return;
    onFrameStateChangeRef.current({
      timeSec: activeFrame.time,
      deltaMin: frameTimingInfo.deltaMin,
      isForecast: frameTimingInfo.isForecast
    });
  }, [activeFrame, frameTimingInfo.deltaMin, frameTimingInfo.isForecast]);

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

  // 8-Octant Convective Cell Geodesic Projection + 30-min Advection Arrowhead
  const projectedConvectiveCells = useMemo(() => {
    if (
      !showRadar ||
      Math.abs(frameTimingInfo.deltaMin) > 15 ||
      !convectiveCells ||
      convectiveCells.length === 0
    ) {
      return [];
    }

    const hasAdvection =
      typeof advectionFromDeg === "number" &&
      Number.isFinite(advectionFromDeg) &&
      typeof advectionSpeedKmh === "number" &&
      Number.isFinite(advectionSpeedKmh) &&
      advectionSpeedKmh > 0;
    const motionToDeg = hasAdvection ? ((advectionFromDeg! + 180) % 360 + 360) % 360 : 0;
    const dist30MinKm = hasAdvection ? advectionSpeedKmh! * 0.5 : 0;

    return convectiveCells
      .map((cell) => {
        const cellGeo = projectGeodesicPoint(
          selectedLat,
          selectedLon,
          cell.bearingDeg,
          cell.distanceKm
        );
        const pt = projectToScreen(cellGeo.lat, cellGeo.lon);
        if (
          pt.x < -36 ||
          pt.x > size.width + 36 ||
          pt.y < -36 ||
          pt.y > size.height + 36
        ) {
          return null;
        }

        let tipPt: { x: number; y: number } | null = null;
        let arrowPolygon: string | null = null;
        if (hasAdvection && dist30MinKm >= 1) {
          const tipGeo = projectGeodesicPoint(
            cellGeo.lat,
            cellGeo.lon,
            motionToDeg,
            dist30MinKm
          );
          const rawTip = projectToScreen(tipGeo.lat, tipGeo.lon);
          const vx = rawTip.x - pt.x;
          const vy = rawTip.y - pt.y;
          const segLen = Math.hypot(vx, vy);
          if (segLen >= 8) {
            tipPt = rawTip;
            const ang = Math.atan2(vy, vx);
            const headLen = 6.5;
            const wingAng = 0.52;
            const pLeftX = rawTip.x - headLen * Math.cos(ang - wingAng);
            const pLeftY = rawTip.y - headLen * Math.sin(ang - wingAng);
            const pRightX = rawTip.x - headLen * Math.cos(ang + wingAng);
            const pRightY = rawTip.y - headLen * Math.sin(ang + wingAng);
            arrowPolygon = `${rawTip.x.toFixed(1)},${rawTip.y.toFixed(1)} ${pLeftX.toFixed(1)},${pLeftY.toFixed(1)} ${pRightX.toFixed(1)},${pRightY.toFixed(1)}`;
          }
        }

        const badgeText = `${Math.round(cell.peakDbz)} dBZ${
          cell.etaMinutes ? ` · ~${cell.etaMinutes}dk` : ""
        }`;
        const strokeColor =
          cell.peakDbz >= 50
            ? "#f43f5e"
            : cell.peakDbz >= 42
              ? "#f97316"
              : cell.kind === "thundersnow_dek"
                ? "#38bdf8"
                : "#facc15";

        return {
          id: cell.id,
          x: pt.x,
          y: pt.y,
          tipPt,
          arrowPolygon,
          badgeText,
          strokeColor
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [
    showRadar,
    frameTimingInfo.deltaMin,
    convectiveCells,
    advectionFromDeg,
    advectionSpeedKmh,
    selectedLat,
    selectedLon,
    projectToScreen,
    size.width,
    size.height
  ]);

  const activeClockLabel = activeFrame
    ? formatRadarClock(activeFrame.time, timeZone, utcOffsetSeconds)
    : "--:--";

  const lowLegendRate = formatPrecip(dbzToRainRateMmHr(20), unit, { per: "hour" });
  const highLegendRate = formatPrecip(dbzToRainRateMmHr(50), unit, { per: "hour" });
  const windFallbackCap = unit === "imperial" ? "37+ mph" : "60+ km/s";

  const sliderValueText = activeFrame
    ? `${activeClockLabel} — ${isRadarArchive ? "Arşiv Kare" : frameTimingInfo.label}`
    : "Radar karesi yükleniyor";

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#0a0f18]">
      {/* Etkileşimli Harita Yüzeyi */}
      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-label="Canlı yağış radarı ve rüzgar akışı haritası"
        onKeyDown={handleMapKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => setHoveredProvinceCode(null)}
        className={`relative h-full w-full cursor-crosshair active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-inset ${
          mobileDragLock ? "touch-none" : "sm:touch-none touch-pan-y"
        }`}
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

        {/* Canlı RainViewer 512px HD Scheme 2 Doppler Yağış Katmanı (Z8-Z10 Kesintisiz Overzoom Destekli) */}
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
            timeOffsetMinutes={showRadar && activeFrame ? frameTimingInfo.deltaMin : 0}
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

        {/* Tembel Yüklenen Resmi 81-İl Vektör Sınır Katmanı & Seçili İl Camgöbeği/Kehribar Vurgusu */}
        {trBorderPaths && (
          <svg
            viewBox={`0 0 ${Math.max(1, size.width)} ${Math.max(1, size.height)}`}
            className="pointer-events-none absolute inset-0 z-[8] h-full w-full overflow-hidden"
            aria-hidden="true"
          >
            {trBorderPaths.allArcsD && (
              <path
                d={trBorderPaths.allArcsD}
                fill="none"
                stroke={
                  basemap === "satellite"
                    ? "rgba(248, 250, 252, 0.38)"
                    : "rgba(148, 210, 250, 0.28)"
                }
                strokeWidth={zoom >= 7 ? 1.15 : 0.9}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {trBorderPaths.hoveredD && (
              <path
                d={trBorderPaths.hoveredD}
                fill="rgba(56, 189, 248, 0.06)"
                fillRule="evenodd"
                stroke="rgba(56, 189, 248, 0.62)"
                strokeWidth="1.35"
                strokeLinejoin="round"
              />
            )}
            {trBorderPaths.activeD && (
              <>
                <path
                  d={trBorderPaths.activeD}
                  fill="rgba(56, 189, 248, 0.08)"
                  fillRule="evenodd"
                  stroke="rgba(245, 158, 11, 0.48)"
                  strokeWidth={zoom >= 7 ? 4.2 : 3.4}
                  strokeLinejoin="round"
                />
                <path
                  d={trBorderPaths.activeD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={zoom >= 7 ? 1.9 : 1.55}
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
        )}

        {/* 8-Oktant Konvektif Fırtına Hücre Vektörleri & 30dk İlerleme Okları (SVG Katmanı) */}
        {projectedConvectiveCells.length > 0 && (
          <svg
            viewBox={`0 0 ${Math.max(1, size.width)} ${Math.max(1, size.height)}`}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden"
            aria-hidden="true"
          >
            {projectedConvectiveCells.map((cell) => {
              const badgeWidth = Math.max(58, cell.badgeText.length * 6.1 + 12);
              const placeLeft = cell.x + 10 + badgeWidth > size.width - 8;
              const badgeX = placeLeft ? cell.x - 10 - badgeWidth : cell.x + 10;
              const badgeY = Math.max(46, Math.min(size.height - 62, cell.y - 11));
              return (
                <g key={cell.id}>
                  {cell.tipPt && (
                    <line
                      x1={cell.x}
                      y1={cell.y}
                      x2={cell.tipPt.x}
                      y2={cell.tipPt.y}
                      stroke={cell.strokeColor}
                      strokeWidth="1.75"
                      strokeDasharray="4 3"
                      strokeOpacity="0.92"
                    />
                  )}
                  {cell.arrowPolygon && (
                    <polygon
                      points={cell.arrowPolygon}
                      fill={cell.strokeColor}
                      fillOpacity="0.95"
                    />
                  )}
                  <circle
                    cx={cell.x}
                    cy={cell.y}
                    r="8"
                    fill={cell.strokeColor}
                    fillOpacity="0.18"
                    stroke={cell.strokeColor}
                    strokeWidth="1.3"
                  />
                  <circle cx={cell.x} cy={cell.y} r="3" fill={cell.strokeColor} />
                  <g transform={`translate(${badgeX.toFixed(1)}, ${badgeY.toFixed(1)})`}>
                    <rect
                      x="0"
                      y="0"
                      width={badgeWidth}
                      height="19"
                      rx="5"
                      fill="rgba(7, 12, 22, 0.88)"
                      stroke={cell.strokeColor}
                      strokeOpacity="0.65"
                      strokeWidth="1"
                    />
                    <text
                      x={badgeWidth / 2}
                      y="13"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="10"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fontWeight="600"
                    >
                      {cell.badgeText}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        )}

        {/* Seçili İle Ait Canlı Doğrulama İstasyonu İşaretçileri (`verification.stations`) */}
        {projectedVerificationStations.map((st) => (
          <div
            key={`vst-${st.id}`}
            style={{ left: st.x, top: st.y }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md border border-emerald-400/35 bg-obsidian-950/88 px-1.5 py-0.5 font-mono text-[10px] text-emerald-100 shadow-sm tabular"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{st.label}</span>
            {st.tempLabel && <span className="text-emerald-300">{st.tempLabel}</span>}
          </div>
        ))}

        {/* Hazır Şehir İşaretçileri (Üst/alt HUD barlarıyla ve aktif istasyonlarla çakışmaz) */}
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
          const overlapsStation = projectedVerificationStations.some(
            (st) => Math.hypot(st.x - pt.x, st.y - pt.y) < 38
          );
          if (overlapsStation) return null;

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
              className="pointer-events-none absolute z-[12] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span className="atmos-beacon-ring absolute h-8 w-8 rounded-full border border-[var(--atmos-accent)]" />
                <svg
                  viewBox="0 0 44 44"
                  className="h-11 w-11"
                  style={
                    prefersReducedMotion
                      ? undefined
                      : { animation: "atmosIsobarSpin 14s linear infinite" }
                  }
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

      {/* Birleşik Çakışmasız Üst HUD Kuşağı (Dar ekranda kompakt çekmece, geniş ekranda sol-sağ ayrılır) */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:max-w-[58%]">
          <div className="atmos-hud-glass pointer-events-auto sm:pointer-events-none max-w-full rounded-xl px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-ink-secondary tabular">
                <span className="font-semibold text-ink-primary">
                  {overlayMode === "wind"
                    ? "CANLI RÜZGAR AKIŞI"
                    : overlayMode === "radar"
                      ? "DOPPLER RADAR"
                      : "DOPPLER + RÜZGAR"}
                </span>
                {effectiveProvinceBadgeText && (
                  <span className="rounded border border-sky-400/35 bg-sky-400/12 px-1.5 py-0.2 text-[10px] font-medium text-sky-200">
                    {effectiveProvinceBadgeText}
                  </span>
                )}
                {activeWaterBody && (
                  <span className="hidden md:inline-flex items-center gap-1 rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.2 text-[10px] text-cyan-200">
                    <Waves className="h-2.5 w-2.5 text-cyan-300" />
                    <span>
                      {activeWaterBody.labelTr}{" "}
                      {formatTemperature(activeWaterBody.tempC, unit)}
                    </span>
                  </span>
                )}
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
                        ? `${activeClockLabel} (${
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

              {/* < 640px Kompakt "Katman & Lejant" Çekmece Tetikleyicisi */}
              <button
                type="button"
                aria-expanded={mobileHudOpen}
                onClick={() => setMobileHudOpen((v) => !v)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-obsidian-950/85 px-2 py-1 text-[10px] font-medium text-ink-primary hover:bg-white/10 sm:hidden"
              >
                <span>Katman & Lejant</span>
                {mobileHudOpen ? (
                  <ChevronUp className="h-3 w-3 text-signal-sky" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-ink-muted" />
                )}
              </button>
            </div>

            {/* Z-R Scheme 2 & Rüzgar Lejantı: Masaüstünde açık, mobilde çekmece içinde */}
            <div className={mobileHudOpen ? "mt-2 block space-y-1.5" : "hidden sm:block"}>
              {showRadar && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-ink-muted tabular">
                  <span>20 dBZ ({lowLegendRate})</span>
                  <span
                    className="h-1.5 w-20 sm:w-24 shrink-0 rounded-full"
                    style={{ background: RAINVIEWER_LEGEND_GRADIENT }}
                  />
                  <span>50+ dBZ ({highLegendRate})</span>
                </div>
              )}
              {showWind && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-ink-muted tabular">
                  <span>
                    {showRadar && frameTimingInfo.isHistoricalOrFuture
                      ? "Canlı 10m"
                      : "Rüzgar 0"}
                  </span>
                  <span className="h-1.5 w-20 sm:w-24 shrink-0 rounded-full bg-gradient-to-r from-[#93c5fd] via-[#38bdf8] via-[#34d399] via-[#f59e0b] to-[#f87171]" />
                  <span className={windStale && windGrid ? "text-amber-200" : ""}>
                    {windGrid
                      ? `Maks ${formatWindSpeed(windGrid.maxSpeedKmh, unit)}${
                          windStale ? " · Arşiv" : ""
                        }`
                      : windLoading
                        ? "Alan yükleniyor..."
                        : windFallbackCap}
                  </span>
                </div>
              )}

              {/* Mobil Çekmece İçi Katman, 81 İl Sınırı & Taban Seçicileri */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:hidden">
                <div className="inline-flex rounded-lg border border-white/10 bg-obsidian-950/90 p-0.5 text-[11px]">
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

                <div className="inline-flex rounded-lg border border-white/10 bg-obsidian-950/90 p-0.5 text-[11px]">
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

                <button
                  type="button"
                  aria-pressed={showProvinceBorders}
                  onClick={() => setShowProvinceBorders((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    showProvinceBorders
                      ? "border-sky-400/45 bg-sky-400/15 text-sky-200"
                      : "border-white/10 bg-obsidian-950/90 text-ink-muted hover:text-ink-primary"
                  }`}
                >
                  <MapIcon className="h-3 w-3" />
                  <span>81 İl Sınırı</span>
                </button>
              </div>
            </div>
          </div>

          {trBorderPaths?.hoveredProv && (
            <div className="atmos-hud-glass hidden sm:inline-flex self-start items-center gap-1.5 rounded-lg border border-sky-400/35 bg-obsidian-950/90 px-2.5 py-1 font-mono text-[11px] text-sky-100">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>
                {trBorderPaths.hoveredProv.code} · {trBorderPaths.hoveredProv.nameTr}
              </span>
              <span className="text-[10px] text-ink-muted">
                ({zoom <= 6 ? "Tıkla: İl Seç" : "Tıkla: Nokta Ölç"})
              </span>
            </div>
          )}

          {/* Radar Hatası (HUD akışı içinde çakışmasız durur; yalnızca elde kayıtlı kare yoksa gösterilir) */}
          {showRadar && radarError && !radar && (
            <div className="atmos-hud-glass pointer-events-auto max-w-sm rounded-xl border border-signal-rose/40 bg-obsidian-950/90 p-2.5 text-xs text-ink-primary flex items-center justify-between gap-2.5">
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
        </div>

        {/* Üst Sağ: Masaüstü Katman, 81 İl Sınırı & Taban Seçiciler + Yakınlaştır & Mobil Sürükleme Kilidi */}
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 self-end sm:self-auto">
          <div className="hidden sm:flex flex-wrap justify-end gap-1.5">
            {/* 81 İl Resmi Sınır Katmanı Düğmesi (Varsayılan Açık) */}
            <button
              type="button"
              aria-pressed={showProvinceBorders}
              onClick={() => setShowProvinceBorders((v) => !v)}
              title="Resmi 81 İl Sınır Katmanı"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                showProvinceBorders
                  ? "border-sky-400/45 bg-obsidian-950/90 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.16)]"
                  : "border-white/10 bg-obsidian-950/85 text-ink-muted hover:text-ink-primary"
              }`}
            >
              <MapIcon className="h-3 w-3 text-sky-300" />
              <span>81 İl Sınırı</span>
            </button>

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

          <div className="flex flex-row sm:flex-col gap-1.5">
            <button
              type="button"
              aria-pressed={mobileDragLock}
              aria-label="Harita Sürükleme Kilidi"
              title="Harita Sürükleme Kilidi"
              onClick={() => setMobileDragLock((v) => !v)}
              className={`flex sm:hidden h-8 items-center gap-1 rounded-lg border px-2 text-[10px] font-medium transition-colors ${
                mobileDragLock
                  ? "border-sky-400/50 bg-sky-400/20 text-sky-200"
                  : "border-white/10 bg-obsidian-950/85 text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {mobileDragLock ? (
                <Lock className="h-3.5 w-3.5 text-sky-300" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
              <span>Sürükle</span>
            </button>
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
              aria-valuetext={sliderValueText}
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
              <span className="min-w-[68px] text-right text-ink-primary">
                {activeClockLabel}
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
          <span>
            {showProvinceBorders && zoom <= 6
              ? "Tıkla: İl Seç (Z7+ Nokta Ölç) · Esri · RainViewer HD · Open-Meteo"
              : "Tıkla: Koordinat Ölç · Esri · RainViewer HD · Open-Meteo"}
          </span>
        </div>
      </div>
    </div>
  );
}

const LiveRadarMap = memo(LiveRadarMapBase);
export default LiveRadarMap;

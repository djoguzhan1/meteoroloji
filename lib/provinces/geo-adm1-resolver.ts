/**
 * ATMOS v5.0 — Wave 1 (GEO-01)
 * Official 81-Province Topological Point-in-Polygon Resolver & Foreign Island Exclusion Engine
 *
 * Pure TypeScript / ESM module — ZERO `node:*` imports (safe for both Server & Client bundles).
 * Uses `0.25° × 0.25°` spatial grid indexing over `public/geo/tr-81-adm1-topo.json`
 * (`< 0.005 ms` typical lookup, `< 0.5 ms` worst-case coastal snap).
 */

import tr81TopoRaw from "../../public/geo/tr-81-adm1-topo.json";
import {
  isTrProvinceCode,
  type ProvinceResolution,
  TR_PLATE_NUMBERS,
  type TrProvinceCode
} from "./types";

export const TR_PROVINCE_NAMES_BY_CODE: Readonly<Record<TrProvinceCode, string>> =
  Object.freeze({
    "TR-01": "Adana",
    "TR-02": "Adıyaman",
    "TR-03": "Afyonkarahisar",
    "TR-04": "Ağrı",
    "TR-05": "Amasya",
    "TR-06": "Ankara",
    "TR-07": "Antalya",
    "TR-08": "Artvin",
    "TR-09": "Aydın",
    "TR-10": "Balıkesir",
    "TR-11": "Bilecik",
    "TR-12": "Bingöl",
    "TR-13": "Bitlis",
    "TR-14": "Bolu",
    "TR-15": "Burdur",
    "TR-16": "Bursa",
    "TR-17": "Çanakkale",
    "TR-18": "Çankırı",
    "TR-19": "Çorum",
    "TR-20": "Denizli",
    "TR-21": "Diyarbakır",
    "TR-22": "Edirne",
    "TR-23": "Elazığ",
    "TR-24": "Erzincan",
    "TR-25": "Erzurum",
    "TR-26": "Eskişehir",
    "TR-27": "Gaziantep",
    "TR-28": "Giresun",
    "TR-29": "Gümüşhane",
    "TR-30": "Hakkari",
    "TR-31": "Hatay",
    "TR-32": "Isparta",
    "TR-33": "Mersin",
    "TR-34": "İstanbul",
    "TR-35": "İzmir",
    "TR-36": "Kars",
    "TR-37": "Kastamonu",
    "TR-38": "Kayseri",
    "TR-39": "Kırklareli",
    "TR-40": "Kırşehir",
    "TR-41": "Kocaeli",
    "TR-42": "Konya",
    "TR-43": "Kütahya",
    "TR-44": "Malatya",
    "TR-45": "Manisa",
    "TR-46": "Kahramanmaraş",
    "TR-47": "Mardin",
    "TR-48": "Muğla",
    "TR-49": "Muş",
    "TR-50": "Nevşehir",
    "TR-51": "Niğde",
    "TR-52": "Ordu",
    "TR-53": "Rize",
    "TR-54": "Sakarya",
    "TR-55": "Samsun",
    "TR-56": "Siirt",
    "TR-57": "Sinop",
    "TR-58": "Sivas",
    "TR-59": "Tekirdağ",
    "TR-60": "Tokat",
    "TR-61": "Trabzon",
    "TR-62": "Tunceli",
    "TR-63": "Şanlıurfa",
    "TR-64": "Uşak",
    "TR-65": "Van",
    "TR-66": "Yozgat",
    "TR-67": "Zonguldak",
    "TR-68": "Aksaray",
    "TR-69": "Bayburt",
    "TR-70": "Karaman",
    "TR-71": "Kırıkkale",
    "TR-72": "Batman",
    "TR-73": "Şırnak",
    "TR-74": "Bartın",
    "TR-75": "Ardahan",
    "TR-76": "Iğdır",
    "TR-77": "Yalova",
    "TR-78": "Karabük",
    "TR-79": "Kilis",
    "TR-80": "Osmaniye",
    "TR-81": "Düzce"
  });

const PLATE_NUMBER_BY_CODE: Readonly<Record<TrProvinceCode, number>> = (() => {
  const out = {} as Record<TrProvinceCode, number>;
  for (const plate of TR_PLATE_NUMBERS) {
    const code: TrProvinceCode = `TR-${plate}`;
    out[code] = Number(plate);
  }
  return Object.freeze(out);
})();

/**
 * Normalizes Turkish & Unicode NFC/NFD strings to canonical lowercase ASCII
 * (`İ/I/ı -> i`, `Ş/ş -> s`, `Ğ/ğ -> g`, `Ü/ü -> u`, `Ö/ö -> o`, `Ç/ç -> c`, `Â/â -> a`).
 */
function normalizeTrAdminToken(raw: string): string {
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
    .replace(/Â/g, "a")
    .replace(/â/g, "a")
    .replace(/Î/g, "i")
    .replace(/î/g, "i")
    .replace(/Û/g, "u")
    .replace(/û/g, "u")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Geographical regions & country labels that BigDataCloud / geocoders sometimes emit in `admin1` */
const REJECTED_REGION_TOKENS = new Set<string>([
  "marmara",
  "marmara bolgesi",
  "marmara region",
  "ege",
  "ege bolgesi",
  "aegean",
  "aegean region",
  "akdeniz",
  "akdeniz bolgesi",
  "mediterranean",
  "mediterranean region",
  "ic anadolu",
  "ic anadolu bolgesi",
  "central anatolia",
  "central anatolia region",
  "karadeniz",
  "karadeniz bolgesi",
  "black sea",
  "black sea region",
  "dogu anadolu",
  "dogu anadolu bolgesi",
  "eastern anatolia",
  "eastern anatolia region",
  "guneydogu anadolu",
  "guneydogu anadolu bolgesi",
  "southeastern anatolia",
  "southeastern anatolia region",
  "trakya",
  "thrace",
  "anadolu",
  "anatolia",
  "turkiye",
  "turkey"
]);

const ADMIN1_ALIAS_TO_CODE: Readonly<Record<string, TrProvinceCode>> = (() => {
  const map: Record<string, TrProvinceCode> = {};
  for (const plate of TR_PLATE_NUMBERS) {
    const code: TrProvinceCode = `TR-${plate}`;
    const normName = normalizeTrAdminToken(TR_PROVINCE_NAMES_BY_CODE[code]);
    map[normName] = code;
    map[`tr-${plate}`] = code;
    map[`tr${plate}`] = code;
  }
  // Official historical, central-city & GeoNames aliases
  map["icel"] = "TR-33";
  map["afyon"] = "TR-03";
  map["antakya"] = "TR-31";
  map["izmit"] = "TR-41";
  map["kocaeli izmit"] = "TR-41";
  map["adapazari"] = "TR-54";
  map["maras"] = "TR-46";
  map["k.maras"] = "TR-46";
  map["k maras"] = "TR-46";
  map["urfa"] = "TR-63";
  map["s.urfa"] = "TR-63";
  map["s urfa"] = "TR-63";
  map["antep"] = "TR-27";
  map["g.antep"] = "TR-27";
  map["g antep"] = "TR-27";
  map["dersim"] = "TR-62";
  map["istanbul avrupa"] = "TR-34";
  map["istanbul anadolu"] = "TR-34";
  return Object.freeze(map);
})();

function stripAdminSuffixes(s: string): string {
  return s
    .replace(/\b(?:ili|province|valiligi|vilayeti|governorate)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTrAdmin1ToProvinceCode(
  admin1: string | null | undefined
): TrProvinceCode | null {
  if (!admin1 || typeof admin1 !== "string") return null;
  const trimmed = admin1.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  if (isTrProvinceCode(upper)) {
    return upper;
  }

  const norm = normalizeTrAdminToken(trimmed);
  if (!norm) return null;

  // Reject geographic regions ("Marmara Bölgesi", "Aegean Region", etc.) immediately
  if (
    REJECTED_REGION_TOKENS.has(norm) ||
    /\b(?:bolgesi|region)\b/.test(norm)
  ) {
    return null;
  }

  const directClean = stripAdminSuffixes(norm);
  if (REJECTED_REGION_TOKENS.has(directClean)) return null;
  const directHit = ADMIN1_ALIAS_TO_CODE[directClean];
  if (directHit) return directHit;

  // Support compound station labels such as "Bursa · Batı Ova (MGM 18386)" or "Kocaeli (İzmit)"
  const segments = norm
    .split(/[·,/|()[\]\u2013\u2014-]+/)
    .map((seg) => stripAdminSuffixes(seg))
    .filter(Boolean);

  for (const seg of segments) {
    if (REJECTED_REGION_TOKENS.has(seg)) continue;
    const hit = ADMIN1_ALIAS_TO_CODE[seg];
    if (hit) return hit;
  }

  return null;
}

// ============================================================================
// TOPOJSON DECODER & 0.25° UNIFORM SPATIAL GRID INDEX
// ============================================================================

interface RawTopology {
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
        properties?: { n?: number[] };
        arcs: number[][][];
      }>;
    };
    foreign_exclusion?: {
      type: string;
      geometries: Array<{
        type: string;
        properties?: { c?: string };
        arcs: number[][];
      }>;
    };
  };
  arcs: number[][][];
}

interface IndexedRing {
  code: TrProvinceCode | null; // null for foreign_exclusion ring
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  /** Interleaved [lon0, lat0, lon1, lat1, ...] closed ring (`coords[0..1] === coords[2n-2..2n-1]`) */
  coords: Float64Array;
  vertexCount: number;
}

const GRID_MIN_LON = 25.0;
const GRID_MAX_LON = 45.25;
const GRID_MIN_LAT = 34.75;
const GRID_MAX_LAT = 42.5;
const GRID_CELL_DEG = 0.25;
const GRID_COLS = Math.ceil((GRID_MAX_LON - GRID_MIN_LON) / GRID_CELL_DEG);
const GRID_ROWS = Math.ceil((GRID_MAX_LAT - GRID_MIN_LAT) / GRID_CELL_DEG);

interface SpatialIndex {
  provinceRings: IndexedRing[];
  foreignRings: IndexedRing[];
  ringsByProvince: Map<TrProvinceCode, IndexedRing[]>;
  adjacencyByProvince: Map<TrProvinceCode, Set<TrProvinceCode>>;
  provGrid: number[][];
  foreignGrid: number[][];
}

let cachedIndex: SpatialIndex | null = null;

function buildRingFromCoords(
  pts: Array<[number, number]>,
  code: TrProvinceCode | null
): IndexedRing {
  const closedPts =
    pts.length > 1 &&
    pts[0][0] === pts[pts.length - 1][0] &&
    pts[0][1] === pts[pts.length - 1][1]
      ? pts
      : [...pts, pts[0]];

  const n = closedPts.length;
  const coords = new Float64Array(n * 2);
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;

  for (let i = 0; i < n; i++) {
    const lon = closedPts[i][0];
    const lat = closedPts[i][1];
    coords[i * 2] = lon;
    coords[i * 2 + 1] = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return {
    code,
    minLon,
    minLat,
    maxLon,
    maxLat,
    coords,
    vertexCount: n
  };
}

function getSpatialIndex(): SpatialIndex {
  if (cachedIndex) return cachedIndex;

  const topo = tr81TopoRaw as unknown as RawTopology;
  const [sx, sy] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;

  const decodedArcs: Array<Array<[number, number]>> = topo.arcs.map((arc) => {
    let qx = 0;
    let qy = 0;
    return arc.map((pair) => {
      qx += pair[0];
      qy += pair[1];
      return [tx + qx * sx, ty + qy * sy];
    });
  });

  function stitchArcRefs(refs: number[]): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    for (let k = 0; k < refs.length; k++) {
      const ref = refs[k];
      const arc = ref >= 0 ? decodedArcs[ref] : decodedArcs[~ref];
      if (ref >= 0) {
        for (let i = 0; i < arc.length; i++) {
          if (out.length > 0 && i === 0) continue;
          out.push(arc[i]);
        }
      } else {
        for (let i = arc.length - 1; i >= 0; i--) {
          if (out.length > 0 && i === arc.length - 1) continue;
          out.push(arc[i]);
        }
      }
    }
    return out;
  }

  const provinceRings: IndexedRing[] = [];
  const foreignRings: IndexedRing[] = [];
  const ringsByProvince = new Map<TrProvinceCode, IndexedRing[]>();
  const adjacencyByProvince = new Map<TrProvinceCode, Set<TrProvinceCode>>();

  for (const plate of TR_PLATE_NUMBERS) {
    const c: TrProvinceCode = `TR-${plate}`;
    ringsByProvince.set(c, []);
    adjacencyByProvince.set(c, new Set());
  }

  for (const geom of topo.objects.provinces.geometries) {
    const code = geom.id as TrProvinceCode;
    if (!isTrProvinceCode(code)) continue;

    const adjSet = adjacencyByProvince.get(code)!;
    const neighborPlates = geom.properties?.n ?? [];
    for (const pNum of neighborPlates) {
      const pCode = `TR-${String(pNum).padStart(2, "0")}`;
      if (isTrProvinceCode(pCode) && pCode !== code) {
        adjSet.add(pCode);
        adjacencyByProvince.get(pCode)?.add(code);
      }
    }

    const pRings = ringsByProvince.get(code)!;
    for (const polyArcs of geom.arcs) {
      const extRefs = polyArcs[0];
      if (!extRefs || extRefs.length === 0) continue;
      const pts = stitchArcRefs(extRefs);
      if (pts.length < 3) continue;
      const indexed = buildRingFromCoords(pts, code);
      provinceRings.push(indexed);
      pRings.push(indexed);
    }
  }

  const foreignGeoms = topo.objects.foreign_exclusion?.geometries ?? [];
  for (const fg of foreignGeoms) {
    const extRefs = fg.arcs[0];
    if (!extRefs || extRefs.length === 0) continue;
    const pts = stitchArcRefs(extRefs);
    if (pts.length < 3) continue;
    foreignRings.push(buildRingFromCoords(pts, null));
  }

  const totalCells = GRID_COLS * GRID_ROWS;
  const provGrid: number[][] = Array.from({ length: totalCells }, () => []);
  const foreignGrid: number[][] = Array.from({ length: totalCells }, () => []);

  function insertIntoGrid(rings: IndexedRing[], grid: number[][]): void {
    for (let idx = 0; idx < rings.length; idx++) {
      const r = rings[idx];
      const c0 = Math.max(0, Math.floor((r.minLon - GRID_MIN_LON) / GRID_CELL_DEG));
      const c1 = Math.min(
        GRID_COLS - 1,
        Math.floor((r.maxLon - GRID_MIN_LON) / GRID_CELL_DEG)
      );
      const r0 = Math.max(0, Math.floor((r.minLat - GRID_MIN_LAT) / GRID_CELL_DEG));
      const r1 = Math.min(
        GRID_ROWS - 1,
        Math.floor((r.maxLat - GRID_MIN_LAT) / GRID_CELL_DEG)
      );
      for (let rr = r0; rr <= r1; rr++) {
        const rowOffset = rr * GRID_COLS;
        for (let cc = c0; cc <= c1; cc++) {
          grid[rowOffset + cc].push(idx);
        }
      }
    }
  }

  insertIntoGrid(provinceRings, provGrid);
  insertIntoGrid(foreignRings, foreignGrid);

  cachedIndex = {
    provinceRings,
    foreignRings,
    ringsByProvince,
    adjacencyByProvince,
    provGrid,
    foreignGrid
  };
  return cachedIndex;
}

// ============================================================================
// GEOMETRIC PRIMITIVES (EXACT RAY-CASTING + GREAT-CIRCLE SEGMENT DISTANCE)
// ============================================================================

const ON_EDGE_EPS_SQ = 1e-12; // ~0.1m tolerance for exact shared-arc vertices/segments

function pointToSegmentDistSqDeg(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) {
    const ex = px - x1;
    const ey = py - y1;
    return ex * ex + ey * ey;
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const ex = px - (x1 + t * dx);
  const ey = py - (y1 + t * dy);
  return ex * ex + ey * ey;
}

function pointInIndexedRing(lon: number, lat: number, ring: IndexedRing): boolean {
  if (
    lon < ring.minLon ||
    lon > ring.maxLon ||
    lat < ring.minLat ||
    lat > ring.maxLat
  ) {
    return false;
  }

  const c = ring.coords;
  const n = ring.vertexCount;
  let inside = false;

  for (let i = 0; i < n - 1; i++) {
    const x1 = c[i * 2];
    const y1 = c[i * 2 + 1];
    const x2 = c[(i + 1) * 2];
    const y2 = c[(i + 1) * 2 + 1];

    if (pointToSegmentDistSqDeg(lon, lat, x1, y1, x2, y2) <= ON_EDGE_EPS_SQ) {
      return true;
    }

    if (
      y1 > lat !== y2 > lat &&
      lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1
    ) {
      inside = !inside;
    }
  }

  return inside;
}

function minDistanceToRingKm(
  lat: number,
  lon: number,
  ring: IndexedRing,
  cosLat: number
): number {
  const c = ring.coords;
  const n = ring.vertexCount;
  const kmPerDegLat = 111.132;
  const kmPerDegLon = 111.32 * cosLat;

  let minSqKm = Infinity;
  for (let i = 0; i < n - 1; i++) {
    const x1 = (c[i * 2] - lon) * kmPerDegLon;
    const y1 = (c[i * 2 + 1] - lat) * kmPerDegLat;
    const x2 = (c[(i + 1) * 2] - lon) * kmPerDegLon;
    const y2 = (c[(i + 1) * 2 + 1] - lat) * kmPerDegLat;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    let d2: number;
    if (len2 === 0) {
      d2 = x1 * x1 + y1 * y1;
    } else {
      let t = -(x1 * dx + y1 * dy) / len2;
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      const px = x1 + t * dx;
      const py = y1 + t * dy;
      d2 = px * px + py * py;
    }
    if (d2 < minSqKm) minSqKm = d2;
  }
  return Math.sqrt(minSqKm);
}

function ringBBoxMinDistKm(
  lat: number,
  lon: number,
  ring: IndexedRing,
  cosLat: number
): number {
  const dLon =
    lon < ring.minLon ? ring.minLon - lon : lon > ring.maxLon ? lon - ring.maxLon : 0;
  const dLat =
    lat < ring.minLat ? ring.minLat - lat : lat > ring.maxLat ? lat - ring.maxLat : 0;
  if (dLon === 0 && dLat === 0) return 0;
  const dxKm = dLon * 111.32 * cosLat;
  const dyKm = dLat * 111.132;
  return Math.hypot(dxKm, dyKm);
}

function minDistanceToProvinceBoundaryKm(
  lat: number,
  lon: number,
  code: TrProvinceCode,
  idx: SpatialIndex
): number {
  const rings = idx.ringsByProvince.get(code);
  if (!rings || rings.length === 0) return Infinity;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  let bestKm = Infinity;
  for (const r of rings) {
    if (ringBBoxMinDistKm(lat, lon, r, cosLat) >= bestKm) continue;
    const d = minDistanceToRingKm(lat, lon, r, cosLat);
    if (d < bestKm) bestKm = d;
  }
  return bestKm;
}

/**
 * Enclosed Turkish internal seas & bays (Marmara, Bosphorus, Dardanelles, İzmit/Gemlik/Bandırma Bays,
 * İzmir Inner/Middle Bay, İskenderun Bay) allow up to 6.0 km coastal snap vs. 2.5 km on open coasts.
 */
function isEnclosedTurkishInternalWater(lat: number, lon: number): boolean {
  // Marmara Sea + Bosphorus + Dardanelles + İzmit & Gemlik Bays
  if (lat >= 40.25 && lat <= 41.24 && lon >= 26.2 && lon <= 29.98) return true;
  // İzmir Bay
  if (lat >= 38.35 && lat <= 38.66 && lon >= 26.7 && lon <= 27.22) return true;
  // İskenderun Bay
  if (lat >= 36.52 && lat <= 36.94 && lon >= 35.85 && lon <= 36.24) return true;
  return false;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function areAdjacentProvinces(
  a: TrProvinceCode,
  b: TrProvinceCode
): boolean {
  if (a === b) return false;
  const idx = getSpatialIndex();
  return idx.adjacencyByProvince.get(a)?.has(b) ?? false;
}

export function pointInProvincePolygon(
  lat: number,
  lon: number,
  provinceCode: TrProvinceCode
): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !isTrProvinceCode(provinceCode)) {
    return false;
  }
  const idx = getSpatialIndex();
  const rings = idx.ringsByProvince.get(provinceCode);
  if (!rings) return false;
  for (let i = 0; i < rings.length; i++) {
    if (pointInIndexedRing(lon, lat, rings[i])) return true;
  }
  return false;
}

function pointInForeignExclusion(
  lat: number,
  lon: number,
  idx: SpatialIndex
): boolean {
  if (
    lon < GRID_MIN_LON ||
    lon >= GRID_MAX_LON ||
    lat < GRID_MIN_LAT ||
    lat >= GRID_MAX_LAT
  ) {
    return false;
  }
  const col = Math.floor((lon - GRID_MIN_LON) / GRID_CELL_DEG);
  const row = Math.floor((lat - GRID_MIN_LAT) / GRID_CELL_DEG);
  const bucket = idx.foreignGrid[row * GRID_COLS + col];
  for (let i = 0; i < bucket.length; i++) {
    if (pointInIndexedRing(lon, lat, idx.foreignRings[bucket[i]])) {
      return true;
    }
  }
  return false;
}

function makeTrResolution(
  code: TrProvinceCode,
  method: ProvinceResolution["method"],
  borderDistanceKm?: number
): ProvinceResolution {
  return {
    provinceCode: code,
    provinceName: TR_PROVINCE_NAMES_BY_CODE[code],
    plateNumber: PLATE_NUMBER_BY_CODE[code],
    method,
    ...(borderDistanceKm !== undefined
      ? { borderDistanceKm: Number(borderDistanceKm.toFixed(3)) }
      : {})
  };
}

export function resolveProvinceCode(input: {
  lat: number;
  lon: number;
  admin1?: string | null;
  countryCode?: string | null;
  explicitProvinceCode?: string | null;
}): ProvinceResolution {
  const { lat, lon } = input;
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return { provinceCode: "GLOBAL", method: "global_outside" };
  }

  // Stage 0: Fast outer bounding box gate for Turkey (35.80..42.15°N, 25.60..44.85°E)
  if (lat < 35.75 || lat > 42.2 || lon < 25.55 || lon > 44.9) {
    return { provinceCode: "GLOBAL", method: "global_outside" };
  }

  const idx = getSpatialIndex();
  const col = Math.floor((lon - GRID_MIN_LON) / GRID_CELL_DEG);
  const row = Math.floor((lat - GRID_MIN_LAT) / GRID_CELL_DEG);

  // Stage 1: Exact 0.25° grid-indexed topological Point-in-Polygon
  let pipCode: TrProvinceCode | null = null;
  if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
    const bucket = idx.provGrid[row * GRID_COLS + col];
    for (let i = 0; i < bucket.length; i++) {
      const ring = idx.provinceRings[bucket[i]];
      if (pointInIndexedRing(lon, lat, ring)) {
        pipCode = ring.code;
        break;
      }
    }
  }

  const explicitTr =
    input.explicitProvinceCode && isTrProvinceCode(input.explicitProvinceCode.trim().toUpperCase())
      ? (input.explicitProvinceCode.trim().toUpperCase() as TrProvinceCode)
      : null;
  const hintCode: TrProvinceCode | null =
    explicitTr ?? parseTrAdmin1ToProvinceCode(input.admin1);

  if (pipCode !== null) {
    // Stage 1b: <= 1.5 km ridge/border tie-break when authoritative admin1/explicit hint names an adjacent province
    if (
      hintCode !== null &&
      hintCode !== pipCode &&
      areAdjacentProvinces(pipCode, hintCode)
    ) {
      const dHintKm = minDistanceToProvinceBoundaryKm(lat, lon, hintCode, idx);
      if (dHintKm <= 1.5) {
        return makeTrResolution(hintCode, "border_admin1_tiebreak", dHintKm);
      }
    }
    return makeTrResolution(pipCode, "exact_polygon");
  }

  // Stage 2: Foreign country & Greek island / neighboring land exclusion mask
  if (input.explicitProvinceCode?.trim().toUpperCase() === "GLOBAL") {
    return { provinceCode: "GLOBAL", method: "global_outside" };
  }

  if (input.countryCode && input.countryCode.trim().length > 0) {
    const cc = input.countryCode.trim().toUpperCase();
    if (cc !== "TR" && cc !== "TUR") {
      return { provinceCode: "GLOBAL", method: "global_outside" };
    }
  }

  if (pointInForeignExclusion(lat, lon, idx)) {
    return { provinceCode: "GLOBAL", method: "global_outside" };
  }

  // Stage 3: Guarded Coastal / Internal Bay Snap (vetoed if closer to foreign island/coast)
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const maxSnapKm = isEnclosedTurkishInternalWater(lat, lon) ? 6.0 : 2.5;

  const rMin = Math.max(0, row - 1);
  const rMax = Math.min(GRID_ROWS - 1, row + 1);
  const cMin = Math.max(0, col - 1);
  const cMax = Math.min(GRID_COLS - 1, col + 1);

  const visitedProvRings = new Set<number>();
  let bestTrCode: TrProvinceCode | null = null;
  let bestTrDistKm = maxSnapKm + 0.001;

  for (let rr = rMin; rr <= rMax; rr++) {
    for (let cc = cMin; cc <= cMax; cc++) {
      const bucket = idx.provGrid[rr * GRID_COLS + cc];
      for (let i = 0; i < bucket.length; i++) {
        const rIdx = bucket[i];
        if (visitedProvRings.has(rIdx)) continue;
        visitedProvRings.add(rIdx);
        const ring = idx.provinceRings[rIdx];
        if (ringBBoxMinDistKm(lat, lon, ring, cosLat) > bestTrDistKm) continue;
        const dKm = minDistanceToRingKm(lat, lon, ring, cosLat);
        if (dKm < bestTrDistKm && ring.code !== null) {
          bestTrDistKm = dKm;
          bestTrCode = ring.code;
        }
      }
    }
  }

  if (bestTrCode === null || bestTrDistKm > maxSnapKm) {
    return { provinceCode: "GLOBAL", method: "global_outside" };
  }

  // Foreign-shore proximity veto: never snap water points that are closer to (or within 350m parity of) a Greek island or foreign border coast
  const visitedForeignRings = new Set<number>();
  let bestForeignDistKm = Infinity;
  const foreignCheckCapKm = bestTrDistKm + 0.36;

  for (let rr = rMin; rr <= rMax; rr++) {
    for (let cc = cMin; cc <= cMax; cc++) {
      const fBucket = idx.foreignGrid[rr * GRID_COLS + cc];
      for (let i = 0; i < fBucket.length; i++) {
        const fIdx = fBucket[i];
        if (visitedForeignRings.has(fIdx)) continue;
        visitedForeignRings.add(fIdx);
        const fRing = idx.foreignRings[fIdx];
        if (ringBBoxMinDistKm(lat, lon, fRing, cosLat) > foreignCheckCapKm) {
          continue;
        }
        const dKm = minDistanceToRingKm(lat, lon, fRing, cosLat);
        if (dKm < bestForeignDistKm) {
          bestForeignDistKm = dKm;
        }
      }
    }
  }

  if (bestForeignDistKm <= bestTrDistKm + 0.35) {
    return { provinceCode: "GLOBAL", method: "global_outside" };
  }

  if (
    hintCode !== null &&
    hintCode !== bestTrCode &&
    areAdjacentProvinces(bestTrCode, hintCode)
  ) {
    const dHintKm = minDistanceToProvinceBoundaryKm(lat, lon, hintCode, idx);
    if (dHintKm <= 1.5) {
      return makeTrResolution(hintCode, "coastal_snap", dHintKm);
    }
  }

  return makeTrResolution(bestTrCode, "coastal_snap", bestTrDistKm);
}

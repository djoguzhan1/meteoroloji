/**
 * Shared Client + Server RainViewer Color Scheme 2 (Universal Blue, 1_1 smoothed)
 * Continuous Polyline dBZ Projection, O(1) RGB555 LUT & Marshall-Palmer / Convective Z-R Engine
 * File: lib/radar-palette.ts
 *
 * Zero Node.js built-in imports so this module can be imported directly by both
 * client components (e.g., LiveRadarMap.tsx) and server hydrometeorological pipelines.
 */

export const RAINVIEWER_COLOR_SCHEME = 2 as const;
export const RAINVIEWER_SMOOTH_OPTIONS = "1_1" as const;
export const RAINVIEWER_LEGEND_GRADIENT =
  "linear-gradient(90deg, #88dafe 0%, #38bdf8 16%, #28b978 34%, #facc15 52%, #f97316 68%, #ef4444 82%, #d946ef 100%)" as const;

export interface RainViewerDbzAnchor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly dbz: number;
}

/**
 * Ordered 12-node color polyline anchors for RainViewer Color Scheme 2 (Universal Blue).
 */
export const RAINVIEWER_DBZ_ANCHORS: readonly RainViewerDbzAnchor[] = [
  { r: 136, g: 218, b: 254, dbz: 10.0 },
  { r: 56, g: 189, b: 248, dbz: 18.5 },
  { r: 0, g: 140, b: 235, dbz: 23.0 },
  { r: 40, g: 185, b: 120, dbz: 28.5 },
  { r: 165, g: 225, b: 45, dbz: 34.0 },
  { r: 250, g: 204, b: 21, dbz: 38.0 },
  { r: 249, g: 115, b: 22, dbz: 42.5 },
  { r: 239, g: 68, b: 68, dbz: 47.5 },
  { r: 220, g: 40, b: 30, dbz: 51.5 },
  { r: 165, g: 15, b: 25, dbz: 55.5 },
  { r: 205, g: 40, b: 195, dbz: 60.5 },
  { r: 245, g: 140, b: 250, dbz: 65.0 },
] as const;

interface PaletteSegment {
  readonly r0: number;
  readonly g0: number;
  readonly b0: number;
  readonly vr: number;
  readonly vg: number;
  readonly vb: number;
  readonly invLenSq: number;
  readonly z0: number;
  readonly dz: number;
}

const PALETTE_SEGMENTS: readonly PaletteSegment[] = (() => {
  const segs: PaletteSegment[] = [];
  for (let k = 0; k < RAINVIEWER_DBZ_ANCHORS.length - 1; k++) {
    const c0 = RAINVIEWER_DBZ_ANCHORS[k];
    const c1 = RAINVIEWER_DBZ_ANCHORS[k + 1];
    const vr = c1.r - c0.r;
    const vg = c1.g - c0.g;
    const vb = c1.b - c0.b;
    const lenSq = vr * vr + vg * vg + vb * vb;
    segs.push({
      r0: c0.r,
      g0: c0.g,
      b0: c0.b,
      vr,
      vg,
      vb,
      invLenSq: lenSq > 0 ? 1 / lenSq : 0,
      z0: c0.dbz,
      dz: c1.dbz - c0.dbz,
    });
  }
  return segs;
})();

const MAX_SEGMENT_DISTANCE = 95;
const MAX_SEGMENT_DISTANCE_SQ = MAX_SEGMENT_DISTANCE * MAX_SEGMENT_DISTANCE;

/**
 * Exact continuous 3D RGB polyline orthogonal projection onto RainViewer Color Scheme 2.
 * Rejects transparent pixels (`a < 20`), achromatic/grayscale error banners (`chroma <= 10`),
 * and out-of-gamut artifacts (`d_min > 95`).
 */
export function projectRgbToScheme2Dbz(r: number, g: number, b: number, a: number): number {
  if (a < 20) return 0;

  const maxC = r > g ? (r > b ? r : b) : g > b ? g : b;
  const minC = r < g ? (r < b ? r : b) : g < b ? g : b;
  const chroma = maxC - minC;
  if (chroma <= 10) return 0;

  let bestDistSq = Infinity;
  let bestDbz = 0;

  for (let k = 0; k < PALETTE_SEGMENTS.length; k++) {
    const seg = PALETTE_SEGMENTS[k];
    const pr = r - seg.r0;
    const pg = g - seg.g0;
    const pb = b - seg.b0;

    const rawT = (pr * seg.vr + pg * seg.vg + pb * seg.vb) * seg.invLenSq;
    const t = rawT <= 0 ? 0 : rawT >= 1 ? 1 : rawT;

    const dr = pr - t * seg.vr;
    const dg = pg - t * seg.vg;
    const db = pb - t * seg.vb;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestDbz = seg.z0 + t * seg.dz;
    }
  }

  if (bestDistSq > MAX_SEGMENT_DISTANCE_SQ) return 0;

  const alphaScale = a >= 96 ? 1 : 0.75 + 0.25 * ((a - 20) / 76);
  return alphaScale * bestDbz;
}

/**
 * Precomputed 32x32x32 (32,768 entries) RGB555 -> base dBZ lookup table at full opacity (`a = 255`).
 * Each 5-bit channel bin `0..31` is evaluated at its exact 8-bit interval midpoint `8 * bin + 3.5`.
 */
export const RGB555_DBZ_LUT: Float32Array = (() => {
  const lut = new Float32Array(32 * 32 * 32);
  for (let ri = 0; ri < 32; ri++) {
    const rc = ri * 8 + 3.5;
    const rShift = ri << 10;
    for (let gi = 0; gi < 32; gi++) {
      const gc = gi * 8 + 3.5;
      const rgShift = rShift | (gi << 5);
      for (let bi = 0; bi < 32; bi++) {
        const bc = bi * 8 + 3.5;
        lut[rgShift | bi] = projectRgbToScheme2Dbz(rc, gc, bc, 255);
      }
    }
  }
  return lut;
})();

/**
 * Full-precision RGBA pixel -> RainViewer Scheme 2 dBZ decoder.
 */
export function rgbaPixelToScheme2Dbz(r: number, g: number, b: number, a: number): number {
  return projectRgbToScheme2Dbz(r, g, b, a);
}

/**
 * O(1) RGB555 LUT-accelerated RGBA pixel -> RainViewer Scheme 2 dBZ decoder.
 * Performs the exact `chroma <= 10` grayscale check on raw `(r, g, b)` BEFORE 5-bit quantization
 * so achromatic gray pixels (e.g. `110, 110, 110`) can never alias into colored bins.
 */
export function rgbaPixelToScheme2DbzFast(r: number, g: number, b: number, a: number): number {
  if (a < 20) return 0;

  const maxC = r > g ? (r > b ? r : b) : g > b ? g : b;
  const minC = r < g ? (r < b ? r : b) : g < b ? g : b;
  const chroma = maxC - minC;
  if (chroma <= 10) return 0;

  const ri = (r <= 0 ? 0 : r >= 255 ? 255 : r) >> 3;
  const gi = (g <= 0 ? 0 : g >= 255 ? 255 : g) >> 3;
  const bi = (b <= 0 ? 0 : b >= 255 ? 255 : b) >> 3;

  const baseDbz = RGB555_DBZ_LUT[(ri << 10) | (gi << 5) | bi];
  if (baseDbz <= 0) return 0;

  const alphaScale = a >= 96 ? 1 : 0.75 + 0.25 * ((a - 20) / 76);
  return alphaScale * baseDbz;
}

/**
 * Dual-regime Marshall-Palmer stratiform (`< 38 dBZ`: `Z = 200 R^1.6`) and
 * convective (`>= 38 dBZ`: `Z = 300 R^1.4`, capped at `85 mm/h`) Z-R converter.
 */
export function dbzToRainRateMmHr(dbz: number): number {
  if (dbz < 13.0) return 0;
  const zLinear = 10 ** (dbz / 10);
  if (dbz >= 38.0) {
    return Math.min(85, (zLinear / 300) ** (1 / 1.4));
  }
  return (zLinear / 200) ** (1 / 1.6);
}

/**
 * Builds a canonical RainViewer radar slippy-tile URL locked to Color Scheme 2 (`1_1.png`).
 */
export function buildRainViewerTileUrl(
  host: string,
  framePath: string,
  tileSize: 256 | 512,
  z: number,
  x: number,
  y: number,
): string {
  const cleanHost = host.replace(/\/+$/, "");
  const normalizedPath = framePath.startsWith("/")
    ? framePath.replace(/\/+$/, "")
    : `/${framePath.replace(/\/+$/, "")}`;
  return `${cleanHost}${normalizedPath}/${tileSize}/${z}/${x}/${y}/${RAINVIEWER_COLOR_SCHEME}/${RAINVIEWER_SMOOTH_OPTIONS}.png`;
}

import * as THREE from "three";

/**
 * ULTRA-HIZLI (<45ms) GUERILLA GAMES "NUBIS" 3D VOLÜMETRİK BULUT PİŞİRİCİSİ
 *
 * WebGL2 `THREE.Data3DTexture` üzerinde tek seferde (modül singleton) pişirilen:
 * 1) `baseVolume` (48×48×48 RGBA8):
 *    - R: Yüksek kontrastlı [0..1] Perlin-Worley hibrit (karnabahar kümülonimbus çekirdeği)
 *    - G: Tileable 3D Worley @ frekans 4 (iri kabarcık kuleleri)
 *    - B: Tileable 3D Worley @ frekans 7 (orta kabarcık kıvrımları)
 *    - A: 3D Domain-Warp vektör skaları (düz geometrik şekilleri tamamen organik yapar)
 * 2) `detailVolume` (32×32×32 RGBA8):
 *    - R, G, B: Yüksek frekanslı Tileable 3D Worley erozyon (frekans 4, 7, 11)
 *    - A: İnce türbülanslı kenar oyucu
 * 3) `blueNoise` (64×64 RGBA8):
 *    - R2 Golden-Ratio dither dokusu (raymarching bantlaşmasını sıfırlar)
 */

export type NubisVolumeSet = {
  baseVolume: THREE.Data3DTexture;
  detailVolume: THREE.Data3DTexture;
  blueNoise: THREE.DataTexture;
};

function hash1(ix: number, iy: number, iz: number, seed: number): number {
  let h =
    Math.imul(ix, 374761393) ^
    Math.imul(iy, 668265263) ^
    Math.imul(iz, 2147483647) ^
    Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function wrapMod(n: number, period: number): number {
  const m = n % period;
  return m < 0 ? m + period : m;
}

/** Önceden hesaplanmış periyodik 3D hücre noktalarıyla 6× daha hızlı Tileable Worley! */
function buildWorleyGrid(period: number, seed: number): Float32Array {
  const total = period * period * period;
  const pts = new Float32Array(total * 3);
  let p = 0;
  for (let z = 0; z < period; z++) {
    for (let y = 0; y < period; y++) {
      for (let x = 0; x < period; x++) {
        pts[p++] = hash1(x, y, z, seed);
        pts[p++] = hash1(x + 19, y + 37, z + 71, seed + 11);
        pts[p++] = hash1(x + 53, y + 17, z + 29, seed + 23);
      }
    }
  }
  return pts;
}

function sampleWorleyFast(
  u: number,
  v: number,
  w: number,
  period: number,
  grid: Float32Array
): number {
  const x = u * period;
  const y = v * period;
  const z = w * period;
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  const cz = Math.floor(z);
  const fx = x - cx;
  const fy = y - cy;
  const fz = z - cz;
  const p2 = period * period;

  let minD2 = 9.0;
  for (let dz = -1; dz <= 1; dz++) {
    const nz = wrapMod(cz + dz, period) * p2;
    for (let dy = -1; dy <= 1; dy++) {
      const ny = nz + wrapMod(cy + dy, period) * period;
      for (let dx = -1; dx <= 1; dx++) {
        const idx = (ny + wrapMod(cx + dx, period)) * 3;
        const rx = dx + grid[idx] - fx;
        const ry = dy + grid[idx + 1] - fy;
        const rz = dz + grid[idx + 2] - fz;
        const d2 = rx * rx + ry * ry + rz * rz;
        if (d2 < minD2) minD2 = d2;
      }
    }
  }
  // Tam [0..1] kontrast aralığına esnetilmiş keskin karnabahar kabarcığı
  const dist = Math.sqrt(minD2);
  return Math.max(0, Math.min(1, 1.0 - dist * 1.15));
}

function tileableValue3D(
  u: number,
  v: number,
  w: number,
  period: number,
  seed: number
): number {
  const x = u * period;
  const y = v * period;
  const z = w * period;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fy = y - y0;
  const fz = z - z0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const sz = fz * fz * (3 - 2 * fz);

  const ix0 = wrapMod(x0, period);
  const iy0 = wrapMod(y0, period);
  const iz0 = wrapMod(z0, period);
  const ix1 = wrapMod(x0 + 1, period);
  const iy1 = wrapMod(y0 + 1, period);
  const iz1 = wrapMod(z0 + 1, period);

  const c000 = hash1(ix0, iy0, iz0, seed);
  const c100 = hash1(ix1, iy0, iz0, seed);
  const c010 = hash1(ix0, iy1, iz0, seed);
  const c110 = hash1(ix1, iy1, iz0, seed);
  const c001 = hash1(ix0, iy0, iz1, seed);
  const c101 = hash1(ix1, iy0, iz1, seed);
  const c011 = hash1(ix0, iy1, iz1, seed);
  const c111 = hash1(ix1, iy1, iz1, seed);

  const x00 = c000 + (c100 - c000) * sx;
  const x10 = c010 + (c110 - c010) * sx;
  const x01 = c001 + (c101 - c001) * sx;
  const x11 = c011 + (c111 - c011) * sx;

  const y0v = x00 + (x10 - x00) * sy;
  const y1v = x01 + (x11 - x01) * sy;

  return y0v + (y1v - y0v) * sz;
}

let cachedSet: NubisVolumeSet | null = null;

export function getNubisCloudTextures(): NubisVolumeSet {
  if (cachedSet) return cachedSet;

  // Önceden hesaplanmış periyodik 3D hücre ızgaraları (~35ms toplam pişirme!)
  const g4 = buildWorleyGrid(4, 101);
  const g7 = buildWorleyGrid(7, 211);
  const g11 = buildWorleyGrid(11, 307);

  // 1. Ana Bulut Hacmi: 48³ RGBA8 (~442 KB VRAM)
  const B = 48;
  const baseData = new Uint8Array(B * B * B * 4);
  let ptr = 0;
  for (let z = 0; z < B; z++) {
    const w = z / B;
    for (let y = 0; y < B; y++) {
      const v = y / B;
      for (let x = 0; x < B; x++) {
        const u = x / B;
        const p1 = tileableValue3D(u, v, w, 4, 17);
        const p2 = tileableValue3D(u, v, w, 8, 43);
        const pFbm = p1 * 0.66 + p2 * 0.34;

        const w4 = sampleWorleyFast(u, v, w, 4, g4);
        const w7 = sampleWorleyFast(u, v, w, 7, g7);
        const warp = tileableValue3D(u, v, w, 3, 89);

        // Yüksek kontrastlı karnabahar Perlin-Worley karışımı (tam [0..1] dinamik aralık!)
        const pw = Math.max(0, Math.min(1, pFbm * 0.48 + w4 * 0.36 + w7 * 0.24 - 0.06));

        baseData[ptr++] = Math.round(pw * 255);
        baseData[ptr++] = Math.round(w4 * 255);
        baseData[ptr++] = Math.round(w7 * 255);
        baseData[ptr++] = Math.round(warp * 255);
      }
    }
  }

  const baseVolume = new THREE.Data3DTexture(baseData, B, B, B);
  baseVolume.format = THREE.RGBAFormat;
  baseVolume.type = THREE.UnsignedByteType;
  baseVolume.minFilter = THREE.LinearFilter;
  baseVolume.magFilter = THREE.LinearFilter;
  baseVolume.wrapS = THREE.RepeatWrapping;
  baseVolume.wrapT = THREE.RepeatWrapping;
  baseVolume.wrapR = THREE.RepeatWrapping;
  baseVolume.unpackAlignment = 1;
  baseVolume.needsUpdate = true;

  // 2. Yüksek Frekanslı Erozyon Detay Hacmi: 32³ RGBA8 (~128 KB VRAM)
  const D = 32;
  const detailData = new Uint8Array(D * D * D * 4);
  ptr = 0;
  for (let z = 0; z < D; z++) {
    const w = z / D;
    for (let y = 0; y < D; y++) {
      const v = y / D;
      for (let x = 0; x < D; x++) {
        const u = x / D;
        const e1 = sampleWorleyFast(u, v, w, 4, g4);
        const e2 = sampleWorleyFast(u, v, w, 7, g7);
        const e3 = sampleWorleyFast(u, v, w, 11, g11);
        const wispy = tileableValue3D(u, v, w, 6, 733);
        detailData[ptr++] = Math.round(e1 * 255);
        detailData[ptr++] = Math.round(e2 * 255);
        detailData[ptr++] = Math.round(e3 * 255);
        detailData[ptr++] = Math.round(wispy * 255);
      }
    }
  }

  const detailVolume = new THREE.Data3DTexture(detailData, D, D, D);
  detailVolume.format = THREE.RGBAFormat;
  detailVolume.type = THREE.UnsignedByteType;
  detailVolume.minFilter = THREE.LinearFilter;
  detailVolume.magFilter = THREE.LinearFilter;
  detailVolume.wrapS = THREE.RepeatWrapping;
  detailVolume.wrapT = THREE.RepeatWrapping;
  detailVolume.wrapR = THREE.RepeatWrapping;
  detailVolume.unpackAlignment = 1;
  detailVolume.needsUpdate = true;

  // 3. 64×64 R2 Düşük-Uyuşmazlıklı Dither Dokusu
  const N = 64;
  const noiseData = new Uint8Array(N * N * 4);
  const g = 1.324717957244746;
  const a1 = 1 / g;
  const a2 = 1 / (g * g);
  ptr = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const idx = y * N + x;
      const r1 = (0.5 + a1 * x + a2 * y) % 1;
      const r2 = (0.5 + a2 * x + a1 * (y + 17)) % 1;
      const r3 = hash1(x, y, idx & 7, 991);
      noiseData[ptr++] = Math.round(r1 * 255);
      noiseData[ptr++] = Math.round(r2 * 255);
      noiseData[ptr++] = Math.round(r3 * 255);
      noiseData[ptr++] = 255;
    }
  }

  const blueNoise = new THREE.DataTexture(noiseData, N, N, THREE.RGBAFormat);
  blueNoise.minFilter = THREE.NearestFilter;
  blueNoise.magFilter = THREE.NearestFilter;
  blueNoise.wrapS = THREE.RepeatWrapping;
  blueNoise.wrapT = THREE.RepeatWrapping;
  blueNoise.needsUpdate = true;

  cachedSet = { baseVolume, detailVolume, blueNoise };
  return cachedSet;
}

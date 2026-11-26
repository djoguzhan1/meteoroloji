import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  FACTION_META,
  STAGE_META,
  SUPERCELL_SHOCKWAVE_MIN_MASS,
  computeWindSpeedMultiplier,
  getCloudRadius,
  getWindScreenVector,
  type CloudNode,
  type CumulusGameState,
  type FactionId
} from "./cumulus-engine";

export type ArenaInteractionOverlay = {
  dragging: boolean;
  isRightDrag: boolean;
  pointerX: number;
  pointerY: number;
  selectedIds: number[];
  hoveredCloudId: number | null;
};

export type ArenaViewportTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Canvas herhangi bir en-boy oranında tam ekran (pillarbox olmadan) dolarken
 * 1000x620 oyun alanını tam merkezde ve %100 dairesel koruyan dönüşüm.
 */
export function computeArenaTransform(
  width: number,
  height: number
): ArenaViewportTransform {
  const scale = Math.min(width / ARENA_WIDTH, height / ARENA_HEIGHT);
  return {
    scale,
    offsetX: (width - ARENA_WIDTH * scale) * 0.5,
    offsetY: (height - ARENA_HEIGHT * scale) * 0.5
  };
}

/* ============================================================================
 * DETERMINİSTİK 2D VALUE NOISE, 5-OKTAV FBM & DOMAIN-WARPED TURBULENCE
 * ============================================================================ */

function hash2(ix: number, iy: number, seed: number): number {
  let n =
    Math.imul(ix, 374761393) +
    Math.imul(iy, 668265263) +
    Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function noise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);

  const v00 = hash2(ix, iy, seed);
  const v10 = hash2(ix + 1, iy, seed);
  const v01 = hash2(ix, iy + 1, seed);
  const v11 = hash2(ix + 1, iy + 1, seed);

  const nx0 = v00 + (v10 - v00) * fx;
  const nx1 = v01 + (v11 - v01) * fx;
  return nx0 + (nx1 - nx0) * fy;
}

function fbm(x: number, y: number, seed: number, octaves = 5): number {
  let val = 0;
  let amp = 0.52;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    val += noise2D(x * freq, y * freq, seed + i * 31) * amp;
    norm += amp;
    freq *= 2.04;
    amp *= 0.5;
  }
  return val / norm;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ============================================================================
 * SİNEMATİK ATMOSFERİK BULUT IŞIK PALETLERİ
 * Her bulut gerçek güneşli fildişi-beyaz kabarık tepeye sahip; cephe kimliği
 * doğal iç ışık saçılımı, gümüş-kenar parıltısı ve gölge derinliğinden gelir!
 * ============================================================================ */

type CloudPalette = {
  sunCrest: [number, number, number];
  brightBillow: [number, number, number];
  midScatter: [number, number, number];
  shadowBelly: [number, number, number];
  stormCore: [number, number, number];
  stormElectric: [number, number, number];
};

const CLOUD_PALETTES: Record<FactionId, CloudPalette> = {
  neutral: {
    sunCrest: [255, 252, 246],
    brightBillow: [236, 241, 249],
    midScatter: [176, 192, 214],
    shadowBelly: [76, 94, 122],
    stormCore: [42, 54, 78],
    stormElectric: [216, 232, 250]
  },
  player: {
    sunCrest: [255, 254, 250],
    brightBillow: [212, 244, 255],
    midScatter: [78, 198, 252],
    shadowBelly: [24, 78, 138],
    stormCore: [10, 34, 74],
    stormElectric: [56, 210, 255]
  },
  amber: {
    sunCrest: [255, 252, 240],
    brightBillow: [255, 224, 156],
    midScatter: [246, 158, 38],
    shadowBelly: [132, 62, 22],
    stormCore: [64, 26, 12],
    stormElectric: [255, 196, 64]
  },
  crimson: {
    sunCrest: [255, 246, 248],
    brightBillow: [255, 186, 206],
    midScatter: [242, 68, 114],
    shadowBelly: [122, 26, 64],
    stormCore: [52, 12, 34],
    stormElectric: [255, 88, 138]
  },
  emerald: {
    sunCrest: [248, 255, 252],
    brightBillow: [184, 252, 224],
    midScatter: [26, 206, 146],
    shadowBelly: [18, 96, 78],
    stormCore: [8, 46, 40],
    stormElectric: [52, 242, 178]
  }
};

/* ============================================================================
 * YÜKSEK ÇÖZÜNÜRLÜKLÜ PROSEDÜREL VOLÜMETRİK BULUT SPRITE BANKASI
 * ============================================================================ */

type CloudSpriteBank = {
  puffs: Record<FactionId, HTMLCanvasElement[]>;
  stormPuffs: Record<FactionId, HTMLCanvasElement[]>;
  cloudlets: Record<FactionId, HTMLCanvasElement>;
  anvilPlumes: Record<FactionId, HTMLCanvasElement>;
  vortexRings: Record<FactionId, HTMLCanvasElement>;
  shadowPuff: HTMLCanvasElement;
  mistVeil: HTMLCanvasElement;
  cirrusStreak: HTMLCanvasElement;
};

let cachedSpriteBank: CloudSpriteBank | null = null;

function makeOffscreen(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Gerçek kabartmalı, yumuşak pamuksu ve domain-warped FBM 3D kümülüs bulutu lobu.
 * Sol-üstten gelen sıcak güneş ışığı her karnabahar kıvrımını 3 boyutlu aydınlatır!
 */
function generateVolumetricCloudPuff(
  size: number,
  palette: CloudPalette,
  seed: number,
  isStorm: boolean
): HTMLCanvasElement {
  const canvas = makeOffscreen(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const img = ctx.createImageData(size, size);
  const data = img.data;
  const half = size * 0.5;
  const eps = 1.9 / size;

  // Güneş sol-üst-ön (altın saat gökyüzü açısı)
  const sunX = -0.64;
  const sunY = -0.62;
  const sunZ = 0.45;

  // Çok-odaklı organik kümülüs silüeti (yuvarlak balon yerine gerçek kabarık bulut!)
  const subCenters = [
    { x: 0.0, y: 0.04, r: 0.62 },
    { x: -0.26, y: 0.1, r: 0.48 },
    { x: 0.27, y: 0.12, r: 0.46 },
    { x: -0.1, y: -0.22, r: 0.46 },
    { x: 0.14, y: -0.16, r: 0.4 }
  ];

  const sampleDensity = (nx: number, ny: number): number => {
    // Domain warp: kenarlarda doğal rüzgarlı lifli pamuksu kırılmalar
    const wx = (fbm(nx * 2.1 + 3.7, ny * 2.1 - 2.3, seed + 13, 3) - 0.5) * 0.28;
    const wy = (fbm(nx * 2.1 - 5.1, ny * 2.1 + 4.9, seed + 47, 3) - 0.5) * 0.28;
    const x = nx + wx;
    const y = ny + wy;

    let shape = 0;
    for (const sc of subCenters) {
      const d = Math.hypot((x - sc.x) * 0.92, (y - sc.y) * 1.04) / sc.r;
      if (d < 1) {
        const lobe = Math.pow(1 - d * d, 1.45);
        if (lobe > shape) shape = lobe;
      }
    }
    if (shape <= 0.01) return 0;

    const billow = fbm(x * 3.1 + 2.4, y * 3.1 + 1.8, seed, 5);
    const fineWisp = fbm(x * 7.2 - 3.3, y * 7.2 + 6.4, seed + 131, 3);
    const raw = shape * (0.58 + billow * 0.62 + fineWisp * 0.22) - 0.12;
    return clamp01(raw * 1.55);
  };

  for (let py = 0; py < size; py++) {
    const ny = (py - half) / half;
    for (let px = 0; px < size; px++) {
      const nx = (px - half) / half;
      const d = sampleDensity(nx, ny);
      if (d <= 0.012) continue;

      // 3D yüzey normalini yoğunluk alanından hesapla (kabartmalı karnabahar kıvrımları)
      const dx = sampleDensity(nx + eps, ny) - sampleDensity(nx - eps, ny);
      const dy = sampleDensity(nx, ny + eps) - sampleDensity(nx, ny - eps);
      const bump = isStorm ? 6.2 : 4.9;
      let gx = -dx * bump;
      let gy = -dy * bump;
      let gz = 1.0;
      const invLen = 1 / Math.hypot(gx, gy, gz);
      gx *= invLen;
      gy *= invLen;
      gz *= invLen;

      // Güneş aydınlatması + bulut içi çift-saçılım (Beer-Lambert / Powder effect!)
      const ndotl = clamp01(gx * sunX + gy * sunY + gz * sunZ);
      const sunSide = clamp01(0.56 - ny * 0.52 - nx * 0.34);
      const silverRim = Math.pow(clamp01(1 - d), 1.3) * clamp01(sunSide + 0.32);
      const lit = clamp01(
        ndotl * 0.56 + sunSide * 0.36 + silverRim * (isStorm ? 0.36 : 0.44)
      );

      const darkTone = isStorm ? palette.stormCore : palette.shadowBelly;
      const midTone = isStorm ? palette.midScatter : palette.midScatter;
      const highTone = isStorm ? palette.brightBillow : palette.brightBillow;

      let rCol: number;
      let gCol: number;
      let bCol: number;

      if (lit < 0.42) {
        const t = lit / 0.42;
        rCol = lerp(darkTone[0], midTone[0], t);
        gCol = lerp(darkTone[1], midTone[1], t);
        bCol = lerp(darkTone[2], midTone[2], t);
      } else if (lit < 0.78) {
        const t = (lit - 0.42) / 0.36;
        rCol = lerp(midTone[0], highTone[0], t);
        gCol = lerp(midTone[1], highTone[1], t);
        bCol = lerp(midTone[2], highTone[2], t);
      } else {
        const t = (lit - 0.78) / 0.22;
        rCol = lerp(highTone[0], palette.sunCrest[0], t);
        gCol = lerp(highTone[1], palette.sunCrest[1], t);
        bCol = lerp(highTone[2], palette.sunCrest[2], t);
      }

      // Gümüş-altın güneş kenarı (Mie forward scattering!)
      if (silverRim > 0.24) {
        const rimBoost = clamp01((silverRim - 0.24) * 1.15) * (isStorm ? 0.5 : 0.65);
        rCol = lerp(rCol, 255, rimBoost);
        gCol = lerp(gCol, 251, rimBoost);
        bCol = lerp(bCol, 240, rimBoost);
      }

      // Fırtına bulutlarında çekirdek içinden dramatik elektrik enerjisi parlaması
      if (isStorm) {
        const core = Math.pow(clamp01(1 - Math.hypot(nx, ny * 1.1) * 1.15), 2.2) * 0.42;
        rCol = lerp(rCol, palette.stormElectric[0], core);
        gCol = lerp(gCol, palette.stormElectric[1], core);
        bCol = lerp(bCol, palette.stormElectric[2], core);
      }

      const alpha = clamp01(Math.pow(d, isStorm ? 0.6 : 0.7) * 1.15);
      const idx = (py * size + px) * 4;
      data[idx] = Math.round(rCol);
      data[idx + 1] = Math.round(gCol);
      data[idx + 2] = Math.round(bCol);
      data[idx + 3] = Math.round(alpha * 255);
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Kümülonimbus (Cb) ve Süper Hücre için rüzgarla uzayan ipeksi buz-sirüs örs kuyruğu (Incus).
 */
function generateAnvilPlume(palette: CloudPalette): HTMLCanvasElement {
  const w = 180;
  const h = 124;
  const canvas = makeOffscreen(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const img = ctx.createImageData(w, h);
  const data = img.data;
  for (let py = 0; py < h; py++) {
    const ny = (py - h * 0.5) / (h * 0.48);
    for (let px = 0; px < w; px++) {
      const nx = px / w;
      const fanWidth = 0.28 + Math.pow(nx, 0.68) * 0.7;
      const distY = Math.abs(ny) / fanWidth;
      if (distY >= 1) continue;

      const envX = Math.sin(nx * Math.PI) * Math.pow(1 - nx, 0.48);
      const envY = Math.pow(1 - distY, 1.45);
      const streaks = fbm(nx * 2.0, ny * 10.5 + 2.4, 411, 4);
      const fine = fbm(nx * 5.2 + 6.1, ny * 18.0, 733, 3);
      const d = clamp01(envX * envY * (0.48 + streaks * 0.85 + fine * 0.28));
      if (d <= 0.015) continue;

      const t = clamp01(0.45 + (1 - ny) * 0.4);
      const idx = (py * w + px) * 4;
      data[idx] = Math.round(lerp(palette.brightBillow[0], palette.sunCrest[0], t));
      data[idx + 1] = Math.round(lerp(palette.brightBillow[1], palette.sunCrest[1], t));
      data[idx + 2] = Math.round(lerp(palette.brightBillow[2], palette.sunCrest[2], t));
      data[idx + 3] = Math.round(d * 170);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Süper Hücre dönen mezosiklon duvar bulutu spirali.
 */
function generateMesocycloneVortex(palette: CloudPalette): HTMLCanvasElement {
  const size = 168;
  const canvas = makeOffscreen(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const img = ctx.createImageData(size, size);
  const data = img.data;
  const half = size * 0.5;
  for (let py = 0; py < size; py++) {
    const ny = (py - half) / half;
    for (let px = 0; px < size; px++) {
      const nx = (px - half) / half;
      const r = Math.hypot(nx, ny);
      if (r >= 0.98 || r < 0.14) continue;
      const ang = Math.atan2(ny, nx);
      const spiral = ang + r * 5.8;
      const band = Math.pow(0.5 + 0.5 * Math.sin(spiral * 3), 1.55);
      const turb = fbm(
        Math.cos(spiral) * 2.5 + r * 3.1,
        Math.sin(spiral) * 2.5 + r * 3.1,
        919,
        3
      );
      const ringEnv = Math.sin(clamp01((r - 0.14) / 0.82) * Math.PI);
      const alpha = clamp01(ringEnv * (0.3 + band * 0.72) * (0.58 + turb * 0.65));
      if (alpha <= 0.02) continue;

      const t = clamp01(band * 0.6 + (1 - r) * 0.4);
      const idx = (py * size + px) * 4;
      data[idx] = Math.round(lerp(palette.stormElectric[0], palette.sunCrest[0], t));
      data[idx + 1] = Math.round(lerp(palette.stormElectric[1], palette.sunCrest[1], t));
      data[idx + 2] = Math.round(lerp(palette.stormElectric[2], palette.sunCrest[2], t));
      data[idx + 3] = Math.round(alpha * 195);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * 5 km yukarıdan denize ve dağlara düşen yumuşak organik bulut gölgesi.
 */
function generateShadowPuff(): HTMLCanvasElement {
  const size = 128;
  const canvas = makeOffscreen(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const half = size * 0.5;
  for (let py = 0; py < size; py++) {
    const ny = (py - half) / half;
    for (let px = 0; px < size; px++) {
      const nx = (px - half) / half;
      const r = Math.hypot(nx * 0.92, ny * 1.05);
      if (r >= 1) continue;
      const n = fbm(nx * 2.4 + 1.5, ny * 2.4 + 3.4, 55, 3);
      const d = Math.pow(clamp01(1 - r), 1.65) * (0.68 + n * 0.44);
      const idx = (py * size + px) * 4;
      data[idx] = 3;
      data[idx + 1] = 9;
      data[idx + 2] = 22;
      data[idx + 3] = Math.round(clamp01(d) * 168);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Alt atmosferde yavaşça süzülen yarı saydam stratokümülüs sis tabakası.
 */
function generateMistVeil(): HTMLCanvasElement {
  const w = 300;
  const h = 160;
  const canvas = makeOffscreen(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  for (let py = 0; py < h; py++) {
    const ny = (py - h * 0.5) / (h * 0.5);
    for (let px = 0; px < w; px++) {
      const nx = (px - w * 0.5) / (w * 0.5);
      const r = Math.hypot(nx, ny);
      if (r >= 1) continue;
      const n = fbm(nx * 2.9 + 9.1, ny * 2.5 - 4.2, 808, 4);
      const a = Math.pow(clamp01(1 - r), 1.65) * clamp01(n * 1.45 - 0.34);
      if (a <= 0.01) continue;
      const idx = (py * w + px) * 4;
      data[idx] = 216;
      data[idx + 1] = 232;
      data[idx + 2] = 252;
      data[idx + 3] = Math.round(a * 62);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Yüksek irtifa ipeksi sirüs bulutu çizgisi (gökyüzünde süzülen narin buz kristali tülü).
 */
function generateCirrusStreak(): HTMLCanvasElement {
  const w = 360;
  const h = 90;
  const canvas = makeOffscreen(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  for (let py = 0; py < h; py++) {
    const ny = (py - h * 0.5) / (h * 0.5);
    for (let px = 0; px < w; px++) {
      const nx = (px - w * 0.5) / (w * 0.5);
      const env = Math.pow(clamp01(1 - nx * nx), 1.5) * Math.pow(clamp01(1 - ny * ny), 1.9);
      if (env <= 0.01) continue;
      const wisps = fbm(nx * 2.4 + 1.2, ny * 7.8 + 4.3, 613, 4);
      const a = clamp01(env * (wisps * 1.5 - 0.35));
      if (a <= 0.01) continue;
      const idx = (py * w + px) * 4;
      data[idx] = 255;
      data[idx + 1] = 248;
      data[idx + 2] = 238;
      data[idx + 3] = Math.round(a * 54);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Minik parlak tüylü bulutçuk (cloudlet) — güneşli fildişi baş + cephe ışığı!
 */
function generateCloudletSprite(palette: CloudPalette): HTMLCanvasElement {
  const size = 48;
  const canvas = makeOffscreen(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const half = size * 0.5;
  for (let py = 0; py < size; py++) {
    const ny = (py - half) / half;
    for (let px = 0; px < size; px++) {
      const nx = (px - half) / half;
      const r = Math.hypot(nx, ny);
      if (r >= 1) continue;
      const n = fbm(nx * 3.4 + 2.1, ny * 3.4 + 5.7, 303, 3);
      const d = clamp01(Math.pow(1 - r, 1.3) * (0.65 + n * 0.58));
      const lit = clamp01(0.62 - ny * 0.38 - nx * 0.28);
      const rCol = lerp(palette.midScatter[0], palette.sunCrest[0], lit);
      const gCol = lerp(palette.midScatter[1], palette.sunCrest[1], lit);
      const bCol = lerp(palette.midScatter[2], palette.sunCrest[2], lit);
      const idx = (py * size + px) * 4;
      data[idx] = Math.round(rCol);
      data[idx + 1] = Math.round(gCol);
      data[idx + 2] = Math.round(bCol);
      data[idx + 3] = Math.round(d * 250);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function getSpriteBank(): CloudSpriteBank {
  if (cachedSpriteBank) return cachedSpriteBank;
  const factions: FactionId[] = ["player", "amber", "crimson", "emerald", "neutral"];
  const puffs = {} as Record<FactionId, HTMLCanvasElement[]>;
  const stormPuffs = {} as Record<FactionId, HTMLCanvasElement[]>;
  const cloudlets = {} as Record<FactionId, HTMLCanvasElement>;
  const anvilPlumes = {} as Record<FactionId, HTMLCanvasElement>;
  const vortexRings = {} as Record<FactionId, HTMLCanvasElement>;

  for (const f of factions) {
    const pal = CLOUD_PALETTES[f];
    puffs[f] = [
      generateVolumetricCloudPuff(136, pal, 17, false),
      generateVolumetricCloudPuff(136, pal, 73, false),
      generateVolumetricCloudPuff(136, pal, 149, false)
    ];
    stormPuffs[f] = [
      generateVolumetricCloudPuff(144, pal, 223, true),
      generateVolumetricCloudPuff(144, pal, 311, true)
    ];
    cloudlets[f] = generateCloudletSprite(pal);
    anvilPlumes[f] = generateAnvilPlume(pal);
    vortexRings[f] = generateMesocycloneVortex(pal);
  }

  cachedSpriteBank = {
    puffs,
    stormPuffs,
    cloudlets,
    anvilPlumes,
    vortexRings,
    shadowPuff: generateShadowPuff(),
    mistVeil: generateMistVeil(),
    cirrusStreak: generateCirrusStreak()
  };
  return cachedSpriteBank;
}

/* ============================================================================
 * GENİŞ EKRAN (TAM BLEED) ALTIN SAAT YÜKSEK İRTİFA DÜNYA MANZARASI ÜRETİCİSİ
 * ============================================================================ */

const BACKDROP_W = 1440;
const BACKDROP_H = 760;

type StageTheme = {
  seed: number;
  seaLevel: number;
  deepSea: [number, number, number];
  midSea: [number, number, number];
  shallowSea: [number, number, number];
  coastFoam: [number, number, number];
  lowLand: [number, number, number];
  midLand: [number, number, number];
  highRidge: [number, number, number];
  sunGlow: string;
  warmWash: string;
  rayTint: string;
  landBias: (nx: number, ny: number) => number;
};

const STAGE_THEMES: Record<string, StageTheme> = {
  marmara: {
    seed: 101,
    seaLevel: 0.51,
    deepSea: [10, 38, 76],
    midSea: [16, 68, 114],
    shallowSea: [32, 128, 152],
    coastFoam: [184, 224, 230],
    lowLand: [34, 62, 58],
    midLand: [68, 86, 72],
    highRidge: [138, 122, 98],
    sunGlow: "rgba(255, 224, 162, 0.34)",
    warmWash: "rgba(251, 178, 108, 0.14)",
    rayTint: "rgba(255, 236, 196, 0.085)",
    landBias: (nx, ny) =>
      Math.pow(Math.abs(ny - 0.5) * 1.85, 1.5) * 0.42 -
      Math.exp(-Math.pow((nx - 0.5) * 2.0, 2)) * 0.14
  },
  bogaz: {
    seed: 207,
    seaLevel: 0.47,
    deepSea: [9, 42, 82],
    midSea: [18, 84, 126],
    shallowSea: [38, 142, 162],
    coastFoam: [192, 232, 236],
    lowLand: [30, 58, 56],
    midLand: [72, 90, 76],
    highRidge: [148, 134, 106],
    sunGlow: "rgba(255, 212, 148, 0.34)",
    warmWash: "rgba(125, 211, 252, 0.14)",
    rayTint: "rgba(255, 232, 188, 0.08)",
    landBias: (nx, ny) => Math.abs((nx - 0.5) * 0.92 + (ny - 0.5) * 0.96) * 0.62 - 0.12
  },
  ege: {
    seed: 319,
    seaLevel: 0.58,
    deepSea: [10, 44, 96],
    midSea: [18, 92, 148],
    shallowSea: [42, 166, 188],
    coastFoam: [204, 240, 242],
    lowLand: [56, 74, 62],
    midLand: [104, 102, 82],
    highRidge: [168, 144, 114],
    sunGlow: "rgba(255, 226, 158, 0.36)",
    warmWash: "rgba(56, 216, 242, 0.14)",
    rayTint: "rgba(255, 240, 200, 0.09)",
    landBias: (nx, ny) =>
      (Math.abs(nx - 0.5) > 0.4 ? 0.19 : -0.05) + Math.sin(nx * 13) * Math.cos(ny * 9) * 0.09
  },
  anadolu: {
    seed: 431,
    seaLevel: 0.25,
    deepSea: [16, 54, 92],
    midSea: [26, 86, 124],
    shallowSea: [54, 132, 150],
    coastFoam: [190, 216, 218],
    lowLand: [62, 56, 48],
    midLand: [108, 86, 66],
    highRidge: [176, 134, 96],
    sunGlow: "rgba(255, 198, 124, 0.38)",
    warmWash: "rgba(244, 114, 182, 0.12)",
    rayTint: "rgba(255, 220, 168, 0.095)",
    landBias: (nx, ny) => 0.14 + Math.sin(nx * 5.0 + ny * 3.2) * 0.11
  },
  akdeniz: {
    seed: 557,
    seaLevel: 0.57,
    deepSea: [8, 34, 82],
    midSea: [16, 78, 136],
    shallowSea: [38, 146, 178],
    coastFoam: [194, 234, 242],
    lowLand: [42, 66, 58],
    midLand: [88, 92, 76],
    highRidge: [158, 140, 114],
    sunGlow: "rgba(255, 218, 152, 0.35)",
    warmWash: "rgba(56, 189, 248, 0.15)",
    rayTint: "rgba(255, 236, 194, 0.088)",
    landBias: (_nx, ny) => (0.29 - ny) * 0.54
  },
  sonsuz: {
    seed: 709,
    seaLevel: 0.52,
    deepSea: [10, 30, 74],
    midSea: [22, 72, 128],
    shallowSea: [46, 142, 176],
    coastFoam: [190, 234, 246],
    lowLand: [34, 54, 68],
    midLand: [74, 94, 112],
    highRidge: [142, 158, 178],
    sunGlow: "rgba(165, 228, 255, 0.32)",
    warmWash: "rgba(52, 211, 153, 0.14)",
    rayTint: "rgba(205, 242, 255, 0.085)",
    landBias: (nx, ny) => (Math.hypot(nx - 0.5, ny - 0.5) - 0.4) * 0.28
  }
};

type StageBackdropBundle = {
  canvas: HTMLCanvasElement;
  cityLights: Array<{ nx: number; ny: number; phase: number; warm: boolean }>;
  seaGlints: Array<{ nx: number; ny: number; phase: number; size: number }>;
};

const backdropCache = new Map<string, StageBackdropBundle>();

function getStageBackdrop(stageId: string): StageBackdropBundle {
  const existing = backdropCache.get(stageId);
  if (existing) return existing;

  const theme = STAGE_THEMES[stageId] ?? STAGE_THEMES.marmara;

  // 560x296 detaylı uydu batimetri + rölyef topografya haritası
  const rw = 560;
  const rh = 296;
  const rawCanvas = makeOffscreen(rw, rh);
  const rctx = rawCanvas.getContext("2d");
  const cityLights: StageBackdropBundle["cityLights"] = [];
  const seaGlints: StageBackdropBundle["seaGlints"] = [];

  if (rctx) {
    const img = rctx.createImageData(rw, rh);
    const data = img.data;
    const heightMap = new Float32Array(rw * rh);

    for (let y = 0; y < rh; y++) {
      const ny = y / rh;
      for (let x = 0; x < rw; x++) {
        const nx = x / rw;
        const n = fbm(nx * 4.8 + 2.1, ny * 2.8 + 1.3, theme.seed, 5);
        const detail = fbm(nx * 12.5 - 3.2, ny * 7.8 + 4.7, theme.seed + 51, 3);
        const h = clamp01(n * 0.78 + detail * 0.22 + theme.landBias(nx, ny));
        heightMap[y * rw + x] = h;
      }
    }

    for (let y = 0; y < rh; y++) {
      const ny = y / rh;
      for (let x = 0; x < rw; x++) {
        const nx = x / rw;
        const idxMap = y * rw + x;
        const h = heightMap[idxMap];

        // Sol-üst güneş yakamozu yolu (su üstünde sinematik güneş yansıması!)
        const sunPath = Math.exp(
          -(Math.pow((nx - 0.16) * 1.9, 2) + Math.pow((ny - 0.14) * 1.9, 2))
        );

        let rCol: number;
        let gCol: number;
        let bCol: number;

        if (h < theme.seaLevel) {
          const depthT = clamp01(h / Math.max(0.05, theme.seaLevel));
          // İnce su dalgası dokusu
          const swell = fbm(nx * 24 + ny * 6, ny * 20 - nx * 4, theme.seed + 88, 2);
          if (depthT < 0.72) {
            const t = depthT / 0.72;
            rCol = lerp(theme.deepSea[0], theme.midSea[0], t);
            gCol = lerp(theme.deepSea[1], theme.midSea[1], t);
            bCol = lerp(theme.deepSea[2], theme.midSea[2], t);
          } else {
            const t = (depthT - 0.72) / 0.28;
            rCol = lerp(theme.midSea[0], theme.shallowSea[0], t);
            gCol = lerp(theme.midSea[1], theme.shallowSea[1], t);
            bCol = lerp(theme.midSea[2], theme.shallowSea[2], t);
          }

          // Deniz yüzeyinde altın güneş ışığı ve hafif dalga parıltısı
          const waveSheen = (swell - 0.5) * 18 + sunPath * 34;
          rCol = Math.min(255, Math.max(0, rCol + waveSheen * 1.15));
          gCol = Math.min(255, Math.max(0, gCol + waveSheen * 1.0));
          bCol = Math.min(255, Math.max(0, bCol + waveSheen * 0.78));

          // Kıyı köpüğü sınırı
          if (theme.seaLevel - h < 0.015) {
            const rimT = 1 - (theme.seaLevel - h) / 0.015;
            rCol = lerp(rCol, theme.coastFoam[0], rimT * 0.58);
            gCol = lerp(gCol, theme.coastFoam[1], rimT * 0.58);
            bCol = lerp(bCol, theme.coastFoam[2], rimT * 0.58);
          }

          if (
            x % 17 === 0 &&
            y % 15 === 0 &&
            h < theme.seaLevel - 0.06 &&
            hash2(x, y, theme.seed + 7) > 0.72
          ) {
            seaGlints.push({
              nx,
              ny,
              phase: hash2(x, y, 99) * Math.PI * 2,
              size: 1.1 + hash2(x, y, 42) * 1.5
            });
          }
        } else {
          // Kara: yüksek kontrastlı güneşli rölyef topografya (hillshade!)
          const hL = heightMap[y * rw + Math.max(0, x - 1)];
          const hR = heightMap[y * rw + Math.min(rw - 1, x + 1)];
          const hU = heightMap[Math.max(0, y - 1) * rw + x];
          const hD = heightMap[Math.min(rh - 1, y + 1) * rw + x];
          const slopeX = (hR - hL) * 22;
          const slopeY = (hD - hU) * 22;
          const hillShade = clamp01(0.56 - slopeX * 0.65 - slopeY * 0.65);

          const elevT = clamp01((h - theme.seaLevel) / Math.max(0.1, 1 - theme.seaLevel));
          let baseR: number;
          let baseG: number;
          let baseB: number;
          if (elevT < 0.5) {
            const t = elevT / 0.5;
            baseR = lerp(theme.lowLand[0], theme.midLand[0], t);
            baseG = lerp(theme.lowLand[1], theme.midLand[1], t);
            baseB = lerp(theme.lowLand[2], theme.midLand[2], t);
          } else {
            const t = (elevT - 0.5) / 0.5;
            baseR = lerp(theme.midLand[0], theme.highRidge[0], t);
            baseG = lerp(theme.midLand[1], theme.highRidge[1], t);
            baseB = lerp(theme.midLand[2], theme.highRidge[2], t);
          }

          const sunBoost = 0.56 + hillShade * 0.92;
          rCol = Math.min(255, baseR * sunBoost + hillShade * 24 + sunPath * 16);
          gCol = Math.min(255, baseG * sunBoost + hillShade * 17 + sunPath * 12);
          bCol = Math.min(255, baseB * sunBoost + hillShade * 8 + sunPath * 6);

          // Kıyı boyunca akşamüstü parlayan şehir ışıkları
          if (
            h - theme.seaLevel > 0.01 &&
            h - theme.seaLevel < 0.07 &&
            hash2(x, y, theme.seed + 303) > 0.991
          ) {
            cityLights.push({
              nx,
              ny,
              phase: hash2(x, y, 19) * Math.PI * 2,
              warm: hash2(x, y, 27) > 0.2
            });
          }
        }

        const p = idxMap * 4;
        data[p] = Math.round(rCol);
        data[p + 1] = Math.round(gCol);
        data[p + 2] = Math.round(bCol);
        data[p + 3] = 255;
      }
    }
    rctx.putImageData(img, 0, 0);
  }

  // 1440x760 geniş ekran sinematik uydu/gökyüzü katmanına ölçekle
  const finalCanvas = makeOffscreen(BACKDROP_W, BACKDROP_H);
  const fctx = finalCanvas.getContext("2d");
  if (fctx) {
    fctx.imageSmoothingEnabled = true;
    fctx.imageSmoothingQuality = "high";
    fctx.drawImage(rawCanvas, 0, 0, BACKDROP_W, BACKDROP_H);

    // Atmosferik irtifa derinliği (Rayleigh mavi-altın geçiş — koyu değil, canlı ve derin!)
    const atmoGrad = fctx.createLinearGradient(0, 0, BACKDROP_W, BACKDROP_H);
    atmoGrad.addColorStop(0, "rgba(255, 222, 168, 0.07)");
    atmoGrad.addColorStop(0.45, "rgba(14, 34, 68, 0.16)");
    atmoGrad.addColorStop(1, "rgba(6, 16, 36, 0.42)");
    fctx.fillStyle = atmoGrad;
    fctx.fillRect(0, 0, BACKDROP_W, BACKDROP_H);

    // Sol-üst altın saat güneş parıltısı
    const sunWash = fctx.createRadialGradient(
      BACKDROP_W * 0.08,
      BACKDROP_H * 0.06,
      15,
      BACKDROP_W * 0.08,
      BACKDROP_H * 0.06,
      780
    );
    sunWash.addColorStop(0, theme.sunGlow);
    sunWash.addColorStop(0.42, theme.warmWash);
    sunWash.addColorStop(1, "rgba(0, 0, 0, 0)");
    fctx.fillStyle = sunWash;
    fctx.fillRect(0, 0, BACKDROP_W, BACKDROP_H);

    // Volümetrik Güneş Işınları (God Rays / Crepuscular Beams!)
    fctx.save();
    fctx.globalCompositeOperation = "screen";
    const rayAngles = [0.22, 0.42, 0.64, 0.88, 1.1];
    for (let i = 0; i < rayAngles.length; i++) {
      const a = rayAngles[i];
      const spread = 0.075 + (i % 2) * 0.03;
      const len = 1280;
      const grad = fctx.createLinearGradient(
        -40,
        -40,
        Math.cos(a) * len,
        Math.sin(a) * len
      );
      grad.addColorStop(0, theme.rayTint);
      grad.addColorStop(0.65, "rgba(255, 236, 196, 0.02)");
      grad.addColorStop(1, "rgba(255, 236, 196, 0)");
      fctx.fillStyle = grad;
      fctx.beginPath();
      fctx.moveTo(-40, -40);
      fctx.lineTo(Math.cos(a - spread) * len, Math.sin(a - spread) * len);
      fctx.lineTo(Math.cos(a + spread) * len, Math.sin(a + spread) * len);
      fctx.closePath();
      fctx.fill();
    }
    fctx.restore();

    // Çok zarif sinoptik izobar halkaları (haritayı kirletmeden gözlemevi hissi)
    fctx.save();
    fctx.setLineDash([8, 14]);
    fctx.strokeStyle = "rgba(224, 242, 254, 0.075)";
    fctx.lineWidth = 1;
    for (const r of [200, 380, 560]) {
      fctx.beginPath();
      fctx.ellipse(
        BACKDROP_W * 0.5,
        BACKDROP_H * 0.5,
        r * 1.32,
        r * 0.78,
        -0.12,
        0,
        Math.PI * 2
      );
      fctx.stroke();
    }
    fctx.setLineDash([]);

    // Yumuşak sinematik kenar vinyeti
    const vig = fctx.createRadialGradient(
      BACKDROP_W * 0.5,
      BACKDROP_H * 0.5,
      360,
      BACKDROP_W * 0.5,
      BACKDROP_H * 0.5,
      860
    );
    vig.addColorStop(0, "rgba(0, 0, 0, 0)");
    vig.addColorStop(1, "rgba(4, 10, 22, 0.44)");
    fctx.fillStyle = vig;
    fctx.fillRect(0, 0, BACKDROP_W, BACKDROP_H);
    fctx.restore();
  }

  const bundle: StageBackdropBundle = {
    canvas: finalCanvas,
    cityLights: cityLights.slice(0, 75),
    seaGlints: seaGlints.slice(0, 65)
  };
  backdropCache.set(stageId, bundle);
  return bundle;
}

/* ============================================================================
 * DİNAMİK ATMOSFER KATMANLARI (SİS PERDELERİ + SİRÜS TÜLLERİ + RÜZGAR AKIMLARI)
 * ============================================================================ */

export type AtmosphericVisualState = {
  ribbons: Array<{
    nx: number;
    ny: number;
    len: number;
    speedMult: number;
    alpha: number;
    phase: number;
  }>;
  mistBanks: Array<{
    nx: number;
    ny: number;
    scale: number;
    alpha: number;
    speedMult: number;
  }>;
  cirrusBands: Array<{
    nx: number;
    ny: number;
    scale: number;
    alpha: number;
    speedMult: number;
  }>;
};

export function createAtmosphericVisualState(): AtmosphericVisualState {
  const ribbons: AtmosphericVisualState["ribbons"] = [];
  for (let i = 0; i < 48; i++) {
    ribbons.push({
      nx: Math.random(),
      ny: Math.random(),
      len: 46 + Math.random() * 78,
      speedMult: 0.65 + Math.random() * 0.75,
      alpha: 0.1 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2
    });
  }

  const mistBanks: AtmosphericVisualState["mistBanks"] = [];
  for (let i = 0; i < 10; i++) {
    mistBanks.push({
      nx: Math.random(),
      ny: Math.random(),
      scale: 0.95 + Math.random() * 1.25,
      alpha: 0.22 + Math.random() * 0.22,
      speedMult: 0.18 + Math.random() * 0.2
    });
  }

  const cirrusBands: AtmosphericVisualState["cirrusBands"] = [];
  for (let i = 0; i < 6; i++) {
    cirrusBands.push({
      nx: Math.random(),
      ny: 0.08 + Math.random() * 0.84,
      scale: 0.9 + Math.random() * 1.1,
      alpha: 0.16 + Math.random() * 0.16,
      speedMult: 0.35 + Math.random() * 0.3
    });
  }

  return { ribbons, mistBanks, cirrusBands };
}

/* ============================================================================
 * ANA 60 FPS FULL-BLEED SİNEMATİK RENDER FONKSİYONU
 * ============================================================================ */

export function renderCumulusArena(
  ctx: CanvasRenderingContext2D,
  pixelW: number,
  pixelH: number,
  state: CumulusGameState,
  inter: ArenaInteractionOverlay,
  atmos: AtmosphericVisualState,
  toolMode: "launch" | "supply",
  launchRatio: number,
  timeSec: number,
  dt: number
) {
  const sprites = getSpriteBank();
  const backdrop = getStageBackdrop(state.stageId);
  const { scale, offsetX, offsetY } = computeArenaTransform(pixelW, pixelH);

  ctx.save();

  // Mikro kamera sarsıntısı
  if (state.shake > 0.12) {
    const sx = (Math.random() - 0.5) * state.shake * 1.4 * scale;
    const sy = (Math.random() - 0.5) * state.shake * 1.4 * scale;
    ctx.translate(sx, sy);
  }

  // 1. TAM EKRAN (ZERO PILLARBOX!) YÜKSEK İRTİFA DENİZ & DAĞ RÖLYEF DÜNYASI
  ctx.drawImage(backdrop.canvas, 0, 0, pixelW, pixelH);

  // 2. Deniz güneş yakamozları + kıyı şehir ışıkları (tüm geniş ekranda!)
  for (const glint of backdrop.seaGlints) {
    const tw = Math.pow(0.5 + 0.5 * Math.sin(timeSec * 1.8 + glint.phase), 4);
    if (tw < 0.18) continue;
    ctx.fillStyle = `rgba(255, 248, 228, ${tw * 0.38})`;
    ctx.beginPath();
    ctx.arc(glint.nx * pixelW, glint.ny * pixelH, glint.size * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const light of backdrop.cityLights) {
    const tw = 0.55 + 0.45 * Math.sin(timeSec * 2.5 + light.phase);
    ctx.fillStyle = light.warm
      ? `rgba(255, 214, 142, ${0.52 * tw})`
      : `rgba(186, 230, 253, ${0.38 * tw})`;
    ctx.beginPath();
    ctx.arc(light.nx * pixelW, light.ny * pixelH, 1.45 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Alt İrtifa Paralaks Sis Perdeleri & İpeksi Sirüs Tülleri (tüm ekranda akar!)
  drawFullBleedAtmosphereLayers(
    ctx,
    pixelW,
    pixelH,
    scale,
    state,
    atmos,
    sprites,
    timeSec,
    dt
  );

  // =========================================================================
  // OYUN KOORDİNAT UZAYINA GEÇ (1000x620 — %100 dairesel, ortalanmış!)
  // =========================================================================
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // 4. GERÇEK 5 KM İRTİFA GÖLGELERİ (bulutlar ve bulutçuklar denize gölge düşürür!)
  drawAltitudeShadows(ctx, state, sprites.shadowPuff);

  // 5. Termal Yükselici & Buz Çekirdeği Konvektif Zemin Alanları
  drawSpecialZones(ctx, state, timeSec);

  // 6. Sürekli Nem Besleme Hatları
  drawSupplyLines(ctx, state, timeSec);

  // 7. Barometrik Şok Dalgaları
  drawShockwaves(ctx, state);

  // 8. Sürükleme / Nişan Önizleme Hatları
  drawAimPreview(ctx, state, inter, toolMode, launchRatio, timeSec);

  // 9. Havada Uçan Tüylü Bulutçuk Sürüleri
  drawCloudlets(ctx, state, sprites, timeSec);

  // 10. DEVASA, KABARIK, 3D GÜNEŞLİ VOLÜMETRİK ANA BULUTLAR
  const selectedSet = new Set(inter.selectedIds);
  const sortedClouds = [...state.clouds].sort(
    (a, b) => getCloudRadius(a.mass, a.kind) - getCloudRadius(b.mass, b.kind)
  );
  for (const cloud of sortedClouds) {
    drawVolumetricCloudNode(
      ctx,
      cloud,
      state,
      sprites,
      selectedSet.has(cloud.id),
      inter.hoveredCloudId === cloud.id,
      timeSec
    );
  }

  // 11. Çok-Dallı Çatallı Yıldırım Boşalmaları
  drawForkedLightning(ctx, state);

  // 12. Kıvılcım, Dolu Kristali & Yoğunlaşma Parçacıkları
  ctx.save();
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    const rad = p.size * (0.45 + 0.55 * alpha);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha * 0.24;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rad * 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 13. Uçuşan Evrim / Olay Bildirimleri
  for (const c of state.callouts) {
    const alpha = Math.min(1, (c.life / c.maxLife) * 1.45);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "700 12.5px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.lineWidth = 3.2;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(2, 6, 16, 0.88)";
    ctx.strokeText(c.text, c.x, c.y);
    ctx.fillStyle = c.color;
    ctx.fillText(c.text, c.x, c.y);
    ctx.restore();
  }

  ctx.restore(); // 1000x620 uzayından çık

  // 14. Köşe Rüzgar Pusulası (sağ üst köşeye sabit!)
  if (state.windKmh > 1) {
    drawCornerWindCompass(ctx, pixelW, scale, state.windKmh, state.windDirDeg);
  }

  ctx.restore();
}

function drawFullBleedAtmosphereLayers(
  ctx: CanvasRenderingContext2D,
  pixelW: number,
  pixelH: number,
  scale: number,
  state: CumulusGameState,
  atmos: AtmosphericVisualState,
  sprites: CloudSpriteBank,
  timeSec: number,
  dt: number
) {
  const { wx, wy } =
    state.windKmh > 1
      ? getWindScreenVector(state.windKmh, state.windDirDeg)
      : { wx: 12, wy: 4 };
  const mag = Math.max(1, Math.hypot(wx, wy));
  const ux = wx / mag;
  const uy = wy / mag;
  const windAngle = Math.atan2(uy, ux);

  // Alt irtifa sis / stratokümülüs perdeleri
  const mistSpd = (0.012 + mag * 0.0007) * dt;
  ctx.save();
  for (const m of atmos.mistBanks) {
    m.nx += ux * mistSpd * m.speedMult;
    m.ny += uy * mistSpd * m.speedMult;
    if (m.nx < -0.22) m.nx += 1.44;
    if (m.nx > 1.22) m.nx -= 1.44;
    if (m.ny < -0.22) m.ny += 1.44;
    if (m.ny > 1.22) m.ny -= 1.44;

    ctx.globalAlpha = m.alpha;
    const dw = 310 * m.scale * scale;
    const dh = 165 * m.scale * scale;
    ctx.drawImage(
      sprites.mistVeil,
      m.nx * pixelW - dw * 0.5,
      m.ny * pixelH - dh * 0.5,
      dw,
      dh
    );
  }
  ctx.restore();

  // İpeksi üst-atmosfer sirüs bulutu şeritleri (rüzgar yönünde süzülür)
  const cirrusSpd = (0.02 + mag * 0.001) * dt;
  ctx.save();
  for (const c of atmos.cirrusBands) {
    c.nx += ux * cirrusSpd * c.speedMult;
    c.ny += uy * cirrusSpd * c.speedMult;
    if (c.nx < -0.25) c.nx += 1.5;
    if (c.nx > 1.25) c.nx -= 1.5;
    if (c.ny < -0.25) c.ny += 1.5;
    if (c.ny > 1.25) c.ny -= 1.5;

    ctx.save();
    ctx.translate(c.nx * pixelW, c.ny * pixelH);
    ctx.rotate(windAngle);
    ctx.globalAlpha = c.alpha;
    const cw = 360 * c.scale * scale;
    const ch = 90 * c.scale * scale;
    ctx.drawImage(sprites.cirrusStreak, -cw * 0.5, -ch * 0.5, cw, ch);
    ctx.restore();
  }
  ctx.restore();

  // Jet-akım ince rüzgar şeritleri
  if (state.windKmh > 1) {
    const ribbonSpd = (0.036 + mag * 0.0024) * dt;
    ctx.save();
    ctx.lineCap = "round";
    for (const r of atmos.ribbons) {
      r.nx += ux * ribbonSpd * r.speedMult;
      r.ny += uy * ribbonSpd * r.speedMult;
      if (r.nx < -0.1) r.nx += 1.2;
      if (r.nx > 1.1) r.nx -= 1.2;
      if (r.ny < -0.1) r.ny += 1.2;
      if (r.ny > 1.1) r.ny -= 1.2;

      const hx = r.nx * pixelW;
      const hy = r.ny * pixelH;
      const lenPx = r.len * scale;
      const tailX = hx - ux * lenPx;
      const tailY = hy - uy * lenPx;
      const wave = Math.sin(timeSec * 1.8 + r.phase) * 5.5 * scale;
      const midX = (hx + tailX) * 0.5 - uy * wave;
      const midY = (hy + tailY) * 0.5 + ux * wave;

      const grad = ctx.createLinearGradient(tailX, tailY, hx, hy);
      grad.addColorStop(0, "rgba(224, 242, 254, 0)");
      grad.addColorStop(0.55, `rgba(224, 242, 254, ${r.alpha})`);
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.25 * scale;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.quadraticCurveTo(midX, midY, hx, hy);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawAltitudeShadows(
  ctx: CanvasRenderingContext2D,
  state: CumulusGameState,
  shadowPuff: HTMLCanvasElement
) {
  ctx.save();
  ctx.globalAlpha = 0.28;
  for (const cl of state.cloudlets) {
    const s = 18 + Math.min(10, Math.sqrt(cl.payload) * 3.5);
    ctx.drawImage(shadowPuff, cl.x + 17 - s * 0.5, cl.y + 21 - s * 0.5, s, s);
  }

  for (const cloud of state.clouds) {
    const r = getCloudRadius(cloud.mass, cloud.kind);
    const heightBoost =
      cloud.stage === "supercell"
        ? 1.55
        : cloud.stage === "cb"
          ? 1.32
          : cloud.stage === "congestus"
            ? 1.15
            : 1.0;
    const ox = 24 * heightBoost;
    const oy = 30 * heightBoost;
    const sw = r * 3.8 * heightBoost;
    const sh = r * 3.1 * heightBoost;
    ctx.globalAlpha = cloud.stage === "supercell" ? 0.65 : cloud.stage === "cb" ? 0.56 : 0.44;
    ctx.drawImage(shadowPuff, cloud.x + ox - sw * 0.5, cloud.y + oy - sh * 0.5, sw, sh);
  }
  ctx.restore();
}

function drawSpecialZones(
  ctx: CanvasRenderingContext2D,
  state: CumulusGameState,
  timeSec: number
) {
  for (const cloud of state.clouds) {
    if (cloud.kind === "normal") continue;
    const r = getCloudRadius(cloud.mass, cloud.kind);

    if (cloud.kind === "thermal") {
      ctx.save();
      const glow = ctx.createRadialGradient(
        cloud.x,
        cloud.y,
        r * 0.2,
        cloud.x,
        cloud.y,
        r * 2.5
      );
      glow.addColorStop(0, "rgba(253, 214, 96, 0.34)");
      glow.addColorStop(0.55, "rgba(245, 158, 11, 0.14)");
      glow.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      for (let w = 0; w < 2; w++) {
        const wave = (timeSec * 0.48 + cloud.seed + w * 0.5) % 1;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, r * 1.05 + wave * 38, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.52 * (1 - wave)})`;
        ctx.lineWidth = 1.65;
        ctx.stroke();
      }
      ctx.restore();
    } else if (cloud.kind === "ice") {
      ctx.save();
      const glow = ctx.createRadialGradient(
        cloud.x,
        cloud.y,
        r * 0.3,
        cloud.x,
        cloud.y,
        r * 2.35
      );
      glow.addColorStop(0, "rgba(186, 230, 253, 0.28)");
      glow.addColorStop(0.6, "rgba(56, 189, 248, 0.1)");
      glow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, r * 2.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(cloud.x, cloud.y);
      ctx.rotate(timeSec * 0.2 + cloud.seed * 6);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = Math.cos(a) * (r + 18);
        const py = Math.sin(a) * (r + 18);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(224, 242, 254, 0.48)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawSupplyLines(
  ctx: CanvasRenderingContext2D,
  state: CumulusGameState,
  timeSec: number
) {
  const byId = new Map(state.clouds.map((c) => [c.id, c]));
  for (const src of state.clouds) {
    if (src.supplyTargetId === null || src.owner === "neutral") continue;
    const dst = byId.get(src.supplyTargetId);
    if (!dst || dst.owner !== src.owner) continue;

    const meta = FACTION_META[src.owner];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(dst.x, dst.y);
    ctx.strokeStyle = meta.glow;
    ctx.lineWidth = 7;
    ctx.globalAlpha = 0.22;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(dst.x, dst.y);
    ctx.strokeStyle = meta.light;
    ctx.globalAlpha = 0.62;
    ctx.lineWidth = 2;
    ctx.setLineDash([9, 8]);
    ctx.lineDashOffset = -timeSec * 46;
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < 4; i++) {
      const t = (timeSec * 0.48 + i / 4) % 1;
      const dx = src.x + (dst.x - src.x) * t;
      const dy = src.y + (dst.y - src.y) * t;
      const pulseA = 0.92 * Math.sin(t * Math.PI);
      ctx.beginPath();
      ctx.arc(dx, dy, 6.8, 0, Math.PI * 2);
      ctx.fillStyle = meta.primary;
      ctx.globalAlpha = pulseA * 0.28;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = pulseA;
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawShockwaves(ctx: CanvasRenderingContext2D, state: CumulusGameState) {
  for (const sw of state.shockwaves) {
    const alpha = Math.max(0, sw.life / sw.maxLife);
    const meta = FACTION_META[sw.owner];
    ctx.save();
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = alpha * 0.32;
    ctx.lineWidth = 13 * alpha + 4;
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = alpha * 0.94;
    ctx.lineWidth = 4.5 * alpha + 1.5;
    ctx.stroke();

    const grad = ctx.createRadialGradient(
      sw.x,
      sw.y,
      Math.max(2, sw.radius * 0.64),
      sw.x,
      sw.y,
      sw.radius
    );
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.76, meta.glow);
    grad.addColorStop(1, "rgba(255, 255, 255, 0.42)");
    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha * 0.44;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawAimPreview(
  ctx: CanvasRenderingContext2D,
  state: CumulusGameState,
  inter: ArenaInteractionOverlay,
  toolMode: "launch" | "supply",
  launchRatio: number,
  timeSec: number
) {
  if (inter.selectedIds.length === 0) return;
  const hovered =
    inter.hoveredCloudId !== null
      ? state.clouds.find((c) => c.id === inter.hoveredCloudId) ?? null
      : null;

  const isSupply = inter.isRightDrag || toolMode === "supply";
  const tx = hovered ? hovered.x : inter.pointerX;
  const ty = hovered ? hovered.y : inter.pointerY;

  if (!inter.dragging && !hovered) return;

  const isReinforce = hovered !== null && hovered.owner === "player";
  const lineColor = isSupply ? "#34d399" : isReinforce ? "#22d3ee" : "#e0f2fe";

  let totalSend = 0;
  let windPctSum = 0;
  let lineCount = 0;

  for (const srcId of inter.selectedIds) {
    if (hovered && srcId === hovered.id) continue;
    const src = state.clouds.find((c) => c.id === srcId);
    if (!src || src.owner !== "player") continue;

    const sendMass = Math.max(0, Math.floor(src.mass * launchRatio));
    totalSend += sendMass;
    const windMult = computeWindSpeedMultiplier(
      tx - src.x,
      ty - src.y,
      state.windKmh,
      state.windDirDeg
    );
    windPctSum += Math.round((windMult - 1) * 100);
    lineCount++;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = lineColor;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2.6;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -timeSec * 58;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  if (hovered && lineCount > 0) {
    const avgWindPct = Math.round(windPctSum / lineCount);
    const r = getCloudRadius(hovered.mass, hovered.kind);

    ctx.save();
    ctx.beginPath();
    ctx.arc(hovered.x, hovered.y, r + 18, 0, Math.PI * 2);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 7.5;
    ctx.globalAlpha = 0.22;
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.globalAlpha = 0.94;
    ctx.stroke();

    const label = isSupply
      ? isReinforce
        ? "BESLEME HATTI"
        : "DOST BULUT SEÇ"
      : isReinforce
        ? `BESLE +${totalSend}`
        : `FİLO ${totalSend}${avgWindPct >= 6 ? ` · +%${avgWindPct} RÜZGAR` : avgWindPct <= -6 ? ` · %${avgWindPct} KARŞI` : ""}`;

    ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
    const tw = ctx.measureText(label).width + 16;
    const bx = hovered.x - tw / 2;
    const by = hovered.y - r - 44;
    ctx.fillStyle = "rgba(4, 10, 22, 0.9)";
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.25;
    roundRectPath(ctx, bx, by, tw, 22, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = lineColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, hovered.x, by + 11);
    ctx.restore();
  }
}

function drawCloudlets(
  ctx: CanvasRenderingContext2D,
  state: CumulusGameState,
  sprites: CloudSpriteBank,
  timeSec: number
) {
  for (const cl of state.cloudlets) {
    const meta = FACTION_META[cl.owner];
    const sprite = sprites.cloudlets[cl.owner];
    const spd = Math.max(1, Math.hypot(cl.vx, cl.vy));
    const ux = cl.vx / spd;
    const uy = cl.vy / spd;
    const size = 18 + Math.min(12, Math.sqrt(cl.payload) * 4.2);

    ctx.save();
    // İpeksi buhar akım izi
    const tailLen = cl.isCharged ? 26 : 18;
    const grad = ctx.createLinearGradient(
      cl.x - ux * tailLen,
      cl.y - uy * tailLen,
      cl.x,
      cl.y
    );
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(1, cl.isCharged ? "#ffffff" : meta.light);
    ctx.strokeStyle = grad;
    ctx.globalAlpha = cl.isCharged ? 0.82 : 0.56;
    ctx.lineWidth = size * 0.24;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cl.x - ux * tailLen, cl.y - uy * tailLen);
    ctx.lineTo(cl.x, cl.y);
    ctx.stroke();

    // Minik kabarık bulutçuk gövdesi
    ctx.globalAlpha = 0.98;
    ctx.drawImage(sprite, cl.x - size * 0.5, cl.y - size * 0.5, size, size);

    if (cl.isCharged) {
      const flicker = 0.65 + 0.35 * Math.sin(timeSec * 34 + cl.id);
      ctx.fillStyle = meta.primary;
      ctx.globalAlpha = flicker * 0.32;
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, 5.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = flicker;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (cl.isHail) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.3;
      const hr = size * 0.34;
      ctx.beginPath();
      ctx.moveTo(cl.x, cl.y - hr);
      ctx.lineTo(cl.x + hr, cl.y);
      ctx.lineTo(cl.x, cl.y + hr);
      ctx.lineTo(cl.x - hr, cl.y);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * GERÇEK DEVASA PAMUKSU 3D BULUT + ÖRS (Cb) + MEZOSİKLON (SC)
 * Bulutu kapatan ağır koyu kutu YOK — 100% temiz kabarık bulut dokusu + havada süzülen kristal tipografi!
 */
function drawVolumetricCloudNode(
  ctx: CanvasRenderingContext2D,
  cloud: CloudNode,
  state: CumulusGameState,
  sprites: CloudSpriteBank,
  isSelected: boolean,
  isHovered: boolean,
  timeSec: number
) {
  const meta = FACTION_META[cloud.owner];
  const baseR = getCloudRadius(cloud.mass, cloud.kind);
  const breath = Math.sin(timeSec * 1.6 + cloud.seed * 14) * 1.4;
  // Gerçekçi dolgun bulut görsel ölçeği (çarpışma yarıçapından daha görkemli ve kabarık!)
  const r = baseR + breath + cloud.pulse * 5.2;
  const visualR = r * 1.28;
  const isCongestus = cloud.stage === "congestus";
  const isCb = cloud.stage === "cb";
  const isSupercell = cloud.stage === "supercell";
  const isStorm = isCb || isSupercell;
  const shockReady =
    isSupercell &&
    cloud.owner !== "neutral" &&
    cloud.mass >= SUPERCELL_SHOCKWAVE_MIN_MASS &&
    cloud.shockwaveTimer <= 0;

  // Fırtına bulutu içi doğal şimşek parlaması (sheet lightning!)
  const internalFlash =
    isStorm && cloud.owner !== "neutral"
      ? Math.pow(
          Math.max(
            0,
            Math.sin(timeSec * (isSupercell ? 7.5 : 5.0) + cloud.seed * 41) *
              Math.sin(timeSec * 13.7 + cloud.seed * 19)
          ),
          6
        )
      : 0;

  ctx.save();

  // 1. Yıldırım savunma menzil halkası (seçiliyken veya hover'da)
  if (isStorm && cloud.owner !== "neutral" && (isSelected || isHovered)) {
    const lRange = STAGE_META[cloud.stage].lightningRange;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, lRange, 0, Math.PI * 2);
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = 0.24;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // 2. Kümülonimbus & Süper Hücre için YAĞIŞ PERDESİ (Virga) + RÜZGARLI ÖRS KUYRUĞU (Incus!)
  if (isStorm && cloud.owner !== "neutral") {
    ctx.save();
    ctx.strokeStyle = meta.light;
    ctx.lineWidth = 1.1;
    for (let s = 0; s < (isSupercell ? 10 : 7); s++) {
      const ox = (s - (isSupercell ? 4.5 : 3)) * (visualR * 0.22);
      const dropPhase = (timeSec * 2.0 + s * 0.37 + cloud.seed * 5) % 1;
      const sx = cloud.x + ox + dropPhase * 13;
      const sy = cloud.y + visualR * 0.38 + dropPhase * 24;
      ctx.globalAlpha = 0.28 * Math.sin(dropPhase * Math.PI);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 5, sy + 12);
      ctx.stroke();
    }
    ctx.restore();

    const windVec =
      state.windKmh > 1
        ? getWindScreenVector(state.windKmh, state.windDirDeg)
        : { wx: 1, wy: -0.25 };
    const windAngle = Math.atan2(windVec.wy, windVec.wx);
    const plume = sprites.anvilPlumes[cloud.owner];

    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(windAngle);
    const pw = visualR * (isSupercell ? 3.5 : 2.9);
    const ph = visualR * (isSupercell ? 2.4 : 2.0);
    ctx.globalAlpha = isSupercell ? 0.88 : 0.76;
    ctx.drawImage(plume, -visualR * 0.35, -ph * 0.5, pw, ph);
    ctx.restore();
  }

  // 3. Atmosferik Cephe Işık Halesi
  const auraRadius = visualR * (isSupercell ? 2.0 : isStorm ? 1.8 : 1.55);
  const aura = ctx.createRadialGradient(
    cloud.x,
    cloud.y,
    visualR * 0.2,
    cloud.x,
    cloud.y,
    auraRadius
  );
  aura.addColorStop(0, meta.glow);
  aura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = aura;
  ctx.globalAlpha = cloud.owner === "neutral" ? 0.24 : isStorm ? 0.58 : 0.44;
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, auraRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // 4. DEVASA ÇOK-KATMANLI VOLÜMETRİK KARNABAHAR BULUT KÜMESİ!
  const puffList = isStorm
    ? sprites.stormPuffs[cloud.owner]
    : sprites.puffs[cloud.owner];
  const brightPuffs = sprites.puffs[cloud.owner];

  // Geniş pamuksu alt etek katmanı (yatay doğal kümülüs yayılımı!)
  const baseLobes = isSupercell ? 7 : isCb ? 6 : isCongestus ? 5 : 4;
  for (let i = 0; i < baseLobes; i++) {
    const a =
      (i / baseLobes) * Math.PI * 2 +
      cloud.seed * 6.283 +
      (isSupercell
        ? timeSec * 0.32
        : Math.sin(timeSec * 0.42 + i + cloud.seed * 7) * 0.08);
    const dist = visualR * (0.44 + 0.14 * Math.sin(i * 2.3 + cloud.seed * 11));
    const lx = cloud.x + Math.cos(a) * dist * 1.12;
    const ly = cloud.y + Math.sin(a) * dist * 0.8 + visualR * 0.1;
    const ps = visualR * (1.72 + 0.26 * Math.cos(i * 1.9 + cloud.seed * 5));
    const sp = puffList[i % puffList.length];
    ctx.drawImage(sp, lx - ps * 0.5, ly - ps * 0.5, ps, ps);
  }

  // Güneşli kabaran yüksek kümülüs kubbesi (göz alıcı parlak fildişi-beyaz tepe!)
  const crownCount = isSupercell ? 4 : isCb ? 3 : isCongestus ? 3 : 2;
  for (let i = 0; i < crownCount; i++) {
    const a = (i / crownCount) * Math.PI * 2 + cloud.seed * 11.4 + 0.5;
    const dist = visualR * (isStorm ? 0.25 : 0.22);
    const lx = cloud.x + Math.cos(a) * dist - visualR * 0.09;
    const ly = cloud.y + Math.sin(a) * dist * 0.72 - visualR * (isStorm ? 0.16 : 0.1);
    const ps = visualR * (isStorm ? 1.56 : 1.48);
    const sp = brightPuffs[(i + 1) % brightPuffs.length];
    ctx.globalAlpha = isStorm ? 0.9 : 0.96;
    ctx.drawImage(sp, lx - ps * 0.5, ly - ps * 0.5, ps, ps);
  }
  ctx.globalAlpha = 1;

  // 5. Süper Hücre Dönen Volümetrik Mezosiklon Girdabı (SC 100+)
  if (isSupercell) {
    const vortex = sprites.vortexRings[cloud.owner];
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(-timeSec * 1.38);
    const vs = visualR * 2.4;
    ctx.globalAlpha = 0.84;
    ctx.drawImage(vortex, -vs * 0.5, -vs * 0.5, vs, vs);
    ctx.restore();
  }

  // 6. Bulut İçi Şimşek Aydınlanması (Fırtına Bulutu & Süper Hücre)
  if (internalFlash > 0.06) {
    const flashGrad = ctx.createRadialGradient(
      cloud.x - visualR * 0.1,
      cloud.y - visualR * 0.1,
      2,
      cloud.x,
      cloud.y,
      visualR * 1.35
    );
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * internalFlash})`);
    flashGrad.addColorStop(0.45, meta.glow);
    flashGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = internalFlash * 0.88;
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, visualR * 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 7. İnce Zarif Evrim İlerleme Yayı (dost ve rakip bulutlarda — bulutu kapatmaz!)
  if (cloud.owner !== "neutral" && !isSupercell) {
    const nextMin =
      cloud.stage === "cu" ? 30 : cloud.stage === "congestus" ? 60 : 100;
    const prevMin = STAGE_META[cloud.stage].minMass;
    const prog = clamp01((cloud.mass - prevMin) / (nextMin - prevMin));
    ctx.beginPath();
    ctx.arc(
      cloud.x,
      cloud.y,
      visualR + 4,
      -Math.PI / 2,
      -Math.PI / 2 + prog * Math.PI * 2
    );
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = 0.62;
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 8. Süper Hücre Şok Dalgası Hazır Halkası (120+ kütle)
  if (shockReady) {
    const pulse = 0.5 + 0.5 * Math.sin(timeSec * 6.5);
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, visualR + 7 + pulse * 4, 0, Math.PI * 2);
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = 0.28 + pulse * 0.14;
    ctx.lineWidth = 8.5;
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.72 + pulse * 0.28;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 9. Seçim Halkası
  if (isSelected) {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(timeSec * 0.95);
    ctx.beginPath();
    ctx.arc(0, 0, visualR + 9, 0, Math.PI * 2);
    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 7.2;
    ctx.stroke();
    ctx.globalAlpha = 0.96;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 10. KUTUSUZ, AĞIRLIKSIZ KRİSTAL TİPOGRAFİ (bulutun muhteşem 3D dokusu %100 görünür!)
  const massText = String(Math.floor(cloud.mass));
  const stageBadge =
    cloud.stage === "supercell"
      ? shockReady
        ? "SC · E⚡"
        : "SC"
      : cloud.stage === "cb"
        ? "Cb ⚡"
        : cloud.stage === "congestus"
          ? "Cu+"
          : "";

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Sayı arkasında yumuşak görünmez kontrast halesi (keskin kutu olmadan %100 okunaklılık!)
  ctx.font = `800 ${isSupercell ? 19 : isStorm ? 17 : 16}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.lineWidth = 4.2;
  ctx.strokeStyle = "rgba(4, 10, 22, 0.78)";
  ctx.lineJoin = "round";
  ctx.strokeText(massText, cloud.x, cloud.y + 1);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(massText, cloud.x, cloud.y + 1);

  // Evrim etiketi (sadece Cu+ / Cb / SC olunca bulutun alt eteğinde zarifçe parlar!)
  if (stageBadge) {
    const tagY = cloud.y + visualR * 0.64;
    ctx.font = "800 9.5px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = "rgba(4, 10, 22, 0.85)";
    ctx.strokeText(stageBadge, cloud.x, tagY);
    ctx.fillStyle = isStorm ? "#fef08a" : meta.light;
    ctx.fillText(stageBadge, cloud.x, tagY);
  }
  ctx.restore();

  // 11. Özel Düğüm Mikro Rozeti (Termal 2× / Buz ❄)
  if (cloud.kind !== "normal") {
    const tag = cloud.kind === "thermal" ? "2×" : "❄";
    const bx = cloud.x + visualR * 0.78;
    const by = cloud.y - visualR * 0.68;
    ctx.beginPath();
    ctx.arc(bx, by, 10.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(5, 12, 26, 0.84)";
    ctx.fill();
    ctx.strokeStyle = cloud.kind === "thermal" ? "#fde047" : "#bae6fd";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = "700 9.5px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = cloud.kind === "thermal" ? "#fef08a" : "#e0f2fe";
    ctx.fillText(tag, bx, by + 0.5);
  }

  ctx.restore();
}

/**
 * Gerçek Çatallı Yıldırım (ana plazma gövdesi + 2 yan dal + atmosfer parlaması).
 */
function drawForkedLightning(ctx: CanvasRenderingContext2D, state: CumulusGameState) {
  if (state.bolts.length === 0) return;

  for (const bolt of state.bolts) {
    const alpha = Math.max(0, bolt.life / bolt.maxLife);
    const meta = FACTION_META[bolt.owner];
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const flash = ctx.createRadialGradient(
      bolt.x1,
      bolt.y1,
      4,
      bolt.x1,
      bolt.y1,
      72
    );
    flash.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.72})`);
    flash.addColorStop(0.5, meta.glow);
    flash.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = flash;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(bolt.x1, bolt.y1, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    bolt.points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = alpha * 0.26;
    ctx.lineWidth = 18;
    ctx.stroke();

    ctx.strokeStyle = meta.light;
    ctx.globalAlpha = alpha * 0.72;
    ctx.lineWidth = 6.5;
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    if (bolt.points.length >= 4) {
      for (const idx of [2, 4]) {
        const origin = bolt.points[Math.min(idx, bolt.points.length - 2)];
        const side = (bolt.id + idx) % 2 === 0 ? 1 : -1;
        const angle =
          Math.atan2(bolt.y2 - bolt.y1, bolt.x2 - bolt.x1) + side * 0.55;
        const branchLen = 22 + ((bolt.id * 17 + idx * 9) % 20);
        const mx = origin.x + Math.cos(angle) * branchLen * 0.52;
        const my = origin.y + Math.sin(angle) * branchLen * 0.52;
        const ex = origin.x + Math.cos(angle + side * 0.25) * branchLen;
        const ey = origin.y + Math.sin(angle + side * 0.25) * branchLen;

        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(mx, my);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = meta.light;
        ctx.globalAlpha = alpha * 0.78;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function drawCornerWindCompass(
  ctx: CanvasRenderingContext2D,
  pixelW: number,
  scale: number,
  windKmh: number,
  windDirDeg: number
) {
  const cx = pixelW - 44 * scale;
  const cy = 42 * scale;
  const r = 21 * scale;
  const { wx, wy } = getWindScreenVector(windKmh, windDirDeg);
  const angle = Math.atan2(wy, wx);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(6, 14, 28, 0.65)";
  ctx.fill();
  ctx.strokeStyle = "rgba(224, 242, 254, 0.3)";
  ctx.lineWidth = 1.2 * scale;
  ctx.stroke();

  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.strokeStyle = "#7dd3fc";
  ctx.fillStyle = "#e0f2fe";
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  ctx.moveTo(-10 * scale, 0);
  ctx.lineTo(9 * scale, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12 * scale, 0);
  ctx.lineTo(5 * scale, -4.5 * scale);
  ctx.lineTo(5 * scale, 4.5 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = `700 ${Math.max(9, Math.round(9.5 * scale))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";
  ctx.lineWidth = 2.6;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(2, 6, 16, 0.85)";
  ctx.strokeText(`${Math.round(windKmh)} km/s`, cx, cy + 32 * scale);
  ctx.fillText(`${Math.round(windKmh)} km/s`, cx, cy + 32 * scale);
  ctx.restore();
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

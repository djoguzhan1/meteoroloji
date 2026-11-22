export type FactionId = "player" | "amber" | "crimson" | "emerald" | "neutral";

export type CloudStage = "cu" | "congestus" | "cb" | "supercell";

export type CloudNodeKind = "normal" | "thermal" | "ice";

export type DifficultyKey = "calm" | "storm" | "supercell";

export type WindMode = "live" | "dynamic" | "off";

export const ARENA_WIDTH = 1000;
export const ARENA_HEIGHT = 620;

export const FACTION_META: Record<
  FactionId,
  {
    name: string;
    shortName: string;
    primary: string;
    glow: string;
    dark: string;
    light: string;
    personality?: string;
  }
> = {
  player: {
    name: "Gök Cephesi (Sen)",
    shortName: "Sen",
    primary: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.55)",
    dark: "#0c4a6e",
    light: "#e0f2fe"
  },
  amber: {
    name: "Kehribar Cephe",
    shortName: "Kehribar",
    primary: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.55)",
    dark: "#78350f",
    light: "#fef3c7",
    personality: "Hızlı Yayılımcı"
  },
  crimson: {
    name: "Kızıl Siklon",
    shortName: "Kızıl",
    primary: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.55)",
    dark: "#881337",
    light: "#ffe4e6",
    personality: "Fırtına Evrimcisi"
  },
  emerald: {
    name: "Zümrüt Bora",
    shortName: "Zümrüt",
    primary: "#10b981",
    glow: "rgba(16, 185, 129, 0.55)",
    dark: "#064e3b",
    light: "#d1fae5",
    personality: "Fırsatçı Avcı"
  },
  neutral: {
    name: "Tarafsız",
    shortName: "Tarafsız",
    primary: "#94a3b8",
    glow: "rgba(148, 163, 184, 0.35)",
    dark: "#334155",
    light: "#e2e8f0"
  }
};

export const STAGE_META: Record<
  CloudStage,
  {
    label: string;
    code: string;
    minMass: number;
    prodRate: number; // mass / sec
    speedMult: number;
    powerMult: number;
    baseRadius: number;
    lightningCooldown: number; // 0 = none
    lightningTargets: number;
    lightningRange: number;
  }
> = {
  cu: {
    label: "Kümülüs",
    code: "Cu",
    minMass: 0,
    prodRate: 1.35,
    speedMult: 1.0,
    powerMult: 1.0,
    baseRadius: 27,
    lightningCooldown: 0,
    lightningTargets: 0,
    lightningRange: 0
  },
  congestus: {
    label: "Kongestus",
    code: "Cu con",
    minMass: 30,
    prodRate: 2.35,
    speedMult: 1.15,
    powerMult: 1.15,
    baseRadius: 34,
    lightningCooldown: 0,
    lightningTargets: 0,
    lightningRange: 0
  },
  cb: {
    label: "Kümülonimbus",
    code: "Cb",
    minMass: 60,
    prodRate: 3.25,
    speedMult: 1.24,
    powerMult: 1.3,
    baseRadius: 42,
    lightningCooldown: 1.55,
    lightningTargets: 1,
    lightningRange: 175
  },
  supercell: {
    label: "Süper Hücre",
    code: "SC",
    minMass: 100,
    prodRate: 4.35,
    speedMult: 1.34,
    powerMult: 1.48,
    baseRadius: 50,
    lightningCooldown: 1.25,
    lightningTargets: 3,
    lightningRange: 215
  }
};

export const SUPERCELL_SHOCKWAVE_MIN_MASS = 120;
export const SUPERCELL_SHOCKWAVE_COST = 22;
export const SUPERCELL_SHOCKWAVE_COOLDOWN = 9;
export const SUPERCELL_SHOCKWAVE_RADIUS = 250;

export function getCloudStage(mass: number): CloudStage {
  if (mass >= 100) return "supercell";
  if (mass >= 60) return "cb";
  if (mass >= 30) return "congestus";
  return "cu";
}

export function getCloudRadius(mass: number, kind: CloudNodeKind): number {
  const stage = getCloudStage(mass);
  const base = STAGE_META[stage].baseRadius;
  const bonus = Math.min(8, Math.sqrt(Math.max(0, mass)) * 0.6);
  const kindBonus = kind === "thermal" ? 4 : kind === "ice" ? 2 : 0;
  return base + bonus + kindBonus;
}

export type CloudNode = {
  id: number;
  x: number;
  y: number;
  owner: FactionId;
  mass: number;
  maxMass: number;
  kind: CloudNodeKind;
  stage: CloudStage;
  lightningTimer: number;
  shockwaveTimer: number;
  supplyTargetId: number | null;
  supplyTimer: number;
  pulse: number; // görsel büyüme/darbe animasyonu (0..1)
  seed: number;
};

export type Cloudlet = {
  id: number;
  owner: FactionId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetId: number;
  payload: number; // taşıdığı bulut kütlesi
  powerMult: number; // saldırı gücü çarpanı (evrim + buz çekirdeği)
  speedBase: number;
  isHail: boolean;
  isCharged: boolean;
  age: number;
};

export type LightningBolt = {
  id: number;
  owner: FactionId;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  points: Array<{ x: number; y: number }>;
};

export type ShockwaveRing = {
  id: number;
  owner: FactionId;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
};

export type SparkParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
};

export type FloatingCallout = {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
};

export type GameEvent =
  | { type: "launch"; owner: FactionId; count: number }
  | { type: "reinforce"; owner: FactionId; cloudId: number }
  | { type: "capture"; owner: FactionId; previousOwner: FactionId; cloudId: number }
  | { type: "evolve"; owner: FactionId; stage: CloudStage; cloudId: number }
  | { type: "lightning"; owner: FactionId }
  | { type: "shockwave"; owner: FactionId }
  | { type: "clash" }
  | { type: "victory" }
  | { type: "defeat" };

export type StageSpec = {
  id: string;
  index: number;
  name: string;
  subtitle: string;
  opponents: FactionId[];
  defaultWindKmh: number;
  defaultWindDirDeg: number;
  procedural?: boolean;
};

export const CUMULUS_STAGES: StageSpec[] = [
  {
    id: "marmara",
    index: 1,
    name: "Marmara Cephesi",
    subtitle: "1v1 · Dengeli başlangıç, ortada sıcak Termal Yükselici",
    opponents: ["amber"],
    defaultWindKmh: 16,
    defaultWindDirDeg: 225
  },
  {
    id: "bogaz",
    index: 2,
    name: "Boğaz Koridoru",
    subtitle: "1v1 · Kuvvetli kanal rüzgarı + Evrimci Kızıl Siklon",
    opponents: ["crimson"],
    defaultWindKmh: 34,
    defaultWindDirDeg: 45
  },
  {
    id: "ege",
    index: 3,
    name: "Ege Adaları",
    subtitle: "1v2 · Kehribar & Zümrüt cepheleri arasında ada kümeleri",
    opponents: ["amber", "emerald"],
    defaultWindKmh: 24,
    defaultWindDirDeg: 350
  },
  {
    id: "anadolu",
    index: 4,
    name: "Anadolu Süper Hücresi",
    subtitle: "1v2 · Buz Çekirdeği & Termal evrim yarışı",
    opponents: ["crimson", "amber"],
    defaultWindKmh: 20,
    defaultWindDirDeg: 260
  },
  {
    id: "akdeniz",
    index: 5,
    name: "Akdeniz Siklonu",
    subtitle: "1v3 · 4 cepheli büyük fırtına savaşı",
    opponents: ["amber", "crimson", "emerald"],
    defaultWindKmh: 28,
    defaultWindDirDeg: 170
  },
  {
    id: "sonsuz",
    index: 6,
    name: "Sonsuz Fırtına",
    subtitle: "1v2 · Her oyunda yeni simetrik gökyüzü haritası",
    opponents: ["crimson", "emerald"],
    defaultWindKmh: 22,
    defaultWindDirDeg: 210,
    procedural: true
  }
];

export type GameStats = {
  elapsedSec: number;
  cloudsCaptured: number;
  supercellsFormed: number;
  lightningZaps: number;
  shockwavesFired: number;
  cloudletsLaunched: number;
  peakStage: CloudStage;
};

export type CumulusGameState = {
  stageId: string;
  difficulty: DifficultyKey;
  windMode: WindMode;
  windKmh: number;
  windDirDeg: number; // meteorolojik geldiği yön
  windShiftTimer: number;
  clouds: CloudNode[];
  cloudlets: Cloudlet[];
  bolts: LightningBolt[];
  shockwaves: ShockwaveRing[];
  particles: SparkParticle[];
  callouts: FloatingCallout[];
  aiTimers: Record<string, number>;
  nextId: number;
  shake: number;
  status: "playing" | "victory" | "defeat";
  stats: GameStats;
};

function makeJaggedBolt(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Array<{ x: number; y: number }> {
  const segs = 6;
  const pts: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;

  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const jitter = (Math.random() - 0.5) * Math.min(28, len * 0.2);
    pts.push({
      x: x1 + dx * t + nx * jitter,
      y: y1 + dy * t + ny * jitter
    });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
}

function createCloud(
  id: number,
  x: number,
  y: number,
  owner: FactionId,
  mass: number,
  kind: CloudNodeKind = "normal"
): CloudNode {
  return {
    id,
    x,
    y,
    owner,
    mass,
    maxMass: kind === "thermal" ? 180 : 160,
    kind,
    stage: getCloudStage(mass),
    lightningTimer: 0.4,
    shockwaveTimer: 0,
    supplyTargetId: null,
    supplyTimer: 1.5,
    pulse: 0,
    seed: (id * 1.6180339) % 1
  };
}

function buildStageClouds(stage: StageSpec): CloudNode[] {
  let id = 1;
  const add = (
    x: number,
    y: number,
    owner: FactionId,
    mass: number,
    kind: CloudNodeKind = "normal"
  ) => createCloud(id++, x, y, owner, mass, kind);

  if (stage.id === "marmara") {
    return [
      add(150, 310, "player", 26),
      add(265, 165, "neutral", 12),
      add(265, 455, "neutral", 12),
      add(395, 240, "neutral", 16),
      add(395, 380, "neutral", 16),
      add(500, 310, "neutral", 28, "thermal"),
      add(500, 125, "neutral", 18, "ice"),
      add(500, 495, "neutral", 18),
      add(605, 240, "neutral", 16),
      add(605, 380, "neutral", 16),
      add(735, 165, "neutral", 12),
      add(735, 455, "neutral", 12),
      add(850, 310, "amber", 26)
    ];
  }

  if (stage.id === "bogaz") {
    return [
      add(145, 475, "player", 28),
      add(260, 355, "neutral", 12),
      add(165, 235, "neutral", 15),
      add(345, 495, "neutral", 14),
      add(385, 245, "neutral", 20, "ice"),
      add(500, 310, "neutral", 32, "thermal"),
      add(615, 375, "neutral", 20, "ice"),
      add(655, 125, "neutral", 14),
      add(835, 385, "neutral", 15),
      add(740, 265, "neutral", 12),
      add(855, 145, "crimson", 28),
      add(500, 115, "neutral", 16),
      add(500, 505, "neutral", 16)
    ];
  }

  if (stage.id === "ege") {
    return [
      add(155, 310, "player", 30),
      add(285, 200, "neutral", 12),
      add(285, 420, "neutral", 12),
      add(430, 140, "neutral", 16),
      add(430, 310, "neutral", 26, "thermal"),
      add(430, 480, "neutral", 16),
      add(575, 225, "neutral", 20, "ice"),
      add(575, 395, "neutral", 20, "ice"),
      add(700, 310, "neutral", 22),
      add(835, 155, "amber", 28),
      add(835, 465, "emerald", 28),
      add(720, 125, "neutral", 12),
      add(720, 495, "neutral", 12)
    ];
  }

  if (stage.id === "anadolu") {
    return [
      add(150, 465, "player", 32),
      add(150, 155, "neutral", 16),
      add(285, 390, "neutral", 12),
      add(295, 225, "neutral", 18),
      add(425, 485, "neutral", 20, "thermal"),
      add(500, 310, "neutral", 36, "ice"),
      add(575, 135, "neutral", 20, "thermal"),
      add(705, 395, "neutral", 18),
      add(715, 230, "neutral", 12),
      add(850, 155, "crimson", 34),
      add(850, 465, "amber", 30),
      add(415, 150, "neutral", 16),
      add(585, 470, "neutral", 16)
    ];
  }

  if (stage.id === "akdeniz") {
    return [
      add(145, 145, "player", 32),
      add(855, 145, "amber", 30),
      add(855, 475, "crimson", 32),
      add(145, 475, "emerald", 30),
      add(295, 215, "neutral", 14),
      add(705, 215, "neutral", 14),
      add(705, 405, "neutral", 14),
      add(295, 405, "neutral", 14),
      add(500, 125, "neutral", 22, "ice"),
      add(500, 495, "neutral", 22, "ice"),
      add(350, 310, "neutral", 20),
      add(650, 310, "neutral", 20),
      add(500, 310, "neutral", 38, "thermal")
    ];
  }

  // Sonsuz Fırtına: Dengeli simetrik prosedürel harita
  const clouds: CloudNode[] = [
    add(145, 310, "player", 30),
    add(845, 160, "crimson", 28),
    add(845, 460, "emerald", 28),
    add(500, 310, "neutral", 26 + Math.floor(Math.random() * 10), "thermal")
  ];

  const isClear = (x: number, y: number, minDist = 112) =>
    clouds.every((c) => Math.hypot(c.x - x, c.y - y) >= minDist);

  let attempts = 0;
  while (clouds.length < 13 && attempts < 140) {
    attempts++;
    const x = 230 + Math.random() * 540;
    const y = 105 + Math.random() * 195;
    const mirrorY = ARENA_HEIGHT - y;
    if (!isClear(x, y) || !isClear(x, mirrorY) || Math.abs(y - mirrorY) < 115) {
      continue;
    }
    const mass = 10 + Math.floor(Math.random() * 14);
    const kind: CloudNodeKind =
      clouds.filter((c) => c.kind === "ice").length < 2 && Math.random() < 0.28
        ? "ice"
        : "normal";
    clouds.push(add(Math.round(x), Math.round(y), "neutral", mass, kind));
    if (clouds.length < 13) {
      clouds.push(add(Math.round(x), Math.round(mirrorY), "neutral", mass, kind));
    }
  }
  return clouds;
}

export function createCumulusGame(params: {
  stageId: string;
  difficulty: DifficultyKey;
  windMode: WindMode;
  liveWindKmh?: number;
  liveWindDirDeg?: number;
}): CumulusGameState {
  const stage =
    CUMULUS_STAGES.find((s) => s.id === params.stageId) ?? CUMULUS_STAGES[0];
  const clouds = buildStageClouds(stage);

  const windKmh =
    params.windMode === "off"
      ? 0
      : params.windMode === "live" && typeof params.liveWindKmh === "number"
        ? Math.max(4, Math.min(55, params.liveWindKmh))
        : stage.defaultWindKmh;

  const windDirDeg =
    params.windMode === "live" && typeof params.liveWindDirDeg === "number"
      ? params.liveWindDirDeg
      : stage.defaultWindDirDeg;

  const aiTimers: Record<string, number> = {};
  stage.opponents.forEach((f, idx) => {
    aiTimers[f] = 1.2 + idx * 0.55;
  });

  return {
    stageId: stage.id,
    difficulty: params.difficulty,
    windMode: params.windMode,
    windKmh,
    windDirDeg,
    windShiftTimer: 32,
    clouds,
    cloudlets: [],
    bolts: [],
    shockwaves: [],
    particles: [],
    callouts: [],
    aiTimers,
    nextId: 100,
    shake: 0,
    status: "playing",
    stats: {
      elapsedSec: 0,
      cloudsCaptured: 0,
      supercellsFormed: 0,
      lightningZaps: 0,
      shockwavesFired: 0,
      cloudletsLaunched: 0,
      peakStage: "cu"
    }
  };
}

/**
 * Meteorolojik rüzgar yönünü ekran vektörüne çevirir (+x doğu, +y güney).
 */
export function getWindScreenVector(
  windKmh: number,
  windDirDeg: number
): { wx: number; wy: number } {
  if (windKmh <= 0.5) return { wx: 0, wy: 0 };
  const rad = (windDirDeg * Math.PI) / 180;
  // Rüzgar geldiği yönden eser -> aktığı yön (-sin, +cos ekran Y aşağı olduğu için!)
  const mag = Math.min(55, windKmh);
  return {
    wx: -Math.sin(rad) * mag,
    wy: Math.cos(rad) * mag
  };
}

/**
 * Rüzgarın uçuş hızı üzerindeki etkisi: rüzgar arkadaysa +%25'e kadar hız, karşıdaysa -%15.
 */
export function computeWindSpeedMultiplier(
  dx: number,
  dy: number,
  windKmh: number,
  windDirDeg: number
): number {
  if (windKmh <= 1) return 1;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const { wx, wy } = getWindScreenVector(windKmh, windDirDeg);
  const wMag = Math.max(1, Math.hypot(wx, wy));
  const alignment = (dx / dist) * (wx / wMag) + (dy / dist) * (wy / wMag); // -1..+1
  const strength = Math.min(1, windKmh / 42);
  if (alignment >= 0) {
    return 1 + alignment * 0.26 * strength;
  }
  return 1 + alignment * 0.16 * strength;
}

function addParticles(
  state: CumulusGameState,
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 95
) {
  for (let i = 0; i < count; i++) {
    if (state.particles.length > 260) break;
    const ang = Math.random() * Math.PI * 2;
    const spd = speed * (0.35 + Math.random() * 0.85);
    state.particles.push({
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      color,
      size: 2 + Math.random() * 2.8,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7
    });
  }
}

function addCallout(
  state: CumulusGameState,
  x: number,
  y: number,
  text: string,
  color: string
) {
  state.callouts.push({
    id: state.nextId++,
    x,
    y,
    text,
    color,
    life: 1.45,
    maxLife: 1.45
  });
}

const STAGE_ORDER: Record<CloudStage, number> = {
  cu: 0,
  congestus: 1,
  cb: 2,
  supercell: 3
};

/**
 * Bir veya daha fazla dost buluttan hedef buluta bulutçuk filosu fırlatır.
 */
export function launchCloudlets(
  state: CumulusGameState,
  fromIds: number[],
  targetId: number,
  ratio = 0.5
): GameEvent[] {
  const events: GameEvent[] = [];
  if (state.status !== "playing") return events;
  const target = state.clouds.find((c) => c.id === targetId);
  if (!target) return events;

  const clampedRatio = Math.max(0.15, Math.min(0.95, ratio));
  let totalLaunched = 0;
  let launcherOwner: FactionId | null = null;

  for (const fromId of fromIds) {
    if (fromId === targetId) continue;
    const src = state.clouds.find((c) => c.id === fromId);
    if (!src || src.owner === "neutral" || src.mass < 2) continue;

    const sendMass = Math.max(1, Math.floor(src.mass * clampedRatio));
    if (sendMass <= 0 || src.mass - sendMass < 1) continue;

    const launchStage = src.stage;
    src.mass -= sendMass;
    src.stage = getCloudStage(src.mass);
    src.pulse = 0.45;
    launcherOwner = src.owner;
    totalLaunched += sendMass;

    const stageMeta = STAGE_META[launchStage];
    const isHail = src.kind === "ice";
    const isCharged = launchStage === "cb" || launchStage === "supercell";
    const powerMult = stageMeta.powerMult * (isHail ? 1.4 : 1.0);

    // Görsel akıcılık için en fazla 22 mermi, her biri dengeli payload taşır
    const projectileCount = Math.min(22, Math.max(1, Math.round(sendMass * 0.65)));
    const payloadPer = sendMass / projectileCount;

    const dx = target.x - src.x;
    const dy = target.y - src.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / dist;
    const ny = dx / dist;
    const baseSpeed = 148 * stageMeta.speedMult;

    for (let i = 0; i < projectileCount; i++) {
      const spread = (Math.random() - 0.5) * 30;
      const forwardOffset = (Math.random() - 0.5) * 18;
      const startX = src.x + (dx / dist) * (14 + forwardOffset) + nx * spread;
      const startY = src.y + (dy / dist) * (14 + forwardOffset) + ny * spread;

      state.cloudlets.push({
        id: state.nextId++,
        owner: src.owner,
        x: startX,
        y: startY,
        vx: (dx / dist) * baseSpeed + nx * spread * 1.4,
        vy: (dy / dist) * baseSpeed + ny * spread * 1.4,
        targetId: target.id,
        payload: payloadPer,
        powerMult,
        speedBase: baseSpeed * (0.94 + Math.random() * 0.12),
        isHail,
        isCharged,
        age: 0
      });
    }
  }

  if (totalLaunched > 0 && launcherOwner) {
    if (launcherOwner === "player") {
      state.stats.cloudletsLaunched += totalLaunched;
    }
    events.push({ type: "launch", owner: launcherOwner, count: totalLaunched });
  }

  return events;
}

/**
 * İki dost bulut arasında sürekli otomatik Nem Besleme Hattı kurar veya iptal eder.
 */
export function toggleSupplyLine(
  state: CumulusGameState,
  fromId: number,
  toId: number
): boolean {
  if (fromId === toId) {
    const src = state.clouds.find((c) => c.id === fromId);
    if (src && src.supplyTargetId !== null) {
      src.supplyTargetId = null;
      return false;
    }
    return false;
  }
  const src = state.clouds.find((c) => c.id === fromId);
  const dst = state.clouds.find((c) => c.id === toId);
  if (!src || !dst || src.owner === "neutral" || src.owner !== dst.owner) {
    return false;
  }
  if (src.supplyTargetId === toId) {
    src.supplyTargetId = null;
    return false;
  }
  // Döngüyü engelle (dst zaten src'yi besliyorsa onu kes)
  if (dst.supplyTargetId === fromId) {
    dst.supplyTargetId = null;
  }
  src.supplyTargetId = toId;
  src.supplyTimer = 0.6;
  return true;
}

/**
 * Süper Hücre aktif yeteneği: Barometrik Şok Dalgası!
 * 120+ kütleli Süper Hücre'den yayılan basınç dalgası yakındaki düşman bulutçuklarını yok eder
 * ve yakındaki düşman bulutlarına doğrudan darbe vurur.
 */
export function triggerSupercellShockwave(
  state: CumulusGameState,
  cloudId: number
): GameEvent[] {
  const events: GameEvent[] = [];
  if (state.status !== "playing") return events;
  const cloud = state.clouds.find((c) => c.id === cloudId);
  if (
    !cloud ||
    cloud.owner === "neutral" ||
    cloud.stage !== "supercell" ||
    cloud.mass < SUPERCELL_SHOCKWAVE_MIN_MASS ||
    cloud.shockwaveTimer > 0
  ) {
    return events;
  }

  cloud.mass -= SUPERCELL_SHOCKWAVE_COST;
  cloud.stage = getCloudStage(cloud.mass);
  cloud.shockwaveTimer = SUPERCELL_SHOCKWAVE_COOLDOWN;
  cloud.pulse = 1;
  state.shake = Math.max(state.shake, 9);

  state.shockwaves.push({
    id: state.nextId++,
    owner: cloud.owner,
    x: cloud.x,
    y: cloud.y,
    radius: getCloudRadius(cloud.mass, cloud.kind),
    maxRadius: SUPERCELL_SHOCKWAVE_RADIUS,
    life: 0.65,
    maxLife: 0.65
  });

  // Menzildeki düşman bulutçuklarını buharlaştır
  const surviving: Cloudlet[] = [];
  for (const cl of state.cloudlets) {
    const d = Math.hypot(cl.x - cloud.x, cl.y - cloud.y);
    if (cl.owner !== cloud.owner && d <= SUPERCELL_SHOCKWAVE_RADIUS) {
      addParticles(state, cl.x, cl.y, FACTION_META[cloud.owner].light, 4, 130);
      continue;
    }
    // Dost bulutçuklara hız dopingi
    if (cl.owner === cloud.owner && d <= SUPERCELL_SHOCKWAVE_RADIUS) {
      cl.speedBase *= 1.25;
      cl.isCharged = true;
    }
    surviving.push(cl);
  }
  state.cloudlets = surviving;

  // Menzildeki düşman bulutlarına basınç darbesi (-14 kütle)
  for (const other of state.clouds) {
    if (other.id === cloud.id || other.owner === cloud.owner || other.owner === "neutral") {
      continue;
    }
    const d = Math.hypot(other.x - cloud.x, other.y - cloud.y);
    if (d <= SUPERCELL_SHOCKWAVE_RADIUS) {
      other.mass = Math.max(1, other.mass - 14);
      other.stage = getCloudStage(other.mass);
      other.pulse = 0.8;
      addParticles(state, other.x, other.y, FACTION_META[cloud.owner].primary, 10, 110);
    }
  }

  addCallout(
    state,
    cloud.x,
    cloud.y - 54,
    "BAROMETRİK ŞOK DALGASI!",
    FACTION_META[cloud.owner].light
  );
  if (cloud.owner === "player") {
    state.stats.shockwavesFired += 1;
  }
  events.push({ type: "shockwave", owner: cloud.owner });
  return events;
}

function stepAiBots(state: CumulusGameState, dt: number, events: GameEvent[]) {
  const cadence =
    state.difficulty === "calm"
      ? 2.25
      : state.difficulty === "storm"
        ? 1.35
        : 0.85;

  const botFactions: FactionId[] = ["amber", "crimson", "emerald"];
  for (const bot of botFactions) {
    if (state.aiTimers[bot] === undefined) continue;
    state.aiTimers[bot] -= dt;
    if (state.aiTimers[bot] > 0) continue;
    state.aiTimers[bot] = cadence * (0.82 + Math.random() * 0.36);

    const myClouds = state.clouds.filter((c) => c.owner === bot);
    if (myClouds.length === 0) continue;

    // Süper Hücre şok dalgası hazırsa ve yakın tehdit varsa tetikle
    for (const sc of myClouds) {
      if (
        sc.stage === "supercell" &&
        sc.mass >= SUPERCELL_SHOCKWAVE_MIN_MASS &&
        sc.shockwaveTimer <= 0
      ) {
        const nearbyHostiles = state.cloudlets.filter(
          (cl) =>
            cl.owner !== bot &&
            Math.hypot(cl.x - sc.x, cl.y - sc.y) < SUPERCELL_SHOCKWAVE_RADIUS * 0.78
        ).length;
        if (nearbyHostiles >= 5) {
          events.push(...triggerSupercellShockwave(state, sc.id));
        }
      }
    }

    // 1. KIZIL SİKLON (Evrimci): Yeterince bulutu varsa en güçlü merkezini besleyip Cb/Supercell kurar!
    if (bot === "crimson" && myClouds.length >= 2) {
      const sorted = [...myClouds].sort((a, b) => b.mass - a.mass);
      const core = sorted[0];
      const feeder = sorted.find(
        (c) => c.id !== core.id && c.mass >= 24 && c.mass < 60
      );
      if (core.mass >= 25 && core.mass < 105 && feeder && Math.random() < 0.55) {
        events.push(...launchCloudlets(state, [feeder.id], core.id, 0.55));
        continue;
      }
    }

    // 2. Genel taktik hedef puanlama (kişiliğe göre)
    const attackers = myClouds.filter((c) => c.mass >= 16);
    if (attackers.length === 0) continue;

    const candidates = state.clouds.filter((c) => c.owner !== bot);
    if (candidates.length === 0) continue;

    let bestScore = -Infinity;
    let bestSources: number[] = [];
    let bestTarget: CloudNode | null = null;

    for (const target of candidates) {
      // En yakın 1-2 saldırgan bulutu seç
      const nearAttackers = [...attackers]
        .sort(
          (a, b) =>
            Math.hypot(a.x - target.x, a.y - target.y) -
            Math.hypot(b.x - target.x, b.y - target.y)
        )
        .slice(0, state.difficulty === "supercell" ? 3 : 2);

      const availableMass = nearAttackers.reduce(
        (acc, c) => acc + Math.floor(c.mass * 0.55),
        0
      );
      const requiredMass = target.mass * (target.owner === "neutral" ? 1.15 : 1.28);
      if (availableMass < requiredMass) continue;

      const avgDist =
        nearAttackers.reduce(
          (acc, c) => acc + Math.hypot(c.x - target.x, c.y - target.y),
          0
        ) / nearAttackers.length;

      let score = 220 - avgDist * 0.45 - target.mass * 2.2;
      if (target.kind === "thermal") score += 95;
      if (target.kind === "ice") score += 65;

      if (bot === "amber") {
        // Hızlı yayılımcı: tarafsız bulutlara öncelik
        if (target.owner === "neutral") score += 75;
      } else if (bot === "emerald") {
        // Fırsatçı: zayıf rakip bulutlarına (özellikle <20 kütle) öncelik
        if (target.owner !== "neutral" && target.mass <= 22) score += 110;
      } else if (bot === "crimson") {
        // Evrimci: yüksek değerli rakiplere güçlü dalga
        if (target.owner !== "neutral") score += 45;
      }

      if (score > bestScore) {
        bestScore = score;
        bestSources = nearAttackers.map((c) => c.id);
        bestTarget = target;
      }
    }

    if (bestTarget && bestSources.length > 0) {
      const ratio = state.difficulty === "calm" ? 0.5 : 0.6;
      events.push(...launchCloudlets(state, bestSources, bestTarget.id, ratio));
    }
  }
}

/**
 * Ana simülasyon adımı (dt saniye cinsinden; sabit 60 FPS veya requestAnimationFrame delta).
 */
export function stepCumulusGame(
  state: CumulusGameState,
  rawDt: number
): GameEvent[] {
  const events: GameEvent[] = [];
  const dt = Math.min(0.05, Math.max(0.001, rawDt));

  // Görsel efektlerin ömrünü her zaman güncelle (zafer ekranında da donmasın)
  state.shake = Math.max(0, state.shake - dt * 26);

  state.bolts = state.bolts
    .map((b) => ({ ...b, life: b.life - dt }))
    .filter((b) => b.life > 0);

  state.shockwaves = state.shockwaves
    .map((sw) => {
      const nextLife = sw.life - dt;
      const prog = 1 - Math.max(0, nextLife) / sw.maxLife;
      return {
        ...sw,
        life: nextLife,
        radius: 35 + (sw.maxRadius - 35) * prog
      };
    })
    .filter((sw) => sw.life > 0);

  state.particles = state.particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vx: p.vx * 0.94,
      vy: p.vy * 0.94,
      life: p.life - dt
    }))
    .filter((p) => p.life > 0);

  state.callouts = state.callouts
    .map((c) => ({ ...c, y: c.y - dt * 24, life: c.life - dt }))
    .filter((c) => c.life > 0);

  if (state.status !== "playing") {
    return events;
  }

  state.stats.elapsedSec += dt;

  // Değişken Cephe rüzgar modu: her 32 saniyede bir yön değişimi
  if (state.windMode === "dynamic") {
    state.windShiftTimer -= dt;
    if (state.windShiftTimer <= 0) {
      state.windShiftTimer = 32;
      state.windDirDeg = (state.windDirDeg + 70 + Math.floor(Math.random() * 90)) % 360;
      state.windKmh = 14 + Math.floor(Math.random() * 24);
      addCallout(
        state,
        ARENA_WIDTH / 2,
        66,
        `CEPHE DÖNDÜ · ${state.windKmh} km/s`,
        "#7dd3fc"
      );
    }
  }

  // 1. Bulut yoğunlaşması, besleme hatları ve Kümülonimbus/Süper Hücre yıldırım savunması
  for (const cloud of state.clouds) {
    cloud.pulse = Math.max(0, cloud.pulse - dt * 2.4);
    if (cloud.shockwaveTimer > 0) {
      cloud.shockwaveTimer = Math.max(0, cloud.shockwaveTimer - dt);
    }

    if (cloud.owner === "neutral") {
      cloud.supplyTargetId = null;
      continue;
    }

    const meta = STAGE_META[cloud.stage];
    const thermalMult = cloud.kind === "thermal" ? 2.0 : 1.0;

    if (cloud.mass < cloud.maxMass) {
      const prevStage = cloud.stage;
      cloud.mass = Math.min(
        cloud.maxMass,
        cloud.mass + meta.prodRate * thermalMult * dt
      );
      const nextStage = getCloudStage(cloud.mass);
      if (nextStage !== prevStage) {
        cloud.stage = nextStage;
        handleEvolution(state, cloud, prevStage, nextStage, events);
      }
    }

    // Sürekli Besleme Hattı pompası
    if (cloud.supplyTargetId !== null) {
      const dst = state.clouds.find((c) => c.id === cloud.supplyTargetId);
      if (!dst || dst.owner !== cloud.owner) {
        cloud.supplyTargetId = null;
      } else {
        cloud.supplyTimer -= dt;
        if (cloud.supplyTimer <= 0 && cloud.mass >= 12) {
          cloud.supplyTimer = 2.0;
          events.push(...launchCloudlets(state, [cloud.id], dst.id, 0.3));
        }
      }
    }

    // Kümülonimbus (Cb) & Süper Hücre Otomatik Yıldırım Savunması
    if (meta.lightningCooldown > 0) {
      cloud.lightningTimer -= dt;
      if (cloud.lightningTimer <= 0) {
        const hostileInRange = state.cloudlets
          .filter(
            (cl) =>
              cl.owner !== cloud.owner &&
              Math.hypot(cl.x - cloud.x, cl.y - cloud.y) <= meta.lightningRange
          )
          .sort(
            (a, b) =>
              Math.hypot(a.x - cloud.x, a.y - cloud.y) -
              Math.hypot(b.x - cloud.x, b.y - cloud.y)
          )
          .slice(0, meta.lightningTargets);

        if (hostileInRange.length > 0) {
          cloud.lightningTimer = meta.lightningCooldown;
          const zappedIds = new Set<number>();
          for (const targetCl of hostileInRange) {
            zappedIds.add(targetCl.id);
            state.bolts.push({
              id: state.nextId++,
              owner: cloud.owner,
              x1: cloud.x,
              y1: cloud.y,
              x2: targetCl.x,
              y2: targetCl.y,
              life: 0.22,
              maxLife: 0.22,
              points: makeJaggedBolt(cloud.x, cloud.y, targetCl.x, targetCl.y)
            });
            addParticles(state, targetCl.x, targetCl.y, "#e0f2fe", 6, 120);
          }
          state.cloudlets = state.cloudlets.filter((cl) => !zappedIds.has(cl.id));
          if (cloud.owner === "player") {
            state.stats.lightningZaps += hostileInRange.length;
          }
          state.shake = Math.max(state.shake, 2.5);
          events.push({ type: "lightning", owner: cloud.owner });
        } else {
          cloud.lightningTimer = 0.25;
        }
      }
    }
  }

  // 2. Bulutçuk hareketi (rüzgar desteği + hedef güdümü) ve hedefe varış
  const cloudById = new Map(state.clouds.map((c) => [c.id, c]));
  const remainingCloudlets: Cloudlet[] = [];

  for (const cl of state.cloudlets) {
    cl.age += dt;
    const target = cloudById.get(cl.targetId);
    if (!target) continue;

    const dx = target.x - cl.x;
    const dy = target.y - cl.y;
    const dist = Math.hypot(dx, dy);
    const hitRadius = getCloudRadius(target.mass, target.kind) * 0.72;

    if (dist <= hitRadius) {
      applyCloudletImpact(state, cl, target, events);
      continue;
    }

    const windMult = computeWindSpeedMultiplier(dx, dy, state.windKmh, state.windDirDeg);
    const desiredSpeed = cl.speedBase * windMult;
    const desiredVx = (dx / Math.max(1, dist)) * desiredSpeed;
    const desiredVy = (dy / Math.max(1, dist)) * desiredSpeed;

    // Yumuşak kıvrımlı atmosfer güdümü
    const steer = Math.min(1, dt * 6.5);
    cl.vx += (desiredVx - cl.vx) * steer;
    cl.vy += (desiredVy - cl.vy) * steer;
    cl.x += cl.vx * dt;
    cl.y += cl.vy * dt;

    remainingCloudlets.push(cl);
  }
  state.cloudlets = remainingCloudlets;

  // 3. Havada Bulutçuk Çarpışması (karşıt taraflar havada çarpışıp birbirini eritir!)
  const deadIds = new Set<number>();
  let clashHappened = false;
  for (let i = 0; i < state.cloudlets.length; i++) {
    const a = state.cloudlets[i];
    if (deadIds.has(a.id)) continue;
    for (let j = i + 1; j < state.cloudlets.length; j++) {
      const b = state.cloudlets[j];
      if (a.owner === b.owner || deadIds.has(b.id)) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx * dx + dy * dy <= 196) {
        // 14px çarpışma yarıçapı
        const powA = a.payload * a.powerMult;
        const powB = b.payload * b.powerMult;
        if (Math.abs(powA - powB) < 0.35) {
          deadIds.add(a.id);
          deadIds.add(b.id);
        } else if (powA > powB) {
          a.payload = (powA - powB) / a.powerMult;
          deadIds.add(b.id);
        } else {
          b.payload = (powB - powA) / b.powerMult;
          deadIds.add(a.id);
        }
        addParticles(state, (a.x + b.x) / 2, (a.y + b.y) / 2, "#f8fafc", 4, 80);
        clashHappened = true;
        break;
      }
    }
  }
  if (deadIds.size > 0) {
    state.cloudlets = state.cloudlets.filter((c) => !deadIds.has(c.id));
  }
  if (clashHappened) {
    events.push({ type: "clash" });
  }

  // 4. Rakip AI Bot Kararları
  stepAiBots(state, dt, events);

  // 5. Zafer / Yenilgi Kontrolü
  const playerHasClouds = state.clouds.some((c) => c.owner === "player");
  const playerHasCloudlets = state.cloudlets.some((c) => c.owner === "player");
  const enemyHasClouds = state.clouds.some(
    (c) => c.owner !== "player" && c.owner !== "neutral"
  );
  const enemyHasCloudlets = state.cloudlets.some((c) => c.owner !== "player");

  if (!enemyHasClouds && !enemyHasCloudlets) {
    state.status = "victory";
    events.push({ type: "victory" });
  } else if (!playerHasClouds && !playerHasCloudlets) {
    state.status = "defeat";
    events.push({ type: "defeat" });
  }

  return events;
}

function handleEvolution(
  state: CumulusGameState,
  cloud: CloudNode,
  prevStage: CloudStage,
  nextStage: CloudStage,
  events: GameEvent[]
) {
  if (STAGE_ORDER[nextStage] <= STAGE_ORDER[prevStage]) return;
  cloud.pulse = 1.0;

  if (nextStage === "cb" || nextStage === "supercell") {
    state.shake = Math.max(state.shake, nextStage === "supercell" ? 7 : 4.5);
    addParticles(
      state,
      cloud.x,
      cloud.y,
      FACTION_META[cloud.owner].light,
      nextStage === "supercell" ? 22 : 14,
      140
    );
    addCallout(
      state,
      cloud.x,
      cloud.y - 46,
      nextStage === "supercell" ? "SÜPER HÜCRE!" : "FIRTINA BULUTU!",
      FACTION_META[cloud.owner].primary
    );
    if (cloud.owner === "player") {
      if (STAGE_ORDER[nextStage] > STAGE_ORDER[state.stats.peakStage]) {
        state.stats.peakStage = nextStage;
      }
      if (nextStage === "supercell") {
        state.stats.supercellsFormed += 1;
      }
    }
    events.push({ type: "evolve", owner: cloud.owner, stage: nextStage, cloudId: cloud.id });
  } else if (
    cloud.owner === "player" &&
    STAGE_ORDER[nextStage] > STAGE_ORDER[state.stats.peakStage]
  ) {
    state.stats.peakStage = nextStage;
  }
}

function applyCloudletImpact(
  state: CumulusGameState,
  cl: Cloudlet,
  target: CloudNode,
  events: GameEvent[]
) {
  const prevStage = target.stage;

  if (target.owner === cl.owner) {
    // Kendi bulutunu besle -> büyür ve Fırtına Bulutu'na / Süper Hücre'ye evrimleşir!
    target.mass = Math.min(target.maxMass + 25, target.mass + cl.payload);
    target.pulse = Math.max(target.pulse, 0.35);
    const nextStage = getCloudStage(target.mass);
    target.stage = nextStage;
    handleEvolution(state, target, prevStage, nextStage, events);
    events.push({ type: "reinforce", owner: cl.owner, cloudId: target.id });
    return;
  }

  // Saldırı: güç çarpanıyla kütleyi erit
  const damage = cl.payload * cl.powerMult;
  target.mass -= damage;
  target.pulse = Math.max(target.pulse, 0.55);

  if (target.mass < 0) {
    const previousOwner = target.owner;
    target.owner = cl.owner;
    target.mass = Math.max(1, Math.abs(target.mass));
    target.supplyTargetId = null;
    target.stage = getCloudStage(target.mass);
    target.pulse = 1.0;

    addParticles(state, target.x, target.y, FACTION_META[cl.owner].primary, 16, 125);
    if (cl.owner === "player") {
      state.stats.cloudsCaptured += 1;
      if (target.kind === "thermal") {
        addCallout(state, target.x, target.y - 36, "+TERMAL 2×", "#fbbf24");
      } else if (target.kind === "ice") {
        addCallout(state, target.x, target.y - 36, "+DOLU ÇEKİRDEĞİ", "#7dd3fc");
      }
    }
    events.push({
      type: "capture",
      owner: cl.owner,
      previousOwner,
      cloudId: target.id
    });
  } else {
    target.stage = getCloudStage(target.mass);
    addParticles(state, cl.x, cl.y, FACTION_META[cl.owner].light, 2, 60);
  }
}

export function computeFactionShares(
  state: CumulusGameState
): Array<{ faction: FactionId; mass: number; pct: number }> {
  const totals: Record<FactionId, number> = {
    player: 0,
    amber: 0,
    crimson: 0,
    emerald: 0,
    neutral: 0
  };
  for (const c of state.clouds) {
    totals[c.owner] += c.mass;
  }
  for (const cl of state.cloudlets) {
    totals[cl.owner] += cl.payload;
  }
  const activeFactions: FactionId[] = ["player", "amber", "crimson", "emerald"];
  const grandTotal = Math.max(
    1,
    activeFactions.reduce((acc, f) => acc + totals[f], 0)
  );
  return activeFactions
    .filter((f) => totals[f] > 0.1 || f === "player")
    .map((f) => ({
      faction: f,
      mass: Math.round(totals[f]),
      pct: Math.round((totals[f] / grandTotal) * 100)
    }));
}

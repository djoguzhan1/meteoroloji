"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  ChevronUp,
  CloudLightning,
  Flame,
  Link2,
  Lock,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Send,
  Snowflake,
  Sparkles,
  Thermometer,
  Trophy,
  Volume2,
  VolumeX,
  Wind,
  Zap
} from "lucide-react";
import { useWeatherData } from "@/context/WeatherContext";
import { areLocationsEquivalent } from "@/lib/forecast-resilience";
import { resolveProvinceCode } from "@/lib/provinces/geo-adm1-resolver";
import type { TrProvinceCode } from "@/lib/provinces/types";
import {
  ATMOS_STORAGE_KEYS,
  formatElevation,
  formatPressure,
  formatTemperature,
  formatWindSpeed,
  readMigratedStorageItem,
  type GeoLocation,
  type UnitSystem,
  type WeatherBundle
} from "@/lib/weather-client";
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  CUMULUS_STAGES,
  FACTION_META,
  STAGE_META,
  SUPERCELL_SHOCKWAVE_MIN_MASS,
  computeFactionShares,
  createCumulusGame,
  getCloudRadius,
  launchCloudlets,
  stepCumulusGame,
  toggleSupplyLine,
  triggerSupercellShockwave,
  type CloudNode,
  type CloudStage,
  type CumulusGameState,
  type DifficultyKey,
  type FactionId,
  type GameEvent,
  type WindMode
} from "@/lib/cumulus-engine";
import { cumulusAudio } from "@/lib/cumulus-audio";
import {
  computeArenaTransform,
  createAtmosphericVisualState,
  renderCumulusArena,
  type AtmosphericVisualState
} from "@/lib/cumulus-renderer";

const CumulusIntro3D = dynamic(() => import("./CumulusIntro3D"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#061224] font-mono text-xs tracking-widest text-sky-200/80">
      3D SÜPER HÜCRE SAHNESİ HAZIRLANIYOR...
    </div>
  )
});

export type AutoCumulusStageId =
  | "marmara"
  | "bogaz"
  | "ege"
  | "anadolu"
  | "akdeniz";

const VALID_AUTO_STAGE_IDS = new Set<AutoCumulusStageId>([
  "marmara",
  "bogaz",
  "ege",
  "anadolu",
  "akdeniz"
]);

/**
 * 81 İl Deterministik Cumulus Cephe Eşleşme Tablosu
 * Sunucu tarafı `resolveCumulusStageForProvince` (`lib/provinces/registry.ts`) ile %100 birebir uyumludur;
 * istemci paketini şişirmeden şehir geçişi anında (henüz API yanıtı gelmeden bile) sıfır gecikmeyle doğru sahneyi seçer.
 */
export const TR_PROVINCE_CUMULUS_STAGE_MAP: Readonly<
  Record<TrProvinceCode, AutoCumulusStageId>
> = Object.freeze({
  "TR-01": "akdeniz",
  "TR-02": "anadolu",
  "TR-03": "ege",
  "TR-04": "anadolu",
  "TR-05": "anadolu",
  "TR-06": "anadolu",
  "TR-07": "akdeniz",
  "TR-08": "marmara",
  "TR-09": "ege",
  "TR-10": "marmara",
  "TR-11": "marmara",
  "TR-12": "anadolu",
  "TR-13": "anadolu",
  "TR-14": "anadolu",
  "TR-15": "akdeniz",
  "TR-16": "marmara",
  "TR-17": "bogaz",
  "TR-18": "anadolu",
  "TR-19": "anadolu",
  "TR-20": "ege",
  "TR-21": "anadolu",
  "TR-22": "marmara",
  "TR-23": "anadolu",
  "TR-24": "anadolu",
  "TR-25": "anadolu",
  "TR-26": "anadolu",
  "TR-27": "anadolu",
  "TR-28": "marmara",
  "TR-29": "anadolu",
  "TR-30": "anadolu",
  "TR-31": "akdeniz",
  "TR-32": "akdeniz",
  "TR-33": "akdeniz",
  "TR-34": "bogaz",
  "TR-35": "ege",
  "TR-36": "anadolu",
  "TR-37": "marmara",
  "TR-38": "anadolu",
  "TR-39": "marmara",
  "TR-40": "anadolu",
  "TR-41": "marmara",
  "TR-42": "anadolu",
  "TR-43": "ege",
  "TR-44": "anadolu",
  "TR-45": "ege",
  "TR-46": "akdeniz",
  "TR-47": "anadolu",
  "TR-48": "ege",
  "TR-49": "anadolu",
  "TR-50": "anadolu",
  "TR-51": "anadolu",
  "TR-52": "marmara",
  "TR-53": "marmara",
  "TR-54": "marmara",
  "TR-55": "marmara",
  "TR-56": "anadolu",
  "TR-57": "marmara",
  "TR-58": "anadolu",
  "TR-59": "marmara",
  "TR-60": "anadolu",
  "TR-61": "marmara",
  "TR-62": "anadolu",
  "TR-63": "anadolu",
  "TR-64": "ege",
  "TR-65": "anadolu",
  "TR-66": "anadolu",
  "TR-67": "marmara",
  "TR-68": "anadolu",
  "TR-69": "anadolu",
  "TR-70": "anadolu",
  "TR-71": "anadolu",
  "TR-72": "anadolu",
  "TR-73": "anadolu",
  "TR-74": "marmara",
  "TR-75": "anadolu",
  "TR-76": "anadolu",
  "TR-77": "marmara",
  "TR-78": "anadolu",
  "TR-79": "anadolu",
  "TR-80": "akdeniz",
  "TR-81": "anadolu"
});

const COMPASS_TR = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"] as const;

export function degreesToCompassTr(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  return COMPASS_TR[Math.round(norm / 45) % 8];
}

/**
 * Sıkı şehir-bundle doğrulaması:
 * Şehir değiştirildiğinde önceki şehrin rüzgar, sıcaklık, basınç veya CAPE değerlerinin
 * yeni şehre sızmasını (%0 cross-city leakage) matematiksel olarak engeller.
 */
export function isBundleMatchedToActiveLocation(
  bundle: WeatherBundle | null | undefined,
  activeLocation: GeoLocation,
  resolvedProvinceCode?: string
): bundle is WeatherBundle {
  if (!bundle) return false;
  if (!areLocationsEquivalent(bundle.location, activeLocation, 0.045)) {
    return false;
  }

  const targetProv =
    resolvedProvinceCode ??
    resolveProvinceCode({
      lat: activeLocation.lat,
      lon: activeLocation.lon,
      admin1: activeLocation.admin1,
      countryCode: activeLocation.countryCode,
      explicitProvinceCode: activeLocation.provinceCode
    }).provinceCode;

  if (targetProv !== "GLOBAL") {
    if (
      bundle.provinceSummary?.provinceCode &&
      bundle.provinceSummary.provinceCode !== targetProv
    ) {
      return false;
    }
    if (
      bundle.location.provinceCode &&
      bundle.location.provinceCode !== targetProv
    ) {
      return false;
    }
  }

  if (
    activeLocation.provinceCode &&
    bundle.location.provinceCode &&
    activeLocation.provinceCode !== bundle.location.provinceCode
  ) {
    return false;
  }

  return true;
}

/**
 * Seçili şehir için Cumulus sahne kimliğini çözer:
 * 1. Doğrulanmış `matchedBundle.provinceSummary.cumulusStageId` varsa doğrudan onu kullanır.
 * 2. Türkiye içi 81 il için topolojik ADM1 çözücü (`TR-01`..`TR-81`) üzerinden sahneyi belirler.
 * 3. Yurt dışı (`GLOBAL`) şehirler için irtifa ve enlem rejimine göre deterministik sahne döndürür.
 */
export function resolveAutoCumulusStageId(
  activeLocation: GeoLocation,
  matchedBundle?: WeatherBundle | null,
  resolvedProvinceCode?: string
): AutoCumulusStageId {
  const summaryStage = matchedBundle?.provinceSummary?.cumulusStageId;
  if (summaryStage && VALID_AUTO_STAGE_IDS.has(summaryStage)) {
    return summaryStage;
  }

  const prov =
    resolvedProvinceCode ??
    resolveProvinceCode({
      lat: activeLocation.lat,
      lon: activeLocation.lon,
      admin1: activeLocation.admin1,
      countryCode: activeLocation.countryCode,
      explicitProvinceCode: activeLocation.provinceCode
    }).provinceCode;

  if (prov !== "GLOBAL" && prov in TR_PROVINCE_CUMULUS_STAGE_MAP) {
    return TR_PROVINCE_CUMULUS_STAGE_MAP[prov as TrProvinceCode];
  }

  if ((activeLocation.elevation ?? 0) >= 650) {
    return "anadolu";
  }
  if (Math.abs(activeLocation.lat) < 37.5) {
    return "akdeniz";
  }
  return "marmara";
}

export type LiveThermodynamicBriefing = {
  cityName: string;
  provinceBadge: string | null;
  elevationM: number | null;
  elevationText: string | null;
  hasLiveTelemetry: boolean;
  tempText: string | null;
  pressureText: string | null;
  capeJkg: number | null;
  capeText: string | null;
  cloudBaseMslM: number | null;
  cloudBaseText: string | null;
  freezingLevelM: number | null;
  freezingLevelLabel: string;
  freezingLevelText: string | null;
  windSpeedKmh: number | null;
  windDirDeg: number | null;
  windCompassTr: string | null;
  windText: string | null;
};

export function buildLiveThermodynamicBriefing(params: {
  activeLocation: GeoLocation;
  matchedBundle: WeatherBundle | null;
  unit: UnitSystem;
  provinceCode: string;
  provinceName?: string;
}): LiveThermodynamicBriefing {
  const { activeLocation, matchedBundle, unit, provinceCode, provinceName } = params;

  const cityName =
    activeLocation.name?.trim() ||
    matchedBundle?.location.name?.trim() ||
    provinceName ||
    "Seçili Konum";

  const provinceBadge =
    matchedBundle?.provinceSummary?.provinceCode ??
    (provinceCode !== "GLOBAL" ? provinceCode : null);

  const rawElev =
    typeof activeLocation.elevation === "number" && Number.isFinite(activeLocation.elevation)
      ? activeLocation.elevation
      : typeof matchedBundle?.location.elevation === "number" &&
          Number.isFinite(matchedBundle.location.elevation)
        ? matchedBundle.location.elevation
        : typeof matchedBundle?.provinceSummary?.canonicalCenter.elevationM === "number" &&
            Number.isFinite(matchedBundle.provinceSummary.canonicalCenter.elevationM)
          ? matchedBundle.provinceSummary.canonicalCenter.elevationM
          : null;

  const elevationText = rawElev !== null ? formatElevation(rawElev, unit) : null;
  const freezingLevelLabel = unit === "imperial" ? "Donma (32°F)" : "Donma (0°C)";

  if (!matchedBundle) {
    return {
      cityName,
      provinceBadge,
      elevationM: rawElev,
      elevationText,
      hasLiveTelemetry: false,
      tempText: null,
      pressureText: null,
      capeJkg: null,
      capeText: null,
      cloudBaseMslM: null,
      cloudBaseText: null,
      freezingLevelM: null,
      freezingLevelLabel,
      freezingLevelText: null,
      windSpeedKmh: null,
      windDirDeg: null,
      windCompassTr: null,
      windText: null
    };
  }

  const current = matchedBundle.current;
  const tempText = formatTemperature(current.temperature, unit, {
    decimals: 0,
    showUnit: true
  });
  const pressureText = formatPressure(current.pressure, unit);

  const rawCape =
    matchedBundle.nativeConvective?.cape ?? matchedBundle.hourly?.[0]?.cape ?? null;
  const capeJkg =
    typeof rawCape === "number" && Number.isFinite(rawCape)
      ? Math.max(0, Math.round(rawCape))
      : null;
  const capeText = `${capeJkg ?? 0} J/kg`;

  // Espy termodinamik yoğunlaşma seviyesi (LCL AGL -> MSL)
  const dewDepressionC = Math.max(0, current.temperature - current.dewPoint);
  const lclAglM = Math.max(120, Math.round(125 * dewDepressionC));
  const cloudBaseMslM = Math.round(Math.max(0, rawElev ?? 0) + lclAglM);
  const cloudBaseText = formatElevation(cloudBaseMslM, unit);

  const rawFreezingM =
    matchedBundle.nativeConvective?.freezingLevelM ??
    matchedBundle.hourly?.[0]?.freezingLevelM ??
    null;
  const freezingLevelM =
    typeof rawFreezingM === "number" && Number.isFinite(rawFreezingM)
      ? Math.round(rawFreezingM)
      : null;
  const freezingLevelText =
    freezingLevelM !== null ? formatElevation(freezingLevelM, unit) : null;

  const windCompassTr = degreesToCompassTr(current.windDirection);
  const windText = `${formatWindSpeed(current.windSpeed, unit)} ${windCompassTr}`;

  return {
    cityName,
    provinceBadge,
    elevationM: rawElev,
    elevationText,
    hasLiveTelemetry: true,
    tempText,
    pressureText,
    capeJkg,
    capeText,
    cloudBaseMslM,
    cloudBaseText,
    freezingLevelM,
    freezingLevelLabel,
    freezingLevelText,
    windSpeedKmh: current.windSpeed,
    windDirDeg: current.windDirection,
    windCompassTr,
    windText
  };
}

type MedalTier = "gold" | "silver" | "bronze";

type StageRecord = {
  bestSec: number;
  medal: MedalTier;
  wins: number;
};

type CareerStorage = {
  stages: Record<string, StageRecord>;
  totalWins: number;
  totalSupercells: number;
};

const CAREER_STORAGE_KEY = ATMOS_STORAGE_KEYS.cumulusCareer;

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function computeMedal(elapsedSec: number, difficulty: DifficultyKey): MedalTier {
  const goldLimit = difficulty === "supercell" ? 135 : difficulty === "storm" ? 105 : 85;
  const silverLimit = difficulty === "supercell" ? 210 : difficulty === "storm" ? 165 : 135;
  if (elapsedSec <= goldLimit) return "gold";
  if (elapsedSec <= silverLimit) return "silver";
  return "bronze";
}

const MEDAL_RANK: Record<MedalTier, number> = {
  bronze: 1,
  silver: 2,
  gold: 3
};

const MEDAL_LABEL: Record<MedalTier, string> = {
  gold: "Altın Cephe",
  silver: "Gümüş Cephe",
  bronze: "Bronz Cephe"
};

type HudSnapshot = {
  status: CumulusGameState["status"];
  elapsedSec: number;
  windKmh: number;
  windDirDeg: number;
  shares: Array<{ faction: FactionId; mass: number; pct: number }>;
  readySupercellId: number | null;
  playerSupercellCount: number;
  playerCloudCount: number;
  stats: CumulusGameState["stats"];
};

function extractHud(state: CumulusGameState): HudSnapshot {
  const playerClouds = state.clouds.filter((c) => c.owner === "player");
  const readySupercell = playerClouds
    .filter(
      (c) =>
        c.stage === "supercell" &&
        c.mass >= SUPERCELL_SHOCKWAVE_MIN_MASS &&
        c.shockwaveTimer <= 0
    )
    .sort((a, b) => b.mass - a.mass)[0];

  return {
    status: state.status,
    elapsedSec: state.stats.elapsedSec,
    windKmh: state.windKmh,
    windDirDeg: state.windDirDeg,
    shares: computeFactionShares(state),
    readySupercellId: readySupercell?.id ?? null,
    playerSupercellCount: playerClouds.filter((c) => c.stage === "supercell").length,
    playerCloudCount: playerClouds.length,
    stats: { ...state.stats }
  };
}

type InteractionState = {
  dragging: boolean;
  isRightDrag: boolean;
  pointerX: number;
  pointerY: number;
  startX: number;
  startY: number;
  movedEnough: boolean;
  selectedIds: number[];
  hoveredCloudId: number | null;
  lastClickCloudId: number | null;
  lastClickAt: number;
};

function findCloudAt(clouds: CloudNode[], x: number, y: number, pad = 12): CloudNode | null {
  let closest: CloudNode | null = null;
  let bestDist = Infinity;
  for (const c of clouds) {
    const r = getCloudRadius(c.mass, c.kind) + pad;
    const d = Math.hypot(c.x - x, c.y - y);
    if (d <= r && d < bestDist) {
      closest = c;
      bestDist = d;
    }
  }
  return closest;
}

export default function CumulusGameView() {
  const { bundle, activeLocation, unit } = useWeatherData();

  const activeResolution = useMemo(
    () =>
      resolveProvinceCode({
        lat: activeLocation.lat,
        lon: activeLocation.lon,
        admin1: activeLocation.admin1,
        countryCode: activeLocation.countryCode,
        explicitProvinceCode: activeLocation.provinceCode
      }),
    [
      activeLocation.lat,
      activeLocation.lon,
      activeLocation.admin1,
      activeLocation.countryCode,
      activeLocation.provinceCode
    ]
  );

  // Yalnızca aktif seçili şehirle birebir eşleşen WeatherBundle kabul edilir (sıfır sızıntı!)
  const matchedBundle = useMemo(
    () =>
      isBundleMatchedToActiveLocation(
        bundle,
        activeLocation,
        activeResolution.provinceCode
      )
        ? bundle
        : null,
    [bundle, activeLocation, activeResolution.provinceCode]
  );

  const autoStageId = useMemo(
    () =>
      resolveAutoCumulusStageId(
        activeLocation,
        matchedBundle,
        activeResolution.provinceCode
      ),
    [activeLocation, matchedBundle, activeResolution.provinceCode]
  );

  const briefing = useMemo(
    () =>
      buildLiveThermodynamicBriefing({
        activeLocation,
        matchedBundle,
        unit,
        provinceCode: activeResolution.provinceCode,
        provinceName: activeResolution.provinceName
      }),
    [
      activeLocation,
      matchedBundle,
      unit,
      activeResolution.provinceCode,
      activeResolution.provinceName
    ]
  );

  const liveWindKmh = matchedBundle?.current.windSpeed;
  const liveWindDirDeg = matchedBundle?.current.windDirection;

  // `lockedStageId === null` iken sahne 81 il otomatik eşleşmesini takip eder; elle seçildiğinde kilitlenir.
  const [lockedStageId, setLockedStageId] = useState<string | null>(null);
  const stageId = lockedStageId ?? autoStageId;
  const isStageManuallyLocked = lockedStageId !== null;

  const [difficulty, setDifficulty] = useState<DifficultyKey>("storm");
  const [windMode, setWindMode] = useState<WindMode>("live");
  const [launchRatio, setLaunchRatio] = useState<number>(0.5);
  const [toolMode, setToolMode] = useState<"launch" | "supply">("launch");
  const [paused, setPaused] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [arenaLockIn, setArenaLockIn] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [career, setCareer] = useState<CareerStorage>({
    stages: {},
    totalWins: 0,
    totalSupercells: 0
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [initialGame] = useState<CumulusGameState>(() =>
    createCumulusGame({
      stageId: autoStageId,
      difficulty: "storm",
      windMode: "live",
      liveWindKmh,
      liveWindDirDeg
    })
  );
  const gameRef = useRef<CumulusGameState>(initialGame);
  const atmosRef = useRef<AtmosphericVisualState>(createAtmosphericVisualState());
  const interactionRef = useRef<InteractionState>({
    dragging: false,
    isRightDrag: false,
    pointerX: ARENA_WIDTH / 2,
    pointerY: ARENA_HEIGHT / 2,
    startX: 0,
    startY: 0,
    movedEnough: false,
    selectedIds: [],
    hoveredCloudId: null,
    lastClickCloudId: null,
    lastClickAt: 0
  });

  const launchRatioRef = useRef(launchRatio);
  const toolModeRef = useRef(toolMode);
  const pausedRef = useRef(paused);
  const showIntroRef = useRef(showIntro);
  const recordedOutcomeRef = useRef(false);
  const difficultyRef = useRef(difficulty);
  const windModeRef = useRef(windMode);
  const liveWindRef = useRef<{ kmh?: number; dir?: number }>({
    kmh: liveWindKmh,
    dir: liveWindDirDeg
  });

  const activeLocationKey = `${activeLocation.id}|${activeLocation.lat.toFixed(4)},${activeLocation.lon.toFixed(4)}|${activeLocation.elevation ?? ""}|${activeResolution.provinceCode}`;
  const prevSyncKeyRef = useRef(`${activeLocationKey}::${stageId}`);

  const [hud, setHud] = useState<HudSnapshot>(() => extractHud(initialGame));

  useEffect(() => {
    launchRatioRef.current = launchRatio;
  }, [launchRatio]);

  useEffect(() => {
    toolModeRef.current = toolMode;
  }, [toolMode]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    showIntroRef.current = showIntro;
  }, [showIntro]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    windModeRef.current = windMode;
  }, [windMode]);

  useEffect(() => {
    liveWindRef.current = { kmh: liveWindKmh, dir: liveWindDirDeg };
  }, [liveWindKmh, liveWindDirDeg]);

  useEffect(() => {
    cumulusAudio.setEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    return () => {
      try {
        cumulusAudio.stopIntroAmbience(0.15);
      } catch {
        // ignore audio teardown errors
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = readMigratedStorageItem("cumulusCareer", window.localStorage);
        if (!raw) return;
        const parsed = JSON.parse(raw) as CareerStorage;
        if (parsed && typeof parsed === "object" && parsed.stages) {
          setCareer(parsed);
        }
      } catch {
        // ignore storage errors
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const persistVictory = useCallback((state: CumulusGameState) => {
    const medal = computeMedal(state.stats.elapsedSec, state.difficulty);
    const sec = Math.round(state.stats.elapsedSec);
    setCareer((prev) => {
      const existing = prev.stages[state.stageId];
      const nextRecord: StageRecord = {
        bestSec: existing ? Math.min(existing.bestSec, sec) : sec,
        medal:
          existing && MEDAL_RANK[existing.medal] > MEDAL_RANK[medal]
            ? existing.medal
            : medal,
        wins: (existing?.wins ?? 0) + 1
      };
      const next: CareerStorage = {
        stages: {
          ...prev.stages,
          [state.stageId]: nextRecord
        },
        totalWins: prev.totalWins + 1,
        totalSupercells: prev.totalSupercells + state.stats.supercellsFormed
      };
      try {
        window.localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const dispatchGameEvents = useCallback((events: GameEvent[]) => {
    for (const ev of events) {
      if (ev.type === "launch" && ev.owner === "player") {
        cumulusAudio.playLaunch(ev.count);
      } else if (ev.type === "reinforce" && ev.owner === "player") {
        cumulusAudio.playReinforce();
      } else if (ev.type === "capture") {
        cumulusAudio.playCapture(ev.owner === "player");
      } else if (ev.type === "lightning") {
        cumulusAudio.playLightning();
      } else if (ev.type === "evolve") {
        cumulusAudio.playEvolution(ev.stage === "supercell");
      } else if (ev.type === "shockwave") {
        cumulusAudio.playShockwave();
      } else if (ev.type === "victory") {
        cumulusAudio.playVictory(true);
      } else if (ev.type === "defeat") {
        cumulusAudio.playVictory(false);
      }
    }
  }, []);

  const resetGame = useCallback(
    (nextStageId = stageId, nextDiff = difficulty, nextWind = windMode) => {
      const next = createCumulusGame({
        stageId: nextStageId,
        difficulty: nextDiff,
        windMode: nextWind,
        liveWindKmh,
        liveWindDirDeg
      });
      gameRef.current = next;
      atmosRef.current = createAtmosphericVisualState();
      interactionRef.current.dragging = false;
      interactionRef.current.selectedIds = [];
      interactionRef.current.hoveredCloudId = null;
      recordedOutcomeRef.current = false;
      prevSyncKeyRef.current = `${activeLocationKey}::${nextStageId}`;
      setPaused(false);
      setHud(extractHud(next));
    },
    [stageId, difficulty, windMode, liveWindKmh, liveWindDirDeg, activeLocationKey]
  );

  // Şehir değiştiğinde veya otomatik sahne güncellendiğinde önceki şehrin rüzgar/bulut durumunu tamamen temizle
  useEffect(() => {
    const nextSyncKey = `${activeLocationKey}::${stageId}`;
    if (prevSyncKeyRef.current === nextSyncKey) return;
    prevSyncKeyRef.current = nextSyncKey;

    const next = createCumulusGame({
      stageId,
      difficulty: difficultyRef.current,
      windMode: windModeRef.current,
      liveWindKmh: liveWindRef.current.kmh,
      liveWindDirDeg: liveWindRef.current.dir
    });
    gameRef.current = next;
    atmosRef.current = createAtmosphericVisualState();
    interactionRef.current.dragging = false;
    interactionRef.current.selectedIds = [];
    interactionRef.current.hoveredCloudId = null;
    recordedOutcomeRef.current = false;

    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setPaused(false);
      setHud(extractHud(next));
    });
    return () => {
      active = false;
    };
  }, [activeLocationKey, stageId]);

  // Aktif şehrin canlı rüzgarı geldiğinde/güncellendiğinde hem oyun fiziğini hem Intro/Arena HUD'unu anında eşitle
  useEffect(() => {
    if (
      windMode === "live" &&
      typeof liveWindKmh === "number" &&
      typeof liveWindDirDeg === "number"
    ) {
      const clampedKmh = Math.max(4, Math.min(55, liveWindKmh));
      gameRef.current.windKmh = clampedKmh;
      gameRef.current.windDirDeg = liveWindDirDeg;

      let active = true;
      queueMicrotask(() => {
        if (!active) return;
        setHud((prev) =>
          prev.windKmh === clampedKmh && prev.windDirDeg === liveWindDirDeg
            ? prev
            : extractHud(gameRef.current)
        );
      });
      return () => {
        active = false;
      };
    }
  }, [windMode, liveWindKmh, liveWindDirDeg]);

  const handleManualStageSelect = useCallback(
    (nextId: string) => {
      setLockedStageId(nextId);
      resetGame(nextId, difficulty, windMode);
    },
    [difficulty, resetGame, windMode]
  );

  const handleUnlockAutoStage = useCallback(() => {
    setLockedStageId(null);
    resetGame(autoStageId, difficulty, windMode);
  }, [autoStageId, difficulty, resetGame, windMode]);

  const fireShockwave = useCallback(() => {
    const state = gameRef.current;
    const selected = interactionRef.current.selectedIds;
    const ready = state.clouds.filter(
      (c) =>
        c.owner === "player" &&
        c.stage === "supercell" &&
        c.mass >= SUPERCELL_SHOCKWAVE_MIN_MASS &&
        c.shockwaveTimer <= 0
    );
    if (ready.length === 0) return;

    const chosen =
      ready.find((c) => selected.includes(c.id)) ??
      ready.sort((a, b) => b.mass - a.mass)[0];
    const events = triggerSupercellShockwave(state, chosen.id);
    dispatchGameEvents(events);
    setHud(extractHud(state));
  }, [dispatchGameEvents]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showIntroRef.current) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "e" || e.key === "E") {
        fireShockwave();
      } else if (e.key === "r" || e.key === "R") {
        resetGame();
      } else if (e.key === "b" || e.key === "B") {
        setToolMode((m) => (m === "launch" ? "supply" : "launch"));
      } else if (e.key === "a" || e.key === "A") {
        interactionRef.current.selectedIds = gameRef.current.clouds
          .filter((c) => c.owner === "player")
          .map((c) => c.id);
      } else if (e.key === "1") {
        setLaunchRatio(0.5);
      } else if (e.key === "2") {
        setLaunchRatio(0.75);
      } else if (e.key === "3") {
        setLaunchRatio(0.95);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fireShockwave, resetGame]);

  // 60 FPS Simülasyon + 2D Arena Döngüsü (CumulusIntro3D açıkken tamamen durur; çift tuval çarpışması 0!)
  useEffect(() => {
    const canvas = canvasRef.current;
    let cssW = canvas?.clientWidth || 960;
    let cssH = canvas?.clientHeight || 580;

    const paintArenaOnce = (nowMs: number, dtSec: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const targetW = Math.max(320, Math.round(cssW * dpr));
      const targetH = Math.max(200, Math.round(cssH * dpr));
      if (c.width !== targetW || c.height !== targetH) {
        c.width = targetW;
        c.height = targetH;
      }
      const ctx = c.getContext("2d");
      if (ctx) {
        renderCumulusArena(
          ctx,
          targetW,
          targetH,
          gameRef.current,
          interactionRef.current,
          atmosRef.current,
          toolModeRef.current,
          launchRatioRef.current,
          nowMs / 1000,
          dtSec
        );
      }
    };

    const ro = canvas
      ? new ResizeObserver((entries) => {
          const r = entries[0]?.contentRect;
          if (r && r.width > 0 && r.height > 0) {
            cssW = r.width;
            cssH = r.height;
          }
        })
      : null;
    if (canvas && ro) ro.observe(canvas);

    // 3D Intro sahnesi tam ekranda aktifken arkadaki 2D oyun döngüsünü ve setHud'u çalıştırma!
    if (showIntro && !arenaLockIn) {
      paintArenaOnce(performance.now(), 0);
      return () => {
        ro?.disconnect();
      };
    }

    let rafId = 0;
    let lastTs = performance.now();
    let hudTimer = 0;

    const drawFrame = (now: number) => {
      if (document.visibilityState === "hidden") {
        lastTs = now;
        rafId = window.requestAnimationFrame(drawFrame);
        return;
      }

      const rawDt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      const state = gameRef.current;
      if (!pausedRef.current && !showIntroRef.current) {
        const events = stepCumulusGame(state, rawDt);
        if (events.length > 0) {
          dispatchGameEvents(events);
        }
        if (state.status === "victory" && !recordedOutcomeRef.current) {
          recordedOutcomeRef.current = true;
          persistVictory(state);
          setHud(extractHud(state));
        } else if (state.status === "defeat" && !recordedOutcomeRef.current) {
          recordedOutcomeRef.current = true;
          setHud(extractHud(state));
        }
      }

      if (interactionRef.current.selectedIds.length > 0) {
        interactionRef.current.selectedIds = interactionRef.current.selectedIds.filter((id) => {
          const cl = state.clouds.find((c) => c.id === id);
          return cl && cl.owner === "player";
        });
      }

      if (!showIntroRef.current) {
        hudTimer += rawDt;
        if (hudTimer >= 0.18) {
          hudTimer = 0;
          setHud(extractHud(state));
        }
      }

      paintArenaOnce(now, pausedRef.current || showIntroRef.current ? 0 : rawDt);
      rafId = window.requestAnimationFrame(drawFrame);
    };

    rafId = window.requestAnimationFrame(drawFrame);
    return () => {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, [arenaLockIn, dispatchGameEvents, persistVictory, showIntro, stageId, activeLocationKey]);

  const clientToArena = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 };
    const rect = canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = computeArenaTransform(
      Math.max(1, rect.width),
      Math.max(1, rect.height)
    );
    return {
      x: (clientX - rect.left - offsetX) / Math.max(0.001, scale),
      y: (clientY - rect.top - offsetY) / Math.max(0.001, scale)
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (gameRef.current.status !== "playing") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const { x, y } = clientToArena(e.clientX, e.clientY);
      const hit = findCloudAt(gameRef.current.clouds, x, y, 14);
      const inter = interactionRef.current;
      inter.pointerX = x;
      inter.pointerY = y;
      inter.startX = x;
      inter.startY = y;
      inter.movedEnough = false;
      inter.hoveredCloudId = hit?.id ?? null;

      const isRight = e.button === 2;
      inter.isRightDrag = isRight;

      if (hit && hit.owner === "player") {
        const now = performance.now();
        if (!isRight && inter.lastClickCloudId === hit.id && now - inter.lastClickAt < 340) {
          inter.selectedIds = gameRef.current.clouds
            .filter((c) => c.owner === "player")
            .map((c) => c.id);
          inter.dragging = true;
          inter.lastClickAt = 0;
          return;
        }
        inter.lastClickCloudId = hit.id;
        inter.lastClickAt = now;

        if (!inter.selectedIds.includes(hit.id)) {
          inter.selectedIds = [hit.id];
        }
        inter.dragging = true;
      } else if (hit && inter.selectedIds.length > 0 && !isRight) {
        const events =
          toolModeRef.current === "supply" && hit.owner === "player"
            ? []
            : launchCloudlets(
                gameRef.current,
                inter.selectedIds,
                hit.id,
                launchRatioRef.current
              );
        dispatchGameEvents(events);
        inter.selectedIds = [];
        inter.dragging = false;
      } else {
        inter.selectedIds = [];
        inter.dragging = false;
      }
    },
    [clientToArena, dispatchGameEvents]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = clientToArena(e.clientX, e.clientY);
      const inter = interactionRef.current;
      inter.pointerX = x;
      inter.pointerY = y;
      const hit = findCloudAt(gameRef.current.clouds, x, y, 14);
      inter.hoveredCloudId = hit?.id ?? null;

      if (inter.dragging) {
        if (Math.hypot(x - inter.startX, y - inter.startY) > 12) {
          inter.movedEnough = true;
        }
        if (
          hit &&
          hit.owner === "player" &&
          !inter.selectedIds.includes(hit.id) &&
          !inter.isRightDrag &&
          toolModeRef.current === "launch"
        ) {
          inter.selectedIds = [...inter.selectedIds, hit.id];
        }
      }
    },
    [clientToArena]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const inter = interactionRef.current;
      if (!inter.dragging) return;
      const { x, y } = clientToArena(e.clientX, e.clientY);
      const hit = findCloudAt(gameRef.current.clouds, x, y, 16);
      const state = gameRef.current;

      const sources = inter.selectedIds;
      const isSupplyAction = inter.isRightDrag || toolModeRef.current === "supply";

      if (hit && inter.movedEnough) {
        if (isSupplyAction) {
          let toggled = false;
          for (const srcId of sources) {
            if (toggleSupplyLine(state, srcId, hit.id)) {
              toggled = true;
            }
          }
          if (toggled) {
            cumulusAudio.playReinforce();
          }
          inter.selectedIds = [];
        } else {
          const launchSources = sources.filter((id) => id !== hit.id);
          if (launchSources.length > 0) {
            const events = launchCloudlets(
              state,
              launchSources,
              hit.id,
              launchRatioRef.current
            );
            dispatchGameEvents(events);
            inter.selectedIds = [];
          }
        }
      } else if (!inter.movedEnough && hit && hit.owner === "player") {
        if (isSupplyAction) {
          toggleSupplyLine(state, hit.id, hit.id);
          inter.selectedIds = [];
        }
      } else {
        inter.selectedIds = [];
      }

      inter.dragging = false;
      inter.isRightDrag = false;
      inter.movedEnough = false;
    },
    [clientToArena, dispatchGameEvents]
  );

  // Non-passive wheel listener on arena canvas so adjusting launch ratio never scrolls the page!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 4) return;
      const steps = [0.5, 0.75, 0.95];
      setLaunchRatio((curr) => {
        const idx = steps.indexOf(curr);
        const safeIdx = idx === -1 ? 0 : idx;
        const next =
          e.deltaY < 0
            ? Math.min(steps.length - 1, safeIdx + 1)
            : Math.max(0, safeIdx - 1);
        return steps[next];
      });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  const currentStage = useMemo(
    () => CUMULUS_STAGES.find((s) => s.id === stageId) ?? CUMULUS_STAGES[0],
    [stageId]
  );

  const autoStageMeta = useMemo(
    () => CUMULUS_STAGES.find((s) => s.id === autoStageId) ?? CUMULUS_STAGES[0],
    [autoStageId]
  );

  const nextStage = useMemo(() => {
    const idx = CUMULUS_STAGES.findIndex((s) => s.id === stageId);
    if (idx === -1 || idx >= CUMULUS_STAGES.length - 1) return CUMULUS_STAGES[0];
    return CUMULUS_STAGES[idx + 1];
  }, [stageId]);

  const formattedHudWind = `${formatWindSpeed(hud.windKmh, unit)} ${degreesToCompassTr(hud.windDirDeg)}`;

  const windBadgeText =
    windMode === "off"
      ? "Rüzgarsız"
      : windMode === "live"
        ? briefing.hasLiveTelemetry
          ? `Canlı ${briefing.cityName} · ${formattedHudWind}`
          : `${briefing.cityName} · Cephe Rüzgarı ${formattedHudWind}`
        : `Değişken Cephe · ${formattedHudWind}`;

  const earnedMedal =
    hud.status === "victory" ? computeMedal(hud.elapsedSec, difficulty) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-2.5 px-3 sm:px-5 lg:px-6">
      {/* Sinematik Panoramik Arena Çerçevesi (Introda temiz sinematik tam ekran, oyunda kompakt HUD) */}
      <section className="overflow-hidden rounded-2xl border border-sky-200/15 bg-[#060c18]/90 shadow-[0_28px_90px_rgba(0,0,0,0.72)] backdrop-blur-xl">
        {/* İnce Entegre Hakimiyet & Canlı Şehir Termodinamik Telemetri Üst Şeridi (Sadece oyun aktifken) */}
        {!showIntro && (
          <div className="border-b border-white/[0.08] bg-[#070d1b]/90 px-3.5 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/35 bg-sky-400/15 text-sky-300">
                  <CloudLightning className="h-4 w-4" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h1 className="font-display text-sm font-bold tracking-wider text-ink-primary sm:text-base">
                    CUMULUS · Bulut Savaşı
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-[11px] text-emerald-100">
                    <MapPin className="h-3 w-3 text-emerald-300" />
                    <span>{briefing.cityName}</span>
                    {briefing.provinceBadge && (
                      <span className="rounded bg-emerald-400/20 px-1 text-[10px] font-semibold text-emerald-200">
                        {briefing.provinceBadge}
                      </span>
                    )}
                    {briefing.elevationText && (
                      <span className="text-[10px] text-emerald-200/80">
                        · {briefing.elevationText}
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[11px] text-sky-200">
                    <span>{currentStage.name}</span>
                    {isStageManuallyLocked ? (
                      <Lock className="h-2.5 w-2.5 text-amber-300" aria-label="Elle kilitli sahne" />
                    ) : (
                      <span className="text-[9px] text-sky-300/80">OTO</span>
                    )}
                  </span>
                  {isStageManuallyLocked && (
                    <button
                      type="button"
                      onClick={handleUnlockAutoStage}
                      title={`${briefing.cityName} için otomatik cepheye (${autoStageMeta.name}) dön`}
                      className="inline-flex items-center gap-1 rounded-md border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-200 transition-colors hover:bg-emerald-500/25"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Oto: {autoStageMeta.name}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-primary">
                  <Wind className="h-3.5 w-3.5 text-sky-400" />
                  <span>{windBadgeText}</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-primary">
                  {formatClock(hud.elapsedSec)}
                </div>
                <div className="hidden sm:flex items-center gap-1 rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-mono text-[11px] text-amber-200">
                  <Trophy className="h-3 w-3 text-amber-400" />
                  <span>{career.totalWins} Zafer</span>
                </div>
              </div>
            </div>

            {/* Seçili Şehir Canlı Termodinamik Brifing Şeridi (Sıcaklık, CAPE, LCL Bulut Tabanı, Donma Sınırı, Basınç) */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-ink-secondary">
              {briefing.hasLiveTelemetry ? (
                <>
                  <span className="inline-flex items-center gap-1 text-ink-primary">
                    <Thermometer className="h-3 w-3 text-sky-300" />
                    <span>Sıcaklık:</span>
                    <strong className="text-sky-200">{briefing.tempText}</strong>
                  </span>
                  <span>
                    CAPE: <strong className="text-amber-300">{briefing.capeText}</strong>
                  </span>
                  <span>
                    Bulut Tabanı (LCL):{" "}
                    <strong className="text-sky-200">{briefing.cloudBaseText}</strong>
                  </span>
                  {briefing.freezingLevelText && (
                    <span>
                      {briefing.freezingLevelLabel}:{" "}
                      <strong className="text-cyan-200">{briefing.freezingLevelText}</strong>
                    </span>
                  )}
                  {briefing.pressureText && (
                    <span className="hidden md:inline">
                      Basınç: <strong className="text-ink-primary">{briefing.pressureText}</strong>
                    </span>
                  )}
                </>
              ) : (
                <span className="text-ink-muted">
                  {briefing.cityName} canlı termodinamik profili senkronize ediliyor...
                </span>
              )}
            </div>

            {/* İnce Hakimiyet Barı + Plazma Cephe Kıvılcımı */}
            <div className="mt-2 flex flex-col gap-1.5">
              <div className="relative flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                {hud.shares.map((s) => (
                  <div
                    key={s.faction}
                    style={{
                      width: `${Math.max(2, s.pct)}%`,
                      backgroundColor: FACTION_META[s.faction].primary
                    }}
                    className="h-full transition-all duration-300"
                  />
                ))}
                {(() => {
                  const pShare = hud.shares.find((s) => s.faction === "player")?.pct ?? 0;
                  if (pShare <= 3 || pShare >= 97) return null;
                  return (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 h-3.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                      style={{
                        left: `${pShare}%`,
                        boxShadow: "0 0 12px #38bdf8, 0 0 22px #f8fbff"
                      }}
                    />
                  );
                })()}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
                  {hud.shares.map((s) => {
                    const meta = FACTION_META[s.faction];
                    return (
                      <div key={s.faction} className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: meta.primary }}
                        />
                        <span className="font-medium text-ink-primary">{meta.name}</span>
                        <span className="font-mono text-ink-secondary">
                          {s.mass} · %{s.pct}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="font-mono text-ink-muted">
                  Bulutların: <strong className="text-sky-300">{hud.playerCloudCount}</strong> · Süper Hücre:{" "}
                  <strong className="text-amber-300">{hud.playerSupercellCount}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 60 FPS Tam Genişlik (Sıfır Siyah Kenar!) Yüksek İrtifa Gökyüzü Arenası */}
        <div className="relative overflow-hidden bg-[#061224]">
          <div
            className={`relative w-full transition-all duration-300 ${
              showIntro
                ? "h-[calc(100svh-196px)] sm:h-[calc(100svh-124px)] min-h-[460px] sm:min-h-[540px] max-h-[760px]"
                : "h-[calc(100svh-276px)] sm:h-[calc(100svh-214px)] min-h-[400px] sm:min-h-[450px] max-h-[680px]"
            }`}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onContextMenu={(e) => e.preventDefault()}
              className={`block h-full w-full cursor-crosshair select-none touch-none transition-all duration-700 ease-out ${
                showIntro && !arenaLockIn
                  ? "scale-110 blur-[4px] brightness-75"
                  : "scale-100 blur-0 brightness-100"
              }`}
            />

            {/* Sadece Start Açılışında Çalışan 3D Volümetrik Süper Hücre 2.0 Sinematiği */}
            {showIntro && (
              <CumulusIntro3D
                stageId={stageId}
                onSelectStage={handleManualStageSelect}
                windBadgeText={windBadgeText}
                windKmh={hud.windKmh}
                pressureHpa={matchedBundle?.current.pressure}
                capeJkg={briefing.capeJkg}
                cityName={briefing.cityName}
                provinceBadge={briefing.provinceBadge}
                elevationText={briefing.elevationText}
                tempText={briefing.tempText}
                pressureText={briefing.pressureText}
                cloudBaseText={briefing.cloudBaseText}
                freezingLevelLabel={briefing.freezingLevelLabel}
                freezingLevelText={briefing.freezingLevelText}
                autoStageId={autoStageId}
                isStageManuallyLocked={isStageManuallyLocked}
                onResetAutoStage={handleUnlockAutoStage}
                totalWins={career.totalWins}
                sfxEnabled={sfxEnabled}
                onToggleSfx={() => setSfxEnabled((s) => !s)}
                onStartDive={() => {
                  cumulusAudio.playIntroDive();
                }}
                onDiveReveal={() => {
                  setArenaLockIn(true);
                }}
                onComplete={() => {
                  resetGame(stageId, difficulty, windMode);
                  setShowIntro(false);
                  setArenaLockIn(false);
                }}
                onSkip={() => {
                  cumulusAudio.stopIntroAmbience(0.15);
                  resetGame(stageId, difficulty, windMode);
                  setShowIntro(false);
                  setArenaLockIn(false);
                }}
              />
            )}

            {/* Duraklatıldı Katmanı */}
            {paused && !showIntro && hud.status === "playing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#040914]/70 backdrop-blur-sm">
                <p className="font-display text-2xl font-semibold tracking-wider text-ink-primary">
                  CEPHE DURAKLATILDI
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Devam etmek için Boşluk tuşuna veya aşağıdaki düğmeye bas.
                </p>
                <button
                  type="button"
                  onClick={() => setPaused(false)}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/20 px-5 py-2 text-sm font-medium text-sky-100 hover:bg-sky-500/30"
                >
                  <Play className="h-4 w-4" />
                  <span>Devam Et</span>
                </button>
              </div>
            )}

            {/* Zafer / Yenilgi Ekranı */}
            {hud.status !== "playing" && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#040914]/80 p-4">
                <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#081020]/95 p-6 text-center shadow-2xl">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/35 bg-sky-500/15 text-sky-300">
                    {hud.status === "victory" ? (
                      <Trophy className="h-6 w-6 text-amber-300" />
                    ) : (
                      <CloudLightning className="h-6 w-6 text-rose-400" />
                    )}
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-bold text-ink-primary">
                    {hud.status === "victory"
                      ? "GÖKYÜZÜ HAKİMİYETİ!"
                      : "CEPHE DAĞILDI"}
                  </h2>
                  <p className="mt-1 text-xs text-ink-secondary">
                    {hud.status === "victory"
                      ? `${currentStage.name} (${briefing.cityName}) fethedildi · ${earnedMedal ? MEDAL_LABEL[earnedMedal] : ""}`
                      : `${currentStage.name} rakip fırtınalara geçti. Kendi bulutlarını besleyip Kümülonimbus kurmayı dene!`}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                      <div className="text-[11px] text-ink-muted">Süre</div>
                      <div className="font-mono text-sm font-semibold text-ink-primary">
                        {formatClock(hud.elapsedSec)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                      <div className="text-[11px] text-ink-muted">En Yüksek Evrim</div>
                      <div className="text-sm font-semibold text-sky-300">
                        {STAGE_META[hud.stats.peakStage].label}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                      <div className="text-[11px] text-ink-muted">Ele Geçirilen / Süper Hücre</div>
                      <div className="font-mono text-sm font-semibold text-ink-primary">
                        {hud.stats.cloudsCaptured} · {hud.stats.supercellsFormed}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                      <div className="text-[11px] text-ink-muted">Yıldırım / Şok Dalgası</div>
                      <div className="font-mono text-sm font-semibold text-amber-300">
                        {hud.stats.lightningZaps} · {hud.stats.shockwavesFired}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => resetGame()}
                      className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-ink-primary hover:bg-white/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Tekrar Oyna</span>
                    </button>
                    {hud.status === "victory" && (
                      <button
                        type="button"
                        onClick={() => handleManualStageSelect(nextStage.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-500/25 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/35"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Sonraki: {nextStage.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Entegre Kompakt Taktik Kontrol Çubuğu (Sadece oyun aktifken) */}
        {!showIntro && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] bg-[#070d1b]/95 px-3.5 py-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Fırlatma Oranı */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
                {[
                  { val: 0.5, label: "%50" },
                  { val: 0.75, label: "%75" },
                  { val: 0.95, label: "%100" }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setLaunchRatio(opt.val)}
                    className={`rounded-lg px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                      launchRatio === opt.val
                        ? "bg-sky-500/25 text-sky-200"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Araç Modu */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
                <button
                  type="button"
                  onClick={() => setToolMode("launch")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    toolMode === "launch"
                      ? "bg-sky-500/25 text-sky-200"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Fırlat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setToolMode("supply")}
                  title="Kendi iki bulutun arasında sürekli nem besleme hattı kur (veya Sağ Tık sürükle)"
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    toolMode === "supply"
                      ? "bg-emerald-500/25 text-emerald-200"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Besle Hattı</span>
                </button>
              </div>

              {/* Süper Hücre Şok Dalgası */}
              <button
                type="button"
                onClick={fireShockwave}
                disabled={hud.readySupercellId === null}
                title="120+ kütleli Süper Hücre'den Barometrik Şok Dalgası yay (Kısayol: E)"
                className={`atmos-btn relative flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all ${
                  hud.readySupercellId !== null
                    ? "border-sky-400/75 bg-sky-500/25 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.52)] hover:bg-sky-500/35"
                    : "cursor-not-allowed border-white/10 bg-white/[0.03] text-ink-muted"
                }`}
              >
                {hud.readySupercellId !== null && (
                  <span
                    aria-hidden="true"
                    className="atmos-beacon-ring pointer-events-none absolute inset-0 rounded-xl border border-sky-300"
                  />
                )}
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {hud.readySupercellId !== null ? "Şok Dalgası Hazır (E)" : "Şok Dalgası (120+ SC)"}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Rüzgar Modu */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
                {(
                  [
                    { key: "live", label: "Canlı" },
                    { key: "dynamic", label: "Değişken" },
                    { key: "off", label: "Kapalı" }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setWindMode(opt.key);
                      resetGame(stageId, difficulty, opt.key);
                    }}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      windMode === opt.key
                        ? "bg-white/15 text-ink-primary"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Zorluk */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
                {(
                  [
                    { key: "calm", label: "Sakin" },
                    { key: "storm", label: "Fırtına" },
                    { key: "supercell", label: "Süper" }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setDifficulty(opt.key);
                      resetGame(stageId, opt.key, windMode);
                    }}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      difficulty === opt.key
                        ? "bg-amber-500/25 text-amber-200"
                        : "text-ink-secondary hover:text-ink-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSfxEnabled((s) => !s)}
                aria-label={sfxEnabled ? "Oyun sesini kapat" : "Oyun sesini aç"}
                title={sfxEnabled ? "Oyun sesini kapat" : "Oyun sesini aç"}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-ink-secondary hover:bg-white/10 hover:text-ink-primary"
              >
                {sfxEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Devam et" : "Duraklat"}
                title="Duraklat / Devam (Boşluk)"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-ink-secondary hover:bg-white/10 hover:text-ink-primary"
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => resetGame()}
                aria-label="Yeniden başlat"
                title="Bölümü yeniden başlat (R)"
                className="flex h-7 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs font-medium text-ink-secondary hover:bg-white/10 hover:text-ink-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Yenile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetGame();
                  setShowIntro(true);
                }}
                title="3D Süper Hücre açılış animasyonunu tekrar izle"
                className="flex h-7 items-center gap-1 rounded-lg border border-sky-400/25 bg-sky-500/10 px-2.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden md:inline">3D Açılış</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 6 Cephe Bölümü Seçici + Katlanabilir Rehber (Sadece oyun aktifken; introda kendi 6-cephe seçicisi var) */}
      {!showIntro && (
        <>
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {CUMULUS_STAGES.map((stage) => {
              const active = stage.id === stageId;
              const isCityAutoStage = stage.id === autoStageId;
              const rec = career.stages[stage.id];
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleManualStageSelect(stage.id)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-sky-400/60 bg-sky-500/15 shadow-[0_0_20px_rgba(56,189,248,0.14)]"
                      : "border-white/10 bg-[#070b14]/80 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                      <span>0{stage.index}</span>
                      {isCityAutoStage && (
                        <span className="rounded bg-emerald-400/15 px-1 py-0.2 text-[9px] font-semibold text-emerald-300">
                          {briefing.provinceBadge ?? "OTO"}
                        </span>
                      )}
                    </span>
                    {rec ? (
                      <span
                        className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                          rec.medal === "gold"
                            ? "bg-amber-400/20 text-amber-300"
                            : rec.medal === "silver"
                              ? "bg-slate-300/20 text-slate-200"
                              : "bg-orange-400/20 text-orange-300"
                        }`}
                      >
                        {formatClock(rec.bestSec)}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-ink-muted">
                        1v{stage.opponents.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-ink-primary">
                    <span>{stage.name}</span>
                    {active && isStageManuallyLocked && (
                      <Lock className="h-3 w-3 text-amber-300" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {stage.opponents.map((op) => (
                      <span
                        key={op}
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: FACTION_META[op].primary }}
                        title={FACTION_META[op].name}
                      />
                    ))}
                    {stage.procedural && (
                      <span className="ml-1 font-mono text-[10px] text-sky-300">
                        ∞
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </section>

          {/* Katlanabilir Evrim & Taktik Rehberi */}
          <section className="rounded-2xl border border-white/10 bg-[#070b14]/80 px-4 py-3 text-xs">
            <button
              type="button"
              onClick={() => setShowGuide((v) => !v)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="font-display text-xs font-semibold tracking-wide text-ink-primary">
                Evrim Basamakları &amp; Kısayollar
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted">
                <span>{showGuide ? "Gizle" : "Göster"}</span>
                {showGuide ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </span>
            </button>

            {showGuide && (
              <div className="mt-3 grid gap-3 md:grid-cols-12">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:col-span-8">
                  {(["cu", "congestus", "cb", "supercell"] as CloudStage[]).map((st) => {
                    const m = STAGE_META[st];
                    const rangeText =
                      st === "cu"
                        ? "1–29"
                        : st === "congestus"
                          ? "30–59"
                          : st === "cb"
                            ? "60–99"
                            : "100+";
                    const perk =
                      st === "cu"
                        ? "Temel yoğunlaşma"
                        : st === "congestus"
                          ? "Hızlı büyüme · +%15 güç"
                          : st === "cb"
                            ? "⚡ Örs Bulutu + Oto Yıldırım"
                            : "🌀 Mezosiklon + 3× Yıldırım + Şok (120+)";
                    return (
                      <div
                        key={st}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-semibold text-sky-300">{m.code}</span>
                          <span className="text-ink-muted">{rangeText}</span>
                        </div>
                        <div className="mt-0.5 font-medium text-ink-primary">{m.label}</div>
                        <div className="mt-0.5 text-[11px] text-ink-secondary">{perk}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 md:col-span-4">
                  <div className="flex flex-wrap items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Flame className="h-3.5 w-3.5" />
                      <strong>Termal:</strong> 2× Üretim
                    </span>
                    <span className="flex items-center gap-1 text-sky-300">
                      <Snowflake className="h-3.5 w-3.5" />
                      <strong>Buz Çekirdeği:</strong> 1.4× Dolu
                    </span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-ink-secondary">
                    <strong className="text-ink-primary">Sürükle:</strong> Fırlat &amp; çoklu süpür ·{" "}
                    <strong className="text-ink-primary">Kendi bulutuna bırak:</strong> Evrimleştir ·{" "}
                    <strong className="text-ink-primary">Sağ tık:</strong> Besle hattı ·{" "}
                    <strong className="text-ink-primary">Çift tık / A:</strong> Toplu taarruz ·{" "}
                    <strong className="text-ink-primary">E:</strong> Şok ·{" "}
                    <strong className="text-ink-primary">Boşluk:</strong> Duraklat
                  </p>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

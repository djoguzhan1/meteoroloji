"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CloudLightning,
  Flame,
  Link2,
  Pause,
  Play,
  RotateCcw,
  Send,
  Snowflake,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Wind,
  Zap
} from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  CUMULUS_STAGES,
  FACTION_META,
  STAGE_META,
  SUPERCELL_SHOCKWAVE_MIN_MASS,
  computeFactionShares,
  computeWindSpeedMultiplier,
  createCumulusGame,
  getCloudRadius,
  getWindScreenVector,
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

const CAREER_STORAGE_KEY = "atmos:cumulus:career:v1";

const COMPASS_TR = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"] as const;

function degreesToCompassTr(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  return COMPASS_TR[Math.round(norm / 45) % 8];
}

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

type WindRibbon = {
  x: number;
  y: number;
  len: number;
  speedMult: number;
  alpha: number;
  phase: number;
};

function createWindRibbons(count = 36): WindRibbon[] {
  const list: WindRibbon[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      x: Math.random() * ARENA_WIDTH,
      y: Math.random() * ARENA_HEIGHT,
      len: 36 + Math.random() * 58,
      speedMult: 0.65 + Math.random() * 0.75,
      alpha: 0.08 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2
    });
  }
  return list;
}

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

function findCloudAt(clouds: CloudNode[], x: number, y: number, pad = 10): CloudNode | null {
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
  const { bundle, activeLocation } = useWeather();

  const liveWindKmh = bundle?.current.windSpeed;
  const liveWindDirDeg = bundle?.current.windDirection;

  const [stageId, setStageId] = useState<string>(CUMULUS_STAGES[0].id);
  const [difficulty, setDifficulty] = useState<DifficultyKey>("storm");
  const [windMode, setWindMode] = useState<WindMode>("live");
  const [launchRatio, setLaunchRatio] = useState<number>(0.5);
  const [toolMode, setToolMode] = useState<"launch" | "supply">("launch");
  const [paused, setPaused] = useState<boolean>(false);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [career, setCareer] = useState<CareerStorage>({
    stages: {},
    totalWins: 0,
    totalSupercells: 0
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<CumulusGameState>(
    createCumulusGame({
      stageId: CUMULUS_STAGES[0].id,
      difficulty: "storm",
      windMode: "live",
      liveWindKmh,
      liveWindDirDeg
    })
  );
  const ribbonsRef = useRef<WindRibbon[]>(createWindRibbons(38));
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
  const recordedOutcomeRef = useRef(false);

  const [hud, setHud] = useState<HudSnapshot>(() => extractHud(gameRef.current));

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
    cumulusAudio.setEnabled(sfxEnabled);
  }, [sfxEnabled]);

  // Kariyer madalyalarını localStorage'dan yükle
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CAREER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CareerStorage;
      if (parsed && typeof parsed === "object" && parsed.stages) {
        setCareer(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistVictory = useCallback(
    (state: CumulusGameState) => {
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
    },
    []
  );

  const dispatchGameEvents = useCallback(
    (events: GameEvent[]) => {
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
    },
    []
  );

  const resetGame = useCallback(
    (
      nextStageId = stageId,
      nextDiff = difficulty,
      nextWind = windMode
    ) => {
      const next = createCumulusGame({
        stageId: nextStageId,
        difficulty: nextDiff,
        windMode: nextWind,
        liveWindKmh,
        liveWindDirDeg
      });
      gameRef.current = next;
      interactionRef.current.dragging = false;
      interactionRef.current.selectedIds = [];
      interactionRef.current.hoveredCloudId = null;
      recordedOutcomeRef.current = false;
      setPaused(false);
      setHud(extractHud(next));
    },
    [stageId, difficulty, windMode, liveWindKmh, liveWindDirDeg]
  );

  // Canlı şehir rüzgarı geldiğinde windMode === "live" ise anlık güncelle
  useEffect(() => {
    if (
      windMode === "live" &&
      typeof liveWindKmh === "number" &&
      typeof liveWindDirDeg === "number"
    ) {
      gameRef.current.windKmh = Math.max(4, Math.min(55, liveWindKmh));
      gameRef.current.windDirDeg = liveWindDirDeg;
    }
  }, [windMode, liveWindKmh, liveWindDirDeg]);

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

  // Klavye kısayolları
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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

  // 60 FPS Simülasyon + Yüksek Kalite Canvas Çizim Döngüsü
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let hudTimer = 0;

    const drawFrame = (now: number) => {
      const rawDt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      const state = gameRef.current;
      if (!pausedRef.current) {
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

      // Seçili bulutlardan artık oyuncuya ait olmayanları temizle
      if (interactionRef.current.selectedIds.length > 0) {
        interactionRef.current.selectedIds = interactionRef.current.selectedIds.filter((id) => {
          const cl = state.clouds.find((c) => c.id === id);
          return cl && cl.owner === "player";
        });
      }

      hudTimer += rawDt;
      if (hudTimer >= 0.14) {
        hudTimer = 0;
        setHud(extractHud(state));
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = Math.max(320, Math.round(rect.width * dpr));
        const targetH = Math.max(200, Math.round(rect.height * dpr));
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          renderArena(
            ctx,
            targetW,
            targetH,
            state,
            interactionRef.current,
            ribbonsRef.current,
            toolModeRef.current,
            launchRatioRef.current,
            now / 1000,
            pausedRef.current ? 0 : rawDt
          );
        }
      }

      rafId = window.requestAnimationFrame(drawFrame);
    };

    rafId = window.requestAnimationFrame(drawFrame);
    return () => window.cancelAnimationFrame(rafId);
  }, [dispatchGameEvents, persistVictory]);

  // Koordinat dönüştürücü (CSS px -> 1000x620 arena)
  const clientToArena = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / Math.max(1, rect.width)) * ARENA_WIDTH,
      y: ((clientY - rect.top) / Math.max(1, rect.height)) * ARENA_HEIGHT
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (gameRef.current.status !== "playing") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const { x, y } = clientToArena(e.clientX, e.clientY);
      const hit = findCloudAt(gameRef.current.clouds, x, y, 12);
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
        // Çift tıklama: tüm oyuncu bulutlarını seç!
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

        // Eğer zaten seçili çoklu bulut grubunun bir parçasıysa grubu koru; değilse yeni grup başlat
        if (!inter.selectedIds.includes(hit.id)) {
          inter.selectedIds = [hit.id];
        }
        inter.dragging = true;
      } else if (hit && inter.selectedIds.length > 0 && !isRight) {
        // Önceden seçili bulutlarla tek tık hedefe fırlat!
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
      const hit = findCloudAt(gameRef.current.clouds, x, y, 12);
      inter.hoveredCloudId = hit?.id ?? null;

      if (inter.dragging) {
        if (Math.hypot(x - inter.startX, y - inter.startY) > 12) {
          inter.movedEnough = true;
        }
        // Çoklu bulut zincir süpürmesi: sürüklerken başka dost bulutlardan geçince seçime ekle!
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
      const hit = findCloudAt(gameRef.current.clouds, x, y, 14);
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
          // Aynı bulut grubu içinden kendi bulutuna bıraktıysa onu kaynaklardan çıkarıp hedef olarak besle!
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
        // Sadece tek tık: bulut seçili kalır, oyuncu başka buluta tıklayarak da ateş edebilir
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

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const steps = [0.5, 0.75, 0.95];
    setLaunchRatio((curr) => {
      const idx = steps.indexOf(curr);
      const safeIdx = idx === -1 ? 0 : idx;
      const next = e.deltaY < 0 ? Math.min(steps.length - 1, safeIdx + 1) : Math.max(0, safeIdx - 1);
      return steps[next];
    });
  }, []);

  const currentStage = useMemo(
    () => CUMULUS_STAGES.find((s) => s.id === stageId) ?? CUMULUS_STAGES[0],
    [stageId]
  );

  const nextStage = useMemo(() => {
    const idx = CUMULUS_STAGES.findIndex((s) => s.id === stageId);
    if (idx === -1 || idx >= CUMULUS_STAGES.length - 1) return CUMULUS_STAGES[0];
    return CUMULUS_STAGES[idx + 1];
  }, [stageId]);

  const windBadgeText =
    windMode === "off"
      ? "Rüzgarsız"
      : windMode === "live"
        ? `Canlı ${activeLocation.name} · ${Math.round(hud.windKmh)} km/s ${degreesToCompassTr(hud.windDirDeg)}`
        : `Değişken Cephe · ${Math.round(hud.windKmh)} km/s ${degreesToCompassTr(hud.windDirDeg)}`;

  const earnedMedal =
    hud.status === "victory" ? computeMedal(hud.elapsedSec, difficulty) : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
      {/* Üst Başlık + Canlı Hakimiyet Şeridi */}
      <section className="rounded-2xl border border-white/10 bg-[#070b14]/85 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/15 text-sky-300">
              <CloudLightning className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-semibold tracking-wide text-ink-primary">
                  CUMULUS · Bulut Savaşı
                </h1>
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-sky-300">
                  {currentStage.name}
                </span>
              </div>
              <p className="text-xs text-ink-secondary">{currentStage.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Canlı Rüzgar Göstergesi */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-ink-primary">
              <Wind className="h-3.5 w-3.5 text-sky-400" />
              <span>{windBadgeText}</span>
            </div>

            {/* Süre */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-ink-primary">
              {formatClock(hud.elapsedSec)}
            </div>

            {/* Kariyer Özeti */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 font-mono text-xs text-amber-200">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>{career.totalWins} Zafer</span>
            </div>
          </div>
        </div>

        {/* Atmosfer Hakimiyet Barı */}
        <div className="mt-3.5 space-y-2">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
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
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {hud.shares.map((s) => {
                const meta = FACTION_META[s.faction];
                return (
                  <div key={s.faction} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: meta.primary }}
                    />
                    <span className="font-medium text-ink-primary">{meta.name}</span>
                    {meta.personality && (
                      <span className="hidden lg:inline text-[11px] text-ink-muted">
                        ({meta.personality})
                      </span>
                    )}
                    <span className="font-mono text-ink-secondary">
                      {s.mass} · %{s.pct}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="font-mono text-[11px] text-ink-muted">
              Bulutların: {hud.playerCloudCount} · Süper Hücre: {hud.playerSupercellCount}
            </div>
          </div>
        </div>
      </section>

      {/* Taktik Araç Çubuğu */}
      <section className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#070b14]/85 px-3.5 py-2.5 backdrop-blur-xl">
        {/* Sol: Fırlatma Oranı + Araç Modu + Süper Hücre Şok Dalgası */}
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

          {/* Araç Modu: Fırlat / Besleme Hattı */}
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

          {/* Aktif Yetenek: Süper Hücre Şok Dalgası */}
          <button
            type="button"
            onClick={fireShockwave}
            disabled={hud.readySupercellId === null}
            title="120+ kütleli Süper Hücre'den Barometrik Şok Dalgası yay (Kısayol: E)"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
              hud.readySupercellId !== null
                ? "border-sky-400/70 bg-sky-500/25 text-sky-100 shadow-[0_0_18px_rgba(56,189,248,0.35)] hover:bg-sky-500/35"
                : "cursor-not-allowed border-white/10 bg-white/[0.03] text-ink-muted"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>
              {hud.readySupercellId !== null ? "Şok Dalgası Hazır (E)" : "Şok Dalgası (120+ SC)"}
            </span>
          </button>
        </div>

        {/* Sağ: Rüzgar Modu + Zorluk + Ses / Duraklat / Yenile */}
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

          {/* Ses, Duraklat, Yeniden Başlat */}
          <button
            type="button"
            onClick={() => setSfxEnabled((s) => !s)}
            aria-label={sfxEnabled ? "Oyun sesini kapat" : "Oyun sesini aç"}
            title={sfxEnabled ? "Oyun sesini kapat" : "Oyun sesini aç"}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-ink-secondary hover:bg-white/10 hover:text-ink-primary"
          >
            {sfxEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Devam et" : "Duraklat"}
            title="Duraklat / Devam (Boşluk)"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-ink-secondary hover:bg-white/10 hover:text-ink-primary"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => resetGame()}
            aria-label="Yeniden başlat"
            title="Bölümü yeniden başlat (R)"
            className="flex h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 text-xs font-medium text-ink-secondary hover:bg-white/10 hover:text-ink-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Yenile</span>
          </button>
        </div>
      </section>

      {/* Ana 60 FPS Atmosfer Arenası */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050912] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="relative mx-auto aspect-[1000/620] w-full max-w-[1060px]">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
            className="h-full w-full cursor-crosshair select-none touch-none block"
          />

          {/* Duraklatıldı Katmanı */}
          {paused && hud.status === "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050912]/70 backdrop-blur-sm">
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
            <div className="absolute inset-0 flex items-center justify-center bg-[#050912]/80 p-4 backdrop-blur-md">
              <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#090f1d]/95 p-6 text-center shadow-2xl">
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
                    ? `${currentStage.name} fethedildi · ${earnedMedal ? MEDAL_LABEL[earnedMedal] : ""}`
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
                      onClick={() => {
                        setStageId(nextStage.id);
                        resetGame(nextStage.id, difficulty, windMode);
                      }}
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
      </section>

      {/* 6 Cephe Bölümü Seçici */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {CUMULUS_STAGES.map((stage) => {
          const active = stage.id === stageId;
          const rec = career.stages[stage.id];
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                setStageId(stage.id);
                resetGame(stage.id, difficulty, windMode);
              }}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                active
                  ? "border-sky-400/60 bg-sky-500/15 shadow-[0_0_20px_rgba(56,189,248,0.12)]"
                  : "border-white/10 bg-[#070b14]/80 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="font-mono text-[11px] text-ink-muted">
                  0{stage.index}
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
              <div className="mt-1 text-xs font-semibold text-ink-primary">
                {stage.name}
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

      {/* Kompakt Evrim & Taktik Rehberi */}
      <section className="grid gap-3 rounded-2xl border border-white/10 bg-[#070b14]/80 p-4 text-xs md:grid-cols-12">
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
                    ? "⚡ Oto Yıldırım Savunması"
                    : "🌀 3× Zincir Yıldırım + Şok (120+)";
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
            <strong className="text-ink-primary">Sürükle:</strong> Fırlat &amp; çoklu bulut süpür ·{" "}
            <strong className="text-ink-primary">Kendi bulutuna bırak:</strong> Büyüt &amp; Fırtına Bulutu&apos;na evrimleştir ·{" "}
            <strong className="text-ink-primary">Sağ tık sürükle / Besle Hattı:</strong> Sürekli nem akışı ·{" "}
            <strong className="text-ink-primary">Çift tık / A:</strong> Toplu taarruz ·{" "}
            <strong className="text-ink-primary">Tekerlek:</strong> Oran
          </p>
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
 * 60 FPS VOLÜMETRİK ATMOSFER & FIRTINA BULUTU CANVAS RENDER MOTORU
 * ============================================================================ */

function renderArena(
  ctx: CanvasRenderingContext2D,
  pixelW: number,
  pixelH: number,
  state: CumulusGameState,
  inter: InteractionState,
  ribbons: WindRibbon[],
  toolMode: "launch" | "supply",
  launchRatio: number,
  timeSec: number,
  dt: number
) {
  ctx.save();
  ctx.scale(pixelW / ARENA_WIDTH, pixelH / ARENA_HEIGHT);

  // 1. Derin Gece Atmosferi + Hafif Sinoptik İzobar Çizgileri
  const bg = ctx.createRadialGradient(
    ARENA_WIDTH * 0.5,
    ARENA_HEIGHT * 0.45,
    40,
    ARENA_WIDTH * 0.5,
    ARENA_HEIGHT * 0.5,
    680
  );
  bg.addColorStop(0, "#0c182d");
  bg.addColorStop(0.55, "#070e1c");
  bg.addColorStop(1, "#040811");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Mikro kamera sarsıntısı (yıldırım / evrim / şok dalgası)
  if (state.shake > 0.15) {
    const sx = (Math.random() - 0.5) * state.shake * 1.4;
    const sy = (Math.random() - 0.5) * state.shake * 1.4;
    ctx.translate(sx, sy);
  }

  // Sinoptik izobar halkaları (observatory havası)
  ctx.save();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 10]);
  for (const r of [140, 260, 390]) {
    ctx.beginPath();
    ctx.ellipse(ARENA_WIDTH * 0.5, ARENA_HEIGHT * 0.5, r * 1.28, r * 0.86, -0.15, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // 2. Hareketli Rüzgar Şeritleri (gerçek rüzgar vektörüne göre)
  drawWindRibbons(ctx, state, ribbons, timeSec, dt);

  // 3. Sürekli Nem Besleme Hatları
  drawSupplyLines(ctx, state, timeSec);

  // 4. Barometrik Şok Dalgaları
  for (const sw of state.shockwaves) {
    const alpha = Math.max(0, sw.life / sw.maxLife);
    const meta = FACTION_META[sw.owner];
    ctx.save();
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = alpha * 0.85;
    ctx.lineWidth = 4.5 * alpha + 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sw.x, sw.y, Math.max(4, sw.radius * 0.84), 0, Math.PI * 2);
    ctx.strokeStyle = meta.light;
    ctx.globalAlpha = alpha * 0.45;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const grad = ctx.createRadialGradient(sw.x, sw.y, sw.radius * 0.7, sw.x, sw.y, sw.radius);
    grad.addColorStop(0, "rgba(56, 189, 248, 0)");
    grad.addColorStop(1, meta.glow);
    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha * 0.25;
    ctx.fill();
    ctx.restore();
  }

  // 5. Nişan / Sürükleme Önizleme Hatları
  drawAimPreview(ctx, state, inter, toolMode, launchRatio, timeSec);

  // 6. Havada Uçan Bulutçuk Sürüleri
  drawCloudlets(ctx, state);

  // 7. Volümetrik Çok-Katmanlı Ana Bulutlar
  const hoveredId = inter.hoveredCloudId;
  const selectedSet = new Set(inter.selectedIds);
  for (const cloud of state.clouds) {
    drawCloudNode(
      ctx,
      cloud,
      selectedSet.has(cloud.id),
      hoveredId === cloud.id,
      timeSec
    );
  }

  // 8. Çatallı Yıldırım Boşalmaları
  for (const bolt of state.bolts) {
    const alpha = Math.max(0, bolt.life / bolt.maxLife);
    const meta = FACTION_META[bolt.owner];
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Dış elektrik parıltısı
    ctx.beginPath();
    bolt.points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = alpha * 0.85;
    ctx.lineWidth = 6.5;
    ctx.shadowColor = meta.primary;
    ctx.shadowBlur = 16;
    ctx.stroke();

    // İç saf beyaz çekirdek
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2.1;
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();
  }

  // 9. Kıvılcım & Nem Parçacıkları
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * alpha), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 10. Uçuşan Evrim / Olay Bildirimleri
  for (const c of state.callouts) {
    const alpha = Math.min(1, (c.life / c.maxLife) * 1.4);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "700 12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(4, 8, 17, 0.8)";
    ctx.fillText(c.text, c.x + 1, c.y + 1);
    ctx.fillStyle = c.color;
    ctx.fillText(c.text, c.x, c.y);
    ctx.restore();
  }

  // 11. Köşe Rüzgar Pusulası (Arena içi zarif gösterge)
  if (state.windKmh > 1) {
    drawCornerWindCompass(ctx, state.windKmh, state.windDirDeg);
  }

  ctx.restore();
}

function drawWindRibbons(
  ctx: CanvasRenderingContext2D,
  state: CumulusGameState,
  ribbons: WindRibbon[],
  timeSec: number,
  dt: number
) {
  if (state.windKmh <= 1) return;
  const { wx, wy } = getWindScreenVector(state.windKmh, state.windDirDeg);
  const mag = Math.max(1, Math.hypot(wx, wy));
  const ux = wx / mag;
  const uy = wy / mag;
  const speedPx = 32 + mag * 2.4;

  ctx.save();
  ctx.lineCap = "round";
  for (const r of ribbons) {
    r.x += ux * speedPx * r.speedMult * dt;
    r.y += uy * speedPx * r.speedMult * dt;

    if (r.x < -80) r.x += ARENA_WIDTH + 160;
    if (r.x > ARENA_WIDTH + 80) r.x -= ARENA_WIDTH + 160;
    if (r.y < -80) r.y += ARENA_HEIGHT + 160;
    if (r.y > ARENA_HEIGHT + 80) r.y -= ARENA_HEIGHT + 160;

    const tailX = r.x - ux * r.len;
    const tailY = r.y - uy * r.len;
    const wave = Math.sin(timeSec * 1.8 + r.phase) * 5;
    const midX = (r.x + tailX) * 0.5 - uy * wave;
    const midY = (r.y + tailY) * 0.5 + ux * wave;

    const grad = ctx.createLinearGradient(tailX, tailY, r.x, r.y);
    grad.addColorStop(0, "rgba(125, 211, 252, 0)");
    grad.addColorStop(0.55, `rgba(125, 211, 252, ${r.alpha})`);
    grad.addColorStop(1, "rgba(224, 242, 254, 0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.quadraticCurveTo(midX, midY, r.x, r.y);
    ctx.stroke();
  }
  ctx.restore();
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
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = 0.34;
    ctx.lineWidth = 2.4;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -timeSec * 38;
    ctx.stroke();
    ctx.setLineDash([]);

    // Akış damlacıkları
    const drops = 3;
    for (let i = 0; i < drops; i++) {
      const t = (timeSec * 0.45 + i / drops) % 1;
      const dx = src.x + (dst.x - src.x) * t;
      const dy = src.y + (dst.y - src.y) * t;
      ctx.beginPath();
      ctx.arc(dx, dy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = meta.light;
      ctx.globalAlpha = 0.78 * Math.sin(t * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawAimPreview(
  ctx: CanvasRenderingContext2D,
  state: CumulusGameState,
  inter: InteractionState,
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
  const lineColor = isSupply
    ? "#34d399"
    : isReinforce
      ? "#22d3ee"
      : "#7dd3fc";

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
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 2.4;
    ctx.setLineDash([7, 6]);
    ctx.lineDashOffset = -timeSec * 52;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Hedef üzerinde akıllı mikro etiket (fırlatılacak kütle + rüzgar desteği)
  if (hovered && lineCount > 0) {
    const avgWindPct = Math.round(windPctSum / lineCount);
    const r = getCloudRadius(hovered.mass, hovered.kind);

    ctx.save();
    ctx.beginPath();
    ctx.arc(hovered.x, hovered.y, r + 9, 0, Math.PI * 2);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.9;
    ctx.stroke();

    const label = isSupply
      ? isReinforce
        ? "BESLEME HATTI"
        : "DOST BULUT SEÇ"
      : isReinforce
        ? `BESLE +${totalSend}`
        : `FİLO ${totalSend}${avgWindPct >= 6 ? ` · +%${avgWindPct} RÜZGAR` : avgWindPct <= -6 ? ` · %${avgWindPct} KARŞI` : ""}`;

    ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
    const tw = ctx.measureText(label).width + 14;
    const bx = hovered.x - tw / 2;
    const by = hovered.y - r - 30;
    ctx.fillStyle = "rgba(5, 9, 18, 0.88)";
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    roundRectPath(ctx, bx, by, tw, 20, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = lineColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, hovered.x, by + 10);
    ctx.restore();
  }
}

function drawCloudlets(ctx: CanvasRenderingContext2D, state: CumulusGameState) {
  for (const cl of state.cloudlets) {
    const meta = FACTION_META[cl.owner];
    const spd = Math.max(1, Math.hypot(cl.vx, cl.vy));
    const ux = cl.vx / spd;
    const uy = cl.vy / spd;
    const r = 3.2 + Math.min(3.0, Math.sqrt(cl.payload) * 1.15);

    ctx.save();
    // Buhar izi
    const tailLen = cl.isCharged ? 16 : 11;
    const grad = ctx.createLinearGradient(
      cl.x - ux * tailLen,
      cl.y - uy * tailLen,
      cl.x,
      cl.y
    );
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(1, meta.primary);
    ctx.strokeStyle = grad;
    ctx.lineWidth = r * 1.05;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cl.x - ux * tailLen, cl.y - uy * tailLen);
    ctx.lineTo(cl.x, cl.y);
    ctx.stroke();

    // Bulutçuk gövdesi
    ctx.fillStyle = cl.isCharged ? "#ffffff" : meta.light;
    ctx.shadowColor = meta.primary;
    ctx.shadowBlur = cl.isCharged ? 10 : 5;
    ctx.beginPath();
    ctx.arc(cl.x, cl.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Dolu (Buz Çekirdeği) kristal parıltısı
    if (cl.isHail) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cl.x, cl.y - r - 2.5);
      ctx.lineTo(cl.x + r + 2.5, cl.y);
      ctx.lineTo(cl.x, cl.y + r + 2.5);
      ctx.lineTo(cl.x - r - 2.5, cl.y);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawCloudNode(
  ctx: CanvasRenderingContext2D,
  cloud: CloudNode,
  isSelected: boolean,
  isHovered: boolean,
  timeSec: number
) {
  const meta = FACTION_META[cloud.owner];
  const baseR = getCloudRadius(cloud.mass, cloud.kind);
  const breath = Math.sin(timeSec * 2.1 + cloud.seed * 12) * 1.4;
  const r = baseR + breath + cloud.pulse * 4.5;
  const isStorm = cloud.stage === "cb" || cloud.stage === "supercell";
  const isSupercell = cloud.stage === "supercell";
  const shockReady =
    isSupercell &&
    cloud.owner !== "neutral" &&
    cloud.mass >= SUPERCELL_SHOCKWAVE_MIN_MASS &&
    cloud.shockwaveTimer <= 0;

  ctx.save();

  // Termal yükselici altın halkası (2× üretim)
  if (cloud.kind === "thermal") {
    const wave = (timeSec * 0.7 + cloud.seed) % 1;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, r + 6 + wave * 14, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.42 * (1 - wave)})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Buz çekirdeği kristal altıgeni (1.4× dolu)
  if (cloud.kind === "ice") {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(timeSec * 0.25 + cloud.seed * 6);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const px = Math.cos(a) * (r + 8);
      const py = Math.sin(a) * (r + 8);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(125, 211, 252, 0.34)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  // Kümülonimbus & Süper Hücre yıldırım menzil halkası (seçiliyken veya hover'da göster)
  if (isStorm && cloud.owner !== "neutral" && (isSelected || isHovered)) {
    const lRange = STAGE_META[cloud.stage].lightningRange;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, lRange, 0, Math.PI * 2);
    ctx.strokeStyle = meta.primary;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 7]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // Dış atmosferik hare (glow)
  const aura = ctx.createRadialGradient(
    cloud.x,
    cloud.y,
    r * 0.35,
    cloud.x,
    cloud.y,
    r * (isSupercell ? 1.75 : isStorm ? 1.55 : 1.35)
  );
  aura.addColorStop(0, meta.glow);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, r * 1.75, 0, Math.PI * 2);
  ctx.fill();

  // Volümetrik çok-loplu bulut gövdesi (alt gölge + ana kütle + güneşli üst kenar)
  const lobeCount = isSupercell ? 9 : isStorm ? 8 : 7;
  const lobes: Array<{ x: number; y: number; lr: number }> = [];
  for (let i = 0; i < lobeCount; i++) {
    const angle =
      (i / lobeCount) * Math.PI * 2 +
      cloud.seed * 6.28 +
      (isSupercell ? timeSec * 0.45 : Math.sin(timeSec * 0.6 + i) * 0.05);
    const orbit = r * (0.42 + 0.12 * Math.sin(i * 2.1 + cloud.seed * 9));
    const lr = r * (0.48 + 0.12 * Math.cos(i * 1.7 + cloud.seed * 5));
    lobes.push({
      x: cloud.x + Math.cos(angle) * orbit,
      y: cloud.y + Math.sin(angle) * orbit * 0.88,
      lr
    });
  }

  // Alt fırtına gölgesi (örs tabanı)
  ctx.fillStyle = isStorm ? "#09111f" : meta.dark;
  ctx.globalAlpha = isStorm ? 0.92 : 0.72;
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y + 4, r * 0.88, 0, Math.PI * 2);
  for (const lb of lobes) {
    ctx.moveTo(lb.x + lb.lr, lb.y + 4);
    ctx.arc(lb.x, lb.y + 4, lb.lr, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.globalAlpha = 1;

  // Ana bulut gradyanı
  const bodyGrad = ctx.createRadialGradient(
    cloud.x - r * 0.28,
    cloud.y - r * 0.34,
    r * 0.12,
    cloud.x,
    cloud.y + r * 0.2,
    r * 1.25
  );
  if (cloud.owner === "neutral") {
    bodyGrad.addColorStop(0, "#cbd5e1");
    bodyGrad.addColorStop(0.55, "#64748b");
    bodyGrad.addColorStop(1, "#1e293b");
  } else if (isSupercell) {
    bodyGrad.addColorStop(0, "#ffffff");
    bodyGrad.addColorStop(0.32, meta.primary);
    bodyGrad.addColorStop(0.75, meta.dark);
    bodyGrad.addColorStop(1, "#050912");
  } else if (isStorm) {
    bodyGrad.addColorStop(0, meta.light);
    bodyGrad.addColorStop(0.45, meta.primary);
    bodyGrad.addColorStop(1, meta.dark);
  } else {
    bodyGrad.addColorStop(0, meta.light);
    bodyGrad.addColorStop(0.55, meta.primary);
    bodyGrad.addColorStop(1, meta.dark);
  }

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, r * 0.82, 0, Math.PI * 2);
  for (const lb of lobes) {
    ctx.moveTo(lb.x + lb.lr, lb.y);
    ctx.arc(lb.x, lb.y, lb.lr, 0, Math.PI * 2);
  }
  ctx.fill();

  // Süper Hücre dönen mezosiklon göz duvarı (spiral kollar)
  if (isSupercell) {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(timeSec * 1.9);
    ctx.strokeStyle = meta.light;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.55;
    for (let arm = 0; arm < 3; arm++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.64, 0, Math.PI * 0.68);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Kümülonimbus (Cb) iç elektrik parıltısı
  if (cloud.stage === "cb" && Math.sin(timeSec * 14 + cloud.seed * 30) > 0.72) {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(cloud.x - r * 0.35, cloud.y - r * 0.2);
    ctx.lineTo(cloud.x - r * 0.05, cloud.y + r * 0.05);
    ctx.lineTo(cloud.x + r * 0.25, cloud.y - r * 0.1);
    ctx.stroke();
    ctx.restore();
  }

  // Evrim ilerleme yayı (Cu -> Congestus -> Cb -> Supercell eşiğine dolum)
  if (cloud.owner !== "neutral" && !isSupercell) {
    const nextMin =
      cloud.stage === "cu" ? 30 : cloud.stage === "congestus" ? 60 : 100;
    const prevMin = STAGE_META[cloud.stage].minMass;
    const prog = Math.max(0, Math.min(1, (cloud.mass - prevMin) / (nextMin - prevMin)));
    ctx.beginPath();
    ctx.arc(
      cloud.x,
      cloud.y,
      r + 3.5,
      -Math.PI / 2,
      -Math.PI / 2 + prog * Math.PI * 2
    );
    ctx.strokeStyle = meta.light;
    ctx.globalAlpha = 0.42;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Süper Hücre Şok Dalgası hazır parlayan halka (120+ kütle)
  if (shockReady) {
    const pulse = 0.55 + 0.45 * Math.sin(timeSec * 6);
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, r + 7 + pulse * 3, 0, Math.PI * 2);
    ctx.strokeStyle = "#f8fafc";
    ctx.globalAlpha = 0.55 + pulse * 0.35;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Seçim halkası
  if (isSelected) {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(timeSec * 0.9);
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.4;
    ctx.setLineDash([9, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Merkez kütle sayısı (yüksek kontrastlı okunabilirlik)
  const massText = String(Math.floor(cloud.mass));
  ctx.font = `700 ${isSupercell ? 18 : isStorm ? 16 : 15}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(4, 8, 17, 0.82)";
  ctx.fillText(massText, cloud.x + 1, cloud.y - 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(massText, cloud.x, cloud.y - 3);

  // Evrim kodu alt etiketi
  const stageBadge =
    cloud.stage === "supercell"
      ? shockReady
        ? "SC · E⚡"
        : "SC 🌀"
      : cloud.stage === "cb"
        ? "Cb ⚡"
        : cloud.stage === "congestus"
          ? "Cu+"
          : "Cu";
  ctx.font = "700 9.5px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "rgba(4, 8, 17, 0.78)";
  ctx.fillText(stageBadge, cloud.x + 0.8, cloud.y + 12.8);
  ctx.fillStyle = isStorm ? "#fef08a" : "#e2e8f0";
  ctx.fillText(stageBadge, cloud.x, cloud.y + 12);

  // Özel Düğüm Mikro Rozeti (Termal 2× / Buz 1.4×)
  if (cloud.kind !== "normal") {
    const tag = cloud.kind === "thermal" ? "2×" : "❄";
    const bx = cloud.x + r * 0.72;
    const by = cloud.y - r * 0.72;
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(5, 9, 18, 0.9)";
    ctx.fill();
    ctx.strokeStyle = cloud.kind === "thermal" ? "#fbbf24" : "#7dd3fc";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.font = "700 9.5px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = cloud.kind === "thermal" ? "#fde68a" : "#e0f2fe";
    ctx.fillText(tag, bx, by + 0.5);
  }

  ctx.restore();
}

function drawCornerWindCompass(
  ctx: CanvasRenderingContext2D,
  windKmh: number,
  windDirDeg: number
) {
  const cx = ARENA_WIDTH - 46;
  const cy = 44;
  const { wx, wy } = getWindScreenVector(windKmh, windDirDeg);
  const angle = Math.atan2(wy, wx);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(7, 11, 20, 0.78)";
  ctx.fill();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Rüzgar akış oku
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.strokeStyle = "#38bdf8";
  ctx.fillStyle = "#38bdf8";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-11, 0);
  ctx.lineTo(10, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(6, -4.5);
  ctx.lineTo(6, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.font = "700 9px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(windKmh)} km/s`, cx, cy + 33);
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

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  ChevronUp,
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
  const { bundle, activeLocation } = useWeather();

  const liveWindKmh = bundle?.current.windSpeed;
  const liveWindDirDeg = bundle?.current.windDirection;

  const [stageId, setStageId] = useState<string>(CUMULUS_STAGES[0].id);
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
      stageId: CUMULUS_STAGES[0].id,
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
    cumulusAudio.setEnabled(sfxEnabled);
  }, [sfxEnabled]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
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
      interactionRef.current.dragging = false;
      interactionRef.current.selectedIds = [];
      interactionRef.current.hoveredCloudId = null;
      recordedOutcomeRef.current = false;
      setPaused(false);
      setHud(extractHud(next));
    },
    [stageId, difficulty, windMode, liveWindKmh, liveWindDirDeg]
  );

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

  // 60 FPS Simülasyon + Sinematik Volümetrik FBM Bulut Render Döngüsü
  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let hudTimer = 0;

    const drawFrame = (now: number) => {
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

      hudTimer += rawDt;
      if (hudTimer >= 0.14) {
        hudTimer = 0;
        setHud(extractHud(state));
      }

      const canvas = canvasRef.current;
      const shouldRender2D = !showIntroRef.current || hudTimer === 0;
      if (canvas && shouldRender2D) {
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
          renderCumulusArena(
            ctx,
            targetW,
            targetH,
            state,
            interactionRef.current,
            atmosRef.current,
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

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
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
    <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-2.5 px-3 sm:px-5 lg:px-6">
      {/* Sinematik Panoramik Arena Çerçevesi (Introda temiz sinematik tam ekran, oyunda kompakt HUD) */}
      <section className="overflow-hidden rounded-2xl border border-sky-200/15 bg-[#060c18]/90 shadow-[0_28px_90px_rgba(0,0,0,0.72)] backdrop-blur-xl">
        {/* İnce Entegre Hakimiyet & Telemetri Üst Şeridi (Sadece oyun aktifken) */}
        {!showIntro && (
          <div className="border-b border-white/[0.08] bg-[#070d1b]/90 px-3.5 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/35 bg-sky-400/15 text-sky-300">
                  <CloudLightning className="h-4 w-4" />
                </div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <h1 className="font-display text-sm font-bold tracking-wider text-ink-primary sm:text-base">
                    CUMULUS · Bulut Savaşı
                  </h1>
                  <span className="rounded-md border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[11px] text-sky-200">
                    {currentStage.name}
                  </span>
                  <span className="hidden xl:inline text-xs text-ink-muted">
                    {currentStage.subtitle}
                  </span>
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
                ? "h-[calc(100vh-118px)] min-h-[540px] max-h-[760px]"
                : "h-[calc(100vh-212px)] min-h-[450px] max-h-[680px]"
            }`}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
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
                onSelectStage={(nextId) => {
                  setStageId(nextId);
                  resetGame(nextId, difficulty, windMode);
                }}
                windBadgeText={windBadgeText}
                windKmh={hud.windKmh}
                pressureHpa={bundle?.current.pressure}
                capeJkg={bundle?.nativeConvective.cape ?? null}
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
              <div className="absolute inset-0 flex items-center justify-center bg-[#040914]/80 p-4 backdrop-blur-md">
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
                      ? "border-sky-400/60 bg-sky-500/15 shadow-[0_0_20px_rgba(56,189,248,0.14)]"
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

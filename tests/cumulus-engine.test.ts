import { describe, expect, it } from "vitest";
import {
  CUMULUS_STAGES,
  SUPERCELL_SHOCKWAVE_COST,
  SUPERCELL_SHOCKWAVE_MIN_MASS,
  computeFactionShares,
  computeWindSpeedMultiplier,
  createCumulusGame,
  getCloudStage,
  launchCloudlets,
  stepCumulusGame,
  toggleSupplyLine,
  triggerSupercellShockwave,
  type GameEvent
} from "../lib/cumulus-engine";

describe("CUMULUS Bulut Savaşı simülasyon motoru", () => {
  it("4 meteorolojik bulut evrim eşiğini doğru sınıflandırır", () => {
    expect(getCloudStage(1)).toBe("cu");
    expect(getCloudStage(29.9)).toBe("cu");
    expect(getCloudStage(30)).toBe("congestus");
    expect(getCloudStage(59.9)).toBe("congestus");
    expect(getCloudStage(60)).toBe("cb");
    expect(getCloudStage(99.9)).toBe("cb");
    expect(getCloudStage(100)).toBe("supercell");
    expect(getCloudStage(150)).toBe("supercell");
  });

  it("6 cephe bölümünün tamamını çakışmayan dengeli bulutlarla üretir", () => {
    for (const stage of CUMULUS_STAGES) {
      const state = createCumulusGame({
        stageId: stage.id,
        difficulty: "storm",
        windMode: "dynamic"
      });
      expect(state.clouds.length).toBeGreaterThanOrEqual(11);
      expect(state.clouds.some((c) => c.owner === "player")).toBe(true);
      for (const opp of stage.opponents) {
        expect(state.clouds.some((c) => c.owner === opp)).toBe(true);
      }
      // Hiçbir iki bulut üst üste binmemeli (minimum 90px merkez mesafesi)
      for (let i = 0; i < state.clouds.length; i++) {
        for (let j = i + 1; j < state.clouds.length; j++) {
          const d = Math.hypot(
            state.clouds[i].x - state.clouds[j].x,
            state.clouds[i].y - state.clouds[j].y
          );
          expect(d).toBeGreaterThanOrEqual(90);
        }
      }
    }
  });

  it("kendi bulutuna bulutçuk fırlatıldığında besleyip Kümülonimbus'a evrimleştirir", () => {
    const state = createCumulusGame({
      stageId: "marmara",
      difficulty: "calm",
      windMode: "off"
    });
    const src = state.clouds[0];
    const dst = state.clouds[1];
    src.owner = "player";
    src.mass = 50;
    src.stage = getCloudStage(src.mass);
    dst.owner = "player";
    dst.mass = 45;
    dst.stage = getCloudStage(dst.mass);

    const launchEvents = launchCloudlets(state, [src.id], dst.id, 0.7);
    expect(launchEvents.some((e) => e.type === "launch")).toBe(true);
    expect(state.cloudlets.length).toBeGreaterThan(0);

    const allEvents: GameEvent[] = [];
    for (let step = 0; step < 180; step++) {
      allEvents.push(...stepCumulusGame(state, 0.03));
    }

    expect(dst.mass).toBeGreaterThanOrEqual(60);
    expect(["cb", "supercell"]).toContain(dst.stage);
    expect(
      allEvents.some((e) => e.type === "evolve" && e.cloudId === dst.id && e.stage === "cb")
    ).toBe(true);
  });

  it("tarafsız buluta fırlatılan filo bulutu ele geçirir ve capture olayı üretir", () => {
    const state = createCumulusGame({
      stageId: "marmara",
      difficulty: "calm",
      windMode: "off"
    });
    const playerCloud = state.clouds.find((c) => c.owner === "player")!;
    const neutral = state.clouds.find((c) => c.owner === "neutral")!;
    playerCloud.mass = 60;
    playerCloud.stage = "cb";
    neutral.mass = 8;

    launchCloudlets(state, [playerCloud.id], neutral.id, 0.5);
    const events: GameEvent[] = [];
    for (let i = 0; i < 200; i++) {
      events.push(...stepCumulusGame(state, 0.03));
    }

    expect(neutral.owner).toBe("player");
    expect(
      events.some((e) => e.type === "capture" && e.cloudId === neutral.id && e.owner === "player")
    ).toBe(true);
  });

  it("karşıt tarafların bulutçukları havada çarpışınca birbirini eritir", () => {
    const state = createCumulusGame({
      stageId: "marmara",
      difficulty: "calm",
      windMode: "off"
    });
    const a = state.clouds[0];
    const b = state.clouds[state.clouds.length - 1];
    a.owner = "player";
    a.x = 300;
    a.y = 300;
    b.owner = "amber";
    b.x = 500;
    b.y = 300;

    state.cloudlets = [
      {
        id: 1001,
        owner: "player",
        x: 395,
        y: 300,
        vx: 150,
        vy: 0,
        targetId: b.id,
        payload: 5,
        powerMult: 1,
        speedBase: 150,
        isHail: false,
        isCharged: false,
        age: 0
      },
      {
        id: 1002,
        owner: "amber",
        x: 405,
        y: 300,
        vx: -150,
        vy: 0,
        targetId: a.id,
        payload: 5,
        powerMult: 1,
        speedBase: 150,
        isHail: false,
        isCharged: false,
        age: 0
      }
    ];

    const events = stepCumulusGame(state, 0.03);
    expect(events.some((e) => e.type === "clash")).toBe(true);
    expect(state.cloudlets.length).toBe(0);
  });

  it("rüzgar arkadan estiğinde hızı artırır, karşıdan estiğinde yavaşlatır", () => {
    // 270° (Batıdan doğuya esen rüzgar -> +x yönünde akar)
    const tailwind = computeWindSpeedMultiplier(200, 0, 36, 270);
    const headwind = computeWindSpeedMultiplier(-200, 0, 36, 270);
    const calm = computeWindSpeedMultiplier(200, 0, 0, 270);

    expect(tailwind).toBeGreaterThan(1.15);
    expect(headwind).toBeLessThan(0.92);
    expect(calm).toBe(1);
  });

  it("Kümülonimbus (Cb) menzile giren düşman bulutçuklarını otomatik yıldırımla yok eder", () => {
    const state = createCumulusGame({
      stageId: "marmara",
      difficulty: "calm",
      windMode: "off"
    });
    const cb = state.clouds.find((c) => c.owner === "player")!;
    cb.mass = 75;
    cb.stage = "cb";
    cb.lightningTimer = 0.01;

    state.cloudlets = [
      {
        id: 2001,
        owner: "amber",
        x: cb.x + 90,
        y: cb.y,
        vx: -100,
        vy: 0,
        targetId: cb.id,
        payload: 4,
        powerMult: 1,
        speedBase: 140,
        isHail: false,
        isCharged: false,
        age: 0
      }
    ];

    const events = stepCumulusGame(state, 0.03);
    expect(events.some((e) => e.type === "lightning" && e.owner === "player")).toBe(true);
    expect(state.bolts.length).toBe(1);
    expect(state.cloudlets.length).toBe(0);
    expect(state.stats.lightningZaps).toBe(1);
  });

  it("Süper Hücre Barometrik Şok Dalgası yakındaki düşman bulutçuklarını siler ve düşman bulutuna hasar verir", () => {
    const state = createCumulusGame({
      stageId: "marmara",
      difficulty: "calm",
      windMode: "off"
    });
    const sc = state.clouds[0];
    sc.owner = "player";
    sc.mass = SUPERCELL_SHOCKWAVE_MIN_MASS + 10;
    sc.stage = "supercell";
    sc.shockwaveTimer = 0;

    const enemy = state.clouds[1];
    enemy.owner = "amber";
    enemy.x = sc.x + 120;
    enemy.y = sc.y;
    enemy.mass = 30;
    enemy.stage = "congestus";

    state.cloudlets = [
      {
        id: 3001,
        owner: "amber",
        x: sc.x + 80,
        y: sc.y,
        vx: -100,
        vy: 0,
        targetId: sc.id,
        payload: 6,
        powerMult: 1,
        speedBase: 140,
        isHail: false,
        isCharged: false,
        age: 0
      }
    ];

    const events = triggerSupercellShockwave(state, sc.id);
    expect(events.some((e) => e.type === "shockwave")).toBe(true);
    expect(sc.mass).toBe(SUPERCELL_SHOCKWAVE_MIN_MASS + 10 - SUPERCELL_SHOCKWAVE_COST);
    expect(state.cloudlets.length).toBe(0);
    expect(enemy.mass).toBe(16);
    expect(state.shockwaves.length).toBe(1);
  });

  it("sürekli Besleme Hattı otomatik bulutçuk pompalar ve AI botlar oyun boyunca hamle yapar", () => {
    const state = createCumulusGame({
      stageId: "marmara",
      difficulty: "storm",
      windMode: "dynamic"
    });
    const c1 = state.clouds[0];
    const c2 = state.clouds[1];
    c1.owner = "player";
    c1.mass = 30;
    c2.owner = "player";
    c2.mass = 20;

    expect(toggleSupplyLine(state, c1.id, c2.id)).toBe(true);
    expect(c1.supplyTargetId).toBe(c2.id);

    let aiLaunched = false;
    let supplyLaunched = false;
    for (let i = 0; i < 160; i++) {
      const evs = stepCumulusGame(state, 0.04);
      if (evs.some((e) => e.type === "launch" && e.owner === "amber")) {
        aiLaunched = true;
      }
      if (evs.some((e) => e.type === "launch" && e.owner === "player")) {
        supplyLaunched = true;
      }
    }

    expect(supplyLaunched).toBe(true);
    expect(aiLaunched).toBe(true);

    const shares = computeFactionShares(state);
    expect(shares.some((s) => s.faction === "player")).toBe(true);
    expect(shares.reduce((acc, s) => acc + s.pct, 0)).toBeGreaterThanOrEqual(98);
  });
});

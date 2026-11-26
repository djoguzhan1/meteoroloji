import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveSkewTMarkerCollisions } from "../components/SkewTCanvas";

describe("Site Geneli Sekme Bazlı Çakışma Önleme & Rasathane Tasarım Doğrulaması", () => {
  it("1. Skew-T sağ eksen LCL / LFC / EL etiket çarpışma çözücüsü birbirine yakın seviyeleri üst üste bindirmez", () => {
    // LFC (349px) ve LCL (352px) yalnızca 3px aralıklı olduğunda en az 14px dikey boşluk bırakır
    const closePair = resolveSkewTMarkerCollisions(
      [
        { label: "LCL", color: "#f59e0b", rawY: 352 },
        { label: "LFC", color: "#ef4444", rawY: 349 },
        { label: "EL", color: "#94a3b8", rawY: 96 }
      ],
      14,
      30,
      390
    );

    expect(closePair).toHaveLength(3);
    expect(closePair[0].label).toBe("EL");
    expect(closePair[1].label).toBe("LFC");
    expect(closePair[2].label).toBe("LCL");
    expect(closePair[2].labelY - closePair[1].labelY).toBeGreaterThanOrEqual(14);
    expect(closePair[1].labelY - closePair[0].labelY).toBeGreaterThanOrEqual(14);

    // Alt sınıra (maxY = 390) dayanan 3 etiket geriye doğru esnetilerek çerçeve dışına taşmaz
    const bottomCluster = resolveSkewTMarkerCollisions(
      [
        { label: "EL", color: "#94a3b8", rawY: 384 },
        { label: "LFC", color: "#ef4444", rawY: 387 },
        { label: "LCL", color: "#f59e0b", rawY: 389 }
      ],
      14,
      30,
      390
    );
    expect(bottomCluster[2].labelY).toBeLessThanOrEqual(390);
    expect(bottomCluster[2].labelY - bottomCluster[1].labelY).toBeGreaterThanOrEqual(14);
    expect(bottomCluster[1].labelY - bottomCluster[0].labelY).toBeGreaterThanOrEqual(14);
  });

  it("2. Küresel Z-Index merdiveni: CommandPalette (z-80) > CitySearch (z-65) > ScanBeam (z-55) > Header/Nav (z-50) > Dashboard Search (z-30)", () => {
    const repoRoot = path.resolve(__dirname, "..");

    const paletteSrc = fs.readFileSync(
      path.join(repoRoot, "components/CommandPalette.tsx"),
      "utf-8"
    );
    expect(paletteSrc).toContain("z-[80]");

    const searchSrc = fs.readFileSync(
      path.join(repoRoot, "components/CitySearch.tsx"),
      "utf-8"
    );
    expect(searchSrc).toContain("z-[65]");

    const stageSrc = fs.readFileSync(
      path.join(repoRoot, "components/RouteTransitionStage.tsx"),
      "utf-8"
    );
    expect(stageSrc).toContain("top-[98px] sm:top-[53px]");
    expect(stageSrc).toContain("z-[55]");

    const shellSrc = fs.readFileSync(
      path.join(repoRoot, "components/AppShell.tsx"),
      "utf-8"
    );
    expect(shellSrc).toContain("pt-[110px] sm:pt-[74px]");
    expect(shellSrc).toContain("pb-safe-nav");
    expect(shellSrc).toContain("new ResizeObserver");

    const dashSrc = fs.readFileSync(
      path.join(repoRoot, "components/DashboardView.tsx"),
      "utf-8"
    );
    expect(dashSrc).toContain("relative z-30 flex flex-wrap items-center justify-between");
  });

  it("3. 5 Sekme Dikey/Yatay Şerit İzolasyonu: Meteogram 7-bant ayrımı, TimeScrubber tooltip kanalı, Radar birleşik HUD ve Cumulus tekerlek kilidi", () => {
    const repoRoot = path.resolve(__dirname, "..");

    // Sekme 1: Hava — Meteogram 330px 7-bant şerit ayrımı & TimeScrubber çakışmasız üst kanal
    const meteogramSrc = fs.readFileSync(
      path.join(repoRoot, "components/HourlyForecastStrip.tsx"),
      "utf-8"
    );
    expect(meteogramSrc).toContain("const STAGE_H = 330;");
    expect(meteogramSrc).toContain("const HYETO_BASE_Y = 274;");
    expect(meteogramSrc).toContain("top-[28px]");
    expect(meteogramSrc).toContain("top-[54px]");
    expect(meteogramSrc).toContain("top-[203px]");

    const scrubberSrc = fs.readFileSync(
      path.join(repoRoot, "components/TimeScrubber.tsx"),
      "utf-8"
    );
    expect(scrubberSrc).not.toContain("-top-8");
    expect(scrubberSrc).toContain('className="relative pt-6"');

    // Sekme 2: Radar — Birleşik esnek üst HUD kuşağı (dar ekranda lejant ve butonlar üst üste binmez)
    const radarSrc = fs.readFileSync(
      path.join(repoRoot, "components/LiveRadarMap.tsx"),
      "utf-8"
    );
    expect(radarSrc).toContain(
      "inset-x-3 top-3 z-20 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
    );

    // Sekme 5: Bulut Savaşı — Non-passive wheel kilidi ve mobil güvenli arena yüksekliği
    const cumulusSrc = fs.readFileSync(
      path.join(repoRoot, "components/CumulusGameView.tsx"),
      "utf-8"
    );
    expect(cumulusSrc).not.toContain("onWheel={handleWheel}");
    expect(cumulusSrc).toContain('canvas.addEventListener("wheel", onWheel, { passive: false })');
    expect(cumulusSrc).toContain("100svh-196px");
  });
});

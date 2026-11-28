/**
 * ATMOS v5.0 — Wave 2 (ARC-03): 80-Province 3D Anisotropic Topographic Cressman,
 * Directional Orographic Barrier (Froude Foehn / Upslope / Rain-Shadow), Venturi Channel,
 * Oke (1987) UHI Canopy & Exponential Sea-Breeze Solver
 * File: lib/provinces/engine/province-cressman.ts
 *
 * Pure TypeScript / ESM module — ZERO `node:*` imports.
 * Enforces an impenetrable province-boundary station firewall (`obs.provinceCode === spec.provinceCode`).
 */

import {
  dewPointMagnus,
  relativeHumidityFromDewPoint
} from "../../thermo-cape";
import type {
  DirectionalBarrierRule,
  ProvinceZoneKind,
  TrProvinceCode,
  VenturiCorridorRule
} from "../types";
import {
  angularDifferenceDeg,
  computeProvinceLiveVerticalProfile,
  computeSectorAlignmentCos,
  haversineDistanceKm,
  integrateProvinceVerticalDeltaC,
  type ProvinceBarrierAliasRule,
  type ProvinceBoundaryLayerState,
  type ProvinceEngineSpec,
  type ProvinceLiveStationObs,
  type ProvinceLiveVerticalProfile
} from "./province-vertical-profile";

export interface ProvinceTargetPoint {
  lat: number;
  lon: number;
  elevationM: number;
  subBasinId?: string;
  zone?: ProvinceZoneKind;
  urbanFraction?: number;
  isCoastal?: boolean;
  coastalDistanceKm?: number;
}

export interface ProvinceAmbientDrivers {
  localHour: number;
  month?: number; // 1..12
  isNight: boolean;
  cloudCoverPct: number;
  wind850DirDeg?: number | null;
  wind850SpeedKmh?: number | null;
  wind10mDirDeg?: number | null;
  wind10mSpeedKmh?: number | null;
  bruntVaisalaFreqS1?: number | null;
  liveWaterTempsByIdC?: Readonly<Record<string, number>>;
  hasSnowpack?: boolean;
}

export interface DirectionalBarrierEffect {
  activeBarrierIds: string[];
  activeRegime: "FOEHN_LEE" | "UPSLOPE_OROGRAPHIC" | "RAIN_SHADOW" | "NEUTRAL";
  froudeNumber: number;
  foehnTempDeltaC: number;
  foehnRhDeltaPct: number;
  precipMultiplier: number;
  foehnBlockedByColdWedge: boolean;
}

export interface VenturiCorridorEffect {
  activeCorridorIds: string[];
  speedMultiplier: number;
  gustMultiplier: number;
  alignmentCos2: number;
  suppressesNocturnalInversion: boolean;
}

export interface MicroclimateOffsetBreakdown {
  totalOffsetC: number;
  uhiNocturnalOffsetC: number;
  seaBreezeOffsetC: number;
  marineThermalModerationC: number;
}

export interface ProvinceStationContribution {
  stationId: string | number;
  stationName: string;
  provinceCode: TrProvinceCode;
  distanceKm: number;
  deltaElevM: number;
  rawTempC: number;
  transportedTempC: number;
  normalizedWeight: number;
  usedColdBasinUnbias: boolean;
}

export interface ProvinceTopographicSurfaceResult {
  provinceCode: TrProvinceCode;
  tempC: number;
  dewPointC: number | null;
  relHumidityPct: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  windDirDeg: number | null;
  pressureMslHpa: number | null;
  precip1hMm: number;
  snowDepthCm: number | null;
  isPrecipitatingNow: boolean;
  uncertaintyC: number;
  verticalState: ProvinceBoundaryLayerState;
  acceptedStationCount: number;
  rejectedCrossBorderCount: number;
  barrierEffect: DirectionalBarrierEffect;
  venturiEffect: VenturiCorridorEffect;
  microclimateOffset: MicroclimateOffsetBreakdown;
  contributions: ProvinceStationContribution[];
}

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Resolves missing target sub-basin, zone, urbanFraction, and coastal distance from `ProvinceSpec`.
 */
export function resolveProvinceTargetMetadata(
  spec: ProvinceEngineSpec,
  rawTarget: ProvinceTargetPoint
): Required<ProvinceTargetPoint> {
  let matchedSubBasinId = rawTarget.subBasinId ?? "";
  let matchedZone: ProvinceZoneKind | undefined = rawTarget.zone;
  let matchedUrban = rawTarget.urbanFraction;

  const needSubBasin = !matchedSubBasinId;
  const needZone = !matchedZone;
  const needUrban = matchedUrban === undefined;

  if (needSubBasin || needZone || needUrban) {
    const centerDistKm = haversineDistanceKm(
      rawTarget.lat,
      rawTarget.lon,
      spec.primaryCenter.lat,
      spec.primaryCenter.lon
    );
    const centerElevDiffM = Math.abs(rawTarget.elevationM - spec.primaryCenter.demVerifiedElevationM);
    const centerBasin =
      centerDistKm <= 2.2 && centerElevDiffM <= 75
        ? spec.subBasins.find((s) => s.id === spec.primaryCenter.subBasinId)
        : undefined;

    if (centerBasin) {
      if (needSubBasin) matchedSubBasinId = centerBasin.id;
      if (needZone) matchedZone = centerBasin.defaultZone;
      if (needUrban) matchedUrban = spec.primaryCenter.urbanFraction;
    } else {
      let bestScore = Infinity;
      for (const sb of spec.subBasins) {
        const b = sb.polygonOrBbox;
        const inBox =
          rawTarget.lat >= b.minLat &&
          rawTarget.lat <= b.maxLat &&
          rawTarget.lon >= b.minLon &&
          rawTarget.lon <= b.maxLon;
        const cLat = 0.5 * (b.minLat + b.maxLat);
        const cLon = 0.5 * (b.minLon + b.maxLon);
        const distKm = haversineDistanceKm(rawTarget.lat, rawTarget.lon, cLat, cLon);
        const [zLo, zHi] = sb.elevationRangeM;
        const elevOutM =
          rawTarget.elevationM < zLo
            ? zLo - rawTarget.elevationM
            : rawTarget.elevationM > zHi
              ? rawTarget.elevationM - zHi
              : 0;
        const score = (inBox ? 0 : 35) + distKm * 0.5 + elevOutM * 0.04;
        if (score < bestScore) {
          bestScore = score;
          if (needSubBasin) matchedSubBasinId = sb.id;
          if (needZone) matchedZone = sb.defaultZone;
          if (needUrban) matchedUrban = sb.defaultUrbanFraction;
        }
      }
    }
  }

  if (!matchedSubBasinId) {
    matchedSubBasinId = spec.primaryCenter.subBasinId;
  }

  const distToCenterKm = haversineDistanceKm(
    rawTarget.lat,
    rawTarget.lon,
    spec.primaryCenter.lat,
    spec.primaryCenter.lon
  );
  if (matchedUrban === undefined) {
    matchedUrban =
      distToCenterKm <= 6
        ? spec.primaryCenter.urbanFraction
        : Math.max(0.12, spec.primaryCenter.urbanFraction * Math.exp(-distToCenterKm / 18));
  }

  if (!matchedZone) {
    const floorM = spec.inversionAndWedgeSpec.basinFloorElevationM;
    matchedZone =
      rawTarget.elevationM >= floorM + 1100
        ? "alpine_summit"
        : rawTarget.elevationM >= floorM + 450
          ? "mountain_slope"
          : rawTarget.elevationM <= 45 && spec.waterBodies.length > 0
            ? "coastal_marine"
            : "urban_plain";
  }

  let coastalDistanceKm = rawTarget.coastalDistanceKm;
  if (!isFiniteNum(coastalDistanceKm)) {
    if (spec.seaBreeze?.coastReferenceCoord) {
      coastalDistanceKm = haversineDistanceKm(
        rawTarget.lat,
        rawTarget.lon,
        spec.seaBreeze.coastReferenceCoord.lat,
        spec.seaBreeze.coastReferenceCoord.lon
      );
    } else if (spec.waterBodies.length > 0) {
      const coastCandidates = [
        ...spec.waterBodies.map((wb) => wb.sampleCoord),
        ...spec.curatedSubLocations
          .filter((c) => c.role === "coast")
          .map((c) => ({ lat: c.lat, lon: c.lon })),
        ...spec.stencil9Points
          .filter((p) => p.role === "marine_upwind")
          .map((p) => ({ lat: p.lat, lon: p.lon }))
      ];
      coastalDistanceKm =
        coastCandidates.length > 0
          ? Math.min(
              ...coastCandidates.map((c) =>
                haversineDistanceKm(rawTarget.lat, rawTarget.lon, c.lat, c.lon)
              )
            )
          : 999;
    } else {
      coastalDistanceKm = 999;
    }
  }

  const isCoastal =
    rawTarget.isCoastal ??
    (matchedZone === "coastal_marine" ||
      matchedZone === "peninsula_exposed" ||
      matchedZone === "strait_corridor" ||
      (coastalDistanceKm <= 12 && rawTarget.elevationM <= 120));

  return {
    lat: rawTarget.lat,
    lon: rawTarget.lon,
    elevationM: rawTarget.elevationM,
    subBasinId: matchedSubBasinId,
    zone: matchedZone,
    urbanFraction: clamp(matchedUrban, 0, 1),
    isCoastal,
    coastalDistanceKm
  };
}

/**
 * Disambiguates windward vs. leeward side when a single `DirectionalBarrierRule` declares
 * overlapping wind sectors for both `foehnSpec` and `upslopeSpec` (e.g., Kaz Dağları where
 * southerly flow simultaneously causes upslope rain on Ayvacık and lee Foehn on Bayramiç).
 */
function isTargetOnWindwardSideWhenOverlapping(
  spec: ProvinceEngineSpec,
  target: Required<ProvinceTargetPoint>
): boolean {
  if (target.zone === "mountain_slope" || target.zone === "alpine_summit") {
    return true;
  }
  const windwardPts = spec.stencil9Points.filter(
    (p) => p.role === "foehn_windward" || p.role === "orographic_wall" || p.role === "marine_upwind"
  );
  const leePts = spec.stencil9Points.filter((p) => p.role === "lee_shadow");

  if (windwardPts.length > 0 && leePts.length > 0) {
    const minWindwardKm = Math.min(
      ...windwardPts.map((p) => haversineDistanceKm(target.lat, target.lon, p.lat, p.lon))
    );
    const minLeeKm = Math.min(
      ...leePts.map((p) => haversineDistanceKm(target.lat, target.lon, p.lat, p.lon))
    );
    return minWindwardKm < minLeeKm;
  }

  return target.isCoastal;
}

/**
 * Evaluates directional orographic barrier rules (Amanos, Toroslar, Kaçkar, Zigana, Spil,
 * Bozdağ, Kaz, Istranca, Yıldız, Samanlı, Küre, Ilgaz, Munzur, etc.) via Mountain Froude Number:
 *   Fr = U_perp / (N * H_eff)
 * Preserves full wind-direction asymmetry (e.g., Antalya northerly Toros Foehn vs southerly
 * Mediterranean flood upslope; Rize southerly Kaçkar Foehn vs NW Black Sea convergence).
 */
export function applyDirectionalBarrierRules(params: {
  spec: ProvinceEngineSpec;
  target: Required<ProvinceTargetPoint>;
  drivers: ProvinceAmbientDrivers;
}): DirectionalBarrierEffect {
  const { spec, target, drivers } = params;
  const rules: readonly (DirectionalBarrierRule | ProvinceBarrierAliasRule)[] =
    spec.barriers && spec.barriers.length > 0
      ? spec.barriers
      : spec.directionalBarriers ?? [];

  const windDir = drivers.wind850DirDeg ?? drivers.wind10mDirDeg ?? null;
  const windSpeedKmh =
    drivers.wind850SpeedKmh ??
    (isFiniteNum(drivers.wind10mSpeedKmh) ? drivers.wind10mSpeedKmh * 1.4 : null);

  if (rules.length === 0 || !isFiniteNum(windDir) || !isFiniteNum(windSpeedKmh) || windSpeedKmh <= 1) {
    return {
      activeBarrierIds: [],
      activeRegime: "NEUTRAL",
      froudeNumber: 0,
      foehnTempDeltaC: 0,
      foehnRhDeltaPct: 0,
      precipMultiplier: 1.0,
      foehnBlockedByColdWedge: false
    };
  }

  // Shallow Balkan / continental cold-wedge guard (e.g., Thrace Edirne surface Karayel under 850 hPa Lodos)
  const wedgeRule = spec.inversionAndWedgeSpec?.shallowColdWedgeRule;
  let foehnBlockedByColdWedge = false;
  if (
    wedgeRule &&
    isFiniteNum(drivers.wind10mDirDeg) &&
    isFiniteNum(drivers.wind850DirDeg)
  ) {
    const sfcInCold = computeSectorAlignmentCos(
      drivers.wind10mDirDeg,
      wedgeRule.surfaceColdSectorDeg.fromDeg,
      wedgeRule.surfaceColdSectorDeg.toDeg
    ).inside;
    const shearDeg = angularDifferenceDeg(drivers.wind10mDirDeg, drivers.wind850DirDeg);
    if (sfcInCold && shearDeg >= wedgeRule.minWindShearVs850Deg) {
      foehnBlockedByColdWedge = true;
    }
  }

  const bruntVaisala = clamp(drivers.bruntVaisalaFreqS1 ?? 0.0108, 0.0045, 0.025);
  const windMs = Math.max(0, windSpeedKmh) / 3.6;

  const activeBarrierIds: string[] = [];
  let bestFroude = 0;
  let foehnTempDeltaC = 0;
  let foehnRhDeltaPct = 0;
  let precipMultiplier = 1.0;
  let activeRegime: DirectionalBarrierEffect["activeRegime"] = "NEUTRAL";

  for (const rule of rules) {
    const subBasins = rule.applicableSubBasins ?? [];
    if (
      subBasins.length > 0 &&
      target.subBasinId &&
      !subBasins.includes(target.subBasinId)
    ) {
      continue;
    }

    const hEffM = Math.max(250, rule.effectiveBarrierHeightM);
    const denom = Math.max(1.5, bruntVaisala * hEffM);

    if ("foehnSpec" in rule) {
      const fAlign = rule.foehnSpec.enabled
        ? computeSectorAlignmentCos(
            windDir,
            rule.foehnSpec.windFromSectorDeg.fromDeg,
            rule.foehnSpec.windFromSectorDeg.toDeg
          )
        : { inside: false, alignment: 0, angularOffsetDeg: 180 };
      const uAlign = rule.upslopeSpec.enabled
        ? computeSectorAlignmentCos(
            windDir,
            rule.upslopeSpec.windFromSectorDeg.fromDeg,
            rule.upslopeSpec.windFromSectorDeg.toDeg
          )
        : { inside: false, alignment: 0, angularOffsetDeg: 180 };

      const bothSectorsOverlap = fAlign.inside && uAlign.inside;
      const preferWindwardUpslope =
        bothSectorsOverlap && isTargetOnWindwardSideWhenOverlapping(spec, target);

      // 1) Leeward Foehn warming & drying
      if (
        !foehnBlockedByColdWedge &&
        !preferWindwardUpslope &&
        fAlign.inside &&
        target.elevationM <= rule.foehnSpec.maxTargetElevationM
      ) {
        const uPerpMs = windMs * fAlign.alignment;
        const fr = uPerpMs / denom;
        bestFroude = Math.max(bestFroude, fr);

        if (
          uPerpMs >= rule.foehnSpec.minCrossCrestSpeedMs &&
          fr >= rule.foehnSpec.minFroudeNumber
        ) {
          const descentSpanM = Math.max(
            250,
            rule.foehnSpec.sourcePlateauElevationM + 0.35 * hEffM - target.elevationM
          );
          const descentFactor = clamp(descentSpanM / 1450, 0.35, 1.35);
          const frFactor = clamp(
            (fr - rule.foehnSpec.minFroudeNumber + 0.28) / 0.58,
            0.3,
            1.18
          );
          const speedFactor = clamp(
            (uPerpMs - rule.foehnSpec.minCrossCrestSpeedMs + 3.5) / 10.5,
            0.32,
            1.0
          );
          const rawWarmC =
            rule.foehnSpec.maxWarmingCapC *
            descentFactor *
            frFactor *
            speedFactor *
            fAlign.alignment;
          const warmC = clamp(rawWarmC, 0.25, rule.foehnSpec.maxWarmingCapC);

          if (warmC > foehnTempDeltaC) {
            foehnTempDeltaC = warmC;
            foehnRhDeltaPct = -clamp(
              warmC * 4.8 * Math.max(0.5, rule.foehnSpec.subCloudVirgaFactor),
              4,
              42
            );
            activeRegime = "FOEHN_LEE";
          }

          const virgaAtten = clamp(
            1 - 0.45 * rule.foehnSpec.subCloudVirgaFactor * speedFactor,
            0.22,
            0.88
          );
          precipMultiplier = Math.min(precipMultiplier, virgaAtten);
          activeBarrierIds.push(rule.id);
        }
      }

      // 2) Lee Rain-Shadow check (skipped if target is on the windward side of an overlapping rule)
      if (rule.rainShadowSpec && !preferWindwardUpslope) {
        const rsAlign = computeSectorAlignmentCos(
          windDir,
          rule.rainShadowSpec.shadowedWindFromSectorDeg.fromDeg,
          rule.rainShadowSpec.shadowedWindFromSectorDeg.toDeg
        );
        if (rsAlign.inside && windMs * rsAlign.alignment >= 4.0) {
          const shadowMult = clamp(
            1 - (1 - rule.rainShadowSpec.precipAttenuationFactor) * rsAlign.alignment,
            0.2,
            1.0
          );
          precipMultiplier = Math.min(precipMultiplier, shadowMult);
          if (activeRegime === "NEUTRAL") activeRegime = "RAIN_SHADOW";
          if (!activeBarrierIds.includes(rule.id)) activeBarrierIds.push(rule.id);
        }
      }

      // 3) Windward Upslope Orographic Enhancement (never suppresses flood rain on onshore flow!)
      if (uAlign.inside && (!bothSectorsOverlap || preferWindwardUpslope || activeRegime !== "FOEHN_LEE")) {
        const uPerpMs = windMs * uAlign.alignment;
        const fr = uPerpMs / denom;
        bestFroude = Math.max(bestFroude, fr);

        if (uPerpMs >= rule.upslopeSpec.minOnshoreOrUpslopeSpeedMs && activeRegime !== "FOEHN_LEE") {
          const speedRamp = clamp(
            (uPerpMs - rule.upslopeSpec.minOnshoreOrUpslopeSpeedMs + 3.0) / 11.0,
            0.25,
            1.0
          );
          const coastBoost = target.isCoastal
            ? Math.max(1.0, rule.upslopeSpec.coastalFrictionalConvergenceBoost)
            : 1.0 + 0.35 * Math.max(0, rule.upslopeSpec.coastalFrictionalConvergenceBoost - 1.0);
          const rawMult =
            1.0 +
            (rule.upslopeSpec.maxPrecipMultiplierCap - 1.0) *
              speedRamp *
              uAlign.alignment *
              clamp(coastBoost / 1.15, 0.85, 1.25);
          const mult = clamp(rawMult, 1.05, rule.upslopeSpec.maxPrecipMultiplierCap);

          if (mult > precipMultiplier) {
            precipMultiplier = mult;
            activeRegime = "UPSLOPE_OROGRAPHIC";
            if (!activeBarrierIds.includes(rule.id)) activeBarrierIds.push(rule.id);
          }
        }
      }
    } else {
      // Alias barrier rule support
      if (!foehnBlockedByColdWedge && rule.foehnWindSectorDeg) {
        const fAlign = computeSectorAlignmentCos(
          windDir,
          rule.foehnWindSectorDeg.fromDeg,
          rule.foehnWindSectorDeg.toDeg
        );
        const maxElev = rule.maxFoehnTargetElevationM ?? 1200;
        if (fAlign.inside && target.elevationM <= maxElev) {
          const uPerpMs = windMs * fAlign.alignment;
          const fr = uPerpMs / denom;
          bestFroude = Math.max(bestFroude, fr);
          const minMs = (rule.minCrossWindKmh ?? 24) / 3.6;
          const minFr = rule.minFroudeNumber ?? 0.38;
          if (uPerpMs >= minMs && fr >= minFr) {
            const capC = rule.maxFoehnWarmingC ?? 4.5;
            const warmC = clamp(
              capC * clamp((uPerpMs - minMs + 3.5) / 10, 0.35, 1) * fAlign.alignment,
              0.25,
              capC
            );
            if (warmC > foehnTempDeltaC) {
              foehnTempDeltaC = warmC;
              foehnRhDeltaPct = -(rule.foehnRhDryingPct ?? Math.round(warmC * 4.5));
              activeRegime = "FOEHN_LEE";
            }
            if (isFiniteNum(rule.rainShadowMultiplier)) {
              precipMultiplier = Math.min(precipMultiplier, clamp(rule.rainShadowMultiplier, 0.15, 1.0));
            }
            activeBarrierIds.push(rule.id);
          }
        }
      }

      if (rule.upslopeWindSectorDeg) {
        const uAlign = computeSectorAlignmentCos(
          windDir,
          rule.upslopeWindSectorDeg.fromDeg,
          rule.upslopeWindSectorDeg.toDeg
        );
        if (uAlign.inside) {
          const uPerpMs = windMs * uAlign.alignment;
          bestFroude = Math.max(bestFroude, uPerpMs / denom);
          if (uPerpMs >= 4.0 && activeRegime !== "FOEHN_LEE") {
            const capMult = rule.upslopePrecipMultiplier ?? 1.85;
            const ramp = clamp((uPerpMs - 3.0) / 10.0, 0.25, 1.0);
            precipMultiplier = Math.max(
              precipMultiplier,
              clamp(1 + (capMult - 1) * ramp * uAlign.alignment, 1.05, capMult)
            );
            activeRegime = "UPSLOPE_OROGRAPHIC";
            if (!activeBarrierIds.includes(rule.id)) activeBarrierIds.push(rule.id);
          }
        }
      }
    }
  }

  return {
    activeBarrierIds,
    activeRegime,
    froudeNumber: Number(bestFroude.toFixed(3)),
    foehnTempDeltaC: Number(foehnTempDeltaC.toFixed(2)),
    foehnRhDeltaPct: Number(foehnRhDeltaPct.toFixed(1)),
    precipMultiplier: Number(precipMultiplier.toFixed(3)),
    foehnBlockedByColdWedge
  };
}

/**
 * Evaluates gap-wind / strait Venturi channel acceleration (Çanakkale Strait, Bosphorus,
 * Gülek, Belen, Sertavul, Çubuk, Zigana, Kırkdilim, Kop, Sabuncubeli) with cos^2(Δθ) axis alignment.
 */
export function applyVenturiCorridorRules(params: {
  corridors: readonly VenturiCorridorRule[];
  targetLat: number;
  targetLon: number;
  windDirDeg?: number | null;
  windSpeedKmh?: number | null;
}): VenturiCorridorEffect {
  const { corridors, targetLat, targetLon, windDirDeg, windSpeedKmh } = params;
  if (
    !corridors ||
    corridors.length === 0 ||
    !isFiniteNum(windDirDeg) ||
    (isFiniteNum(windSpeedKmh) && windSpeedKmh < 4.0)
  ) {
    return {
      activeCorridorIds: [],
      speedMultiplier: 1.0,
      gustMultiplier: 1.0,
      alignmentCos2: 0,
      suppressesNocturnalInversion: false
    };
  }

  const activeCorridorIds: string[] = [];
  let bestSpeedMult = 1.0;
  let bestGustMult = 1.0;
  let bestCos2 = 0;
  let suppressesNocturnalInversion = false;

  for (const c of corridors) {
    const distKm = haversineDistanceKm(
      targetLat,
      targetLon,
      c.centerCoord.lat,
      c.centerCoord.lon
    );
    const radiusKm = Math.max(2, c.influenceRadiusKm);
    if (distKm > radiusKm * 1.35) continue;

    const diffPrimary = angularDifferenceDeg(windDirDeg, c.channelAxisFromDeg);
    const diffOpposite = c.bidirectional
      ? angularDifferenceDeg(windDirDeg, (c.channelAxisFromDeg + 180) % 360)
      : 180;
    const dThetaDeg = Math.min(diffPrimary, diffOpposite);

    const maxHalfWidth = Math.max(15, Math.min(89, c.sectorHalfWidthDeg));
    if (dThetaDeg > maxHalfWidth) continue;

    // Exact cos^2(Δθ) channel axis alignment modulated by smooth spatial corridor envelope
    const cos2 = Math.cos((dThetaDeg * Math.PI) / 180) ** 2;
    const spatialEnv =
      distKm <= radiusKm * 0.35
        ? 1.0
        : Math.exp(-(((distKm - radiusKm * 0.35) / (radiusKm * 0.65)) ** 2));
    const effFactor = cos2 * spatialEnv;

    const spdMult = 1 + Math.max(0, c.speedMultiplier - 1) * effFactor;
    const gstMult = 1 + Math.max(0, c.gustMultiplier - 1) * effFactor;

    if (spdMult > 1.02 || gstMult > 1.02) {
      activeCorridorIds.push(c.id);
      if (spdMult > bestSpeedMult) {
        bestSpeedMult = spdMult;
        bestCos2 = cos2;
      }
      if (gstMult > bestGustMult) {
        bestGustMult = gstMult;
      }
      const acceleratedSpd = (windSpeedKmh ?? 18) * spdMult;
      if (c.suppressesNocturnalInversion && acceleratedSpd >= 16) {
        suppressesNocturnalInversion = true;
      }
    }
  }

  return {
    activeCorridorIds,
    speedMultiplier: Number(bestSpeedMult.toFixed(3)),
    gustMultiplier: Number(bestGustMult.toFixed(3)),
    alignmentCos2: Number(bestCos2.toFixed(4)),
    suppressesNocturnalInversion
  };
}

/**
 * Oke (1987) nocturnal Urban Heat Island (UHI) + rural cold-basin airport unbiaser (`coldBasinAirportIcaos`)
 * + daytime exponential coastal-decay sea-breeze (İmbat/meltem) solver.
 */
export function computeProvinceMicroclimateOffsetC(params: {
  spec: ProvinceEngineSpec;
  target: Required<ProvinceTargetPoint>;
  drivers: ProvinceAmbientDrivers;
  referenceUrbanFraction?: number;
  referenceStationColdPool?: number;
  referenceStationIcao?: string;
  ambientTempC?: number;
}): MicroclimateOffsetBreakdown {
  const { spec, target, drivers } = params;
  const h = ((drivers.localHour % 24) + 24) % 24;
  const month = clamp(drivers.month ?? 6, 1, 12);

  const cloudFrac = clamp(drivers.cloudCoverPct / 100, 0, 1);
  const clearSkyFactor = Math.max(0.1, 1 - 0.82 * cloudFrac * cloudFrac);
  const windKmh = Math.max(0, drivers.wind10mSpeedKmh ?? (drivers.wind850SpeedKmh ?? 12) * 0.55);
  const windMs = windKmh / 3.6;
  const calmDamping = 1 / Math.sqrt(1 + (windMs / 2.4) ** 2);

  // 1. Nocturnal Oke (1987) UHI + Cold-Basin Airport Unbias
  let nocturnalPhase = 0;
  if (drivers.isNight) {
    if (h >= 21 || h <= 6) nocturnalPhase = 1.0;
    else if (h >= 18) nocturnalPhase = (h - 17) / 4;
    else if (h <= 9) nocturnalPhase = (10 - h) / 4;
    else nocturnalPhase = 0.65;
  } else if (h >= 7 && h <= 8) {
    nocturnalPhase = 0.3;
  }

  const refUrban =
    params.referenceUrbanFraction ??
    spec.urbanHeatIsland?.referenceUrbanFraction ??
    spec.primaryCenter.urbanFraction;
  const maxUhiScale = spec.urbanHeatIsland?.maxNocturnalUhiC ?? 3.1;
  const urbanDiff = target.urbanFraction - refUrban;

  const coldAirportSet = new Set(
    (spec.urbanHeatIsland?.coldBasinAirportIcaos ?? []).map((x) => x.toUpperCase())
  );
  const isColdBasinAirport =
    params.referenceStationIcao !== undefined &&
    coldAirportSet.has(params.referenceStationIcao.toUpperCase());
  const effColdPool = Math.max(
    params.referenceStationColdPool ?? 0,
    isColdBasinAirport ? 0.92 : 0
  );

  let uhiNocturnalOffsetC = 0;
  if (nocturnalPhase > 0) {
    const urbanComponent = maxUhiScale * urbanDiff;
    const basinEscapeComponent =
      effColdPool >= 0.45 && target.urbanFraction > refUrban + 0.1
        ? 2.25 * effColdPool * Math.max(0.25, target.urbanFraction - refUrban)
        : 0;
    uhiNocturnalOffsetC =
      (urbanComponent + basinEscapeComponent) *
      nocturnalPhase *
      clearSkyFactor *
      calmDamping;
  }

  // 2. Daytime Exponential Sea-Breeze Cooling (İmbat / Meltem) + Marine Moderation
  let seaBreezeOffsetC = 0;
  let marineThermalModerationC = 0;

  const afternoonWave =
    h >= 11 && h <= 18 ? Math.sin(((h - 10) / 9) * Math.PI) : 0;
  const windDir = drivers.wind10mDirDeg ?? drivers.wind850DirDeg ?? null;

  if (spec.seaBreeze && spec.seaBreeze.enabled !== false) {
    const [mStart, mEnd] = spec.seaBreeze.activeMonths ?? [4, 10];
    const inSeason = month >= mStart && month <= mEnd;
    if (inSeason && afternoonWave > 0 && isFiniteNum(windDir) && spec.seaBreeze.onshoreSectorDeg) {
      const align = computeSectorAlignmentCos(
        windDir,
        spec.seaBreeze.onshoreSectorDeg.fromDeg,
        spec.seaBreeze.onshoreSectorDeg.toDeg
      );
      if (align.inside && windKmh >= 5 && windKmh <= 38) {
        const decayKm = Math.max(4, spec.seaBreeze.inlandDecayScaleKm ?? 28);
        const maxCool = Math.abs(spec.seaBreeze.maxCoolingC ?? 2.8);
        seaBreezeOffsetC =
          -maxCool *
          Math.exp(-target.coastalDistanceKm / decayKm) *
          afternoonWave *
          clearSkyFactor *
          align.alignment;
      }
    }
  } else if (spec.waterBodies.length > 0) {
    for (const wb of spec.waterBodies) {
      const subW =
        wb.subBasinInfluenceWeights[target.subBasinId] ??
        (target.coastalDistanceKm <= wb.seaBreezeSpec.maxInlandPenetrationKm ? 0.65 : 0);
      if (subW <= 0.02) continue;

      const waterTempC =
        drivers.liveWaterTempsByIdC?.[wb.id] ??
        wb.monthlyWaterTempNormalsC[clamp(month - 1, 0, 11)];

      const [mStart, mEnd] = wb.seaBreezeSpec.activeMonths;
      const inSeason = month >= mStart && month <= mEnd;
      if (inSeason && afternoonWave > 0 && isFiniteNum(windDir)) {
        const align = computeSectorAlignmentCos(
          windDir,
          wb.seaBreezeSpec.sectorDeg.fromDeg,
          wb.seaBreezeSpec.sectorDeg.toDeg
        );
        if (align.inside && windKmh >= 5) {
          const decayScaleKm = Math.max(4, wb.seaBreezeSpec.maxInlandPenetrationKm * 0.45);
          const thermalContrastFactor = isFiniteNum(params.ambientTempC)
            ? clamp((params.ambientTempC - waterTempC) / 8.0, 0.2, 1.35)
            : 1.0;
          const candCool =
            -Math.abs(wb.seaBreezeSpec.maxCoolingAmplitudeC) *
            subW *
            Math.exp(-target.coastalDistanceKm / decayScaleKm) *
            afternoonWave *
            clearSkyFactor *
            align.alignment *
            thermalContrastFactor;
          seaBreezeOffsetC = Math.min(seaBreezeOffsetC, candCool);
        }
      }

      if (target.isCoastal && isFiniteNum(params.ambientTempC)) {
        const airWaterDiff = waterTempC - params.ambientTempC;
        const onshoreAlign = isFiniteNum(windDir)
          ? computeSectorAlignmentCos(
              windDir,
              wb.onshoreWindSectorDeg.fromDeg,
              wb.onshoreWindSectorDeg.toDeg
            ).alignment
          : 0.25;
        const modGain = 0.12 + 0.22 * onshoreAlign;
        marineThermalModerationC +=
          subW * clamp(modGain * airWaterDiff, -2.6, 2.6) * Math.exp(-target.coastalDistanceKm / 18);
      }
    }
  }

  const totalOffsetC = clamp(
    uhiNocturnalOffsetC + seaBreezeOffsetC + marineThermalModerationC,
    -5.5,
    5.5
  );

  return {
    totalOffsetC: Number(totalOffsetC.toFixed(2)),
    uhiNocturnalOffsetC: Number(uhiNocturnalOffsetC.toFixed(2)),
    seaBreezeOffsetC: Number(seaBreezeOffsetC.toFixed(2)),
    marineThermalModerationC: Number(marineThermalModerationC.toFixed(2))
  };
}

/**
 * 3D Anisotropic Topographic Cressman-Barnes Surface Solver for all 80 non-Bursa provinces.
 */
export function solveProvinceTopographicSurface(params: {
  spec: ProvinceEngineSpec;
  target: ProvinceTargetPoint;
  stations: readonly ProvinceLiveStationObs[];
  drivers: ProvinceAmbientDrivers;
  verticalProfile?: ProvinceLiveVerticalProfile;
}): ProvinceTopographicSurfaceResult | null {
  const { spec, stations, drivers } = params;
  const resolvedTarget = resolveProvinceTargetMetadata(spec, params.target);

  const bounds = {
    minTempC: spec.qcBounds?.minPlausibleTempC ?? spec.qcAndMosBounds.minPlausibleTempC,
    maxTempC: spec.qcBounds?.maxPlausibleTempC ?? spec.qcAndMosBounds.maxPlausibleTempC,
    minMslpHpa: spec.qcBounds?.minPlausibleMslpHpa ?? spec.qcAndMosBounds.minPlausibleMslpHpa,
    maxMslpHpa: spec.qcBounds?.maxPlausibleMslpHpa ?? spec.qcAndMosBounds.maxPlausibleMslpHpa
  };

  // STRICT PROVINCE BOUNDARY FIREWALL: 0 cross-province station leakage!
  let rejectedCrossBorderCount = 0;
  const acceptedStations: ProvinceLiveStationObs[] = [];

  for (const obs of stations) {
    if (obs.provinceCode !== spec.provinceCode) {
      rejectedCrossBorderCount++;
      continue;
    }
    if (!isFiniteNum(obs.tempC) || !isFiniteNum(obs.elevationM)) continue;
    if (obs.tempC < bounds.minTempC || obs.tempC > bounds.maxTempC) continue;
    if (obs.qcWeight !== undefined && obs.qcWeight <= 0) continue;
    if (obs.ageMinutes !== undefined && obs.ageMinutes > 180) continue;
    acceptedStations.push(obs);
  }

  if (acceptedStations.length === 0) {
    return null;
  }

  const venturiEffect = applyVenturiCorridorRules({
    corridors: spec.venturiCorridors,
    targetLat: resolvedTarget.lat,
    targetLon: resolvedTarget.lon,
    windDirDeg: drivers.wind10mDirDeg ?? drivers.wind850DirDeg,
    windSpeedKmh: drivers.wind10mSpeedKmh ?? drivers.wind850SpeedKmh
  });

  const baseVerticalProfile =
    params.verticalProfile ??
    computeProvinceLiveVerticalProfile({
      spec,
      stations: acceptedStations,
      wind850DirDeg: drivers.wind850DirDeg,
      wind850SpeedKmh: drivers.wind850SpeedKmh,
      wind10mDirDeg: drivers.wind10mDirDeg,
      wind10mSpeedKmh: drivers.wind10mSpeedKmh,
      cloudCoverPct: drivers.cloudCoverPct,
      isNight: drivers.isNight && !venturiEffect.suppressesNocturnalInversion,
      hasSnowpack: drivers.hasSnowpack
    });

  // If Venturi mechanical turbulence breaks nocturnal inversion locally, relax lower pool lapse
  const effectiveVerticalProfile: ProvinceLiveVerticalProfile =
    venturiEffect.suppressesNocturnalInversion &&
    baseVerticalProfile.lowerPoolLapseCPerKm > -4.5
      ? {
          ...baseVerticalProfile,
          lowerPoolLapseCPerKm: -6.0,
          inversionStrengthC: 0,
          boundaryLayerState: "STANDARD_MIXED"
        }
      : baseVerticalProfile;

  const barrierEffect = applyDirectionalBarrierRules({
    spec,
    target: resolvedTarget,
    drivers
  });

  const hasLocalSameBasin = acceptedStations.some(
    (s) =>
      (s.subBasinId ?? spec.primaryCenter.subBasinId) === resolvedTarget.subBasinId &&
      haversineDistanceKm(resolvedTarget.lat, resolvedTarget.lon, s.lat, s.lon) <= 24
  );

  // Horizontal radius R_h and stability-adaptive vertical radius R_z
  const rHorizKm = hasLocalSameBasin ? 16.0 : 44.0;
  const rVertM =
    effectiveVerticalProfile.boundaryLayerState === "STRONG_INVERSION"
      ? 85
      : effectiveVerticalProfile.boundaryLayerState === "SHALLOW_INVERSION"
        ? 140
        : 280;

  const coldAirportSet = new Set(
    (spec.urbanHeatIsland?.coldBasinAirportIcaos ?? []).map((x) => x.toUpperCase())
  );

  interface WeightedStationNode {
    obs: ProvinceLiveStationObs;
    distKm: number;
    dElevM: number;
    weight: number;
    precipWeight: number;
    transportedTempC: number;
    transportedDewC: number | null;
    usedColdBasinUnbias: boolean;
  }

  const nodes: WeightedStationNode[] = [];
  const ambientWindDir = drivers.wind10mDirDeg ?? drivers.wind850DirDeg ?? undefined;
  const ambientWindKmh = drivers.wind10mSpeedKmh ?? drivers.wind850SpeedKmh ?? 0;

  for (const s of acceptedStations) {
    const override =
      spec.stationOverrides[String(s.stationId)] ??
      (s.icaoId ? spec.stationOverrides[s.icaoId] : undefined);

    const stElevM = override?.demElevationM ?? s.elevationM;
    const stSubBasin = s.subBasinId ?? override?.subBasinId ?? spec.primaryCenter.subBasinId;
    const stUrban = s.urbanFraction ?? override?.urbanFraction ?? 0.35;
    const stColdPool = s.coldPoolSusceptibility ?? override?.coldPoolSusceptibility ?? 0.2;
    const stIsCoastal =
      s.isCoastal ??
      (s.zone === "coastal_marine" ||
        s.zone === "peninsula_exposed" ||
        (stElevM <= 55 && spec.waterBodies.length > 0 && stSubBasin.includes("COAST")));

    const distKm = haversineDistanceKm(resolvedTarget.lat, resolvedTarget.lon, s.lat, s.lon);
    const dElevM = resolvedTarget.elevationM - stElevM;

    const wHoriz = Math.exp(-((distKm / rHorizKm) ** 2));
    const wVert = Math.exp(-((dElevM / rVertM) ** 2));

    // Barrier cross-side penalty via province coupling matrix
    const wBarrier =
      stSubBasin === resolvedTarget.subBasinId
        ? 1.0
        : spec.barrierCouplingMatrix[resolvedTarget.subBasinId]?.[stSubBasin] ?? 0.24;

    // Coast-inland decoupling weight
    const wCoastInland =
      resolvedTarget.isCoastal === stIsCoastal
        ? 1.0
        : resolvedTarget.isCoastal && !stIsCoastal
          ? 0.42
          : 0.48;

    // Upwind advection anisotropy bonus
    let wUpwind = 1.0;
    if (ambientWindDir !== undefined && ambientWindKmh >= 11 && distKm >= 2.5) {
      const stAzimuth = bearingDeg(resolvedTarget.lat, resolvedTarget.lon, s.lat, s.lon);
      const dAng = angularDifferenceDeg(stAzimuth, ambientWindDir);
      if (dAng <= 55) {
        wUpwind = 1.0 + 0.36 * Math.cos((dAng * Math.PI) / 110);
      }
    }

    const qcW = clamp(s.qcWeight ?? 1.0, 0.05, 1.5);
    const freshnessW = isFiniteNum(s.ageMinutes) ? Math.exp(-Math.max(0, s.ageMinutes) / 45) : 1.0;

    let transportedTempC =
      (s.tempC as number) +
      integrateProvinceVerticalDeltaC(stElevM, resolvedTarget.elevationM, effectiveVerticalProfile);

    // Apply rural cold-basin / airport -> urban UHI transfer unbias when transporting across canopy contrast
    const isColdAirport = Boolean(s.icaoId && coldAirportSet.has(s.icaoId.toUpperCase()));
    let usedColdBasinUnbias = false;
    if (
      !venturiEffect.suppressesNocturnalInversion &&
      (isColdAirport || stColdPool >= 0.65 || resolvedTarget.urbanFraction - stUrban >= 0.25)
    ) {
      const stationToTargetMicro = computeProvinceMicroclimateOffsetC({
        spec,
        target: resolvedTarget,
        drivers: { ...drivers, wind10mSpeedKmh: s.windSpeedKmh ?? drivers.wind10mSpeedKmh },
        referenceUrbanFraction: stUrban,
        referenceStationColdPool: stColdPool,
        referenceStationIcao: s.icaoId
      });
      if (Math.abs(stationToTargetMicro.uhiNocturnalOffsetC) >= 0.12) {
        transportedTempC += stationToTargetMicro.uhiNocturnalOffsetC;
        usedColdBasinUnbias = true;
      }
    }

    const dzKm = dElevM / 1000;
    const rawDewC = isFiniteNum(s.dewPointC)
      ? s.dewPointC
      : isFiniteNum(s.relHumidityPct)
        ? dewPointMagnus(s.tempC as number, s.relHumidityPct)
        : null;
    const transportedDewC =
      rawDewC !== null ? Math.min(transportedTempC, rawDewC - 2.0 * dzKm) : null;

    const excludeFromHeadline = Boolean(
      s.excludeFromCenterHeadline ?? override?.excludeFromCenterHeadline
    );
    const hasNonExcludedPeer =
      excludeFromHeadline &&
      acceptedStations.some((peer) => {
        const peerOv =
          spec.stationOverrides[String(peer.stationId)] ??
          (peer.icaoId ? spec.stationOverrides[peer.icaoId] : undefined);
        return !(peer.excludeFromCenterHeadline ?? peerOv?.excludeFromCenterHeadline);
      });
    const isCenterTarget =
      resolvedTarget.subBasinId === spec.primaryCenter.subBasinId &&
      resolvedTarget.urbanFraction >= 0.4;
    const airportPenalty =
      (isColdAirport && resolvedTarget.urbanFraction >= 0.45 && acceptedStations.length > 1) ||
      (excludeFromHeadline && isCenterTarget && hasNonExcludedPeer)
        ? 0.22
        : 1.0;

    const combinedWeight = Math.max(
      1e-7,
      qcW * freshnessW * wHoriz * wVert * wBarrier * wCoastInland * wUpwind * airportPenalty
    );
    const wPrecipHoriz = Math.exp(-((distKm / 13.5) ** 2));
    const precipWeight = qcW * freshnessW * wPrecipHoriz * wBarrier * wUpwind;

    nodes.push({
      obs: s,
      distKm,
      dElevM,
      weight: combinedWeight,
      precipWeight,
      transportedTempC,
      transportedDewC,
      usedColdBasinUnbias
    });
  }

  const sumW = nodes.reduce((acc, n) => acc + n.weight, 0);
  if (sumW <= 0) return null;

  // Pass 1: Broad anisotropic Cressman-Barnes field
  let tempPass1 = 0;
  for (const n of nodes) {
    tempPass1 += (n.weight / sumW) * n.transportedTempC;
  }

  // Pass 2: Fine local Barnes residual pass (<= 11 km & <= 180 m elevation diff)
  let fineNum = 0;
  let fineDen = 0;
  for (const n of nodes) {
    if ((n.obs.tier ?? 1) <= 2 && n.distKm <= 11 && Math.abs(n.dElevM) <= 180) {
      const wFine = clamp(n.obs.qcWeight ?? 1.0, 0.1, 1.2) * Math.exp(-((n.distKm / 5.5) ** 2));
      fineNum += wFine * (n.transportedTempC - tempPass1);
      fineDen += wFine;
    }
  }
  const cressmanBaseTempC =
    fineDen > 0.22 ? tempPass1 + 0.72 * (fineNum / fineDen) : tempPass1;

  // Target-level daytime sea-breeze / coastal moderation + directional Foehn warming
  // (only apply residual target offset when nearest station is not already collocated <= 2.5 km)
  const minStationDistKm = Math.min(...nodes.map((n) => n.distKm));
  const spatialResidualScale = clamp((minStationDistKm - 1.5) / 8.0, 0, 1);

  const microclimateOffset = computeProvinceMicroclimateOffsetC({
    spec,
    target: resolvedTarget,
    drivers,
    ambientTempC: cressmanBaseTempC
  });

  const nonStationLocalDeltaC =
    spatialResidualScale *
    (microclimateOffset.seaBreezeOffsetC +
      microclimateOffset.marineThermalModerationC +
      barrierEffect.foehnTempDeltaC);

  const finalTempC = clamp(
    cressmanBaseTempC + nonStationLocalDeltaC,
    bounds.minTempC,
    bounds.maxTempC
  );

  // Dew point & RH (incorporating Foehn adiabatic drying if active on non-collocated lee slope)
  const dewNodes = nodes.filter((n) => n.transportedDewC !== null);
  const sumDewW = dewNodes.reduce((acc, n) => acc + n.weight, 0);
  let dewPointC: number | null =
    sumDewW > 0
      ? Math.min(
          finalTempC,
          dewNodes.reduce((acc, n) => acc + (n.weight / sumDewW) * (n.transportedDewC as number), 0)
        )
      : null;

  let relHumidityPct: number | null =
    dewPointC !== null ? relativeHumidityFromDewPoint(finalTempC, dewPointC) : null;

  if (relHumidityPct !== null && barrierEffect.foehnRhDeltaPct < 0 && spatialResidualScale > 0) {
    relHumidityPct = clamp(
      relHumidityPct + barrierEffect.foehnRhDeltaPct * spatialResidualScale,
      6,
      100
    );
    dewPointC = Math.min(finalTempC, dewPointMagnus(finalTempC, relHumidityPct));
  }

  // Sea-level pressure
  const presNodes = nodes.filter(
    (n) =>
      isFiniteNum(n.obs.pressureMslHpa) &&
      n.obs.pressureMslHpa >= bounds.minMslpHpa &&
      n.obs.pressureMslHpa <= bounds.maxMslpHpa
  );
  const sumPresW = presNodes.reduce((acc, n) => acc + n.weight, 0);
  const pressureMslHpa =
    sumPresW > 0
      ? presNodes.reduce((acc, n) => acc + (n.weight / sumPresW) * (n.obs.pressureMslHpa as number), 0)
      : null;

  // Vector + scalar hybrid wind + Venturi corridor multiplier
  const windNodes = nodes.filter((n) => isFiniteNum(n.obs.windSpeedKmh));
  const sumWindW = windNodes.reduce((acc, n) => acc + n.weight, 0);
  let windSpeedKmh: number | null = null;
  let windGustKmh: number | null = null;
  let windDirDeg: number | null = null;

  if (sumWindW > 0) {
    let uSum = 0;
    let vSum = 0;
    let scalarSum = 0;
    let gustSum = 0;
    let gustW = 0;
    let hasDir = false;

    for (const n of windNodes) {
      const spd = Math.max(0, n.obs.windSpeedKmh as number);
      const wn = n.weight / sumWindW;
      scalarSum += wn * spd;
      if (isFiniteNum(n.obs.windDirDeg)) {
        const rad = (n.obs.windDirDeg * Math.PI) / 180;
        uSum += wn * (-spd * Math.sin(rad));
        vSum += wn * (-spd * Math.cos(rad));
        hasDir = true;
      }
      if (isFiniteNum(n.obs.windGustKmh)) {
        gustSum += n.weight * Math.max(spd, n.obs.windGustKmh);
        gustW += n.weight;
      }
    }

    const baseSpd = hasDir ? 0.7 * Math.hypot(uSum, vSum) + 0.3 * scalarSum : scalarSum;
    const baseGust = gustW > 0 ? gustSum / gustW : baseSpd * 1.32;
    windSpeedKmh = baseSpd * venturiEffect.speedMultiplier;
    windGustKmh = Math.max(windSpeedKmh, baseGust * venturiEffect.gustMultiplier);
    windDirDeg = hasDir
      ? ((Math.atan2(-uSum, -vSum) * 180) / Math.PI + 360) % 360
      : drivers.wind10mDirDeg ?? null;
  } else if (isFiniteNum(drivers.wind10mSpeedKmh)) {
    windSpeedKmh = drivers.wind10mSpeedKmh * venturiEffect.speedMultiplier;
    windGustKmh = windSpeedKmh * Math.max(1.25, venturiEffect.gustMultiplier);
    windDirDeg = drivers.wind10mDirDeg ?? null;
  }

  // Precipitation & Orographic / Rain-Shadow modulation
  const precipNodes = nodes.filter(
    (n) =>
      n.precipWeight > 0.015 &&
      (isFiniteNum(n.obs.precip1hMm) ||
        isFiniteNum(n.obs.precip10MinMm) ||
        n.obs.isPrecipitating !== undefined)
  );
  let rawPrecipMm = 0;
  let wetVoteW = 0;
  let totalPrecipW = 0;
  for (const n of precipNodes) {
    totalPrecipW += n.precipWeight;
    const rate = isFiniteNum(n.obs.precip1hMm)
      ? Math.max(0, n.obs.precip1hMm)
      : isFiniteNum(n.obs.precip10MinMm)
        ? Math.max(0, n.obs.precip10MinMm * 6)
        : n.obs.isPrecipitating
          ? 0.5
          : 0;
    rawPrecipMm += n.precipWeight * rate;
    if (rate >= 0.1 || n.obs.isPrecipitating) {
      wetVoteW += n.precipWeight;
    }
  }
  if (totalPrecipW > 0) {
    rawPrecipMm /= totalPrecipW;
  }
  const modulatedPrecipMm = rawPrecipMm * barrierEffect.precipMultiplier;
  const wetFraction = totalPrecipW > 0 ? wetVoteW / totalPrecipW : 0;
  const isPrecipitatingNow = wetFraction >= 0.4 && modulatedPrecipMm >= 0.06;
  const precip1hMm = isPrecipitatingNow ? Number(modulatedPrecipMm.toFixed(2)) : 0;

  // Elevation-band-matched snow depth
  const snowNodes = nodes.filter(
    (n) => isFiniteNum(n.obs.snowDepthCm) && Math.abs(n.dElevM) <= 450
  );
  const sumSnowW = snowNodes.reduce((acc, n) => acc + n.weight, 0);
  const snowDepthCm =
    sumSnowW > 0
      ? Number(
          Math.max(
            0,
            snowNodes.reduce(
              (acc, n) => acc + (n.weight / sumSnowW) * (n.obs.snowDepthCm as number),
              0
            )
          ).toFixed(1)
        )
      : null;

  const minSameBasinDistKm = Math.min(
    ...nodes
      .filter(
        (n) =>
          (n.obs.subBasinId ?? spec.primaryCenter.subBasinId) === resolvedTarget.subBasinId
      )
      .map((n) => n.distKm),
    50
  );
  const weightedVar = nodes.reduce(
    (acc, n) => acc + (n.weight / sumW) * (n.transportedTempC - cressmanBaseTempC) ** 2,
    0
  );
  const uncertaintyC = Math.sqrt(weightedVar + (0.14 + 0.018 * minSameBasinDistKm) ** 2);

  const contributions: ProvinceStationContribution[] = [...nodes]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)
    .map((n) => ({
      stationId: n.obs.stationId,
      stationName: n.obs.name ?? String(n.obs.stationId),
      provinceCode: spec.provinceCode,
      distanceKm: Number(n.distKm.toFixed(2)),
      deltaElevM: Math.round(n.dElevM),
      rawTempC: Number((n.obs.tempC as number).toFixed(2)),
      transportedTempC: Number(n.transportedTempC.toFixed(2)),
      normalizedWeight: Number((n.weight / sumW).toFixed(4)),
      usedColdBasinUnbias: n.usedColdBasinUnbias
    }));

  return {
    provinceCode: spec.provinceCode,
    tempC: Number(finalTempC.toFixed(2)),
    dewPointC: dewPointC !== null ? Number(dewPointC.toFixed(2)) : null,
    relHumidityPct: relHumidityPct !== null ? Number(relHumidityPct.toFixed(1)) : null,
    windSpeedKmh: windSpeedKmh !== null ? Number(windSpeedKmh.toFixed(1)) : null,
    windGustKmh: windGustKmh !== null ? Number(windGustKmh.toFixed(1)) : null,
    windDirDeg: windDirDeg !== null ? Math.round(windDirDeg) : null,
    pressureMslHpa: pressureMslHpa !== null ? Number(pressureMslHpa.toFixed(1)) : null,
    precip1hMm,
    snowDepthCm,
    isPrecipitatingNow,
    uncertaintyC: Number(uncertaintyC.toFixed(2)),
    verticalState: effectiveVerticalProfile.boundaryLayerState,
    acceptedStationCount: acceptedStations.length,
    rejectedCrossBorderCount,
    barrierEffect,
    venturiEffect,
    microclimateOffset,
    contributions
  };
}

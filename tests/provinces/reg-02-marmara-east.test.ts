import { describe, expect, it } from "vitest";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import {
  interpolateProvinceOrographicWeight,
  TR81_HYPSOMETRIC_PROFILES
} from "../../lib/provinces/hypsometric-bands-tr81";
import { STATIC_MGM_ISTNO_OWNER_PROVINCE } from "../../lib/provinces/mgm-dem-repair";
import { TR_NATIONAL_CATALOG } from "../../lib/provinces/catalog-1102";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  computeProvinceMicroclimateOffsetC,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import type { ProvinceSpec, TrProvinceCode } from "../../lib/provinces/types";
import PROVINCE_SPEC_TR_10_DEFAULT, {
  PROVINCE_SPEC_TR_10,
  TR_10_CALIBRATION_ANCHOR_META
} from "../../lib/provinces/specs/tr-10";
import PROVINCE_SPEC_TR_34_DEFAULT, {
  PROVINCE_SPEC_TR_34,
  TR_34_UHI_CANOPY_SPEC
} from "../../lib/provinces/specs/tr-34";
import PROVINCE_SPEC_TR_41_DEFAULT, {
  PROVINCE_SPEC_TR_41,
  TR_41_CALIBRATION_ANCHOR_META
} from "../../lib/provinces/specs/tr-41";
import PROVINCE_SPEC_TR_77_DEFAULT, {
  PROVINCE_SPEC_TR_77,
  TR_77_CALIBRATION_ANCHOR_META
} from "../../lib/provinces/specs/tr-77";

const REG_02_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_10,
  PROVINCE_SPEC_TR_34,
  PROVINCE_SPEC_TR_41,
  PROVINCE_SPEC_TR_77
];

function collectAllSpecMgmIds(spec: ProvinceSpec): number[] {
  const ids = new Set<number>([
    spec.primaryCenter.mgmIstNo,
    spec.primaryCenter.mgmSaatlikIstNo
  ]);
  for (const key of Object.keys(spec.stationOverrides)) {
    const n = Number(key);
    if (Number.isFinite(n)) ids.add(n);
    const sid = Number(spec.stationOverrides[key].stationId);
    if (Number.isFinite(sid)) ids.add(sid);
  }
  for (const wb of spec.waterBodies) {
    for (const mId of wb.mgmMarineStationIds) {
      ids.add(mId);
    }
  }
  return [...ids];
}

describe("Wave 3A REG-02: East & South Marmara Bespoke Physics & Bursa TR-16 Isolation Shield", () => {
  it("exports valid Tier-A ProvinceSpec contracts with consistent 4-band hypsometry, 9-point stencils, and symmetric coupling matrices", () => {
    expect(PROVINCE_SPEC_TR_10_DEFAULT).toBe(PROVINCE_SPEC_TR_10);
    expect(PROVINCE_SPEC_TR_34_DEFAULT).toBe(PROVINCE_SPEC_TR_34);
    expect(PROVINCE_SPEC_TR_41_DEFAULT).toBe(PROVINCE_SPEC_TR_41);
    expect(PROVINCE_SPEC_TR_77_DEFAULT).toBe(PROVINCE_SPEC_TR_77);

    for (const spec of REG_02_SPECS) {
      expect(spec.region).toBe("MARMARA");
      expect(spec.climateRegion).toBe("MARMARA");
      expect(spec.calibrationTier).toBe("TIER_A_WMO");
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations).toHaveLength(4);

      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      const subIds = spec.subBasins.map((sb) => sb.id);
      for (const a of subIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subIds) {
          const ab = spec.barrierCouplingMatrix[a]?.[b];
          const ba = spec.barrierCouplingMatrix[b]?.[a];
          expect(ab).toBeGreaterThan(0);
          expect(ab).toBeLessThanOrEqual(1.0);
          expect(ab).toBeCloseTo(ba, 6);
        }
      }

      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subIds).toContain(ov.subBasinId);
      }

      for (const loc of spec.curatedSubLocations) {
        const resolved = resolveProvinceCode({
          lat: loc.lat,
          lon: loc.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(
          resolved.provinceCode,
          `Sub-location ${loc.id} leaked to ${resolved.provinceCode}`
        ).toBe(spec.provinceCode);
      }
    }
  });

  it("TR-34 Istanbul: models Black Sea 420 km DEK bands + Marmara buffering, Bosphorus 15°-45°/195°-225° Venturi, Aydos 537 m snow differential, and 3.1°C UHI", () => {
    expect(PROVINCE_SPEC_TR_34.icaoWhitelist).toEqual(["LTFM", "LTBA", "LTFJ"]);
    expect(PROVINCE_SPEC_TR_34.primaryCenter.wmoId).toBe("17060");
    expect(TR_34_UHI_CANOPY_SPEC.maxCanopyWarmingC).toBeCloseTo(3.1, 2);

    const blackSea = PROVINCE_SPEC_TR_34.waterBodies.find((w) => w.id === "sw_black_sea_istanbul");
    const marmara = PROVINCE_SPEC_TR_34.waterBodies.find((w) => w.id === "sea_of_marmara_istanbul");
    expect(blackSea).toBeDefined();
    expect(marmara).toBeDefined();
    expect(blackSea!.kind).toBe("open_sea");
    expect(blackSea!.effectiveFetchKm).toBe(420);
    expect(blackSea!.dekWatchDeltaTC).toBeLessThanOrEqual(11.5);
    expect(blackSea!.dekHeavyDeltaTC).toBeLessThanOrEqual(14.0);
    expect(marmara!.kind).toBe("inland_sea");
    expect(marmara!.subBasinInfluenceWeights.marmara_urban_core).toBeGreaterThan(0.85);

    // Bosphorus bidirectional Venturi channel: 30° ± 15° => 15°..45° Poyraz & 195°..225° Lodos
    const bosphorus = PROVINCE_SPEC_TR_34.venturiCorridors[0];
    expect(bosphorus.bidirectional).toBe(true);
    expect(bosphorus.channelAxisFromDeg - bosphorus.sectorHalfWidthDeg).toBe(15);
    expect(bosphorus.channelAxisFromDeg + bosphorus.sectorHalfWidthDeg).toBe(45);
    const oppositeAxis = (bosphorus.channelAxisFromDeg + 180) % 360;
    expect(oppositeAxis - bosphorus.sectorHalfWidthDeg).toBe(195);
    expect(oppositeAxis + bosphorus.sectorHalfWidthDeg).toBe(225);

    const poyrazVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_34.venturiCorridors,
      targetLat: 41.118,
      targetLon: 29.062,
      windDirDeg: 30,
      windSpeedKmh: 28
    });
    const lodosVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_34.venturiCorridors,
      targetLat: 41.118,
      targetLon: 29.062,
      windDirDeg: 210,
      windSpeedKmh: 28
    });
    expect(poyrazVenturi.speedMultiplier).toBeGreaterThan(1.25);
    expect(lodosVenturi.speedMultiplier).toBeGreaterThan(1.25);
    expect(poyrazVenturi.suppressesNocturnalInversion).toBe(true);

    // Nocturnal Oke (1987) UHI warming between rural Çatalca (0.08) and Şişli core (0.97)
    const sisliTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_34, {
      lat: 41.0547,
      lon: 28.9683,
      elevationM: 63,
      subBasinId: "marmara_urban_core",
      urbanFraction: 0.97
    });
    const uhi = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_34,
      target: sisliTarget,
      drivers: {
        localHour: 2,
        month: 1,
        isNight: true,
        cloudCoverPct: 5,
        wind10mSpeedKmh: 3
      },
      referenceUrbanFraction: 0.08
    });
    expect(uhi.uhiNocturnalOffsetC).toBeGreaterThan(2.0);
    expect(uhi.uhiNocturnalOffsetC).toBeLessThanOrEqual(3.15);

    // Zero Kocaeli Gebze (17639) / Çayırova (19115) leak into TR-34
    const tr34Ids = new Set(collectAllSpecMgmIds(PROVINCE_SPEC_TR_34));
    expect(tr34Ids.has(17639)).toBe(false);
    expect(tr34Ids.has(19115)).toBe(false);
  });

  it("TR-41 Kocaeli: models Izmit-Sapanca trench, Samanli/Kartepe (1602 m) heavy DEK orographic snow & Lodos foehn, and blocks LTFJ & Bursa Iznik/Orhangazi", () => {
    expect(PROVINCE_SPEC_TR_41.icaoWhitelist).toEqual(["LTBQ"]);
    expect(PROVINCE_SPEC_TR_41.icaoWhitelist).not.toContain("LTFJ");
    expect(PROVINCE_SPEC_TR_41.icaoWhitelist).not.toContain("LTBR");
    expect(TR_41_CALIBRATION_ANCHOR_META.meteostatStationId).toBe("LTBQ0");

    // Kartepe 1602 m northerly DEK upslope snow enhancement vs Izmit Lodos foehn
    const kartepeTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_41, {
      lat: 40.6557,
      lon: 30.0954,
      elevationM: 1602,
      subBasinId: "samanli_kartepe_alpine"
    });
    const dekOrographic = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_41,
      target: kartepeTarget,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 95,
        wind850DirDeg: 15,
        wind850SpeedKmh: 45
      }
    });
    expect(dekOrographic.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(dekOrographic.precipMultiplier).toBeGreaterThan(1.45);

    const izmitTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_41, {
      lat: 40.7663,
      lon: 29.9173,
      elevationM: 74,
      subBasinId: "izmit_sapanca_trench"
    });
    const lodosFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_41,
      target: izmitTarget,
      drivers: {
        localHour: 14,
        month: 2,
        isNight: false,
        cloudCoverPct: 35,
        wind850DirDeg: 205,
        wind850SpeedKmh: 52
      }
    });
    expect(lodosFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(lodosFoehn.foehnTempDeltaC).toBeGreaterThan(1.5);

    const wIzmit = interpolateProvinceOrographicWeight(TR81_HYPSOMETRIC_PROFILES["TR-41"], 74);
    const wKartepe = interpolateProvinceOrographicWeight(TR81_HYPSOMETRIC_PROFILES["TR-41"], 1602);
    expect(wKartepe - wIzmit).toBeGreaterThan(0.5);

    const tr41Ids = new Set(collectAllSpecMgmIds(PROVINCE_SPEC_TR_41));
    expect(tr41Ids.has(17661)).toBe(false); // Bursa İznik
    expect(tr41Ids.has(18755)).toBe(false); // Bursa İznik Radar
    expect(tr41Ids.has(18387)).toBe(false); // Bursa Orhangazi
  });

  it("TR-77 Yalova: models Samanli (926 m Bespinar/Termal) maritime north slope, empty live METAR whitelist (LTBP0 archive only), and 100% polygon + Cressman firewall split from Bursa Gemlik/Orhangazi", () => {
    expect(PROVINCE_SPEC_TR_77.icaoWhitelist).toEqual([]);
    expect(TR_77_CALIBRATION_ANCHOR_META.historicalWmoArchiveId).toBe("LTBP0");
    expect(TR_77_CALIBRATION_ANCHOR_META.liveCivilMetarAllowed).toBe(false);
    expect(PROVINCE_SPEC_TR_77.verticalProfileSpec.maxPhysicalPeakM).toBe(926);

    // Exact polygon separation across the Yalova (TR-77) vs Bursa (TR-16) Samanlı / Gemlik border
    expect(resolveProvinceCode({ lat: 40.5478, lon: 28.8408, countryCode: "TR" }).provinceCode).toBe("TR-77"); // Armutlu
    expect(resolveProvinceCode({ lat: 40.6421, lon: 29.106, countryCode: "TR" }).provinceCode).toBe("TR-77"); // Çınarcık
    expect(resolveProvinceCode({ lat: 40.7142, lon: 29.5092, countryCode: "TR" }).provinceCode).toBe("TR-77"); // Altınova
    expect(resolveProvinceCode({ lat: 40.4325, lon: 29.1564, countryCode: "TR" }).provinceCode).toBe("TR-16"); // Gemlik (Bursa)
    expect(resolveProvinceCode({ lat: 40.491, lon: 29.3276, countryCode: "TR" }).provinceCode).toBe("TR-16"); // Orhangazi (Bursa)

    // Cressman boundary firewall: Bursa Gemlik & Istanbul Sabiha Gökçen observations are strictly rejected!
    const yalovaSolved = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_77,
      target: { lat: 40.6604, lon: 29.2867, elevationM: 4 },
      stations: [
        {
          stationId: 17119,
          provinceCode: "TR-77",
          name: "Yalova Merkez",
          lat: 40.6604,
          lon: 29.2867,
          elevationM: 4,
          tempC: 11.4,
          relHumidityPct: 78,
          windSpeedKmh: 22,
          windDirDeg: 38
        },
        {
          stationId: 17663,
          provinceCode: "TR-16",
          name: "Bursa Gemlik (MUST REJECT)",
          lat: 40.4401,
          lon: 29.1503,
          elevationM: 85,
          tempC: 24.0
        },
        {
          stationId: "LTFJ",
          provinceCode: "TR-34",
          icaoId: "LTFJ",
          name: "Istanbul LTFJ (MUST REJECT)",
          lat: 40.8928,
          lon: 29.2972,
          elevationM: 99,
          tempC: 2.0
        }
      ],
      drivers: {
        localHour: 12,
        month: 1,
        isNight: false,
        cloudCoverPct: 60,
        wind10mDirDeg: 38,
        wind10mSpeedKmh: 22
      }
    });
    expect(yalovaSolved).not.toBeNull();
    expect(yalovaSolved!.acceptedStationCount).toBe(1);
    expect(yalovaSolved!.rejectedCrossBorderCount).toBe(2);
    expect(yalovaSolved!.tempC).toBeCloseTo(11.4, 1);
  });

  it("TR-10 Balikesir: models dual-sea (Marmara Poyraz + Edremit Imbat), Kaz Daglari 1774 m south orographic rain & north foehn, central frost hollow, and strict Karacabey/MKP border split", () => {
    expect(PROVINCE_SPEC_TR_10.icaoWhitelist).toEqual(["LTBG", "LTFD", "LTBF"]);
    expect(PROVINCE_SPEC_TR_10.icaoWhitelist).not.toContain("LTBR");
    expect(TR_10_CALIBRATION_ANCHOR_META.wmoStationId).toBe("17150");

    const marmaraSea = PROVINCE_SPEC_TR_10.waterBodies.find((w) => w.id === "south_marmara_bandirma_sea");
    const aegeanSea = PROVINCE_SPEC_TR_10.waterBodies.find((w) => w.id === "north_aegean_edremit_gulf");
    expect(marmaraSea?.kind).toBe("inland_sea");
    expect(aegeanSea?.kind).toBe("open_sea");
    expect(aegeanSea?.seaBreezeSpec.maxCoolingAmplitudeC).toBeGreaterThanOrEqual(3.2);

    // Kaz Dağları (1774 m): Southerly Aegean Lodos -> heavy UPSLOPE_OROGRAPHIC rain on south wall
    const kazSouthTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_10, {
      lat: 39.6763,
      lon: 26.9201,
      elevationM: 1244,
      subBasinId: "kazdaglari_south_wall"
    });
    const kazUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_10,
      target: kazSouthTarget,
      drivers: {
        localHour: 10,
        month: 12,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 210,
        wind850SpeedKmh: 50
      }
    });
    expect(kazUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(kazUpslope.precipMultiplier).toBeGreaterThan(1.45);

    // Kaz Dağları: Northerly Poyraz -> North Foehn warming descending into Edremit Bay!
    const edremitCoastTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_10, {
      lat: 39.5895,
      lon: 27.0194,
      elevationM: 21,
      subBasinId: "edremit_ayvalik_aegean_bay"
    });
    const kazNorthFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_10,
      target: edremitCoastTarget,
      drivers: {
        localHour: 15,
        month: 3,
        isNight: false,
        cloudCoverPct: 20,
        wind850DirDeg: 20,
        wind850SpeedKmh: 54
      }
    });
    expect(kazNorthFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(kazNorthFoehn.foehnTempDeltaC).toBeGreaterThan(1.4);

    // Daytime Aegean İmbat cooling on Edremit Bay in July
    const imbat = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_10,
      target: edremitCoastTarget,
      drivers: {
        localHour: 15,
        month: 7,
        isNight: false,
        cloudCoverPct: 5,
        wind10mDirDeg: 255,
        wind10mSpeedKmh: 20
      },
      ambientTempC: 34.0
    });
    expect(imbat.seaBreezeOffsetC).toBeLessThan(-1.2);

    // Central Susurluk–Balıkesir frost hollow enclosure & Bursa Karacabey/MKP border split
    expect(PROVINCE_SPEC_TR_10.inversionAndWedgeSpec.topographicEnclosureIndex).toBeGreaterThanOrEqual(0.7);
    expect(resolveProvinceCode({ lat: 39.9173, lon: 28.1647, countryCode: "TR" }).provinceCode).toBe("TR-10"); // Susurluk
    expect(resolveProvinceCode({ lat: 40.3322, lon: 27.9966, countryCode: "TR" }).provinceCode).toBe("TR-10"); // Bandırma
    expect(resolveProvinceCode({ lat: 40.1319, lon: 28.332, countryCode: "TR" }).provinceCode).toBe("TR-16"); // Karacabey (Bursa)
    expect(resolveProvinceCode({ lat: 40.0484, lon: 28.4234, countryCode: "TR" }).provinceCode).toBe("TR-16"); // Mustafakemalpaşa (Bursa)
  });

  it("enforces 0.00% station & ICAO intersection against TR-16 Bursa and across all 4 neighbor provinces", () => {
    const bursaStationIds = new Set<number>();
    for (const [istStr, owner] of Object.entries(STATIC_MGM_ISTNO_OWNER_PROVINCE)) {
      if (owner === "TR-16") {
        bursaStationIds.add(Number(istStr));
      }
    }
    for (const entry of TR_NATIONAL_CATALOG) {
      if (entry.provinceCode === "TR-16" && entry.mgmSondurumIstNo) {
        bursaStationIds.add(entry.mgmSondurumIstNo);
      }
    }
    expect(bursaStationIds.size).toBeGreaterThanOrEqual(25);

    const seenByProvince = new Map<TrProvinceCode, Set<number>>();
    for (const spec of REG_02_SPECS) {
      expect(spec.icaoWhitelist).not.toContain("LTBR");

      const ids = collectAllSpecMgmIds(spec);
      expect(ids.length).toBeGreaterThanOrEqual(7);

      for (const istNo of ids) {
        expect(
          bursaStationIds.has(istNo),
          `Station ${istNo} in ${spec.provinceCode} illegally intersects TR-16 Bursa!`
        ).toBe(false);

        expect(
          STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo],
          `Station ${istNo} in ${spec.provinceCode} belongs to ${STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]}`
        ).toBe(spec.provinceCode);

        for (const [otherProv, otherSet] of seenByProvince.entries()) {
          expect(
            otherSet.has(istNo),
            `Station ${istNo} shared between ${spec.provinceCode} and ${otherProv}`
          ).toBe(false);
        }
      }

      seenByProvince.set(spec.provinceCode, new Set(ids));
    }
  });
});

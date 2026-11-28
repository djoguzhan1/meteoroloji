import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  type BursaMeshSnapshot,
  computeLiveBursaVerticalProfile
} from "../bursa-mesh";
import type { ProvinceCode } from "./types";

type QualityControlledObservation = BursaMeshSnapshot["stations"][number];

/**
 * Cryptographic SHA-256 Freeze Manifest for Bursa (TR-16) Core Files.
 * Zero bytes in any of these 11 files may change during or after 81-province expansion.
 */
export const BURSA_FROZEN_SHA256_MANIFEST: Readonly<Record<string, string>> = Object.freeze({
  "lib/bursa-mesh.ts":
    "6e5dea3778c95da396a60e95dcd904318fa83b33c93c169ee35e884475afb5f8",
  "lib/bursa-trained-emos.ts":
    "57674e2e66eead29f588eccd69b53d474e025976db3c3a2ea750a3ec199461b1",
  "lib/topographic-cressman.ts":
    "51717eb74db45e7786b9c24ac3d8e49120b6f8becb90a1c80bad0270fb6d068c",
  "lib/vertical-physics.ts":
    "42e329ec7be2d662a9bff967d5cca7d7baccea0c344a42981817e6446c21ec21",
  "lib/emos-precip-fusion.ts":
    "94ac02f84e5fa37335786e2d6a3f75b60d366e38d97aab03eec4e895fcac8243",
  "lib/precip-engine.ts":
    "18f80f171ac6474e7fa1f764bd6dc81444975c61684dfccf74781b4e200fa431",
  "lib/radar-nowcast.ts":
    "f9db5ced2fb95e0e51eb4e9710e3bd32172900d95e1922c29cae749f12649c6e",
  "scripts/benchmark-bursa-365d.mjs":
    "75ca1d78cdd2ac5ed455e392d044e35f44f77a4dae39d3d82fb4ef298268b224",
  "reports/bursa-365d-benchmark.json":
    "88681c094bdcb6174c08f9ad55696d815271a30cd5ce2b313c40514300917651",
  "tests/bursa-mesh-cressman.test.ts":
    "96f4f126955005d756801319601c3dda3ee4eac8e9346acc079bcb9eedad69fd",
  "tests/atmos-v5-zero-drift.test.ts":
    "85bf13a552a02ad3f909ba68850533664752e373ffd85e427ed84c2b37bc110c"
});

/** Neighbor-province ICAO codes that must never contaminate strict TR-16 Bursa runtime */
const NON_BURSA_PERIMETER_ICAOS = new Set([
  "LTFJ",
  "LTBG",
  "LTBQ",
  "LTBY",
  "LTBA",
  "LTFM",
  "LTBH",
  "LTBZ",
  "LTBN"
]);

export function verifyBursaImmutabilityManifest(repoRoot: string = process.cwd()): {
  ok: boolean;
  checkedCount: number;
  violations: Array<{ file: string; expected: string; actual: string }>;
} {
  const violations: Array<{ file: string; expected: string; actual: string }> = [];
  const entries = Object.entries(BURSA_FROZEN_SHA256_MANIFEST);
  for (const [relPath, expected] of entries) {
    const absPath = path.join(repoRoot, relPath);
    if (!fs.existsSync(absPath)) {
      violations.push({ file: relPath, expected, actual: "MISSING" });
      continue;
    }
    const buf = fs.readFileSync(absPath);
    const actual = crypto.createHash("sha256").update(buf).digest("hex");
    if (actual !== expected) {
      violations.push({ file: relPath, expected, actual });
    }
  }
  return {
    ok: violations.length === 0,
    checkedCount: entries.length,
    violations
  };
}

/**
 * Surgical Perimeter Sanitizer for Bursa (TR-16):
 * Keeps `lib/bursa-mesh.ts` 100% SHA-256 untouched on disk while guaranteeing at runtime
 * that neighbor-province METARs (LTFJ Istanbul, LTBG Balikesir) and cross-border PWS/stations
 * (e.g. Yalova TR-77 across Gemlik Bay) are stripped before entering Bursa surface or Kalman solvers.
 */
export function sanitizeBursaMeshToStrictTr16(
  mesh: BursaMeshSnapshot,
  resolveProvinceFn: (lat: number, lon: number) => ProvinceCode,
  ambientOpts?: { wind850DirDeg?: number | null; wind850SpeedKt?: number | null }
): BursaMeshSnapshot {
  const strictStations: QualityControlledObservation[] = [];
  for (const obs of mesh.stations) {
    const stId = obs.station.id.toUpperCase();
    const icao = (obs.station.icaoId ?? "").toUpperCase();
    if (
      NON_BURSA_PERIMETER_ICAOS.has(icao) ||
      stId === "ICAO_LTFJ" ||
      stId === "ICAO_LTBG" ||
      stId === "17114"
    ) {
      continue;
    }
    const pc = resolveProvinceFn(obs.station.lat, obs.station.lon);
    if (pc !== "TR-16") {
      continue;
    }
    strictStations.push(obs);
  }

  if (strictStations.length === mesh.stations.length) {
    return mesh;
  }

  const verticalProfile = computeLiveBursaVerticalProfile(strictStations, {
    wind850DirDeg: ambientOpts?.wind850DirDeg ?? undefined,
    wind850SpeedKt: ambientOpts?.wind850SpeedKt ?? undefined
  });
  const accepted = strictStations.filter((s) => s.qcWeight > 0);
  return {
    ...mesh,
    stations: strictStations,
    verticalProfile,
    acceptedCount: accepted.length,
    rejectedCount: strictStations.length - accepted.length,
    tier1OnlineCount: accepted.filter((s) => s.station.tier === 1).length
  };
}

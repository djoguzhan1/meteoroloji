#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const MANIFEST = {
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
};

const root = process.cwd();
let failed = false;
for (const [rel, expected] of Object.entries(MANIFEST)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`[SHA256-FAIL] Missing frozen Bursa file: ${rel}`);
    failed = true;
    continue;
  }
  const actual = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
  if (actual !== expected) {
    console.error(`[SHA256-FAIL] ${rel}\n  expected: ${expected}\n  actual:   ${actual}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log(`[SHA256-OK] All ${Object.keys(MANIFEST).length} frozen Bursa TR-16 files verified byte-identical.`);

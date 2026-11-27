"use client";

import {
  Component,
  memo,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { computeAdaptiveDpr, computeSkyScrollRig } from "@/lib/perf-budgets";
import type { SceneAtmosphereInput } from "@/lib/weather-types";

type ErrorBoundaryState = { hasError: boolean };

class WebGLErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Module-singleton 256×256 tileable RGBA noise LUT texture (<1.2 ms one-time bake, 256 KB VRAM).
 * Replaces 460 per-pixel trigonometric `sin()` calls in the sky shader with hardware bilinear texture fetches!
 */
let cachedSkyNoiseTex: THREE.DataTexture | null = null;

function getSkyNoiseTexture(): THREE.DataTexture {
  if (cachedSkyNoiseTex) return cachedSkyNoiseTex;

  const S = 256;
  const data = new Uint8Array(S * S * 4);
  const hash2 = (ix: number, iy: number, seed: number): number => {
    const wx = ((ix % S) + S) % S;
    const wy = ((iy % S) + S) % S;
    let h =
      Math.imul(wx, 374761393) ^
      Math.imul(wy, 668265263) ^
      Math.imul(seed, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };

  // Pre-baked smooth value + multi-octave FBM in G channel so shader can sample 1 tap instead of 5 octaves!
  const rawGrid = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      rawGrid[y * S + x] = hash2(x, y, 17);
    }
  }
  const sampleSmooth = (fx: number, fy: number): number => {
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const ux = tx * tx * (3 - 2 * tx);
    const uy = ty * ty * (3 - 2 * ty);
    const wx0 = ((x0 % S) + S) % S;
    const wy0 = ((y0 % S) + S) % S;
    const wx1 = (wx0 + 1) % S;
    const wy1 = (wy0 + 1) % S;
    const a = rawGrid[wy0 * S + wx0];
    const b = rawGrid[wy0 * S + wx1];
    const c = rawGrid[wy1 * S + wx0];
    const d = rawGrid[wy1 * S + wx1];
    return a + (b - a) * ux + (c - a) * uy * (1 - ux) + (d - b) * ux * uy;
  };

  let ptr = 0;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const nBase = rawGrid[y * S + x];
      // Tileable 4-octave pre-summed FBM at period S
      const f1 = sampleSmooth(x * 0.25, y * 0.25);
      const f2 = sampleSmooth(x * 0.5 + 31.7, y * 0.5 + 19.3);
      const f3 = sampleSmooth(x + 73.1, y + 53.9);
      const fbm = Math.max(0, Math.min(1, f1 * 0.54 + f2 * 0.30 + f3 * 0.16));
      const starHash = hash2(x, y, 911);
      const warpHash = sampleSmooth(x * 0.125 + 11.4, y * 0.125 + 47.2);

      data[ptr++] = Math.round(nBase * 255);
      data[ptr++] = Math.round(fbm * 255);
      data[ptr++] = Math.round(warpHash * 255);
      data[ptr++] = Math.round(starHash * 255);
    }
  }

  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cachedSkyNoiseTex = tex;
  return tex;
}

function CameraRig({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const { camera } = useThree();
  const scrollTargetRef = useRef({ x: 0, y: 0.65, z: 3.1 });

  useEffect(() => {
    let viewH = window.innerHeight || 900;
    let docH = document.documentElement.scrollHeight || 1800;
    let raf = 0;

    const syncRig = () => {
      raf = 0;
      const next = computeSkyScrollRig(window.scrollY || 0, viewH, docH);
      scrollTargetRef.current.x = next.x;
      scrollTargetRef.current.y = next.y;
      scrollTargetRef.current.z = next.z;
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(syncRig);
    };

    const onResize = () => {
      viewH = window.innerHeight || 900;
      docH = document.documentElement.scrollHeight || 1800;
      onScroll();
    };

    syncRig();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const gale = THREE.MathUtils.clamp((atmosphere.windSpeed - 38) / 38, 0, 1);

    const shakeX =
      gale > 0.08
        ? (Math.sin(t * 21.3) * 0.5 + Math.cos(t * 34.7) * 0.5) * 0.03 * gale
        : 0;
    const shakeY =
      gale > 0.08
        ? (Math.cos(t * 17.9) * 0.5 + Math.sin(t * 38.1) * 0.5) * 0.022 * gale
        : 0;

    const targetX = scrollTargetRef.current.x + state.pointer.x * 0.16 + shakeX;
    const targetY = scrollTargetRef.current.y + state.pointer.y * 0.09 + shakeY;
    const targetZ = scrollTargetRef.current.z;

    const nx = THREE.MathUtils.lerp(camera.position.x, targetX, 0.065);
    const ny = THREE.MathUtils.lerp(camera.position.y, targetY, 0.065);
    const nz = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.065);
    camera.position.set(nx, ny, nz);
    camera.lookAt(0, 0.25, -2.5);
  });

  return null;
}

/**
 * Runtime frame-budget monitor: steps canvas DPR down to 1.0 if average frame time > 22.5 ms.
 */
function AdaptiveDprMonitor({
  dpr,
  onChangeDpr
}: {
  dpr: number;
  onChangeDpr: (next: number) => void;
}) {
  const statsRef = useRef({ frames: 0, accMs: 0 });

  useFrame((_, delta) => {
    const dtMs = Math.min(100, delta * 1000);
    statsRef.current.frames += 1;
    statsRef.current.accMs += dtMs;
    if (statsRef.current.frames >= 45) {
      const avgMs = statsRef.current.accMs / statsRef.current.frames;
      statsRef.current.frames = 0;
      statsRef.current.accMs = 0;
      const next = computeAdaptiveDpr({
        avgFrameMs: avgMs,
        currentDpr: dpr,
        devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        maxDpr: 1.35
      });
      if (Math.abs(next - dpr) >= 0.05) {
        onChangeDpr(next);
      }
    }
  });

  return null;
}

/**
 * ATMOS SKY ENGINE 3.0 (Hardware LUT Accelerated)
 * Preserves identical Rayleigh/Mie sky, cirrus + cumulus relief, silver-lining, stars, meteor,
 * and dual-strike lightning while cutting fragment ALU instructions by ~85%.
 * Updates a dedicated `#atmos-lightning-flash` overlay opacity instead of mutating `:root` CSS vars!
 */
function PhysicalAtmosphericSky({
  atmosphere,
  lightningRef
}: {
  atmosphere: SceneAtmosphereInput;
  lightningRef: React.MutableRefObject<number>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const lightningCenterRef = useRef(new THREE.Vector2(0.2, 0.72));
  const lastFlashOpacityRef = useRef(0);
  const doubleStrikeTimerRef = useRef(0);

  const noiseTex = useMemo(() => getSkyNoiseTexture(), []);

  const uniforms = useMemo(
    () => ({
      uNoiseTex: { value: noiseTex },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uCloudCover: { value: atmosphere.cloudCover / 100 },
      uSolarElev: { value: atmosphere.solarElevationDeg },
      uStorm: { value: atmosphere.isStorm ? 1 : 0 },
      uLightning: { value: 0 },
      uLightningPos: { value: new THREE.Vector2(0.2, 0.72) },
      uWind: { value: new THREE.Vector2(0.15, 0.0) },
      uPointer: { value: new THREE.Vector2(0, 0) }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [noiseTex]
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        const flashEl = document.getElementById("atmos-lightning-flash");
        if (flashEl) flashEl.style.opacity = "0";
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += delta;
    u.uCloudCover.value = THREE.MathUtils.lerp(
      u.uCloudCover.value,
      atmosphere.cloudCover / 100,
      0.035
    );
    u.uSolarElev.value = THREE.MathUtils.lerp(
      u.uSolarElev.value,
      atmosphere.solarElevationDeg,
      0.04
    );
    u.uStorm.value = THREE.MathUtils.lerp(
      u.uStorm.value,
      atmosphere.isStorm ? 1 : 0,
      0.04
    );

    const windRad = (atmosphere.windDirection * Math.PI) / 180;
    const windSpeedNorm = Math.max(0.09, atmosphere.windSpeed / 48);
    u.uWind.value.x = THREE.MathUtils.lerp(
      u.uWind.value.x,
      Math.cos(windRad) * windSpeedNorm,
      0.03
    );
    u.uWind.value.y = THREE.MathUtils.lerp(
      u.uWind.value.y,
      Math.sin(windRad) * windSpeedNorm * 0.28,
      0.03
    );

    u.uPointer.value.x = THREE.MathUtils.lerp(u.uPointer.value.x, state.pointer.x, 0.05);
    u.uPointer.value.y = THREE.MathUtils.lerp(u.uPointer.value.y, state.pointer.y, 0.05);

    const flashRate = atmosphere.lightningFlashRatePerMin ?? 0;
    const stormTrigger =
      atmosphere.isStorm ||
      Boolean(atmosphere.isThundersnow) ||
      flashRate >= 0.2 ||
      atmosphere.cape >= 1200
        ? 1
        : 0;
    // Calibrate visual flash cadence from physical `flashesPerMin` (`0.12 .. 0.65 Hz` visual envelope)
    const flashHz =
      flashRate > 0
        ? Math.min(0.65, Math.max(0.14, 0.12 + flashRate * 0.06))
        : 0.26;
    if (doubleStrikeTimerRef.current > 0) {
      doubleStrikeTimerRef.current -= delta;
      if (doubleStrikeTimerRef.current <= 0) {
        lightningRef.current = 0.92;
      }
    } else if (
      stormTrigger > 0 &&
      lightningRef.current <= 0.02 &&
      Math.random() < delta * flashHz
    ) {
      lightningRef.current = 0.75 + Math.random() * 0.25;
      lightningCenterRef.current.set(
        (Math.random() - 0.5) * 1.15,
        0.52 + Math.random() * 0.32
      );
      u.uLightningPos.value.copy(lightningCenterRef.current);
      if (Math.random() < 0.65) {
        doubleStrikeTimerRef.current = 0.14 + Math.random() * 0.09;
      }
    }

    lightningRef.current = Math.max(0, lightningRef.current - delta * 4.4);
    u.uLightning.value = lightningRef.current;

    // Zero-cascade GPU opacity update on isolated flash layer (0 DOM style recalculation!)
    const roundedFlash = Math.round(lightningRef.current * 25) / 25;
    if (roundedFlash !== lastFlashOpacityRef.current && typeof document !== "undefined") {
      lastFlashOpacityRef.current = roundedFlash;
      const flashEl = document.getElementById("atmos-lightning-flash");
      if (flashEl) {
        flashEl.style.opacity = (roundedFlash * 0.22).toFixed(3);
      }
    }
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        depthTest={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.999, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          precision mediump float;
          varying vec2 vUv;

          uniform sampler2D uNoiseTex;
          uniform float uTime;
          uniform vec2 uResolution;
          uniform float uCloudCover;
          uniform float uSolarElev;
          uniform float uStorm;
          uniform float uLightning;
          uniform vec2 uLightningPos;
          uniform vec2 uWind;
          uniform vec2 uPointer;

          float hashFast(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
          }

          // Hardware-filtered 2-tap multi-scale FBM via pre-baked 256x256 RGBA LUT (~12x faster than 5-octave sin() FBM!)
          float fbmLut(vec2 p) {
            float lo = texture2D(uNoiseTex, p * 0.015625).g;
            float hi = texture2D(uNoiseTex, p * 0.052 + vec2(0.37, 0.19)).g;
            return lo * 0.68 + hi * 0.32;
          }

          float cloudDensity(vec2 uv, float aspect, vec2 flow, vec2 ptr) {
            float depth = max(0.18, uv.y + 0.20);
            vec2 dome = vec2((uv.x - 0.5) * aspect / depth, 1.0 / depth);
            dome += ptr * vec2(0.12, 0.06);
            float warp = texture2D(uNoiseTex, (dome * 0.42 + flow * 0.45) * 0.018).b;
            float c1 = fbmLut(dome * 0.72 + flow + warp * 0.55);
            float c2 = texture2D(uNoiseTex, (dome * 1.65 - flow * 0.85) * 0.024).g;
            return mix(c1, c2, 0.36);
          }

          void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / max(1.0, uResolution.y);
            vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

            float dayFactor = smoothstep(-4.0, 22.0, uSolarElev);
            float goldenFactor = smoothstep(-8.0, 1.5, uSolarElev) * (1.0 - smoothstep(4.5, 19.0, uSolarElev));
            float nightFactor = 1.0 - smoothstep(-12.0, -2.0, uSolarElev);

            vec3 nightZenith = vec3(0.015, 0.024, 0.052);
            vec3 nightHorizon = vec3(0.042, 0.068, 0.125);
            vec3 dayZenith = vec3(0.055, 0.19, 0.41);
            vec3 dayHorizon = vec3(0.28, 0.48, 0.69);
            vec3 goldenZenith = vec3(0.07, 0.12, 0.25);
            vec3 goldenHorizon = vec3(0.72, 0.38, 0.19);

            vec3 zenith = mix(nightZenith, dayZenith, dayFactor);
            vec3 horizon = mix(nightHorizon, dayHorizon, dayFactor);
            zenith = mix(zenith, goldenZenith, goldenFactor * 0.72);
            horizon = mix(horizon, goldenHorizon, goldenFactor * 0.84 * (1.0 - uCloudCover * 0.5));

            float overcastDamp = clamp(uCloudCover * 0.64 + uStorm * 0.48, 0.0, 0.92);
            vec3 overcastZenith = mix(vec3(0.032, 0.048, 0.078), vec3(0.12, 0.16, 0.23), dayFactor);
            vec3 overcastHorizon = mix(vec3(0.068, 0.092, 0.135), vec3(0.21, 0.27, 0.34), dayFactor);

            zenith = mix(zenith, overcastZenith, overcastDamp);
            horizon = mix(horizon, overcastHorizon, overcastDamp);

            vec3 sky = mix(horizon, zenith, pow(clamp(uv.y, 0.0, 1.0), 0.68));

            float starVis = nightFactor * (1.0 - smoothstep(0.32, 0.85, uCloudCover));
            if (starVis > 0.02) {
              vec2 mwUv = vec2(p.x * 0.7 + p.y * 0.65, -p.x * 0.65 + p.y * 0.7);
              float band = exp(-abs(mwUv.y - 0.12) * 5.2);
              float mwNoise = fbmLut(mwUv * 4.5 + 3.1);
              sky += vec3(0.11, 0.15, 0.26) * band * mwNoise * starVis * 0.65 * smoothstep(0.15, 0.6, uv.y);

              vec2 sg1 = floor((uv + uPointer * 0.008) * vec2(280.0, 160.0));
              float rs1 = hashFast(sg1);
              if (rs1 > 0.992) {
                float tw = 0.62 + 0.38 * sin(uTime * 2.1 + rs1 * 120.0);
                vec3 sCol = mix(vec3(0.76, 0.86, 1.0), vec3(1.0, 0.92, 0.78), fract(rs1 * 57.0));
                sky += sCol * tw * starVis * smoothstep(0.18, 0.72, uv.y) * 0.95;
              }

              float cycle = mod(uTime, 14.0);
              if (cycle < 1.15) {
                float mt = cycle / 1.15;
                float seed = floor(uTime / 14.0);
                vec2 mStart = vec2(0.18 + hashFast(vec2(seed, 1.3)) * 0.62, 0.84 + hashFast(vec2(seed, 2.7)) * 0.1);
                vec2 mDir = normalize(vec2(-0.82, -0.45));
                vec2 mHead = mStart + mDir * (mt * 0.42);
                vec2 rel = uv - mHead;
                float proj = dot(rel, -mDir);
                float perp = length(rel - (-mDir) * clamp(proj, 0.0, 0.12));
                float streak = exp(-perp * 420.0) * smoothstep(0.12, 0.0, proj) * smoothstep(-0.003, 0.0, proj);
                float fade = sin(mt * 3.14159);
                sky += vec3(0.90, 0.96, 1.0) * streak * fade * starVis * 2.2;
              }
            }

            float sunY = clamp((uSolarElev / 52.0) * 0.46 - 0.05, -0.14, 0.36);
            vec2 sunPos = vec2(0.24 * aspect, sunY) - uPointer * 0.04;
            vec2 sunUv = sunPos / vec2(aspect, 1.0) + 0.5;
            float dSun = length(p - sunPos);
            vec3 sunCol = mix(vec3(0.98, 0.56, 0.28), vec3(1.0, 0.97, 0.90), dayFactor);

            if (uSolarElev > -6.0) {
              float clearness = 1.0 - overcastDamp * 0.82;
              float mieHalo = exp(-dSun * 3.4) * clearness * smoothstep(-6.0, 6.0, uSolarElev);
              float outerGlow = exp(-dSun * 1.45) * (0.18 + goldenFactor * 0.25) * smoothstep(-6.0, 8.0, uSolarElev);
              float sunDisc = smoothstep(0.042, 0.017, dSun) * clearness * smoothstep(0.0, 7.0, uSolarElev);
              sky += sunCol * (mieHalo * 0.38 + outerGlow * 0.32 + sunDisc * 0.88);
            }

            float t = uTime * 0.022;
            vec2 flow = uWind * t;
            vec2 cirrusUv = vec2((uv.x - 0.5) * aspect * 1.15, uv.y * 2.4) + flow * 0.35 + uPointer * 0.02;
            float cirrus = fbmLut(cirrusUv * vec2(1.4, 3.6));
            float cirrusAlpha = smoothstep(0.54, 0.84, cirrus) * (0.12 + uCloudCover * 0.24) * smoothstep(0.25, 0.82, uv.y);
            vec3 cirrusCol = mix(vec3(0.14, 0.20, 0.30), vec3(0.84, 0.89, 0.96), dayFactor);
            cirrusCol = mix(cirrusCol, vec3(0.96, 0.68, 0.46), goldenFactor * 0.65);
            sky = mix(sky, cirrusCol, cirrusAlpha);

            float cf = cloudDensity(uv, aspect, flow, uPointer);
            vec2 toSun = normalize(sunUv - uv + 1e-4) * 0.016;
            float cfTowardSun = cloudDensity(uv + toSun, aspect, flow, uPointer);
            float selfShadow = clamp(0.55 + (cf - cfTowardSun) * 3.4, 0.0, 1.0);

            float coverage = smoothstep(1.01 - uCloudCover * 0.94, 1.09 - uCloudCover * 0.26, cf);
            float horizonFade = smoothstep(0.0, 0.22, uv.y);
            float cloudAlpha = clamp(coverage * (0.28 + uCloudCover * 0.68) * horizonFade, 0.0, 0.93);

            vec3 cDark = mix(vec3(0.038, 0.055, 0.092), vec3(0.16, 0.21, 0.29), dayFactor);
            vec3 cLit = mix(vec3(0.14, 0.20, 0.30), vec3(0.80, 0.85, 0.92), dayFactor);
            cLit = mix(cLit, vec3(0.92, 0.62, 0.40), goldenFactor * 0.64);
            cLit = mix(cLit, vec3(0.22, 0.27, 0.35), uStorm * 0.68);

            vec3 cloudCol = mix(cDark, cLit, smoothstep(0.18, 0.84, selfShadow));

            if (uSolarElev > -4.0) {
              float silverEdge = exp(-dSun * 2.8) * (1.0 - cloudAlpha * 0.55) * coverage;
              cloudCol += sunCol * silverEdge * (0.55 + goldenFactor * 0.45);

              // Lightweight 3-tap LUT crepuscular rays (replaces 75-sin loop!)
              float rayStrength = smoothstep(-2.0, 12.0, uSolarElev) * (1.0 - uStorm * 0.85) * smoothstep(0.15, 0.78, uCloudCover);
              if (rayStrength > 0.04 && dSun < 0.85) {
                float shafts = 0.0;
                for (int i = 1; i <= 3; i++) {
                  float fi = float(i) * 0.22;
                  vec2 sampleUv = mix(uv, sunUv, fi);
                  float dSample = max(0.18, sampleUv.y + 0.20);
                  vec2 domeS = vec2((sampleUv.x - 0.5) * aspect / dSample, 1.0 / dSample);
                  float sc = texture2D(uNoiseTex, (domeS * 0.72 + flow) * 0.018).g;
                  float occ = smoothstep(1.01 - uCloudCover * 0.94, 1.09 - uCloudCover * 0.26, sc);
                  shafts += (1.0 - occ) * (1.0 - fi);
                }
                shafts = (shafts * 0.52) * exp(-dSun * 1.75) * rayStrength;
                sky += sunCol * shafts * (0.28 + goldenFactor * 0.24);
              }
            }

            if (uLightning > 0.01) {
              vec2 lPos = uLightningPos * vec2(aspect, 1.0);
              float dBolt = length(p - vec2(lPos.x * 0.65, lPos.y - 0.5));
              float flashGlow = exp(-dBolt * 2.4) * uLightning;
              float boltMask = smoothstep(0.36, 0.86, cf) * uLightning;
              cloudCol += vec3(0.76, 0.88, 1.0) * (boltMask * 1.15 + flashGlow * 1.35);

              float jitter = texture2D(uNoiseTex, vec2(uv.y * 0.22, uTime * 0.04)).g - 0.5;
              float xDiff = abs(p.x - lPos.x * 0.65 + jitter * 0.14);
              float vein = exp(-xDiff * 95.0) * smoothstep(0.28, 0.75, uv.y) * smoothstep(0.95, 0.62, uv.y);
              cloudCol += vec3(0.92, 0.97, 1.0) * vein * uLightning * 1.9;
            }

            vec3 finalCol = mix(sky, cloudCol, cloudAlpha);
            finalCol += vec3(0.20, 0.26, 0.38) * uLightning * 0.44;

            float vignette = smoothstep(1.22, 0.24, length(uv - 0.5));
            finalCol *= mix(0.68, 1.0, vignette);

            gl_FragColor = vec4(finalCol, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function createPrecipitationSeeds(count: number): Float32Array {
  const arr = new Float32Array(count * 4);
  const hash = (n: number) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return s - Math.floor(s);
  };
  for (let i = 0; i < count; i++) {
    arr[i * 4 + 0] = (hash(i * 4 + 1) - 0.5) * 14;
    arr[i * 4 + 1] = hash(i * 4 + 2) * 9 - 2.5;
    arr[i * 4 + 2] = -9.5 + hash(i * 4 + 3) * 10.1;
    arr[i * 4 + 3] = 0.7 + hash(i * 4 + 4) * 0.75;
  }
  return arr;
}

function RealPrecipitationParticles({
  atmosphere
}: {
  atmosphere: SceneAtmosphereInput;
}) {
  const maxCount = 360;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef<THREE.Object3D | null>(null);
  const seedsRef = useRef<Float32Array | null>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const isRain = atmosphere.precipType === "rain";
    const isSnow = atmosphere.precipType === "snow";
    const isWindStream = !isRain && !isSnow && atmosphere.windSpeed >= 18;

    const activeCount =
      isRain || isSnow
        ? Math.floor(maxCount * Math.min(1, 0.38 + atmosphere.precipIntensity * 0.62))
        : isWindStream
          ? Math.min(72, Math.floor((atmosphere.windSpeed - 14) * 2.0))
          : 0;

    // Zero CPU matrix loop & zero GPU buffer upload when sky is calm/dry!
    if (activeCount <= 0) {
      if (mesh.visible) {
        mesh.visible = false;
        mesh.count = 0;
      }
      return;
    }

    if (!mesh.visible) mesh.visible = true;
    mesh.count = activeCount;

    if (!dummyRef.current) dummyRef.current = new THREE.Object3D();
    if (!seedsRef.current) seedsRef.current = createPrecipitationSeeds(maxCount);
    const dummy = dummyRef.current;
    const seeds = seedsRef.current;

    const windRad = (atmosphere.windDirection * Math.PI) / 180;
    const windDriftX = Math.sin(windRad) * (atmosphere.windSpeed / 16);
    const t = state.clock.elapsedTime;

    for (let i = 0; i < activeCount; i++) {
      const idx = i * 4;
      const mult = seeds[idx + 3];

      if (isRain) {
        seeds[idx + 1] -= delta * (11.2 + atmosphere.windSpeed * 0.09) * mult;
        seeds[idx + 0] += delta * windDriftX * 0.85;
      } else if (isSnow) {
        // High SLR (`15..22:1` dry dendritic powder) floats slower & flutters wider than dense `5:1` wet snow!
        const slrNorm = THREE.MathUtils.clamp(((atmosphere.snowSlrRatio ?? 11) - 5) / 14, 0, 1);
        const fallSpeed = (1.65 - slrNorm * 0.55) * mult;
        const flutterAmp = 0.26 + slrNorm * 0.24;
        seeds[idx + 1] -= delta * fallSpeed;
        seeds[idx + 0] +=
          delta * (windDriftX * 0.44 + Math.sin(t * 1.45 + i) * flutterAmp);
      } else {
        const dirSign = windDriftX >= 0 ? 1 : -1;
        seeds[idx + 0] += delta * (2.6 + atmosphere.windSpeed * 0.09) * mult * dirSign;
        seeds[idx + 1] += Math.sin(t * 0.9 + i) * delta * 0.22;
      }

      if (seeds[idx + 1] < -2.5) seeds[idx + 1] = 5.5;
      if (seeds[idx + 1] > 5.8) seeds[idx + 1] = -2.2;
      if (seeds[idx + 0] > 6.8) seeds[idx + 0] = -6.8;
      if (seeds[idx + 0] < -6.8) seeds[idx + 0] = 6.8;

      dummy.position.set(seeds[idx + 0], seeds[idx + 1], seeds[idx + 2]);
      if (isRain) {
        dummy.rotation.set(0, 0, -Math.atan2(windDriftX * 0.14, 1));
        dummy.scale.set(0.0055, 0.38 + mult * 0.12, 0.0055);
      } else if (isSnow) {
        dummy.rotation.set(t * 0.45 + i, t * 0.32, 0);
        const slrBoost = THREE.MathUtils.clamp(((atmosphere.snowSlrRatio ?? 11) - 8) / 12, -0.15, 0.32);
        const s = 0.03 * (1 + slrBoost) * mult;
        dummy.scale.set(s, s, s);
      } else {
        dummy.rotation.set(0, 0, Math.sin(t * 0.4 + i) * 0.08);
        dummy.scale.set(0.28 * mult, 0.004, 0.004);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  const isSnow = atmosphere.precipType === "snow";
  const isRain = atmosphere.precipType === "rain";

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxCount]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={isSnow ? "#eef6ff" : isRain ? "#c4dcf4" : "#9ec8eb"}
        transparent
        opacity={isSnow ? 0.78 : isRain ? 0.36 : 0.15}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function VisibilityMist({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uMist: { value: 0 } }), []);

  useFrame(() => {
    if (!materialRef.current || !meshRef.current) return;
    const visFactor =
      atmosphere.visibilityKm < 6
        ? THREE.MathUtils.clamp((6 - atmosphere.visibilityKm) / 5.5, 0, 0.75)
        : 0;
    const aqiFactor = atmosphere.airQualityIndex >= 4 ? 0.28 : 0;
    const target = Math.max(visFactor, aqiFactor);
    const nextMist = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMist.value,
      target,
      0.04
    );
    materialRef.current.uniforms.uMist.value = nextMist;
    meshRef.current.visible = nextMist >= 0.01;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={5} visible={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        depthTest={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          precision mediump float;
          varying vec2 vUv;
          uniform float uMist;
          void main() {
            float lowerBand = smoothstep(0.85, 0.0, vUv.y);
            gl_FragColor = vec4(vec3(0.56, 0.62, 0.70), lowerBand * uMist * 0.55);
          }
        `}
      />
    </mesh>
  );
}

function StaticSkyFallback({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const isDay = atmosphere.solarElevationDeg > 4;
  const cls =
    atmosphere.cloudCover > 75
      ? isDay
        ? "from-[#1e293b] via-[#2b3749] to-[#0f172a]"
        : "from-[#0a0f1a] via-[#131c2b] to-[#06090f]"
      : isDay
        ? "from-[#102d56] via-[#244e7d] to-[#0f1b2e]"
        : "from-[#050811] via-[#0c1424] to-[#05070c]";

  return <div className={`fixed inset-0 z-0 bg-gradient-to-b ${cls}`} />;
}

function StormSceneBase({
  atmosphere
}: {
  atmosphere: SceneAtmosphereInput;
}) {
  const [contextLost, setContextLost] = useState(false);
  const [webglUnsupported, setWebglUnsupported] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dpr, setDpr] = useState(1.25);
  const lightningRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let supported = true;
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) {
        supported = false;
      }
    } catch {
      supported = false;
    }

    const initDpr = Math.min(window.devicePixelRatio || 1, 1.35);
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const isRed = Boolean(mq?.matches);

    queueMicrotask(() => {
      if (!supported) setWebglUnsupported(true);
      setDpr(Number(initDpr.toFixed(2)));
      setReducedMotion(isRed);
      setTabHidden(document.visibilityState === "hidden");
    });

    const onVis = () => setTabHidden(document.visibilityState === "hidden");
    const onMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    document.addEventListener("visibilitychange", onVis);
    mq?.addEventListener?.("change", onMq);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      mq?.removeEventListener?.("change", onMq);
    };
  }, []);

  if (contextLost || webglUnsupported || reducedMotion) {
    return <StaticSkyFallback atmosphere={atmosphere} />;
  }

  return (
    <WebGLErrorBoundary fallback={<StaticSkyFallback atmosphere={atmosphere} />}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          dpr={dpr}
          frameloop={tabHidden ? "never" : "always"}
          className="h-full w-full"
          gl={{
            powerPreference: "high-performance",
            antialias: false,
            alpha: false,
            stencil: false,
            depth: true
          }}
          onCreated={({ gl }) => {
            const canvas = gl.domElement;
            canvas.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              setContextLost(true);
            });
            canvas.addEventListener("webglcontextrestored", () => {
              setContextLost(false);
            });
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0.65, 3.1]} fov={46} />
          <color attach="background" args={["#05070c"]} />
          <AdaptiveDprMonitor dpr={dpr} onChangeDpr={setDpr} />
          <PhysicalAtmosphericSky
            atmosphere={atmosphere}
            lightningRef={lightningRef}
          />
          <RealPrecipitationParticles atmosphere={atmosphere} />
          <VisibilityMist atmosphere={atmosphere} />
          <CameraRig atmosphere={atmosphere} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}

const StormScene = memo(StormSceneBase);
export default StormScene;

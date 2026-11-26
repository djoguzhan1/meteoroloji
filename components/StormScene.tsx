"use client";

import {
  Component,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type { SceneAtmosphereInput } from "@/lib/weather-types";

gsap.registerPlugin(ScrollTrigger);

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

function CameraRig({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const { camera } = useThree();
  const scrollTargetRef = useRef({ x: 0, y: 0.65, z: 3.1 });

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        scrollTargetRef.current.x = (p - 0.5) * 0.7;
        scrollTargetRef.current.y = 0.65 - p * 0.36;
        scrollTargetRef.current.z = 3.1 + p * 0.42;
      }
    });
    return () => trigger.kill();
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
 * ATMOS SKY ENGINE 2.0
 * - Perspektif derinlikli çift katmanlı sirüs + kümülüs bulut örtüsü
 * - Henyey-Greenstein gümüş kenarlı güneş saçılımı + Crepuscular God-Rays
 * - Berrak gece Samanyolu yıldız kuşağı + periyodik meteor (yıldız kayması)
 * - Çift darbeli fırtına şimşeği + canlı UI cam kenarlığı yansıma köprüsü (--atmos-lightning)
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
  const lastCssFlashRef = useRef(0);
  const doubleStrikeTimerRef = useRef(0);

  const uniforms = useMemo(
    () => ({
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
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--atmos-lightning", "0");
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

    // Gerçek fırtına / yüksek CAPE durumunda çift darbeli şimşek
    const stormTrigger = atmosphere.isStorm || atmosphere.cape >= 1200 ? 1 : 0;
    if (doubleStrikeTimerRef.current > 0) {
      doubleStrikeTimerRef.current -= delta;
      if (doubleStrikeTimerRef.current <= 0) {
        lightningRef.current = 0.92;
      }
    } else if (stormTrigger > 0 && lightningRef.current <= 0.02 && Math.random() < delta * 0.28) {
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

    // UI cam kenarlıklarına anlık şimşek yansıması köprüsü
    const roundedFlash = Math.round(lightningRef.current * 20) / 20;
    if (roundedFlash !== lastCssFlashRef.current && typeof document !== "undefined") {
      lastCssFlashRef.current = roundedFlash;
      document.documentElement.style.setProperty(
        "--atmos-lightning",
        roundedFlash.toFixed(2)
      );
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
          precision highp float;
          varying vec2 vUv;

          uniform float uTime;
          uniform vec2 uResolution;
          uniform float uCloudCover;
          uniform float uSolarElev;
          uniform float uStorm;
          uniform float uLightning;
          uniform vec2 uLightningPos;
          uniform vec2 uWind;
          uniform vec2 uPointer;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) +
                   (c - a) * u.y * (1.0 - u.x) +
                   (d - b) * u.x * u.y;
          }

          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p = rot * p * 2.04;
              a *= 0.5;
            }
            return v;
          }

          float cloudDensity(vec2 uv, float aspect, vec2 flow, vec2 ptr) {
            // Perspektif gök kubbesi izdüşümü
            float depth = max(0.18, uv.y + 0.20);
            vec2 dome = vec2((uv.x - 0.5) * aspect / depth, 1.0 / depth);
            dome += ptr * vec2(0.12, 0.06);
            float warp = fbm(dome * 0.42 + flow * 0.45);
            float c1 = fbm(dome * 0.72 + flow + warp * 0.42);
            float c2 = fbm(dome * 1.65 - flow * 0.85);
            return mix(c1, c2, 0.36);
          }

          void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / max(1.0, uResolution.y);
            vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

            // Gerçek güneş yükselme açısına göre atmosfer fazları
            float dayFactor = smoothstep(-4.0, 22.0, uSolarElev);
            float goldenFactor = smoothstep(-8.0, 1.5, uSolarElev) * (1.0 - smoothstep(4.5, 19.0, uSolarElev));
            float nightFactor = 1.0 - smoothstep(-12.0, -2.0, uSolarElev);

            // Rayleigh / Mie bazlı fiziksel gökyüzü paleti
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

            // Gece Gözlemevi: Samanyolu kuşağı + 2 katmanlı yıldız + periyodik meteor
            float starVis = nightFactor * (1.0 - smoothstep(0.32, 0.85, uCloudCover));
            if (starVis > 0.02) {
              // Diyagonal Samanyolu toz şeridi
              vec2 mwUv = vec2(p.x * 0.7 + p.y * 0.65, -p.x * 0.65 + p.y * 0.7);
              float band = exp(-abs(mwUv.y - 0.12) * 5.2);
              float mwNoise = fbm(mwUv * 4.5 + 3.1);
              sky += vec3(0.11, 0.15, 0.26) * band * mwNoise * starVis * 0.65 * smoothstep(0.15, 0.6, uv.y);

              // Parlak ve ince yıldızlar
              vec2 sg1 = floor((uv + uPointer * 0.008) * vec2(280.0, 160.0));
              float rs1 = hash(sg1);
              if (rs1 > 0.992) {
                float tw = 0.62 + 0.38 * sin(uTime * 2.1 + rs1 * 120.0);
                vec3 sCol = mix(vec3(0.76, 0.86, 1.0), vec3(1.0, 0.92, 0.78), fract(rs1 * 57.0));
                sky += sCol * tw * starVis * smoothstep(0.18, 0.72, uv.y) * 0.95;
              }

              // Periyodik yıldız kayması (her 14 saniyede 1 kez)
              float cycle = mod(uTime, 14.0);
              if (cycle < 1.15) {
                float mt = cycle / 1.15;
                float seed = floor(uTime / 14.0);
                vec2 mStart = vec2(0.18 + hash(vec2(seed, 1.3)) * 0.62, 0.84 + hash(vec2(seed, 2.7)) * 0.1);
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

            // Canlı güneş konumu + Mie halesi
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

            // Yüksek İrtifa İnce Sirüs Katmanı
            float t = uTime * 0.022;
            vec2 flow = uWind * t;
            vec2 cirrusUv = vec2((uv.x - 0.5) * aspect * 1.15, uv.y * 2.4) + flow * 0.35 + uPointer * 0.02;
            float cirrus = fbm(cirrusUv * vec2(1.4, 3.6));
            float cirrusAlpha = smoothstep(0.56, 0.86, cirrus) * (0.12 + uCloudCover * 0.24) * smoothstep(0.25, 0.82, uv.y);
            vec3 cirrusCol = mix(vec3(0.14, 0.20, 0.30), vec3(0.84, 0.89, 0.96), dayFactor);
            cirrusCol = mix(cirrusCol, vec3(0.96, 0.68, 0.46), goldenFactor * 0.65);
            sky = mix(sky, cirrusCol, cirrusAlpha);

            // Ana Perspektif Kümülüs / Stratüs Bulut Örtüsü
            float cf = cloudDensity(uv, aspect, flow, uPointer);
            // Güneşe doğru yönlü aydınlanma türevi (3D kabartma hissi)
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

            // Henyey-Greenstein Gümüş Kenar (Silver Lining) + Crepuscular God-Rays
            if (uSolarElev > -4.0) {
              float silverEdge = exp(-dSun * 2.8) * (1.0 - cloudAlpha * 0.55) * coverage;
              cloudCol += sunCol * silverEdge * (0.55 + goldenFactor * 0.45);

              // Hafif 5-örnekli güneş hüzmeleri (yalnızca parçalı bulutlu / altın saatte)
              float rayStrength = smoothstep(-2.0, 12.0, uSolarElev) * (1.0 - uStorm * 0.85) * smoothstep(0.15, 0.78, uCloudCover);
              if (rayStrength > 0.04) {
                float shafts = 0.0;
                for (int i = 1; i <= 5; i++) {
                  float fi = float(i) / 6.0;
                  vec2 sampleUv = mix(uv, sunUv, fi * 0.52);
                  float sc = cloudDensity(sampleUv, aspect, flow, uPointer);
                  float occ = smoothstep(1.01 - uCloudCover * 0.94, 1.09 - uCloudCover * 0.26, sc);
                  shafts += (1.0 - occ) * (1.0 - fi);
                }
                shafts = (shafts / 2.6) * exp(-dSun * 1.75) * rayStrength;
                sky += sunCol * shafts * (0.28 + goldenFactor * 0.24);
              }
            }

            // Fırtına içi lokal şimşek çekirdeği + çatallı plazma damarı
            if (uLightning > 0.01) {
              vec2 lPos = uLightningPos * vec2(aspect, 1.0);
              float dBolt = length(p - vec2(lPos.x * 0.65, lPos.y - 0.5));
              float flashGlow = exp(-dBolt * 2.4) * uLightning;
              float boltMask = smoothstep(0.36, 0.86, cf) * uLightning;
              cloudCol += vec3(0.76, 0.88, 1.0) * (boltMask * 1.15 + flashGlow * 1.35);

              // İnce bulut-içi çatallı şimşek damarı
              float xDiff = abs(p.x - lPos.x * 0.65 + (fbm(vec2(uv.y * 14.0, uTime * 2.0)) - 0.5) * 0.14);
              float vein = exp(-xDiff * 95.0) * smoothstep(0.28, 0.75, uv.y) * smoothstep(0.95, 0.62, uv.y);
              cloudCol += vec3(0.92, 0.97, 1.0) * vein * uLightning * 1.9;
            }

            vec3 finalCol = mix(sky, cloudCol, cloudAlpha);
            finalCol += vec3(0.20, 0.26, 0.38) * uLightning * 0.44;

            // Okunabilirlik ve derinlik için yumuşak gözlemevi vinyeti
            float vignette = smoothstep(1.22, 0.24, length(uv - 0.5));
            finalCol *= mix(0.68, 1.0, vignette);

            gl_FragColor = vec4(finalCol, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/**
 * Gerçek 3D Atmosfer Parçacıkları:
 * - Yağmurda hız-uzamalı eğimli cam şeritleri
 * - Karda dönen derinlik kristalleri
 * - Kuru rüzgarlı havada (>= 18 km/s) ultra-hafif atmosferik hava akımı izleri
 */
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
  const count = 440;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef<THREE.Object3D | null>(null);
  const seedsRef = useRef<Float32Array | null>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!dummyRef.current) dummyRef.current = new THREE.Object3D();
    if (!seedsRef.current) seedsRef.current = createPrecipitationSeeds(count);
    const dummy = dummyRef.current;
    const seeds = seedsRef.current;

    const isRain = atmosphere.precipType === "rain";
    const isSnow = atmosphere.precipType === "snow";
    const isWindStream = !isRain && !isSnow && atmosphere.windSpeed >= 18;

    const activeCount =
      isRain || isSnow
        ? Math.floor(count * Math.min(1, 0.38 + atmosphere.precipIntensity * 0.62))
        : isWindStream
          ? Math.min(85, Math.floor((atmosphere.windSpeed - 14) * 2.2))
          : 0;

    const windRad = (atmosphere.windDirection * Math.PI) / 180;
    const windDriftX = Math.sin(windRad) * (atmosphere.windSpeed / 16);
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      if (i >= activeCount) {
        dummy.position.set(0, -50, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const idx = i * 4;
      const mult = seeds[idx + 3];

      if (isRain) {
        seeds[idx + 1] -= delta * (11.2 + atmosphere.windSpeed * 0.09) * mult;
        seeds[idx + 0] += delta * windDriftX * 0.85;
      } else if (isSnow) {
        seeds[idx + 1] -= delta * 1.35 * mult;
        seeds[idx + 0] +=
          delta * (windDriftX * 0.42 + Math.sin(t * 1.45 + i) * 0.36);
      } else {
        // Kuru rüzgarlı havada yatay ince atmosferik hava akışı izleri
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
        const s = 0.03 * mult;
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
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

/**
 * Gerçek sis / düşük görüş mesafesi atmosfer pusu
 */
function VisibilityMist({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uMist: { value: 0 } }), []);

  useFrame(() => {
    if (!materialRef.current) return;
    const visFactor =
      atmosphere.visibilityKm < 6
        ? THREE.MathUtils.clamp((6 - atmosphere.visibilityKm) / 5.5, 0, 0.75)
        : 0;
    const aqiFactor = atmosphere.airQualityIndex >= 4 ? 0.28 : 0;
    const target = Math.max(visFactor, aqiFactor);
    materialRef.current.uniforms.uMist.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMist.value,
      target,
      0.04
    );
  });

  return (
    <mesh frustumCulled={false} renderOrder={5}>
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
          precision highp float;
          varying vec2 vUv;
          uniform float uMist;
          void main() {
            if (uMist < 0.01) discard;
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

export default function StormScene({
  atmosphere
}: {
  atmosphere: SceneAtmosphereInput;
}) {
  const [contextLost, setContextLost] = useState(false);
  const [webglUnsupported, setWebglUnsupported] = useState(false);
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
    if (!supported) {
      queueMicrotask(() => setWebglUnsupported(true));
    }
  }, []);

  if (contextLost || webglUnsupported) {
    return <StaticSkyFallback atmosphere={atmosphere} />;
  }

  return (
    <WebGLErrorBoundary fallback={<StaticSkyFallback atmosphere={atmosphere} />}>
      <div className="fixed inset-0 z-0">
        <Canvas
          dpr={[1, 1.5]}
          className="h-full w-full"
          gl={{ powerPreference: "high-performance", antialias: true }}
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

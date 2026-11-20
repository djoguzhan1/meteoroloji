/* eslint-disable react/no-unknown-property */
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
import type {
  PerformanceMode,
  SceneAtmosphereInput
} from "@/lib/weather-types";

gsap.registerPlugin(ScrollTrigger);

type StormSceneProps = {
  atmosphere: SceneAtmosphereInput;
  performanceMode: PerformanceMode;
};

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
 * ScrollTrigger + drift'siz harmonik fırtına kamera sarsıntısı + fare parallax
 */
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
        scrollTargetRef.current.x = (p - 0.5) * 0.9;
        scrollTargetRef.current.y = 0.65 - p * 0.45;
        scrollTargetRef.current.z = 3.1 + p * 0.5;
      }
    });
    return () => trigger.kill();
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const stormIntensity = THREE.MathUtils.clamp(
      (atmosphere.windSpeed - 35) / 35 + (atmosphere.isStorm ? 0.35 : 0),
      0,
      1
    );

    // Drift yapmayan harmonik sarsıntı (merkez etrafında sıfır ortalamalı)
    const shakeX =
      stormIntensity > 0.15
        ? (Math.sin(t * 23.7) * 0.5 + Math.cos(t * 37.3) * 0.5) *
          0.045 *
          stormIntensity
        : 0;
    const shakeY =
      stormIntensity > 0.15
        ? (Math.cos(t * 19.3) * 0.5 + Math.sin(t * 41.1) * 0.5) *
          0.032 *
          stormIntensity
        : 0;

    const pointerX = state.pointer.x * 0.18;
    const pointerY = state.pointer.y * 0.1;

    const targetX = scrollTargetRef.current.x + pointerX + shakeX;
    const targetY = scrollTargetRef.current.y + pointerY + shakeY;
    const targetZ = scrollTargetRef.current.z;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    camera.lookAt(0, 0.25, -2.5);
  });

  return null;
}

/**
 * Dinamik gökyüzü + yıldızlar + güneş diski + volumetrik bulutlar + şimşek parlaması
 */
function VolumetricSkyAndClouds({
  atmosphere,
  lightningRef
}: {
  atmosphere: SceneAtmosphereInput;
  lightningRef: React.MutableRefObject<number>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uCloudDensity: { value: atmosphere.cloudCover / 100 },
      uStormFactor: { value: atmosphere.isStorm ? 1 : 0 },
      uDaylight: { value: atmosphere.daylight },
      uLightning: { value: 0 },
      uWind: { value: new THREE.Vector2(atmosphere.windSpeed / 50, 0.0) }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Resize'da uTime sıfırlanmadan sadece uResolution güncellenir
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += delta;
    u.uCloudDensity.value = THREE.MathUtils.lerp(
      u.uCloudDensity.value,
      atmosphere.cloudCover / 100,
      0.035
    );
    u.uStormFactor.value = THREE.MathUtils.lerp(
      u.uStormFactor.value,
      atmosphere.isStorm ? 1 : 0,
      0.04
    );
    u.uDaylight.value = THREE.MathUtils.lerp(
      u.uDaylight.value,
      atmosphere.daylight,
      0.04
    );
    const windRad = (atmosphere.windDirection * Math.PI) / 180;
    const windScale = Math.max(0.15, atmosphere.windSpeed / 45);
    u.uWind.value.x = THREE.MathUtils.lerp(
      u.uWind.value.x,
      Math.cos(windRad) * windScale,
      0.03
    );
    u.uWind.value.y = THREE.MathUtils.lerp(
      u.uWind.value.y,
      Math.sin(windRad) * windScale * 0.35,
      0.03
    );

    // Fırtına veya yüksek CAPE'de rastgele bulut içi şimşek parlaması
    const stormPower = atmosphere.isStorm
      ? 1
      : atmosphere.cape >= 1400
        ? 0.55
        : 0;
    if (stormPower > 0 && lightningRef.current <= 0.02 && Math.random() < delta * 0.32 * stormPower) {
      lightningRef.current = 0.75 + Math.random() * 0.25;
    }
    lightningRef.current = Math.max(0, lightningRef.current - delta * 3.8);
    u.uLightning.value = lightningRef.current;
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
          uniform float uCloudDensity;
          uniform float uStormFactor;
          uniform float uDaylight;
          uniform float uLightning;
          uniform vec2 uWind;

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
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.04;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / max(1.0, uResolution.y);
            vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

            // Gün döngüsü renk paleti (gece -> şafak/günbatımı -> gündüz -> fırtına)
            float sunsetBell = smoothstep(0.15, 0.55, uDaylight) * (1.0 - smoothstep(0.55, 0.9, uDaylight));

            vec3 nightTop = vec3(0.02, 0.04, 0.11);
            vec3 nightBot = vec3(0.05, 0.06, 0.16);
            vec3 dayTop = vec3(0.08, 0.24, 0.54);
            vec3 dayBot = vec3(0.24, 0.44, 0.68);
            vec3 sunsetHorizon = vec3(0.76, 0.34, 0.18);

            vec3 skyTop = mix(nightTop, dayTop, uDaylight);
            vec3 skyBot = mix(nightBot, dayBot, uDaylight);
            skyBot = mix(skyBot, sunsetHorizon, sunsetBell * 0.72 * (1.0 - uStormFactor * 0.7));

            // Fırtınada gökyüzü kurşun tonuna döner
            skyTop = mix(skyTop, vec3(0.03, 0.04, 0.09), uStormFactor * 0.75);
            skyBot = mix(skyBot, vec3(0.08, 0.09, 0.16), uStormFactor * 0.75);

            vec3 sky = mix(skyBot, skyTop, pow(uv.y, 0.85));

            // Gece yıldız alanı (bulutsuz ve geceyse parlar)
            float nightVis = (1.0 - smoothstep(0.1, 0.45, uDaylight)) * (1.0 - uCloudDensity * 0.85);
            if (nightVis > 0.01) {
              vec2 starGrid = floor(uv * vec2(220.0, 130.0));
              float rndStar = hash(starGrid);
              if (rndStar > 0.992) {
                float twinkle = 0.55 + 0.45 * sin(uTime * 2.5 + rndStar * 80.0);
                sky += vec3(0.8, 0.88, 1.0) * twinkle * nightVis * smoothstep(0.25, 0.75, uv.y);
              }
            }

            // Güneş / Ay diski + god-rays
            vec2 sunPos = vec2(0.22 * aspect, mix(-0.12, 0.32, uDaylight));
            float distSun = length(p - sunPos);
            float sunHalo = exp(-distSun * 3.4) * uDaylight * (1.0 - uStormFactor * 0.85);
            float sunDisc = smoothstep(0.075, 0.03, distSun) * uDaylight * (1.0 - uCloudDensity * 0.65);
            vec3 sunColor = mix(vec3(1.0, 0.55, 0.25), vec3(1.0, 0.92, 0.78), smoothstep(0.35, 0.85, uDaylight));
            sky += sunColor * (sunHalo * 0.42 + sunDisc * 0.85);

            // Volumetrik fBM bulutlar
            float t = uTime * 0.035;
            vec2 windOffset = uWind * t;
            float base = fbm(uv * vec2(2.8 * aspect, 2.8) + windOffset);
            float detail = fbm(uv * vec2(6.5 * aspect, 6.5) - windOffset * 1.45);
            float clouds = pow(mix(base, detail, 0.55), 1.35);

            float density = clamp(uCloudDensity * 1.25 + uStormFactor * 0.35, 0.0, 1.45);
            float alpha = clamp(clouds * density - 0.16, 0.0, 0.95);

            vec3 cloudShadow = mix(vec3(0.08, 0.1, 0.2), vec3(0.22, 0.28, 0.42), uDaylight);
            vec3 cloudLight = mix(vec3(0.55, 0.62, 0.82), vec3(0.98, 0.92, 0.88), uDaylight);
            cloudLight = mix(cloudLight, vec3(1.0, 0.68, 0.42), sunsetBell * 0.55);
            cloudLight = mix(cloudLight, vec3(0.45, 0.5, 0.64), uStormFactor * 0.6);

            vec3 cloudCol = mix(cloudShadow, cloudLight, smoothstep(0.18, 0.85, clouds));

            // Şimşek bulut içi aydınlanması
            float flashMask = smoothstep(0.32, 0.88, clouds) * uLightning;
            cloudCol += vec3(0.75, 0.85, 1.0) * flashMask * 1.6;

            vec3 finalCol = mix(sky, cloudCol, alpha);
            // Kısa ortam şimşek darbesi
            finalCol += vec3(0.22, 0.28, 0.42) * uLightning * 0.55;

            gl_FragColor = vec4(finalCol, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/**
 * Gerçek 3D Parçacık Sistemi (InstancedMesh): Yağmur, Kar ve Rüzgar Tozu
 */
function WeatherParticles3D({
  atmosphere
}: {
  atmosphere: SceneAtmosphereInput;
}) {
  const count = 420;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(() => {
    const arr = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      arr[i * 4 + 0] = (Math.random() - 0.5) * 12; // x
      arr[i * 4 + 1] = Math.random() * 8 - 2; // y
      arr[i * 4 + 2] = (Math.random() - 0.5) * 8 - 1; // z
      arr[i * 4 + 3] = 0.6 + Math.random() * 0.9; // speed multiplier
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const isRain = atmosphere.precipType === "rain";
    const isSnow = atmosphere.precipType === "snow";
    const isDust = !isRain && !isSnow && atmosphere.windSpeed >= 26;

    const visibleRatio = isRain
      ? Math.min(1, 0.35 + atmosphere.precipIntensity * 0.65)
      : isSnow
        ? Math.min(1, 0.45 + atmosphere.precipIntensity * 0.55)
        : isDust
          ? 0.28
          : 0;

    const activeCount = Math.floor(count * visibleRatio);
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
        seeds[idx + 1] -= delta * (9.5 + atmosphere.windSpeed * 0.08) * mult;
        seeds[idx + 0] += delta * windDriftX * 0.85;
      } else if (isSnow) {
        seeds[idx + 1] -= delta * 1.45 * mult;
        seeds[idx + 0] +=
          delta * (windDriftX * 0.45 + Math.sin(t * 1.6 + i) * 0.45);
      } else {
        // Rüzgar tozu / parçacık akışı
        seeds[idx + 0] += delta * (2.6 + Math.abs(windDriftX)) * mult;
        seeds[idx + 1] += Math.sin(t * 2 + i) * delta * 0.25;
      }

      // Sınır sarmalama
      if (seeds[idx + 1] < -2.5) seeds[idx + 1] = 5.5;
      if (seeds[idx + 1] > 6.0) seeds[idx + 1] = -2.0;
      if (seeds[idx + 0] > 6.5) seeds[idx + 0] = -6.5;
      if (seeds[idx + 0] < -6.5) seeds[idx + 0] = 6.5;

      dummy.position.set(seeds[idx + 0], seeds[idx + 1], seeds[idx + 2]);
      if (isRain) {
        dummy.rotation.set(0, 0, -Math.atan2(windDriftX * 0.14, 1));
        dummy.scale.set(0.012, 0.34, 0.012);
      } else if (isSnow) {
        dummy.rotation.set(t * 0.5 + i, t * 0.4, 0);
        const s = 0.036 * mult;
        dummy.scale.set(s, s, s);
      } else {
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(0.02, 0.02, 0.02);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  const color =
    atmosphere.precipType === "snow"
      ? "#f1f5ff"
      : atmosphere.precipType === "rain"
        ? "#93c5fd"
        : "#cbd5e1";

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={atmosphere.precipType === "snow" ? 0.82 : 0.48}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/**
 * Ekran üstü ince yağmur şeridi shader'ı — YALNIZCA yağış varken aktif!
 */
function ScreenRainOverlay({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uStormFactor: { value: atmosphere.isStorm ? 1 : 0 }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
    const targetIntensity =
      atmosphere.precipType === "rain"
        ? THREE.MathUtils.clamp(
            0.35 + atmosphere.precipIntensity * 0.65 + (atmosphere.isStorm ? 0.2 : 0),
            0,
            1
          )
        : 0;
    materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uIntensity.value,
      targetIntensity,
      0.05
    );
    materialRef.current.uniforms.uStormFactor.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uStormFactor.value,
      atmosphere.isStorm ? 1 : 0,
      0.05
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
        blending={THREE.AdditiveBlending}
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

          uniform float uTime;
          uniform float uIntensity;
          uniform float uStormFactor;

          float random(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            float intensity = uIntensity;
            if (intensity < 0.01) discard;

            vec2 uv = vUv;
            float slant = 0.07 + 0.14 * uStormFactor;
            vec2 ruv = vec2(uv.x + uv.y * slant, uv.y);
            float time = uTime * (1.25 + 0.9 * uStormFactor);
            float drops = 0.0;

            for (int layer = 0; layer < 2; layer++) {
              float fLayer = float(layer);
              float cols = mix(46.0, 82.0, fLayer);
              float speed = mix(2.2, 3.6, fLayer) * (0.85 + 0.65 * uStormFactor);
              vec2 grid = vec2(ruv.x * cols, ruv.y * mix(4.2, 7.2, fLayer) + time * speed);
              vec2 id = floor(grid);
              vec2 f = fract(grid);

              float rnd = random(id + fLayer * 19.3);
              float isDrop = step(1.0 - (0.16 + intensity * 0.38), rnd);
              float xPos = 0.2 + 0.6 * random(id + 4.1);
              float width = mix(0.05, 0.10, intensity) * mix(1.0, 0.65, fLayer);
              float streakX = smoothstep(width, 0.0, abs(f.x - xPos));
              float streakY = smoothstep(0.0, 0.22, f.y) * smoothstep(0.95, 0.25, f.y);
              drops += isDrop * streakX * streakY * mix(0.5, 0.32, fLayer);
            }

            float highlight = clamp(drops, 0.0, 1.0) * (0.32 + 0.32 * uStormFactor);
            vec3 col = vec3(0.72, 0.85, 1.0) * highlight;
            gl_FragColor = vec4(col, highlight * (0.42 + 0.35 * intensity));
          }
        `}
      />
    </mesh>
  );
}

/**
 * Zemin / Ufuk Yağmur Islaklığı & Kar Birikimi Katmanı (Time-Scrubbing fiziksel tepkisi)
 */
function HorizonGroundLayer({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWetness: { value: 0 },
      uSnow: { value: 0 },
      uDaylight: { value: atmosphere.daylight }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value += delta;
    const targetWet = THREE.MathUtils.clamp(
      atmosphere.rainAccum / 10 + (atmosphere.precipType === "rain" ? 0.35 : 0),
      0,
      1
    );
    const targetSnow = THREE.MathUtils.clamp(
      atmosphere.snowAccum / 8 + (atmosphere.precipType === "snow" ? 0.45 : 0),
      0,
      1
    );
    u.uWetness.value = THREE.MathUtils.lerp(u.uWetness.value, targetWet, 0.04);
    u.uSnow.value = THREE.MathUtils.lerp(u.uSnow.value, targetSnow, 0.04);
    u.uDaylight.value = THREE.MathUtils.lerp(u.uDaylight.value, atmosphere.daylight, 0.04);
  });

  return (
    <mesh position={[0, -1.65, -2.2]} rotation={[-Math.PI / 2.25, 0, 0]}>
      <planeGeometry args={[28, 12, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          precision highp float;
          varying vec2 vUv;
          uniform float uTime;
          uniform float uWetness;
          uniform float uSnow;
          uniform float uDaylight;

          void main() {
            float fade = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.12, vUv.y);
            float ripple = sin(vUv.x * 48.0 + uTime * 2.4) * cos(vUv.y * 28.0 - uTime * 1.9);
            float puddleSpec = smoothstep(0.25, 0.95, ripple * 0.5 + 0.5) * uWetness;

            vec3 baseGround = mix(vec3(0.03, 0.05, 0.12), vec3(0.07, 0.11, 0.2), uDaylight);
            vec3 wetColor = mix(baseGround, vec3(0.28, 0.42, 0.65), puddleSpec * 0.65);
            vec3 snowColor = mix(vec3(0.76, 0.84, 0.96), vec3(0.95, 0.97, 1.0), uDaylight);

            vec3 finalCol = mix(wetColor, snowColor, uSnow * 0.82);
            float alpha = fade * (0.28 + uWetness * 0.32 + uSnow * 0.45);
            gl_FragColor = vec4(finalCol, alpha);
          }
        `}
      />
    </mesh>
  );
}

/**
 * Hava Kalitesi & Sis Kenar Pusu (EdgeFog)
 */
function EdgeFog({ atmosphere }: { atmosphere: SceneAtmosphereInput }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHaze: { value: 0 }
    }),
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
    let target = 0;
    if (atmosphere.airQualityIndex >= 5) target = 0.85;
    else if (atmosphere.airQualityIndex >= 4) target = 0.58;
    else if (atmosphere.airQualityIndex >= 3) target = 0.32;

    materialRef.current.uniforms.uHaze.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uHaze.value,
      target,
      0.04
    );
  });

  return (
    <mesh frustumCulled={false} renderOrder={6}>
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
          uniform float uTime;
          uniform float uHaze;

          void main() {
            if (uHaze < 0.01) discard;
            vec2 d = abs(vUv - vec2(0.5));
            float edge = max(d.x, d.y);
            float fog = smoothstep(0.32, 0.82, edge);
            fog += sin(vUv.y * 28.0 + uTime * 0.5) * 0.025;
            float intensity = clamp(fog, 0.0, 1.0) * uHaze;
            vec3 col = mix(vec3(0.08, 0.1, 0.18), vec3(0.62, 0.68, 0.78), intensity);
            gl_FragColor = vec4(col, intensity * 0.62);
          }
        `}
      />
    </mesh>
  );
}

function StaticAtmosphereFallback({
  atmosphere
}: {
  atmosphere: SceneAtmosphereInput;
}) {
  const bgStyle = atmosphere.isStorm
    ? "from-[#060918] via-[#141a38] to-[#040611]"
    : atmosphere.precipType === "snow"
      ? "from-[#111c36] via-[#263b5e] to-[#091124]"
      : atmosphere.daylight > 0.65
        ? "from-[#0b244e] via-[#1c4b82] to-[#0a142d]"
        : "from-[#050816] via-[#131836] to-[#040712]";

  return (
    <div
      className={`fixed inset-0 z-0 bg-gradient-to-b ${bgStyle} transition-colors duration-700`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,_rgba(56,189,248,0.22),_transparent_52%),radial-gradient(circle_at_80%_75%,_rgba(255,138,60,0.16),_transparent_52%)]" />
    </div>
  );
}

export default function StormScene({
  atmosphere,
  performanceMode
}: StormSceneProps) {
  const [contextLost, setContextLost] = useState(false);
  const [autoLowPower, setAutoLowPower] = useState(false);
  const lightningRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
      if (!gl) {
        setAutoLowPower(true);
        return;
      }
    } catch {
      setAutoLowPower(true);
      return;
    }

    const nav = window.navigator as Navigator & { deviceMemory?: number };
    const veryWeakHardware =
      (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) ||
      (nav.deviceMemory && nav.deviceMemory <= 2);
    if (veryWeakHardware) setAutoLowPower(true);
  }, []);

  const useFallback =
    contextLost ||
    performanceMode === "low" ||
    (performanceMode === "auto" && autoLowPower);

  if (useFallback) {
    return <StaticAtmosphereFallback atmosphere={atmosphere} />;
  }

  const dpr: [number, number] =
    performanceMode === "high" ? [1, 2] : [1, 1.5];

  return (
    <WebGLErrorBoundary fallback={<StaticAtmosphereFallback atmosphere={atmosphere} />}>
      <div className="fixed inset-0 z-0">
        <Canvas
          dpr={dpr}
          className="h-full w-full"
          gl={{
            powerPreference: "high-performance",
            antialias: true
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
          <color attach="background" args={["#050816"]} />
          <ambientLight intensity={0.6} />

          <VolumetricSkyAndClouds
            atmosphere={atmosphere}
            lightningRef={lightningRef}
          />
          <HorizonGroundLayer atmosphere={atmosphere} />
          <WeatherParticles3D atmosphere={atmosphere} />
          <ScreenRainOverlay atmosphere={atmosphere} />
          <EdgeFog atmosphere={atmosphere} />
          <CameraRig atmosphere={atmosphere} />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}

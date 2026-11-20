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
        scrollTargetRef.current.x = (p - 0.5) * 0.65;
        scrollTargetRef.current.y = 0.65 - p * 0.35;
        scrollTargetRef.current.z = 3.1 + p * 0.4;
      }
    });
    return () => trigger.kill();
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const gale = THREE.MathUtils.clamp((atmosphere.windSpeed - 42) / 38, 0, 1);

    const shakeX =
      gale > 0.1
        ? (Math.sin(t * 21.3) * 0.5 + Math.cos(t * 34.7) * 0.5) * 0.032 * gale
        : 0;
    const shakeY =
      gale > 0.1
        ? (Math.cos(t * 17.9) * 0.5 + Math.sin(t * 38.1) * 0.5) * 0.024 * gale
        : 0;

    const targetX = scrollTargetRef.current.x + state.pointer.x * 0.12 + shakeX;
    const targetY = scrollTargetRef.current.y + state.pointer.y * 0.07 + shakeY;
    const targetZ = scrollTargetRef.current.z;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.07);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.07);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.07);
    camera.lookAt(0, 0.25, -2.5);
  });

  return null;
}

/**
 * Fiziksel Rayleigh / Mie gökyüzü saçılımı + gerçek bulut tabakası + gece yıldızları + şimşek.
 * Yapay neon/mor-pembe gradyan yok: tamamen gerçek güneş yükselme açısı ve bulut örtüsüyle çalışır.
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

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uCloudCover: { value: atmosphere.cloudCover / 100 },
      uSolarElev: { value: atmosphere.solarElevationDeg },
      uStorm: { value: atmosphere.isStorm ? 1 : 0 },
      uLightning: { value: 0 },
      uWind: { value: new THREE.Vector2(0.15, 0.0) }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  useFrame((_, delta) => {
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
    const windSpeedNorm = Math.max(0.08, atmosphere.windSpeed / 55);
    u.uWind.value.x = THREE.MathUtils.lerp(
      u.uWind.value.x,
      Math.cos(windRad) * windSpeedNorm,
      0.03
    );
    u.uWind.value.y = THREE.MathUtils.lerp(
      u.uWind.value.y,
      Math.sin(windRad) * windSpeedNorm * 0.25,
      0.03
    );

    // Yalnızca gerçek oraj/fırtına veya yüksek gerçek CAPE durumunda şimşek
    const stormTrigger = atmosphere.isStorm || atmosphere.cape >= 1500 ? 1 : 0;
    if (stormTrigger > 0 && lightningRef.current <= 0.02 && Math.random() < delta * 0.24) {
      lightningRef.current = 0.7 + Math.random() * 0.3;
    }
    lightningRef.current = Math.max(0, lightningRef.current - delta * 4.2);
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
          uniform float uCloudCover;
          uniform float uSolarElev;
          uniform float uStorm;
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
            mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
            for (int i = 0; i < 6; i++) {
              v += a * noise(p);
              p = rot * p * 2.02;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / max(1.0, uResolution.y);
            vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

            // Gerçek güneş yükselme açısına göre atmosfer fazları
            float dayFactor = smoothstep(-4.0, 22.0, uSolarElev);
            float goldenFactor = smoothstep(-8.0, 1.0, uSolarElev) * (1.0 - smoothstep(4.0, 18.0, uSolarElev));
            float nightFactor = 1.0 - smoothstep(-12.0, -2.0, uSolarElev);

            // Doğal fiziksel gökyüzü renkleri (çelik-slate, atmosferik mavi, doğal ufuk puslu altın)
            vec3 nightZenith = vec3(0.018, 0.028, 0.055);
            vec3 nightHorizon = vec3(0.045, 0.068, 0.115);

            vec3 dayZenith = vec3(0.07, 0.21, 0.42);
            vec3 dayHorizon = vec3(0.32, 0.49, 0.68);

            vec3 goldenZenith = vec3(0.08, 0.14, 0.26);
            vec3 goldenHorizon = vec3(0.64, 0.36, 0.20);

            vec3 zenith = mix(nightZenith, dayZenith, dayFactor);
            vec3 horizon = mix(nightHorizon, dayHorizon, dayFactor);
            zenith = mix(zenith, goldenZenith, goldenFactor * 0.65);
            horizon = mix(horizon, goldenHorizon, goldenFactor * 0.78 * (1.0 - uCloudCover * 0.55));

            // Kapalı / yağışlı havada gökyüzü gerçek çelik-gri stratüs tonuna döner
            float overcastDamp = clamp(uCloudCover * 0.65 + uStorm * 0.45, 0.0, 0.92);
            vec3 overcastZenith = mix(vec3(0.04, 0.055, 0.08), vec3(0.14, 0.18, 0.24), dayFactor);
            vec3 overcastHorizon = mix(vec3(0.075, 0.095, 0.13), vec3(0.24, 0.29, 0.35), dayFactor);

            zenith = mix(zenith, overcastZenith, overcastDamp);
            horizon = mix(horizon, overcastHorizon, overcastDamp);

            vec3 sky = mix(horizon, zenith, pow(clamp(uv.y, 0.0, 1.0), 0.72));

            // Gerçek yıldız alanı (yalnızca gece ve bulut örtüsü düşükken)
            float starVis = nightFactor * (1.0 - smoothstep(0.35, 0.88, uCloudCover));
            if (starVis > 0.02) {
              vec2 sg = floor(uv * vec2(260.0, 150.0));
              float rs = hash(sg);
              if (rs > 0.993) {
                float tw = 0.65 + 0.35 * sin(uTime * 1.8 + rs * 90.0);
                sky += vec3(0.84, 0.89, 0.98) * tw * starVis * smoothstep(0.22, 0.75, uv.y) * 0.85;
              }
            }

            // Güneş saçılımı (gerçek güneş yükselme açısına göre konumlanır)
            if (uSolarElev > -5.0) {
              float sunY = clamp((uSolarElev / 55.0) * 0.46 - 0.06, -0.14, 0.36);
              vec2 sunPos = vec2(0.24 * aspect, sunY);
              float dSun = length(p - sunPos);
              float clearness = 1.0 - overcastDamp * 0.85;
              float mieHalo = exp(-dSun * 3.8) * clearness * smoothstep(-5.0, 6.0, uSolarElev);
              float sunDisc = smoothstep(0.045, 0.02, dSun) * clearness * smoothstep(0.0, 8.0, uSolarElev);
              vec3 sunCol = mix(vec3(0.95, 0.56, 0.30), vec3(1.0, 0.96, 0.88), dayFactor);
              sky += sunCol * (mieHalo * 0.34 + sunDisc * 0.75);
            }

            // Gerçekçi çok katmanlı stratüs / kümülüs bulut örtüsü
            float t = uTime * 0.025;
            vec2 flow = uWind * t;
            vec2 cloudUv = vec2(uv.x * aspect * 1.6, uv.y * 2.1);
            float warp = fbm(cloudUv * 1.1 + flow * 0.6);
            float n1 = fbm(cloudUv * 1.9 + flow + warp * 0.35);
            float n2 = fbm(cloudUv * 4.2 - flow * 1.25);
            float cloudField = mix(n1, n2, 0.42);

            float coverage = smoothstep(1.02 - uCloudCover * 0.95, 1.08 - uCloudCover * 0.28, cloudField);
            float horizonFade = smoothstep(0.0, 0.24, uv.y);
            float cloudAlpha = clamp(coverage * (0.28 + uCloudCover * 0.66) * horizonFade, 0.0, 0.92);

            vec3 cDark = mix(vec3(0.045, 0.06, 0.095), vec3(0.18, 0.22, 0.29), dayFactor);
            vec3 cLit = mix(vec3(0.15, 0.20, 0.28), vec3(0.76, 0.81, 0.87), dayFactor);
            cLit = mix(cLit, vec3(0.84, 0.60, 0.42), goldenFactor * 0.55);
            cLit = mix(cLit, vec3(0.24, 0.28, 0.34), uStorm * 0.65);

            vec3 cloudCol = mix(cDark, cLit, smoothstep(0.25, 0.82, n1));

            // Gerçek fırtına bulut içi şimşek aydınlanması
            float boltMask = smoothstep(0.42, 0.86, cloudField) * uLightning;
            cloudCol += vec3(0.82, 0.90, 1.0) * boltMask * 1.4;

            vec3 finalCol = mix(sky, cloudCol, cloudAlpha);
            finalCol += vec3(0.18, 0.22, 0.30) * uLightning * 0.42;

            // Metin okunabilirliği için çok ince doğal üst/alt vinyet
            float vignette = smoothstep(1.15, 0.25, length(uv - 0.5));
            finalCol *= mix(0.72, 1.0, vignette);

            gl_FragColor = vec4(finalCol, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/**
 * Gerçek 3D Parçacıklar — yalnızca gerçek yağmur veya kar yağışında çalışır.
 */
function RealPrecipitationParticles({
  atmosphere
}: {
  atmosphere: SceneAtmosphereInput;
}) {
  const count = 360;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(() => {
    const arr = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      arr[i * 4 + 0] = (Math.random() - 0.5) * 14;
      arr[i * 4 + 1] = Math.random() * 9 - 2.5;
      // Kamera lensinin (z=3.1) çok önüne çıkmaması için derinlik -9.5 .. +0.6 aralığında
      arr[i * 4 + 2] = -9.5 + Math.random() * 10.1;
      arr[i * 4 + 3] = 0.7 + Math.random() * 0.75;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const isRain = atmosphere.precipType === "rain";
    const isSnow = atmosphere.precipType === "snow";
    const activeCount =
      isRain || isSnow
        ? Math.floor(count * Math.min(1, 0.35 + atmosphere.precipIntensity * 0.65))
        : 0;

    const windRad = (atmosphere.windDirection * Math.PI) / 180;
    const windDriftX = Math.sin(windRad) * (atmosphere.windSpeed / 18);
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
        seeds[idx + 1] -= delta * (10.0 + atmosphere.windSpeed * 0.08) * mult;
        seeds[idx + 0] += delta * windDriftX * 0.8;
      } else {
        seeds[idx + 1] -= delta * 1.35 * mult;
        seeds[idx + 0] +=
          delta * (windDriftX * 0.4 + Math.sin(t * 1.4 + i) * 0.35);
      }

      if (seeds[idx + 1] < -2.5) seeds[idx + 1] = 5.5;
      if (seeds[idx + 0] > 6.5) seeds[idx + 0] = -6.5;
      if (seeds[idx + 0] < -6.5) seeds[idx + 0] = 6.5;

      dummy.position.set(seeds[idx + 0], seeds[idx + 1], seeds[idx + 2]);
      if (isRain) {
        dummy.rotation.set(0, 0, -Math.atan2(windDriftX * 0.14, 1));
        dummy.scale.set(0.0055, 0.36, 0.0055);
      } else {
        dummy.rotation.set(t * 0.4 + i, t * 0.3, 0);
        const s = 0.028 * mult;
        dummy.scale.set(s, s, s);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={atmosphere.precipType === "snow" ? "#e2e8f0" : "#b8cae0"}
        transparent
        opacity={atmosphere.precipType === "snow" ? 0.75 : 0.32}
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
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) {
        setWebglUnsupported(true);
      }
    } catch {
      setWebglUnsupported(true);
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

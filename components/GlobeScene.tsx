/* eslint-disable react/no-unknown-property */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { computeSubsolarPoint } from "@/lib/weather";
import type { GeoLocation } from "@/lib/weather-types";

const GLOBE_RADIUS = 1.68;

type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

type GeoJsonLand = {
  type: "FeatureCollection";
  features: Array<{ geometry: GeoJsonGeometry }>;
};

let cachedLandPromise: Promise<GeoJsonLand | null> | null = null;

function loadNaturalEarthLand(): Promise<GeoJsonLand | null> {
  if (!cachedLandPromise) {
    cachedLandPromise = fetch("/geo/ne-110m-land.json")
      .then((res) => (res.ok ? (res.json() as Promise<GeoJsonLand>) : null))
      .catch(() => null);
  }
  return cachedLandPromise;
}

export function latLonToVector3(
  lat: number,
  lon: number,
  radius = GLOBE_RADIUS
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function vector3ToLatLon(vec: THREE.Vector3): { lat: number; lon: number } {
  const n = vec.clone().normalize();
  const lat = 90 - Math.acos(THREE.MathUtils.clamp(n.y, -1, 1)) * (180 / Math.PI);
  const lon = (((Math.atan2(n.z, -n.x) * 180) / Math.PI + 360) % 360) - 180;
  return {
    lat: Number(lat.toFixed(3)),
    lon: Number(lon.toFixed(3))
  };
}

function drawLandPolygons(
  ctx: CanvasRenderingContext2D,
  land: GeoJsonLand,
  width: number,
  height: number,
  fillStyle: string,
  strokeStyle: string,
  lineWidth: number
) {
  const traceRing = (ring: number[][]) => {
    ring.forEach(([lon, lat], idx) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  };

  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";

  for (const feature of land.features) {
    const geom = feature.geometry;
    if (!geom) continue;
    ctx.beginPath();
    if (geom.type === "Polygon") {
      for (const ring of geom.coordinates) traceRing(ring);
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        for (const ring of poly) traceRing(ring);
      }
    }
    ctx.fill();
    ctx.stroke();
  }
}

const MAJOR_URBAN_LIGHTS: Array<[number, number, number]> = [
  [28.98, 41.01, 12],
  [29.06, 40.19, 7],
  [32.86, 39.93, 9],
  [27.14, 38.42, 8],
  [30.71, 36.9, 6],
  [-0.13, 51.51, 12],
  [2.35, 48.86, 12],
  [13.4, 52.52, 10],
  [9.19, 45.46, 10],
  [-3.7, 40.42, 9],
  [37.62, 55.75, 12],
  [31.24, 30.04, 12],
  [46.67, 24.71, 9],
  [55.27, 25.2, 10],
  [77.21, 28.61, 14],
  [72.88, 19.08, 12],
  [121.47, 31.23, 14],
  [116.4, 39.9, 13],
  [114.17, 22.32, 12],
  [126.98, 37.57, 12],
  [139.69, 35.69, 14],
  [103.82, 1.35, 9],
  [151.21, -33.87, 10],
  [-74.01, 40.71, 14],
  [-87.63, 41.88, 11],
  [-118.24, 34.05, 13],
  [-99.13, 19.43, 11],
  [-46.63, -23.55, 12],
  [-58.38, -34.6, 10],
  [28.05, -26.2, 9],
  [3.38, 6.52, 9]
];

function createEarthTextures(land: GeoJsonLand | null): {
  dayMap: THREE.CanvasTexture;
  nightMap: THREE.CanvasTexture;
} {
  const width = 2048;
  const height = 1024;

  // --- GÜNDÜZ DOKUSU ---
  const dayCanvas = document.createElement("canvas");
  dayCanvas.width = width;
  dayCanvas.height = height;
  const dCtx = dayCanvas.getContext("2d")!;

  const dayOcean = dCtx.createLinearGradient(0, 0, 0, height);
  dayOcean.addColorStop(0, "#0b1e36");
  dayOcean.addColorStop(0.2, "#0d2645");
  dayOcean.addColorStop(0.5, "#0f2d52");
  dayOcean.addColorStop(0.8, "#0d2645");
  dayOcean.addColorStop(1, "#0b1e36");
  dCtx.fillStyle = dayOcean;
  dCtx.fillRect(0, 0, width, height);

  dCtx.strokeStyle = "rgba(148, 197, 232, 0.10)";
  dCtx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    dCtx.beginPath();
    dCtx.moveTo(x, 0);
    dCtx.lineTo(x, height);
    dCtx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height;
    dCtx.beginPath();
    dCtx.moveTo(0, y);
    dCtx.lineTo(width, y);
    dCtx.stroke();
  }

  dCtx.strokeStyle = "rgba(148, 197, 232, 0.22)";
  dCtx.beginPath();
  dCtx.moveTo(0, height / 2);
  dCtx.lineTo(width, height / 2);
  dCtx.stroke();

  if (land) {
    drawLandPolygons(
      dCtx,
      land,
      width,
      height,
      "#29465c",
      "rgba(186, 228, 252, 0.72)",
      1.6
    );
  }

  // --- GECE DOKUSU (Yüksek okunurluklu gece kara & kıyı hatları + şehir ışıkları) ---
  const nightCanvas = document.createElement("canvas");
  nightCanvas.width = width;
  nightCanvas.height = height;
  const nCtx = nightCanvas.getContext("2d")!;

  nCtx.fillStyle = "#060c18";
  nCtx.fillRect(0, 0, width, height);

  nCtx.strokeStyle = "rgba(120, 160, 200, 0.08)";
  nCtx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    nCtx.beginPath();
    nCtx.moveTo(x, 0);
    nCtx.lineTo(x, height);
    nCtx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * height;
    nCtx.beginPath();
    nCtx.moveTo(0, y);
    nCtx.lineTo(width, y);
    nCtx.stroke();
  }

  if (land) {
    drawLandPolygons(
      nCtx,
      land,
      width,
      height,
      "#15243b",
      "rgba(130, 186, 234, 0.52)",
      1.5
    );
  }

  for (const [lon, lat, r] of MAJOR_URBAN_LIGHTS) {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    const g = nCtx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(254, 230, 168, 0.96)");
    g.addColorStop(0.42, "rgba(245, 178, 86, 0.38)");
    g.addColorStop(1, "rgba(245, 178, 86, 0)");
    nCtx.fillStyle = g;
    nCtx.beginPath();
    nCtx.arc(x, y, r, 0, Math.PI * 2);
    nCtx.fill();
  }

  const dayMap = new THREE.CanvasTexture(dayCanvas);
  dayMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.anisotropy = 4;
  dayMap.needsUpdate = true;

  const nightMap = new THREE.CanvasTexture(nightCanvas);
  nightMap.colorSpace = THREE.SRGBColorSpace;
  nightMap.anisotropy = 4;
  nightMap.needsUpdate = true;

  return { dayMap, nightMap };
}

/**
 * Seçili şehir/koordinat değiştiğinde küre kamerasını yumuşakça o noktaya çevirir;
 * kullanıcı sürüklediğinde otomatik odaklanmayı anında bırakır.
 */
function CameraFocusController({
  selectedLat,
  selectedLon
}: {
  selectedLat: number;
  selectedLon: number;
}) {
  const { camera } = useThree();
  const targetDirRef = useRef<THREE.Vector3 | null>(null);
  const userDraggingRef = useRef(false);
  const lastCoordsRef = useRef<string>("");

  useEffect(() => {
    const key = `${selectedLat.toFixed(2)},${selectedLon.toFixed(2)}`;
    if (lastCoordsRef.current && lastCoordsRef.current !== key) {
      targetDirRef.current = latLonToVector3(selectedLat, selectedLon, 1).normalize();
      userDraggingRef.current = false;
    }
    lastCoordsRef.current = key;
  }, [selectedLat, selectedLon]);

  useFrame((_, delta) => {
    if (!targetDirRef.current || userDraggingRef.current) return;
    const dist = camera.position.length();
    const desiredPos = targetDirRef.current.clone().multiplyScalar(dist);
    camera.position.lerp(desiredPos, Math.min(1, delta * 4.5));
    camera.position.normalize().multiplyScalar(dist);
    camera.lookAt(0, 0, 0);

    if (camera.position.distanceTo(desiredPos) < 0.03) {
      targetDirRef.current = null;
    }
  });

  return (
    <OrbitControls
      enablePan={false}
      minDistance={2.45}
      maxDistance={6.8}
      rotateSpeed={0.62}
      enableDamping
      dampingFactor={0.07}
      onStart={() => {
        userDraggingRef.current = true;
        targetDirRef.current = null;
      }}
    />
  );
}

function EarthMesh({
  selectedLat,
  selectedLon,
  presetCities,
  sunDir,
  onPickCoords,
  onPickCity
}: {
  selectedLat: number;
  selectedLon: number;
  presetCities: GeoLocation[];
  sunDir: THREE.Vector3;
  onPickCoords: (lat: number, lon: number) => void;
  onPickCity: (city: GeoLocation) => void;
}) {
  const [land, setLand] = useState<GeoJsonLand | null>(null);

  useEffect(() => {
    let active = true;
    void loadNaturalEarthLand().then((data) => {
      if (active && data) setLand(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const textures = useMemo(() => createEarthTextures(land), [land]);

  useEffect(() => {
    return () => {
      textures.dayMap.dispose();
      textures.nightMap.dispose();
    };
  }, [textures]);

  const earthUniforms = useMemo(
    () => ({
      uDayMap: { value: textures.dayMap },
      uNightMap: { value: textures.nightMap },
      uSunDir: { value: sunDir.clone() }
    }),
    [textures, sunDir]
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uSunDir: { value: sunDir.clone() }
    }),
    [sunDir]
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { lat, lon } = vector3ToLatLon(e.point);
    onPickCoords(lat, lon);
  };

  const selectedPos = useMemo(
    () => latLonToVector3(selectedLat, selectedLon, GLOBE_RADIUS + 0.032),
    [selectedLat, selectedLon]
  );

  return (
    <group>
      {/* Gerçek Natural Earth Kıyıları + Gerçek Zamanlı Gece-Gündüz Terminatörü */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[GLOBE_RADIUS, 72, 72]} />
        <shaderMaterial
          key={land ? "earth-ne110m" : "earth-base"}
          uniforms={earthUniforms}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            varying vec3 vWorldNormal;
            void main() {
              vUv = uv;
              vWorldNormal = normalize(mat3(modelMatrix) * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            precision highp float;
            uniform sampler2D uDayMap;
            uniform sampler2D uNightMap;
            uniform vec3 uSunDir;
            varying vec2 vUv;
            varying vec3 vWorldNormal;

            void main() {
              vec3 n = normalize(vWorldNormal);
              float ndl = dot(n, normalize(uSunDir));

              float dayFactor = smoothstep(-0.14, 0.14, ndl);
              float diffuse = 0.56 + 0.54 * max(ndl, 0.0);

              vec3 dayCol = texture2D(uDayMap, vUv).rgb * diffuse;
              vec3 nightCol = texture2D(uNightMap, vUv).rgb;

              // Gerçek alacakaranlık kuşağı
              float twilight = exp(-pow(ndl * 7.5, 2.0)) * 0.24;
              vec3 col = mix(nightCol, dayCol, dayFactor) + vec3(0.92, 0.50, 0.24) * twilight;

              gl_FragColor = vec4(col, 1.0);
            }
          `}
        />
      </mesh>

      {/* İnce Rayleigh Atmosfer Limbi */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.04, 64, 64]} />
        <shaderMaterial
          uniforms={atmosphereUniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          vertexShader={/* glsl */ `
            varying vec3 vNormalView;
            varying vec3 vWorldNormal;
            varying vec3 vViewPos;
            void main() {
              vNormalView = normalize(normalMatrix * normal);
              vWorldNormal = normalize(mat3(modelMatrix) * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vViewPos = -mv.xyz;
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            precision highp float;
            uniform vec3 uSunDir;
            varying vec3 vNormalView;
            varying vec3 vWorldNormal;
            varying vec3 vViewPos;

            void main() {
              float fresnel = pow(1.0 - max(dot(normalize(vNormalView), normalize(vViewPos)), 0.0), 3.4);
              float dayLit = smoothstep(-0.25, 0.45, dot(normalize(vWorldNormal), normalize(uSunDir)));
              vec3 col = mix(vec3(0.20, 0.34, 0.54), vec3(0.38, 0.72, 0.98), dayLit);
              gl_FragColor = vec4(col, fresnel * (0.35 + 0.42 * dayLit));
            }
          `}
        />
      </mesh>

      {/* Küresel İstasyon Pinleri */}
      {presetCities.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, GLOBE_RADIUS + 0.022);
        return (
          <mesh
            key={city.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              onPickCity(city);
            }}
          >
            <sphereGeometry args={[0.024, 14, 14]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        );
      })}

      {/* Aktif Seçili Konum İşaretçisi */}
      <mesh position={selectedPos}>
        <sphereGeometry args={[0.042, 18, 18]} />
        <meshBasicMaterial color="#f3f6fb" />
      </mesh>
    </group>
  );
}

export default function GlobeScene({
  selectedLat,
  selectedLon,
  presetCities,
  onPickCoords,
  onPickCity
}: {
  selectedLat: number;
  selectedLon: number;
  presetCities: GeoLocation[];
  onPickCoords: (lat: number, lon: number) => void;
  onPickCity: (city: GeoLocation) => void;
}) {
  const [subsolar, setSubsolar] = useState(() => computeSubsolarPoint(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setSubsolar(computeSubsolarPoint(new Date()));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const sunDir = useMemo(
    () => latLonToVector3(subsolar.lat, subsolar.lon, 1).normalize(),
    [subsolar]
  );

  // İlk kamera açısı seçili konuma (varsayılan Türkiye / Avrupa) dönük
  const initialCam = useMemo(() => {
    const v = latLonToVector3(selectedLat, selectedLon, 4.45);
    return [v.x, v.y, v.z] as [number, number, number];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full bg-[#05080f]">
      <Canvas
        dpr={[1, 1.75]}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <PerspectiveCamera makeDefault position={initialCam} fov={40} />
        <EarthMesh
          selectedLat={selectedLat}
          selectedLon={selectedLon}
          presetCities={presetCities}
          sunDir={sunDir}
          onPickCoords={onPickCoords}
          onPickCity={onPickCity}
        />
        <CameraFocusController
          selectedLat={selectedLat}
          selectedLon={selectedLon}
        />
      </Canvas>

      {/* Üst Sol: Gerçek Güneş Altı Noktası */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/10 bg-obsidian-950/85 px-2.5 py-1.5 font-mono text-[11px] text-ink-secondary backdrop-blur-md tabular">
        <span className="font-semibold text-ink-primary">GERÇEK GECE-GÜNDÜZ SINIRI</span>
        <span className="mx-1.5 text-ink-muted">·</span>
        <span>
          Güneş Altı: {subsolar.lat.toFixed(1)}°, {subsolar.lon.toFixed(1)}°
        </span>
      </div>

      {/* Alt İpucu */}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/10 bg-obsidian-950/85 px-2.5 py-1.5 text-[11px] text-ink-muted backdrop-blur-md">
        Sürükle: Döndür · Tekerlek: Yakınlaştır · Tıkla: Koordinat Ölç · Natural Earth 110m
      </div>
    </div>
  );
}

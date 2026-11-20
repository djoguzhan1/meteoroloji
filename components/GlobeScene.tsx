/* eslint-disable react/no-unknown-property */
"use client";

import { useMemo, useRef } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { GeoLocation } from "@/lib/weather-types";

const GLOBE_RADIUS = 1.65;

export function latLonToVector3(lat: number, lon: number, radius = GLOBE_RADIUS): THREE.Vector3 {
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
  const lon = ((Math.atan2(n.z, -n.x) * 180) / Math.PI + 540) % 360 - 180;
  return {
    lat: Number(lat.toFixed(3)),
    lon: Number(lon.toFixed(3))
  };
}

/**
 * Harici kırılabilir görsel URL'sine bağlı kalmadan prosedürel yüksek çözünürlüklü
 * kıta silüetleri + enlem/boylam ızgarası + şehir gece ışıkları dokusu üretir.
 */
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Derin gece okyanus gradyanı
  const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, "#0c1b3b");
  ocean.addColorStop(0.5, "#07142e");
  ocean.addColorStop(1, "#0b1a38");
  ctx.fillStyle = ocean;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Enlem-boylam teknik ızgara
  ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Stilize kıta poligonları (lon, lat)
  const drawContinent = (coords: Array<[number, number]>) => {
    ctx.beginPath();
    coords.forEach(([lon, lat], idx) => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "#162d4c";
    ctx.fill();
    ctx.strokeStyle = "rgba(125, 211, 252, 0.42)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  };

  // Avrupa + Anadolu + Asya
  drawContinent([
    [-10, 36], [-9, 43], [2, 51], [10, 56], [28, 70], [65, 72], [115, 73],
    [168, 65], [142, 46], [130, 35], [120, 22], [104, 1], [95, 16], [77, 8],
    [66, 25], [48, 30], [36, 36], [26, 39], [20, 38], [12, 42], [4, 43]
  ]);
  // Afrika
  drawContinent([
    [-17, 15], [-6, 36], [10, 37], [32, 31], [43, 12], [51, 11], [40, -10],
    [32, -26], [20, -35], [12, -16], [9, 4], [-8, 5]
  ]);
  // Kuzey Amerika
  drawContinent([
    [-165, 65], [-135, 69], [-95, 70], [-60, 52], [-75, 35], [-81, 25],
    [-97, 20], [-84, 9], [-105, 19], [-125, 42], [-148, 60]
  ]);
  // Güney Amerika
  drawContinent([
    [-80, 10], [-62, 10], [-35, -6], [-40, -22], [-58, -38], [-68, -54],
    [-75, -45], [-71, -18], [-81, -4]
  ]);
  // Avustralya
  drawContinent([
    [114, -22], [130, -12], [142, -11], [153, -28], [146, -38], [130, -32], [115, -34]
  ]);
  // Grönland
  drawContinent([
    [-52, 60], [-42, 65], [-20, 72], [-30, 82], [-58, 78], [-55, 68]
  ]);

  // Büyük metropol gece ışıkları
  const lights: Array<[number, number]> = [
    [29, 41], [29, 40.2], [32.8, 39.9], [27.1, 38.4], [0, 51.5], [2.3, 48.8],
    [13.4, 52.5], [37.6, 55.7], [31.2, 30.0], [139.6, 35.6], [121.4, 31.2],
    [77.2, 28.6], [-74, 40.7], [-118.2, 34.0], [-46.6, -23.5], [151.2, -33.8]
  ];
  for (const [lon, lat] of lights) {
    const x = ((lon + 180) / 360) * canvas.width;
    const y = ((90 - lat) / 180) * canvas.height;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
    g.addColorStop(0, "rgba(255, 190, 110, 0.95)");
    g.addColorStop(0.4, "rgba(255, 138, 60, 0.45)");
    g.addColorStop(1, "rgba(255, 138, 60, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function JetStreamParticles() {
  const count = 320;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      lat: (Math.random() - 0.5) * 140,
      lon: Math.random() * 360 - 180,
      speed: 8 + Math.random() * 14,
      alt: GLOBE_RADIUS + 0.08 + Math.random() * 0.12
    }));
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.lon += delta * p.speed;
      if (p.lon > 180) p.lon -= 360;
      const pos = latLonToVector3(p.lat, p.lon, p.alt);
      dummy.position.copy(pos);
      dummy.lookAt(0, 0, 0);
      dummy.scale.set(0.012, 0.012, 0.045);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#7dd3fc" transparent opacity={0.62} />
    </instancedMesh>
  );
}

function EarthMesh({
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
  const cloudsRef = useRef<THREE.Mesh>(null);
  const earthTexture = useMemo(() => createProceduralEarthTexture(), []);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.025;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const { lat, lon } = vector3ToLatLon(e.point);
    onPickCoords(lat, lon);
  };

  const selectedPos = useMemo(
    () => latLonToVector3(selectedLat, selectedLon, GLOBE_RADIUS + 0.04),
    [selectedLat, selectedLon]
  );

  return (
    <group>
      {/* Ana Dünya Küresi */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.72}
          metalness={0.18}
        />
      </mesh>

      {/* İnce Bulut / Atmosfer Fresnel Kabuğu */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.035, 48, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          vertexShader={/* glsl */ `
            varying vec3 vNormal;
            varying vec3 vViewPos;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vViewPos = -mv.xyz;
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            precision highp float;
            varying vec3 vNormal;
            varying vec3 vViewPos;
            void main() {
              float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPos)), 0.0), 3.0);
              vec3 col = mix(vec3(0.22, 0.74, 0.98), vec3(1.0, 0.54, 0.24), fresnel * 0.35);
              gl_FragColor = vec4(col, fresnel * 0.72);
            }
          `}
        />
      </mesh>

      {/* Rüzgar Akımı / Jet Stream Parçacıkları */}
      <JetStreamParticles />

      {/* Hazır Küresel Şehir Pinleri */}
      {presetCities.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, GLOBE_RADIUS + 0.03);
        return (
          <mesh
            key={city.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              onPickCity(city);
            }}
          >
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        );
      })}

      {/* Aktif Seçili Konum Pini */}
      <mesh position={selectedPos}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshBasicMaterial color="#ff8a3c" />
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
  return (
    <Canvas
      dpr={[1, 1.75]}
      className="h-full w-full cursor-grab active:cursor-grabbing"
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <PerspectiveCamera makeDefault position={[0.4, 1.3, 4.4]} fov={42} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 4, 5]} intensity={1.45} color="#e0f2fe" />
      <directionalLight position={[-4, -2, -4]} intensity={0.45} color="#ff8a3c" />

      <EarthMesh
        selectedLat={selectedLat}
        selectedLon={selectedLon}
        presetCities={presetCities}
        onPickCoords={onPickCoords}
        onPickCity={onPickCity}
      />

      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={7.0}
        rotateSpeed={0.65}
        enableDamping
        dampingFactor={0.07}
      />
    </Canvas>
  );
}

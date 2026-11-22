"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CloudLightning, Play, Sparkles, Wind } from "lucide-react";
import { CUMULUS_STAGES, FACTION_META } from "@/lib/cumulus-engine";

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * IMAX-KALİTE 3D VOLÜMETRİK RAYMARCHED SÜPER HÜCRE & FIRTINA OKYANUSU SHADER'I
 * - Derin altın-alacakaranlık gökyüzü + yüksek kontrastlı koyu fırtına okyanusu
 * - Devasa, yoğun, dönen 3D Süper Hücre mezosiklon kulesi + geniş örs (incus) şapkası
 * - Güçlü Beer-Lambert 3D öz-gölgeleme + altın-gümüş güneş kenarı + iç elektrik çekirdeği
 * - 3D çatallı yıldırımla senkronize bulut içi volümetrik şimşek aydınlanması
 */
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uCamForward;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform float uTanHalfFov;
  uniform vec3 uLightningPos;
  uniform vec3 uLightningColor;
  uniform float uLightningFlash;
  uniform float uDive;
  uniform float uWindSpeed;

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash13(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash13(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);

    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.54;
    for (int i = 0; i < 4; i++) {
      v += a * noise3D(p);
      p = p * 2.04 + vec3(13.7, -9.2, 5.4);
      a *= 0.48;
    }
    return v;
  }

  float fbm3Fast(vec3 p) {
    float v = 0.58 * noise3D(p);
    p = p * 2.08 + vec3(11.3, -7.1, 4.2);
    v += 0.29 * noise3D(p);
    p = p * 2.05 + vec3(-5.2, 8.7, -3.1);
    v += 0.13 * noise3D(p);
    return v;
  }

  float ign(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }

  // 3D Yoğunluk Alanı: Dev dönen Süper Hücre + örs şapkası + yan bulut duvarları
  float sampleClouds(vec3 p, bool highDetail) {
    float t = uTime * (0.26 + uWindSpeed * 0.004);

    // 1. DEVASA SÜPER HÜCRE (merkezde (0, 0.85, -10.4))
    vec3 sc = p - vec3(0.0, 0.85, -10.4);
    float rXZ = length(sc.xz);

    // Gerçek dönen mezosiklon girdap bükümü
    float swirl = -uTime * 0.38 + rXZ * 0.24 - sc.y * 0.34;
    float cs = cos(swirl);
    float sn = sin(swirl);
    vec3 scRot = vec3(
      cs * sc.x - sn * sc.z,
      sc.y,
      sn * sc.x + cs * sc.z
    );

    // Gövde + üstte dramatik genişleyen Kümülonimbus örs şapkası (Incus!)
    float wallBase = 2.6 + smoothstep(-2.0, -0.5, sc.y) * 1.1;
    float anvilCap = smoothstep(0.65, 2.35, sc.y) * 5.2;
    float topTaper = smoothstep(2.65, 4.0, sc.y) * 3.1;
    float scRadius = max(0.8, wallBase + anvilCap - topTaper);

    float towerRadial = 1.0 - smoothstep(scRadius * 0.42, scRadius, rXZ);
    float towerVert =
      smoothstep(-2.45, -1.1, sc.y) * (1.0 - smoothstep(2.6, 4.05, sc.y));
    float supercellMask = towerRadial * towerVert;

    // 2. SAĞ VE SOL ÖN PLAN KABARAN KÜMÜLÜS KULELERİ (sinematik 3D derinlik koridoru!)
    vec3 leftC = p - vec3(-6.4, -0.5, -5.8);
    float leftMask =
      (1.0 - smoothstep(1.8, 4.8, length(leftC * vec3(0.85, 1.2, 0.85)))) *
      smoothstep(-2.6, -1.3, p.y);

    vec3 rightC = p - vec3(6.6, -0.35, -6.4);
    float rightMask =
      (1.0 - smoothstep(1.8, 4.9, length(rightC * vec3(0.85, 1.2, 0.85)))) *
      smoothstep(-2.6, -1.3, p.y);

    // 3. UZAKTA ALÇAK BULUT DENİZİ
    float deckVert = smoothstep(-2.7, -1.75, p.y) * (1.0 - smoothstep(-0.7, 0.35, p.y));
    float deckCorridor = smoothstep(2.4, 7.8, abs(p.x));
    float deckDist = 1.0 - smoothstep(18.0, 32.0, length(p.xz - vec2(0.0, -9.0)));
    float deckMask = deckVert * deckCorridor * deckDist * 0.82;

    float baseMask = max(max(supercellMask * 1.28, max(leftMask, rightMask) * 1.05), deckMask);
    if (baseMask < 0.03) return 0.0;

    vec3 noisePos = mix(
      p * 0.44 + vec3(t * 0.42, -t * 0.08, t * 0.25),
      scRot * 0.64 + vec3(0.0, -t * 0.34, 0.0),
      clamp(supercellMask * 1.35, 0.0, 1.0)
    );

    float n = highDetail ? fbm3(noisePos) : fbm3Fast(noisePos);
    // Keskin, kabarık karnabahar bulut dokusu ve 3D kıvrım derinliği!
    float billow = smoothstep(0.32, 0.72, n * 0.88 + baseMask * 0.55);
    return billow * baseMask * 2.45;
  }

  // Dramatik Alacakaranlık & Altın Saat Fırtına Gökyüzü
  vec3 renderSky(vec3 rd, vec3 sunDir) {
    float up = clamp(rd.y, 0.0, 1.0);
    vec3 zenith = vec3(0.008, 0.022, 0.068);
    vec3 midSky = vec3(0.025, 0.072, 0.175);
    vec3 horizonCool = vec3(0.075, 0.165, 0.31);
    vec3 horizonAmber = vec3(0.95, 0.42, 0.14);

    float sunDot = max(dot(rd, sunDir), 0.0);
    float horizonBand = pow(1.0 - up, 5.2);

    vec3 sky = mix(midSky, zenith, pow(up, 0.6));
    sky = mix(sky, horizonCool, horizonBand * 0.9);
    // Sadece ufuk ve güneş civarında sıcak bakır-altın ışık (ekranı beyazlatmaz!)
    sky += horizonAmber * pow(sunDot, 4.5) * (0.16 + horizonBand * 0.95);

    // Keskin altın güneş diski + kontrollü hale
    sky += vec3(1.0, 0.76, 0.42) * pow(sunDot, 48.0) * 0.95;
    sky += vec3(1.0, 0.94, 0.78) * smoothstep(0.9982, 0.9995, sunDot) * 2.8;

    // İnce dramatik güneş ışınları (god rays)
    float rayAngle = atan(rd.y - sunDir.y, rd.x - sunDir.x);
    float rays = pow(0.5 + 0.5 * sin(rayAngle * 11.0 + uTime * 0.22), 4.0);
    sky += vec3(1.0, 0.68, 0.34) * rays * pow(sunDot, 5.5) * 0.22;

    return sky;
  }

  // Derin Fırtına Okyanusu (Altın Güneş Yolu + Elektrik Şimşek Yansıması!)
  vec3 renderOcean(vec3 ro, vec3 rd, vec3 sunDir) {
    float planeY = -3.45;
    float t = (planeY - ro.y) / min(rd.y, -0.001);
    vec3 hit = ro + rd * t;

    vec2 uv = hit.xz * 0.44;
    float w1 = noise3D(vec3(uv * 1.5 + vec2(uTime * 0.42, -uTime * 0.28), uTime * 0.22));
    float w2 = noise3D(vec3(uv * 4.2 - vec2(uTime * 0.6, uTime * 0.35), uTime * 0.32));
    vec3 norm = normalize(vec3((w1 - 0.5) * 0.32 + (w2 - 0.5) * 0.16, 1.0, (w2 - 0.5) * 0.30));

    vec3 reflDir = reflect(rd, norm);
    reflDir.y = abs(reflDir.y);
    vec3 skyRefl = renderSky(reflDir, sunDir);

    float fresnel = pow(1.0 - max(dot(-rd, norm), 0.0), 4.2);
    vec3 deepWater = vec3(0.006, 0.022, 0.058);
    vec3 waterCol = mix(deepWater, skyRefl * 0.72, clamp(0.12 + fresnel * 0.75, 0.0, 1.0));

    // Parıldayan keskin altın güneş yakamozu yolu
    float spec = pow(max(dot(reflDir, sunDir), 0.0), 96.0);
    waterCol += vec3(1.0, 0.78, 0.42) * spec * 2.4;

    // Süper Hücre'nin denize düşen hafif mavi fırtına parıltısı
    float scDist2 = dot(hit.xz - vec2(0.0, -10.4), hit.xz - vec2(0.0, -10.4));
    waterCol += vec3(0.06, 0.28, 0.52) / (1.0 + scDist2 * 0.055) * 0.42;

    // Şimşek çaktığında okyanus dalgalarında patlayan elektrik yansıması!
    if (uLightningFlash > 0.01) {
      float d2 = dot(hit.xz - uLightningPos.xz, hit.xz - uLightningPos.xz);
      float boltReflect = uLightningFlash / (1.0 + d2 * 0.04);
      waterCol += uLightningColor * boltReflect * 1.45;
    }

    float fog = 1.0 - exp(-t * 0.032);
    vec3 fogCol = mix(
      vec3(0.045, 0.10, 0.20),
      vec3(0.62, 0.30, 0.14),
      pow(max(dot(rd, sunDir), 0.0), 4.0) * 0.75
    );
    return mix(waterCol, fogCol, clamp(fog, 0.0, 1.0));
  }

  void main() {
    vec2 ndc = vUv * 2.0 - 1.0;
    float aspect = uResolution.x / max(1.0, uResolution.y);
    vec3 rd = normalize(
      uCamForward +
      ndc.x * aspect * uTanHalfFov * uCamRight +
      ndc.y * uTanHalfFov * uCamUp
    );
    vec3 ro = uCamPos;

    // Güneş sol ufuk üstünde (dramatik yandan aydınlatma -> bulutlarda maksimum 3D kabartma!)
    vec3 sunDir = normalize(vec3(-0.68, 0.22, -0.70));
    vec3 bgCol = rd.y < -0.002 ? renderOcean(ro, rd, sunDir) : renderSky(rd, sunDir);

    // --- 44 ADIMLI YÜKSEK KONTRASTLI 3D VOLÜMETRİK RAYMARCHING ---
    float dither = ign(gl_FragCoord.xy + fract(uTime * 19.0) * 100.0);
    float tMin = 1.8;
    float tMax = 25.0;
    const int STEPS = 44;
    float stepLen = (tMax - tMin) / float(STEPS);
    float t = tMin + dither * stepLen;

    float transmittance = 1.0;
    vec3 accumLight = vec3(0.0);

    float cosTheta = dot(rd, sunDir);
    float g = 0.64;
    float hgPhase = (1.0 - g * g) / (4.0 * 3.14159 * pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5));
    float silverLining = clamp(hgPhase * 1.1, 0.16, 1.85);

    vec3 sunLightCol = vec3(1.0, 0.76, 0.48) * 1.55;
    vec3 skyTopCol = vec3(0.14, 0.28, 0.52);
    vec3 stormBellyDark = vec3(0.018, 0.032, 0.075);

    for (int i = 0; i < STEPS; i++) {
      if (transmittance < 0.02) break;
      vec3 pos = ro + rd * t;

      if (pos.y > -2.85 && pos.y < 4.25) {
        float dens = sampleClouds(pos, true);
        if (dens > 0.01) {
          // Güneş yönünde güçlü öz-gölgeleme (chiaroscuro 3D hacim!)
          float sunDens = sampleClouds(pos + sunDir * 0.85, false);
          float beer = exp(-sunDens * 2.65);
          float powder = 1.0 - exp(-dens * 1.85);
          float heightGrad = clamp((pos.y + 2.3) / 5.8, 0.0, 1.0);

          vec3 ambient = mix(stormBellyDark, skyTopCol, pow(heightGrad, 1.15));
          vec3 directSun = sunLightCol * beer * (0.35 + 0.75 * powder) * silverLining;

          // Süper Hücre'nin dönen göz çekirdeğinde sabit hafif elektrik-mavi atmosfer parıltısı
          vec3 toCore = pos - vec3(0.0, 0.45, -10.4);
          float coreDist = length(toCore);
          float corePulse = 0.78 + 0.22 * sin(uTime * 2.8);
          vec3 stormHeart = vec3(0.12, 0.66, 1.0) * exp(-coreDist * 0.42) * 0.42 * corePulse;

          // Bulut içi gerçek 3D şimşek parlaması (çaktığında bütün Süper Hücre içten aydınlanır!)
          vec3 lightningContrib = vec3(0.0);
          if (uLightningFlash > 0.01) {
            vec3 toBolt = pos - uLightningPos;
            float distSq = dot(toBolt, toBolt);
            float pulse = uLightningFlash / (1.0 + distSq * 0.085);
            lightningContrib = uLightningColor * pulse * 4.6;
          }

          vec3 sampleCol = ambient + directSun + stormHeart + lightningContrib;

          float distFog = 1.0 - exp(-t * 0.018);
          sampleCol = mix(sampleCol, vec3(0.07, 0.13, 0.26), distFog * 0.35);

          float alpha = 1.0 - exp(-dens * stepLen * 1.55);
          accumLight += transmittance * sampleCol * alpha;
          transmittance *= (1.0 - alpha);
        }
      }
      t += stepLen;
    }

    vec3 finalCol = accumLight + bgCol * transmittance;

    // Dalış sonunda 2D arenaya pürüzsüz mavi-siyan geçiş
    float diveGlow = smoothstep(0.55, 0.98, uDive);
    finalCol = mix(finalCol, vec3(0.16, 0.42, 0.68), diveGlow * 0.48);

    // ACES filmic ton eşleme (zengin kontrast, beyaz patlama yok!)
    finalCol = (finalCol * (2.51 * finalCol + 0.03)) / (finalCol * (2.43 * finalCol + 0.59) + 0.14);
    finalCol = pow(clamp(finalCol, 0.0, 1.0), vec3(1.0 / 2.2));

    // Sinematik vinyet
    float vig = 1.0 - dot(ndc * 0.56, ndc * 0.56);
    finalCol *= clamp(0.58 + 0.46 * vig, 0.0, 1.0);

    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

type LightningArc3D = {
  mainGroup: THREE.Group;
  life: number;
  maxLife: number;
  origin: THREE.Vector3;
  color: THREE.Color;
};

function createSoftParticleTexture(): THREE.CanvasTexture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.28, "rgba(224,242,254,0.68)");
    g.addColorStop(0.65, "rgba(125,211,252,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function build3DLightningGroup(
  start: THREE.Vector3,
  end: THREE.Vector3,
  boltCol: THREE.Color
): THREE.Group {
  const group = new THREE.Group();
  const segs = 14;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const p = new THREE.Vector3().lerpVectors(start, end, t);
    if (i > 0 && i < segs) {
      const jitter = Math.sin(t * Math.PI) * 1.05;
      p.x += (Math.random() - 0.5) * jitter;
      p.y += (Math.random() - 0.5) * jitter * 0.3;
      p.z += (Math.random() - 0.5) * jitter;
    }
    pts.push(p);
  }

  // Kalın parlak şimşek gövdesi (hafif kaydırılmış 3 paralel elektrik ipliği)
  const offsets = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.05, 0, 0.03),
    new THREE.Vector3(-0.05, 0, -0.03)
  ];
  offsets.forEach((off, idx) => {
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      arr[i * 3] = p.x + off.x;
      arr[i * 3 + 1] = p.y + off.y;
      arr[i * 3 + 2] = p.z + off.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const mat = new THREE.LineBasicMaterial({
      color: idx === 0 ? 0xffffff : boltCol,
      transparent: true,
      opacity: idx === 0 ? 1 : 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new THREE.Line(geo, mat));
  });

  // 5 çatallı yan yıldırım dalı
  const branchSegs: number[] = [];
  for (const idx of [3, 5, 7, 9, 11]) {
    const origin = pts[idx];
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2.8,
      -0.6 - Math.random() * 1.2,
      (Math.random() - 0.5) * 1.8
    );
    const mid = origin.clone().addScaledVector(dir, 0.52);
    mid.x += (Math.random() - 0.5) * 0.45;
    const tip = origin.clone().add(dir);
    branchSegs.push(
      origin.x, origin.y, origin.z,
      mid.x, mid.y, mid.z,
      mid.x, mid.y, mid.z,
      tip.x, tip.y, tip.z
    );
  }
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(branchSegs), 3));
  const bMat = new THREE.LineBasicMaterial({
    color: boltCol,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  group.add(new THREE.LineSegments(bGeo, bMat));

  return group;
}

function disposeGroup(group: THREE.Group) {
  group.traverse((obj) => {
    if (obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    }
  });
}

export type CumulusIntro3DProps = {
  stageId: string;
  onSelectStage: (stageId: string) => void;
  windBadgeText: string;
  windKmh: number;
  totalWins: number;
  onStartDive: () => void;
  onComplete: () => void;
  onSkip: () => void;
};

export default function CumulusIntro3D({
  stageId,
  onSelectStage,
  windBadgeText,
  windKmh,
  totalWins,
  onStartDive,
  onComplete,
  onSkip
}: CumulusIntro3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [diving, setDiving] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const divingRef = useRef(false);
  const diveStartRef = useRef(0);
  const completedRef = useRef(false);
  const windKmhRef = useRef(windKmh);
  const pointerRef = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    windKmhRef.current = windKmh;
  }, [windKmh]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const triggerDive = () => {
    if (divingRef.current) return;
    divingRef.current = true;
    diveStartRef.current = performance.now();
    setDiving(true);
    onStartDive();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        triggerDive();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    renderer.setPixelRatio(dpr);
    renderer.autoClear = false;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // --- PASS 1: IMAX 3D VOLÜMETRİK RAYMARCHED SÜPER HÜCRE SAHNESİ ---
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1200, 620) },
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3(0, 0.9, 5.4) },
      uCamForward: { value: new THREE.Vector3(0, 0, -1) },
      uCamRight: { value: new THREE.Vector3(1, 0, 0) },
      uCamUp: { value: new THREE.Vector3(0, 1, 0) },
      uTanHalfFov: { value: Math.tan((54 * Math.PI) / 360) },
      uLightningPos: { value: new THREE.Vector3(0, 0.9, -10.4) },
      uLightningColor: { value: new THREE.Vector3(0.42, 0.85, 1.0) },
      uLightningFlash: { value: 0 },
      uDive: { value: 0 },
      uWindSpeed: { value: Math.max(8, windKmhRef.current) }
    };

    const bgGeo = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false
    });
    bgScene.add(new THREE.Mesh(bgGeo, bgMat));

    // --- PASS 2: GERÇEK 3D FOREGROUND (ŞİMŞEKLER + DÖNEN CEPHE HALKASI + HIZ ÇİZGİLERİ) ---
    const fgScene = new THREE.Scene();
    const fgCamera = new THREE.PerspectiveCamera(54, 16 / 9, 0.1, 120);

    // 1. Süper Hücre'nin alt duvarı etrafında dönen zarif 4 cephe bulutçuk akımı
    const particleTex = createSoftParticleTexture();
    const SWARM_COUNT = 260;
    const swarmPositions = new Float32Array(SWARM_COUNT * 3);
    const swarmColors = new Float32Array(SWARM_COUNT * 3);
    const swarmMeta: Array<{
      radius: number;
      angle: number;
      speed: number;
      yBase: number;
      yAmp: number;
      phase: number;
    }> = [];

    const factionHex = [
      new THREE.Color("#38bdf8"),
      new THREE.Color("#f59e0b"),
      new THREE.Color("#f43f5e"),
      new THREE.Color("#10b981")
    ];

    for (let i = 0; i < SWARM_COUNT; i++) {
      const fIdx = i % 4;
      const col = factionHex[fIdx];
      swarmColors[i * 3] = col.r;
      swarmColors[i * 3 + 1] = col.g;
      swarmColors[i * 3 + 2] = col.b;
      swarmMeta.push({
        radius: 3.4 + Math.random() * 3.8,
        angle: (fIdx * Math.PI) / 2 + Math.random() * 1.1,
        speed: 0.32 + Math.random() * 0.36,
        yBase: -2.0 + Math.random() * 1.8,
        yAmp: 0.2 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2
      });
    }

    const swarmGeo = new THREE.BufferGeometry();
    swarmGeo.setAttribute("position", new THREE.BufferAttribute(swarmPositions, 3));
    swarmGeo.setAttribute("color", new THREE.BufferAttribute(swarmColors, 3));
    const swarmMat = new THREE.PointsMaterial({
      size: 0.22,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    fgScene.add(new THREE.Points(swarmGeo, swarmMat));

    // 2. 3D Rüzgar & Dalış Hız Çizgileri
    const STREAK_COUNT = 130;
    const streakPositions = new Float32Array(STREAK_COUNT * 6);
    const streakSeeds: Array<{ x: number; y: number; z: number; spd: number }> = [];
    for (let i = 0; i < STREAK_COUNT; i++) {
      streakSeeds.push({
        x: (Math.random() - 0.5) * 18,
        y: (Math.random() - 0.42) * 9,
        z: -15 + Math.random() * 22,
        spd: 1.4 + Math.random() * 2.0
      });
    }
    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
    const streakMat = new THREE.LineBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    fgScene.add(new THREE.LineSegments(streakGeo, streakMat));

    // 3. Zarif 3D Barometrik Gözlemevi Halkaları
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, -1.25, -10.4);
    const outerRingGeo = new THREE.RingGeometry(4.85, 4.92, 96);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.26,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI * 0.48;
    ringGroup.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(3.45, 3.5, 80);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI * 0.52;
    innerRing.rotation.y = 0.2;
    ringGroup.add(innerRing);
    fgScene.add(ringGroup);

    // 4. Dinamik 3D Çatallı Yıldırım Havuzu (açılışta 0.4s içinde ilk şimşek çakar!)
    let activeBolt: LightningArc3D | null = null;
    let nextBoltIn = 0.35;

    const spawn3DBolt = (forcedCenter = false) => {
      if (activeBolt) {
        fgScene.remove(activeBolt.mainGroup);
        disposeGroup(activeBolt.mainGroup);
        activeBolt = null;
      }

      const angle = Math.random() * Math.PI * 2;
      const rad = forcedCenter ? 0.5 : 0.9 + Math.random() * 2.1;
      const ox = Math.cos(angle) * rad;
      const oz = -10.4 + Math.sin(angle) * rad * 0.7;
      const start = new THREE.Vector3(ox, 1.55 + Math.random() * 0.85, oz);
      const end = new THREE.Vector3(
        ox + (Math.random() - 0.5) * 1.8,
        -3.45,
        oz + (Math.random() - 0.5) * 1.4
      );

      const isWarm = Math.random() < 0.28;
      const boltCol = isWarm ? new THREE.Color("#fbbf24") : new THREE.Color("#7dd3fc");
      const mainGroup = build3DLightningGroup(start, end, boltCol);
      fgScene.add(mainGroup);

      activeBolt = {
        mainGroup,
        life: 0.42,
        maxLife: 0.42,
        origin: new THREE.Vector3(ox, 0.95, oz),
        color: boltCol
      };
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, Math.round(rect.width));
      const h = Math.max(220, Math.round(rect.height));
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w * dpr, h * dpr);
      fgCamera.aspect = w / h;
      fgCamera.updateProjectionMatrix();
    };
    resize();
    const roObs = new ResizeObserver(resize);
    roObs.observe(container);

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.tx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      pointerRef.current.ty = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    };
    container.addEventListener("pointermove", onPointerMove);

    const forwardVec = new THREE.Vector3();
    const rightVec = new THREE.Vector3();
    const upVec = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    let diveBoltFired = false;

    let rafId = 0;
    let lastTs = performance.now();
    const startTs = lastTs;

    const animate = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const elapsed = (now - startTs) / 1000;

      pointerRef.current.x += (pointerRef.current.tx - pointerRef.current.x) * Math.min(1, dt * 4);
      pointerRef.current.y += (pointerRef.current.ty - pointerRef.current.y) * Math.min(1, dt * 4);

      let diveT = 0;
      if (divingRef.current) {
        diveT = Math.min(1, (now - diveStartRef.current) / 1550);
        if (diveT > 0.45 && !diveBoltFired) {
          diveBoltFired = true;
          spawn3DBolt(true);
        }
        if (diveT > 0.72) {
          setFadeOut(true);
        }
        if (diveT >= 1 && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
          return;
        }
      }

      const diveEase =
        diveT < 0.5
          ? 2 * diveT * diveT
          : 1 - Math.pow(-2 * diveT + 2, 2) / 2;

      const idleX = Math.sin(elapsed * 0.24) * 1.9 + pointerRef.current.x * 1.25;
      const idleY = 0.65 + Math.cos(elapsed * 0.31) * 0.28 - pointerRef.current.y * 0.55;
      const idleZ = 4.9 + Math.sin(elapsed * 0.19) * 0.45;

      const camX = THREE.MathUtils.lerp(idleX, 0.0, diveEase);
      const camY = THREE.MathUtils.lerp(idleY, 2.1 - diveEase * 3.8, diveEase);
      const camZ = THREE.MathUtils.lerp(idleZ, -9.8, diveEase);

      const targetX = THREE.MathUtils.lerp(pointerRef.current.x * 0.6, 0.0, diveEase);
      const targetY = THREE.MathUtils.lerp(0.55 - pointerRef.current.y * 0.4, -6.2, Math.pow(diveEase, 1.45));
      const targetZ = THREE.MathUtils.lerp(-10.4, -12.2, diveEase);

      fgCamera.position.set(camX, camY, camZ);
      lookTarget.set(targetX, targetY, targetZ);
      fgCamera.lookAt(lookTarget);

      const bank =
        Math.sin(elapsed * 0.24) * 0.04 -
        pointerRef.current.x * 0.05 +
        Math.sin(diveEase * Math.PI) * 0.2;
      fgCamera.rotateZ(bank);

      const nextFov = THREE.MathUtils.lerp(54, 84, Math.pow(diveEase, 1.2));
      if (Math.abs(fgCamera.fov - nextFov) > 0.05) {
        fgCamera.fov = nextFov;
        fgCamera.updateProjectionMatrix();
      }

      fgCamera.updateMatrixWorld();
      forwardVec.set(0, 0, -1).applyQuaternion(fgCamera.quaternion).normalize();
      rightVec.set(1, 0, 0).applyQuaternion(fgCamera.quaternion).normalize();
      upVec.set(0, 1, 0).applyQuaternion(fgCamera.quaternion).normalize();

      uniforms.uTime.value = elapsed;
      uniforms.uCamPos.value.copy(fgCamera.position);
      uniforms.uCamForward.value.copy(forwardVec);
      uniforms.uCamRight.value.copy(rightVec);
      uniforms.uCamUp.value.copy(upVec);
      uniforms.uTanHalfFov.value = Math.tan((fgCamera.fov * Math.PI) / 360);
      uniforms.uDive.value = diveEase;
      uniforms.uWindSpeed.value = Math.max(8, windKmhRef.current);

      // 3D Çatallı Şimşek & Bulut İçi Volümetrik Patlama
      nextBoltIn -= dt;
      if (nextBoltIn <= 0 && !divingRef.current) {
        spawn3DBolt(false);
        nextBoltIn = 1.25 + Math.random() * 1.65;
      }

      if (activeBolt) {
        activeBolt.life -= dt;
        const ratio = Math.max(0, activeBolt.life / activeBolt.maxLife);
        const flicker = ratio > 0.68 ? 1.0 : ratio > 0.48 ? 0.35 : ratio * 2.1;
        activeBolt.mainGroup.traverse((obj) => {
          if (obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
            (obj.material as THREE.LineBasicMaterial).opacity = flicker;
          }
        });
        uniforms.uLightningPos.value.copy(activeBolt.origin);
        uniforms.uLightningColor.value.set(
          activeBolt.color.r,
          activeBolt.color.g,
          activeBolt.color.b
        );
        uniforms.uLightningFlash.value = flicker * 1.25;

        if (activeBolt.life <= 0) {
          fgScene.remove(activeBolt.mainGroup);
          disposeGroup(activeBolt.mainGroup);
          activeBolt = null;
          uniforms.uLightningFlash.value = 0;
        }
      } else {
        uniforms.uLightningFlash.value *= 0.84;
      }

      // 3D Cephe Bulutçuk Halkası
      const posAttr = swarmGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < SWARM_COUNT; i++) {
        const m = swarmMeta[i];
        const a = m.angle + elapsed * m.speed * (1 + diveEase * 1.8);
        const rad = m.radius * (1 - diveEase * 0.28);
        const x = Math.cos(a) * rad;
        const z = -10.4 + Math.sin(a) * rad;
        const y = m.yBase + Math.sin(elapsed * 1.4 + m.phase) * m.yAmp;
        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;

      // 3D Rüzgar & Dalış Hız Çizgileri
      const streakAttr = streakGeo.getAttribute("position") as THREE.BufferAttribute;
      const streakSpd = 2.6 + diveEase * 34;
      const streakLen = 0.4 + diveEase * 4.0;
      streakMat.opacity = 0.2 + diveEase * 0.58;
      for (let i = 0; i < STREAK_COUNT; i++) {
        const s = streakSeeds[i];
        s.z += s.spd * streakSpd * dt;
        if (s.z > fgCamera.position.z + 2) {
          s.z = fgCamera.position.z - 22 - Math.random() * 8;
          s.x = (Math.random() - 0.5) * 18;
          s.y = (Math.random() - 0.42) * 9;
        }
        streakAttr.setXYZ(i * 2, s.x, s.y, s.z);
        streakAttr.setXYZ(i * 2 + 1, s.x, s.y, s.z - streakLen);
      }
      streakAttr.needsUpdate = true;

      outerRing.rotation.z = elapsed * 0.16;
      innerRing.rotation.z = -elapsed * 0.24;
      ringGroup.scale.setScalar(1 + diveEase * 1.65);
      outerRingMat.opacity = 0.26 * (1 - diveEase);
      innerRingMat.opacity = 0.2 * (1 - diveEase);

      renderer.clear();
      renderer.render(bgScene, bgCamera);
      renderer.clearDepth();
      renderer.render(fgScene, fgCamera);

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      roObs.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      if (activeBolt) {
        disposeGroup(activeBolt.mainGroup);
      }
      bgGeo.dispose();
      bgMat.dispose();
      swarmGeo.dispose();
      swarmMat.dispose();
      particleTex.dispose();
      streakGeo.dispose();
      streakMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const selectedStage =
    CUMULUS_STAGES.find((s) => s.id === stageId) ?? CUMULUS_STAGES[0];

  return (
    <div
      className={`absolute inset-0 z-30 overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {!webglFailed ? (
        <div ref={containerRef} className="h-full w-full" />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_left,#3b2f2f_0%,#0c1f3d_45%,#050b18_100%)]" />
      )}

      {/* Sinematik Açılış Başlık & Cephe Seçim Arayüzü */}
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-8 transition-all duration-500 ${
          diving ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Üst İnce Telemetri Satırı */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-[#040a16]/65 px-3.5 py-1.5 backdrop-blur-md">
            <CloudLightning className="h-3.5 w-3.5 text-sky-300" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-sky-100">
              ATMOS · 3D SÜPER HÜCRE AÇILIŞI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#040a16]/65 px-3 py-1.5 font-mono text-[11px] text-sky-100 backdrop-blur-md">
              <Wind className="h-3.5 w-3.5 text-amber-300" />
              <span>{windBadgeText}</span>
            </div>
            {totalWins > 0 && (
              <div className="hidden sm:flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1.5 font-mono text-[11px] text-amber-200 backdrop-blur-md">
                <span>{totalWins} Zafer</span>
              </div>
            )}
          </div>
        </div>

        {/* Merkez Kahraman Başlık & Aksiyon (hafif okunaklılık halesi ile) */}
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(4,10,22,0.52)_0%,rgba(4,10,22,0)_74%)] px-6 py-4 text-center">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            SİNOPTİK ATMOSFER STRATEJİSİ
          </span>
          <h2 className="mt-2 font-display text-5xl font-bold tracking-[0.2em] text-white drop-shadow-[0_10px_34px_rgba(0,0,0,0.95)] sm:text-6xl">
            CUMULUS
          </h2>
          <p className="mt-1 font-mono text-xs font-semibold tracking-[0.42em] text-sky-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            BULUT SAVAŞI
          </p>
          <p className="mt-3 max-w-lg text-xs leading-relaxed text-slate-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:text-sm">
            Kendi bulutlarını besleyip <strong>Kümülonimbus</strong> ve{" "}
            <strong>Süper Hücre</strong>&apos;ye evrimleştir, canlı şehir rüzgarını arkana al
            ve 3 farklı fırtına yapay zekasına karşı gökyüzünü fethet.
          </p>

          <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={triggerDive}
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 px-8 py-3.5 text-sm font-extrabold tracking-wider text-slate-950 shadow-[0_0_44px_rgba(56,189,248,0.55)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(56,189,248,0.82)] active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-slate-950 transition-transform group-hover:translate-x-0.5" />
              <span>SAVAŞA BAŞLA</span>
              <Sparkles className="h-4 w-4 opacity-85" />
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="rounded-xl border border-white/25 bg-[#040a16]/65 px-4 py-3 text-xs font-medium text-slate-100 backdrop-blur-md transition-colors hover:border-white/45 hover:bg-[#040a16]/85 hover:text-white"
            >
              Hızlı Geç
            </button>
          </div>
        </div>

        {/* Alt Hızlı Cephe Seçici */}
        <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col items-center gap-2">
          <div className="rounded-full bg-[#040a16]/55 px-3.5 py-1 text-[11px] font-medium text-slate-100 backdrop-blur-md">
            Seçili Cephe: <strong className="text-sky-300">{selectedStage.name}</strong> ·{" "}
            <span className="text-slate-300">{selectedStage.subtitle}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {CUMULUS_STAGES.map((st) => {
              const active = st.id === stageId;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStage(st.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all ${
                    active
                      ? "border-sky-300/80 bg-sky-500/35 text-white shadow-[0_0_18px_rgba(56,189,248,0.4)]"
                      : "border-white/15 bg-[#040a16]/65 text-slate-200 hover:border-white/35 hover:bg-[#040a16]/85"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">0{st.index}</span>
                  <span>{st.name}</span>
                  <span className="flex items-center gap-0.5">
                    {st.opponents.map((op) => (
                      <span
                        key={op}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: FACTION_META[op].primary }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dalış esnasında odak yazısı */}
      {diving && !fadeOut && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <div className="rounded-full border border-sky-200/35 bg-[#040a16]/65 px-4 py-1.5 font-mono text-[11px] tracking-[0.26em] text-sky-100 backdrop-blur-md">
            CEPHEYE İNİŞ · {selectedStage.name.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

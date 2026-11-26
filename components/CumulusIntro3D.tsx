"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  BlendFunction,
  BloomEffect,
  Effect,
  EffectComposer,
  EffectPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect
} from "postprocessing";
import { createNoise2D } from "simplex-noise";
import { Play, Volume2, VolumeX } from "lucide-react";
import { CUMULUS_STAGES, FACTION_META } from "@/lib/cumulus-engine";
import { cumulusAudio, type ThunderKind } from "@/lib/cumulus-audio";
import { getNubisCloudTextures } from "@/lib/volumetric-noise-3d";

/**
 * 6 Fotoğrafik Meteoroloji Sahnesi (Gerçek Doğa Fırtına Fotoğrafçılığı Paletleri — Yapay Neon/Mor Yok!)
 */
type MeteorologicalLook = {
  skyZenith: [number, number, number];
  skyHorizon: [number, number, number];
  sunHorizonGlow: [number, number, number];
  sunLightCol: [number, number, number];
  cloudAmbientTop: [number, number, number];
  cloudBellyDark: [number, number, number];
  hailTint: [number, number, number]; // Anadolu dolu-çekirdeği yeşili gibi gerçek optik saçılım
  sunDir: [number, number, number];
  boltTint: [number, number, number];
  stormDensity: number;
  shearTilt: number;
  rainIntensity: number;
  boltRateSec: number;
  isNight: number;
  tagline: string;
};

const STAGE_LOOKS: Record<string, MeteorologicalLook> = {
  marmara: {
    skyZenith: [0.009, 0.032, 0.095],
    skyHorizon: [0.075, 0.115, 0.175],
    sunHorizonGlow: [2.45, 0.86, 0.22],
    sunLightCol: [3.25, 1.72, 0.78],
    cloudAmbientTop: [0.11, 0.19, 0.34],
    cloudBellyDark: [0.008, 0.014, 0.03],
    hailTint: [0.018, 0.05, 0.075],
    sunDir: [-0.74, 0.17, -0.65],
    boltTint: [0.84, 0.93, 1.0],
    stormDensity: 1.32,
    shearTilt: 0.28,
    rainIntensity: 0.58,
    boltRateSec: 2.2,
    isNight: 0.0,
    tagline: "Altın Alacakaranlık · Marmara Mezosiklonu"
  },
  bogaz: {
    skyZenith: [0.008, 0.028, 0.072],
    skyHorizon: [0.095, 0.155, 0.23],
    sunHorizonGlow: [1.15, 1.38, 1.65],
    sunLightCol: [2.55, 2.75, 3.0],
    cloudAmbientTop: [0.14, 0.24, 0.38],
    cloudBellyDark: [0.007, 0.016, 0.032],
    hailTint: [0.025, 0.08, 0.115],
    sunDir: [-0.66, 0.24, -0.71],
    boltTint: [0.86, 0.95, 1.0],
    stormDensity: 1.35,
    shearTilt: 0.34,
    rainIntensity: 0.78,
    boltRateSec: 1.95,
    isNight: 0.0,
    tagline: "Soğuk Cephe Gümüşü · Boğaz Rüzgar Koridoru"
  },
  ege: {
    skyZenith: [0.012, 0.022, 0.068],
    skyHorizon: [0.14, 0.085, 0.085],
    sunHorizonGlow: [2.65, 0.65, 0.16],
    sunLightCol: [3.35, 1.32, 0.54],
    cloudAmbientTop: [0.12, 0.13, 0.26],
    cloudBellyDark: [0.01, 0.01, 0.024],
    hailTint: [0.04, 0.028, 0.045],
    sunDir: [-0.78, 0.12, -0.61],
    boltTint: [0.96, 0.9, 0.84],
    stormDensity: 1.3,
    shearTilt: 0.24,
    rainIntensity: 0.48,
    boltRateSec: 2.1,
    isNight: 0.0,
    tagline: "Bakır Gün Batımı · Ege Üçlü Cephe"
  },
  anadolu: {
    skyZenith: [0.008, 0.028, 0.046],
    skyHorizon: [0.082, 0.155, 0.145],
    sunHorizonGlow: [1.85, 1.42, 0.65],
    sunLightCol: [2.85, 2.45, 1.55],
    cloudAmbientTop: [0.12, 0.23, 0.26],
    cloudBellyDark: [0.007, 0.026, 0.024],
    hailTint: [0.065, 0.34, 0.24],
    sunDir: [0.72, 0.2, -0.66],
    boltTint: [0.88, 0.97, 1.0],
    stormDensity: 1.38,
    shearTilt: -0.3,
    rainIntensity: 0.68,
    boltRateSec: 1.7,
    isNight: 0.0,
    tagline: "Dolu Çekirdeği Yeşili · Anadolu Süper Hücresi"
  },
  akdeniz: {
    skyZenith: [0.003, 0.01, 0.028],
    skyHorizon: [0.016, 0.036, 0.072],
    sunHorizonGlow: [0.58, 0.82, 1.25],
    sunLightCol: [1.05, 1.35, 1.9],
    cloudAmbientTop: [0.045, 0.082, 0.15],
    cloudBellyDark: [0.003, 0.006, 0.015],
    hailTint: [0.014, 0.035, 0.06],
    sunDir: [-0.52, 0.29, -0.8],
    boltTint: [0.78, 0.92, 1.0],
    stormDensity: 1.4,
    shearTilt: 0.18,
    rainIntensity: 0.86,
    boltRateSec: 1.4,
    isNight: 1.0,
    tagline: "Ay Işıklı Gece Medikanesi · Akdeniz Siklonu"
  },
  sonsuz: {
    skyZenith: [0.004, 0.009, 0.024],
    skyHorizon: [0.055, 0.042, 0.038],
    sunHorizonGlow: [2.15, 0.72, 0.18],
    sunLightCol: [2.35, 1.28, 0.58],
    cloudAmbientTop: [0.068, 0.095, 0.14],
    cloudBellyDark: [0.004, 0.006, 0.013],
    hailTint: [0.022, 0.068, 0.055],
    sunDir: [-0.62, 0.09, -0.78],
    boltTint: [0.88, 0.94, 1.0],
    stormDensity: 1.46,
    shearTilt: 0.38,
    rainIntensity: 0.94,
    boltRateSec: 1.15,
    isNight: 0.45,
    tagline: "Antrasit Derecho Duvarı · Sonsuz Fırtına"
  }
};

const NUBIS_VERTEX_GLSL3 = /* glsl */ `
  in vec3 position;
  in vec2 uv;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * CUMULUS 3.0 — GUERILLA GAMES "NUBIS" WEBGL2 DATA3DTEXTURE VOLÜMETRİK SÜPER HÜCRE + GERSTNER FIRTINA DENİZİ
 * - 64³ Perlin-Worley + 32³ Worley Erozyon 3D hacim dokuları (keskin karnabahar kümülonimbus kuleleri)
 * - 96 adaptif adım + 3-oktav enerji koruyan çoklu ışık saçılımı + Powder etkisi
 * - Rüzgar kırılmasıyla eğimli asimetrik süper hücre + dönen duvar bulutu + mammatus + yağmur perdesi
 * - 8-yönlü Gerstner/kapiler fırtına okyanusu + bulut gölgesi + dalga köpüğü + şimşek yansıması
 */
const NUBIS_FRAGMENT_GLSL3 = /* glsl */ `
  precision highp float;
  precision highp sampler3D;

  in vec2 vUv;
  out vec4 fragColor;

  uniform sampler3D uBaseVolume;
  uniform sampler3D uDetailVolume;
  uniform sampler2D uBlueNoise;

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
  uniform vec2 uStrikeXZ;
  uniform float uStrikeGlow;
  uniform float uDive;
  uniform float uWindSpeed;

  uniform vec3 uSkyZenith;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSunHorizonGlow;
  uniform vec3 uSunLightCol;
  uniform vec3 uCloudAmbientTop;
  uniform vec3 uCloudBellyDark;
  uniform vec3 uHailTint;
  uniform vec3 uSunDir;
  uniform float uStormDensity;
  uniform float uShearTilt;
  uniform float uIsNight;

  float remap(float v, float a, float b, float c, float d) {
    float t = clamp((v - a) / max(1e-5, b - a), 0.0, 1.0);
    return mix(c, d, t);
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Pürüzsüz yumuşak-maksimum: küresel kümülüs kulelerini organik şekilde kaynaştırır
  float sMax(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return max(a, b) + h * h * k * 0.25;
  }

  float cloudLobe(vec3 p, vec3 c, vec3 radii) {
    vec3 q = (p - c) / radii;
    return 1.0 - smoothstep(0.18, 1.0, length(q));
  }

  // 3D Domain-Warped Çok-Kuleli IMAX Süper Hücre (Doğal Kümülonimbus Dağları — Sıfır düz tavan!)
  float sampleSupercell(vec3 p, bool detailed, out float rainCore, out float heightNorm) {
    rainCore = 0.0;
    heightNorm = clamp((p.y + 2.6) / 7.8, 0.0, 1.0);

    float windFlow = uTime * (0.14 + uWindSpeed * 0.0024);
    vec3 sc = p - vec3(0.5, 0.15, -13.4);

    // 3D organik türbülans bükümü (daha mesafe ölçmeden zarfı kıvırır!)
    vec3 warpUv = sc * 0.095 + vec3(windFlow * 0.14, -windFlow * 0.19, windFlow * 0.07);
    vec4 warpSample = texture(uBaseVolume, warpUv);
    vec3 disp = (warpSample.rgb - 0.5) * 2.65;

    float shearX = (sc.y + 1.2) * uShearTilt;
    vec3 scSheared = vec3(sc.x - shearX, sc.y, sc.z) + disp * vec3(1.0, 0.65, 1.0);
    float rXZ = length(scSheared.xz);

    // Yavaş dönen mezosiklon girdabı
    float swirl = -uTime * (0.17 + uDive * 0.34) + rXZ * 0.16 - sc.y * 0.2;
    float cs = cos(swirl);
    float sn = sin(swirl);
    vec3 scRot = vec3(
      cs * scSheared.x - sn * scSheared.z,
      scSheared.y,
      sn * scSheared.x + cs * scSheared.z
    );

    // 1. Katmanlı Dönen Mezosiklon Duvar / Raf Bulutu Tabanı (geniş, karanlık, heybetli)
    float shelfBands = 1.0 + 0.24 * sin(sc.y * 8.4 + rXZ * 0.9 - uTime * 0.48);
    float wallRadius = 6.7 * exp(-pow((sc.y + 1.4) / 0.98, 2.0)) * shelfBands;
    float wallMask =
      (1.0 - smoothstep(wallRadius * 0.24, max(0.8, wallRadius), rXZ)) *
      smoothstep(-2.45, -1.1, sc.y) *
      (1.0 - smoothstep(0.25, 1.35, sc.y));

    // 2. Birbirini Örten 6 Anıtsal Kümülonimbus Karnabahar Kulesi + Aşım Kubbesi (Overshooting Top!)
    float sgn = uShearTilt >= 0.0 ? 1.0 : -1.0;
    float turrets = cloudLobe(scSheared, vec3(-1.0 * sgn, 0.35, 0.3), vec3(5.4, 3.1, 4.7));
    turrets = sMax(turrets, cloudLobe(scSheared, vec3(-1.7 * sgn, 2.35, -0.2), vec3(4.5, 3.0, 4.1)), 0.28);
    // Stratosfere taşan devasa altın aydınlıklı ana aşım kubbesi
    turrets = sMax(turrets, cloudLobe(scSheared, vec3(-0.6 * sgn, 4.15, -0.35), vec3(4.1, 2.55, 3.6)), 0.28);
    turrets = sMax(turrets, cloudLobe(scSheared, vec3(2.4 * sgn, 3.2, -0.7), vec3(4.4, 2.35, 3.7)), 0.28);
    turrets = sMax(turrets, cloudLobe(scSheared, vec3(-4.1 * sgn, 1.3, 0.7), vec3(3.9, 2.55, 3.4)), 0.28);
    turrets = sMax(turrets, cloudLobe(scSheared, vec3(3.7 * sgn, 0.95, 0.8), vec3(4.1, 2.3, 3.5)), 0.28);

    // 3. Rüzgar Yönünde Görkemli Yayılan Örs Plümü (Anvil Plume) + Altında Mammatus Keseleri
    float anvilPlume = cloudLobe(scSheared, vec3(5.6 * sgn, 2.95, -1.3), vec3(8.4, 1.75, 4.9));
    float mammatus = 0.0;
    if (sc.y > 0.3 && sc.y < 2.2 && rXZ > 2.2 && rXZ < 10.5) {
      float mCell = texture(uDetailVolume, scRot * 0.24).r;
      mammatus = smoothstep(0.42, 0.84, mCell) * 0.52 * smoothstep(2.2, 0.85, sc.y) * smoothstep(0.3, 0.9, sc.y);
    }

    float supercellShape = sMax(wallMask * 1.18, sMax(turrets * 1.2, anvilPlume * 0.98, 0.24), 0.26);
    supercellShape = clamp(supercellShape + mammatus * clamp(anvilPlume + turrets * 0.5, 0.0, 1.0), 0.0, 1.38);

    // 4. Duvar Bulutundan Denize İnen Eğik Yağmur Perdesi (Virga / Rain Shaft — Gerçek Fırtına Fotoğrafçılığı!)
    if (sc.y < -0.75 && sc.y > -3.9 && rXZ < 4.8) {
      float shaftR = 1.0 - smoothstep(0.4, 4.4, rXZ);
      float streakTex = texture(uDetailVolume, vec3(sc.x * 0.28, sc.y * 0.07 + uTime * 0.42, sc.z * 0.28)).r;
      rainCore = shaftR * smoothstep(-3.9, -1.65, sc.y) * (0.35 + 0.65 * streakTex) * 0.72;
    }

    // 5. Yan Çerçeveleyen Kümülüs Kuleleri + Uzak Ufuk Fırtına Sırası (100 km ölçek hissi!)
    vec3 leftP = p - vec3(-12.2, -0.55, -10.8) + disp * 0.52;
    float leftShape = sMax(
      cloudLobe(leftP, vec3(0.0, 0.0, 0.0), vec3(5.0, 2.45, 3.9)),
      cloudLobe(leftP, vec3(-1.4, 1.45, -0.6), vec3(3.5, 2.0, 3.0)),
      0.22
    ) * smoothstep(-2.45, -1.1, p.y);

    vec3 rightP = p - vec3(12.2, -0.35, -11.4) + disp * 0.52;
    float rightShape = sMax(
      cloudLobe(rightP, vec3(0.0, 0.0, 0.0), vec3(5.6, 2.7, 4.2)),
      cloudLobe(rightP, vec3(1.3, 1.65, -0.5), vec3(3.8, 2.15, 3.2)),
      0.22
    ) * smoothstep(-2.45, -1.1, p.y);

    // Uzak ufukta siluet derinliği katan alçak fırtına sırası
    vec3 farP = p - vec3(-5.8, -1.1, -23.5) + disp * 0.4;
    float farDeck = cloudLobe(farP, vec3(0.0, 0.0, 0.0), vec3(12.2, 1.95, 4.3)) * smoothstep(-2.6, -1.4, p.y);

    float shapeMask = max(supercellShape, max(max(leftShape, rightShape) * 0.96, farDeck * 0.76));
    if (shapeMask < 0.02 && rainCore < 0.02) return 0.0;

    // 6. Yüksek Frekanslı 3-Katmanlı 3D Worley Karnabahar Oyma (Hem silüette hem güneşli cephede!)
    vec3 baseCoord = scRot * 0.24 + vec3(windFlow * 0.13, -windFlow * 0.24, windFlow * 0.08);
    vec4 lo = texture(uBaseVolume, baseCoord);
    float billowBase = lo.r * 0.48 + lo.g * 0.34 + lo.b * 0.18;

    // Derin oyuklu anıtsal karnabahar kabartması
    float carved = shapeMask - (1.0 - billowBase) * 0.58;
    if (carved <= 0.004) return rainCore * 0.48;

    if (detailed) {
      vec3 dCoord = baseCoord * 2.55 + vec3(windFlow * 0.14, -windFlow * 0.32, 0.0);
      vec3 hi = texture(uDetailVolume, dCoord).rgb;
      float hiFbm = dot(hi, vec3(0.54, 0.31, 0.15));

      // 3. mikro-karnabahar oktavı (keskin bulut tomurcukları!)
      float micro = texture(uDetailVolume, dCoord * 2.15 + vec3(0.0, -windFlow * 0.22, 0.17)).r;
      float detailCombo = hiFbm * 0.72 + micro * 0.28;

      // Hem dış kabukta hem güneş gören ön cephede derin 3D tomurcuk rölyefi!
      float erosionAmt = mix(0.36, 0.56, smoothstep(0.12, 0.88, heightNorm));
      float surfaceMask = smoothstep(1.38, 0.06, shapeMask);
      carved -= (1.0 - detailCombo) * erosionAmt * surfaceMask;
      // İnce yüzey yoğunluk modülasyonu (güneş ışığı her tomurcuk kıvrımını tek tek yakalar)
      carved += (detailCombo - 0.52) * 0.16;
    }

    float finalDens = max(0.0, carved) * 3.85 * uStormDensity;
    return finalDens + rainCore * 0.46;
  }

  vec3 renderAtmosphereSky(vec3 rd, vec3 sunDir) {
    float up = clamp(rd.y, 0.0, 1.0);
    float sunDot = max(dot(rd, sunDir), 0.0);
    float horizBand = pow(1.0 - up, 5.2);

    // Zengin derin safir-kobalt alacakaranlık gökyüzü geçişi
    vec3 sky = mix(uSkyHorizon, uSkyZenith, pow(up, 0.48));
    // Altın ufuk atmosfer saçılımı + sıcak gün batımı ışın halesi (Mie)
    sky += uSunHorizonGlow * pow(sunDot, 3.8) * (0.08 + horizBand * 0.85);
    sky += uSunHorizonGlow * pow(sunDot, 14.0) * smoothstep(0.42, -0.02, rd.y) * 0.42;
    sky += uSunLightCol * pow(sunDot, 64.0) * 0.55;
    // Gerçek HDR güneş/ay diski
    sky += uSunLightCol * smoothstep(0.9988, 0.9997, sunDot) * (1.8 - uIsNight * 0.95);

    // Yüksek stratosferde gece ince yıldızlar
    if (up > 0.22 && uIsNight > 0.15) {
      vec2 sg = floor(rd.xz / max(0.22, rd.y) * 140.0);
      float rs = hash12(sg);
      float star = smoothstep(0.9955, 0.9996, rs) * smoothstep(0.22, 0.65, up) * uIsNight;
      sky += vec3(0.84, 0.9, 1.0) * star * 0.9;
    }
    return sky;
  }

  // 8-Yönlü Gerstner / Kapiler Fırtına Okyanusu (Sıfır balmumu lekesi, gerçek dalga normali + gölge + köpük!)
  vec3 renderStormOcean(vec3 ro, vec3 rd, vec3 sunDir) {
    float planeY = -3.45;
    float t = (planeY - ro.y) / min(rd.y, -0.0012);
    vec3 hit = ro + rd * t;

    float windAmp = 0.72 + clamp(uWindSpeed / 45.0, 0.0, 0.95);
    vec2 p = hit.xz * 0.52;

    // 6-oktav dönen yönlü fırtına dalga spektrumu
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    float hC = 0.0;
    float hX = 0.0;
    float hZ = 0.0;
    float amp = 0.42 * windAmp;
    float freq = 0.85;
    float spd = 0.62;
    vec2 eps = vec2(0.06, 0.0);

    for (int i = 0; i < 6; i++) {
      vec2 drift = vec2(uTime * spd, -uTime * spd * 0.58);
      vec2 q = p * freq + drift;
      float n0 = noise2D(q);
      float nx = noise2D(q + eps.xy * freq);
      float nz = noise2D(q + eps.yx * freq);
      // Keskin fırtına dalga sırtları (ridged wave crests)
      float w0 = pow(1.0 - abs(n0 * 2.0 - 1.0), 1.65);
      float wx = pow(1.0 - abs(nx * 2.0 - 1.0), 1.65);
      float wz = pow(1.0 - abs(nz * 2.0 - 1.0), 1.65);
      hC += w0 * amp;
      hX += wx * amp;
      hZ += wz * amp;
      p = rot * p;
      freq *= 1.88;
      amp *= 0.49;
      spd *= 1.18;
    }

    // Uzak dalgalarda doğal anti-aliasing (gürültülü pırıltıyı engeller)
    float distAtten = 1.0 / (1.0 + t * 0.042);
    vec3 norm = normalize(vec3(
      (hC - hX) * 5.2 * distAtten,
      1.0,
      (hC - hZ) * 5.2 * distAtten
    ));

    vec3 reflDir = reflect(rd, norm);
    reflDir.y = abs(reflDir.y);
    vec3 skyRefl = renderAtmosphereSky(reflDir, sunDir);

    // Süper hücrenin denize düşürdüğü GERÇEK dev bulut gölgesi!
    float dCore = length(hit.xz - vec2(0.4, -12.8));
    float cloudShadow = mix(0.24, 1.0, smoothstep(3.5, 16.5, dCore));

    float fresnel = pow(1.0 - max(dot(-rd, norm), 0.0), 4.6);
    vec3 deepSea = mix(vec3(0.004, 0.012, 0.022), uSkyZenith * 0.55 + vec3(0.004, 0.015, 0.026), 0.6);
    vec3 water = mix(deepSea, skyRefl * 0.72 * cloudShadow, clamp(0.08 + fresnel * 0.84, 0.0, 1.0));

    // Keskin güneş/ay yakamoz parıltısı (bulut gölgesinin dışında)
    float glint = pow(max(dot(reflDir, sunDir), 0.0), 180.0) * cloudShadow;
    water += uSunLightCol * glint * 1.95;

    // Rüzgarla savrulan dalga sırtı ince köpük izleri (whitecaps)
    float foamMask = smoothstep(0.68, 0.94, hC / max(0.5, windAmp)) * distAtten * 0.28;
    vec3 foamCol = mix(vec3(0.18, 0.24, 0.3), uCloudAmbientTop * 1.25, 0.5) * cloudShadow;
    water = mix(water, foamCol, foamMask);

    // Yıldırım anında dalga kapilerlerinde doğal parlayan şimşek yansıması
    if (uLightningFlash > 0.01) {
      float d2 = dot(hit.xz - uLightningPos.xz, hit.xz - uLightningPos.xz);
      float specRipple = 0.55 + 0.45 * pow(max(dot(norm, normalize(uLightningPos - hit)), 0.0), 8.0);
      water += uLightningColor * (uLightningFlash / (1.0 + d2 * 0.03)) * specRipple * 1.75;
    }

    // Denize yıldırım düştüğü an noktada kısa süreli termal yüzey parıltısı
    if (uStrikeGlow > 0.01) {
      float dS = length(hit.xz - uStrikeXZ);
      water += uLightningColor * exp(-dS * 0.55) * uStrikeGlow * 2.2;
    }

    // Doğal deniz ufuk sisi
    float fog = 1.0 - exp(-t * 0.024);
    vec3 fogCol = mix(
      uSkyHorizon * 0.92,
      uSunHorizonGlow * 0.52,
      pow(max(dot(rd, sunDir), 0.0), 3.6) * 0.65
    );
    return mix(water, fogCol, clamp(fog, 0.0, 1.0));
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
    vec3 sunDir = normalize(uSunDir);

    vec3 bgCol = rd.y < -0.0015 ? renderStormOcean(ro, rd, sunDir) : renderAtmosphereSky(rd, sunDir);

    // Blue-Noise uzamsal dither (bantlaşma sıfır!)
    float bn = texture(uBlueNoise, gl_FragCoord.xy / 64.0).r;

    // --- 96 ADAPTİF ADIMLI NUBIS ÇOKLU-SAÇILIM + MİKRO-KABARTMA RAYMARCHER ---
    float t = 1.6 + bn * 0.28;
    float tMax = 35.0;
    float transmittance = 1.0;
    vec3 accumLight = vec3(0.0);

    // Çift-Lobe Henyey-Greenstein faz fonksiyonu (gümüş kenar + yumuşak geri saçılım)
    float cosTheta = dot(rd, sunDir);
    float gFwd = 0.78;
    float gBack = -0.32;
    float hgFwd = (1.0 - gFwd * gFwd) / (4.0 * 3.14159 * pow(1.0 + gFwd * gFwd - 2.0 * gFwd * cosTheta, 1.5));
    float hgBack = (1.0 - gBack * gBack) / (4.0 * 3.14159 * pow(1.0 + gBack * gBack - 2.0 * gBack * cosTheta, 1.5));
    float phase = clamp(mix(hgBack, hgFwd, 0.72) * 1.18, 0.24, 2.55);

    for (int i = 0; i < 96; i++) {
      if (t > tMax || transmittance < 0.015) break;
      vec3 pos = ro + rd * t;

      // Bulut katmanı dışındaysak büyük adım at (60 FPS sırrı!)
      if (pos.y < -4.2 || pos.y > 7.4) {
        t += 0.45;
        continue;
      }

      float rainCore = 0.0;
      float hNorm = 0.5;
      float dens = sampleSupercell(pos, true, rainCore, hNorm);

      if (dens > 0.008) {
        // 5 kademeli güneşe doğru yüksek çözünürlüklü gölge + yerel karnabahar tomurcuk rölyefi!
        float dR = 0.0;
        float dH = 0.0;
        float dSunMicro = sampleSupercell(pos + sunDir * 0.16, true, dR, dH);
        float sunOd = dSunMicro * 0.36;
        sunOd += sampleSupercell(pos + sunDir * 0.46, true, dR, dH) * 0.55;
        sunOd += sampleSupercell(pos + sunDir * 1.05, false, dR, dH) * 0.85;
        sunOd += sampleSupercell(pos + sunDir * 2.15, false, dR, dH) * 1.1;
        sunOd += sampleSupercell(pos + sunDir * 3.85, false, dR, dH) * 1.3;

        // Fiziksel yerel tomurcuk eğimi (güneş gören sırtlar parlak fildişi-altın, oyuklar derin gölge!)
        float sunCrest = clamp((dens - dSunMicro) * 0.42, -0.22, 0.82);

        // 3-Oktav Enerji Koruyan Chiaroscuro Çoklu Saçılım
        float ms =
          exp(-sunOd * 2.45) * phase * (1.0 + sunCrest * 0.72) +
          exp(-sunOd * 0.78) * 0.36 * mix(0.55, phase, 0.45) +
          exp(-sunOd * 0.24) * 0.12;

        // Keskin Powder kenar kabartması
        float powder = 1.0 - 0.76 * exp(-dens * 3.6);
        vec3 directSun = uSunLightCol * ms * powder * 0.94;

        // Dramatik derin fırtına karnı vs. üst gökyüzü safir ortamı (tomurcuk çukurlarında ekstra AO)
        float localAo = mix(0.55, 1.08, smoothstep(-0.22, 0.45, sunCrest));
        vec3 ambient = mix(uCloudBellyDark, uCloudAmbientTop, pow(hNorm, 1.48)) * localAo;
        float bellyZone = smoothstep(0.52, 0.06, hNorm) * smoothstep(0.0, 0.16, hNorm);
        ambient += uHailTint * bellyZone * (0.65 + exp(-sunOd * 0.5) * 0.82);

        if (rainCore > 0.04) {
          ambient = mix(ambient, uCloudBellyDark * 0.72 + vec3(0.01, 0.018, 0.03), 0.65);
        }

        // Bulut içi gerçek 3D şimşek saçılımı (içi alevlenen kümülonimbus!)
        vec3 boltScatter = vec3(0.0);
        if (uLightningFlash > 0.01) {
          vec3 toBolt = pos - uLightningPos;
          float distSq = dot(toBolt, toBolt);
          float inCloudGlow = uLightningFlash / (1.0 + distSq * 0.06);
          boltScatter = uLightningColor * inCloudGlow * (3.1 + 2.5 * exp(-dens * 0.65));
        }

        vec3 sampleCol = ambient + directSun + boltScatter;

        // Çok hafif atmosferik derinlik (bulut kontrastını asla soldurmaz!)
        float aerialFog = 1.0 - exp(-t * 0.01);
        sampleCol = mix(sampleCol, uSkyHorizon * 0.8, aerialFog * 0.16);

        float stepDt = 0.18;
        float alpha = 1.0 - exp(-dens * stepDt * 1.75);
        accumLight += transmittance * sampleCol * alpha;
        transmittance *= (1.0 - alpha);
        t += stepDt;
      } else {
        t += 0.34;
      }
    }

    vec3 finalCol = accumLight + bgCol * transmittance;

    // Supersonik dalışın sonunda bulut tabanı açılırken doğal bulut sisi aydınlığı
    float diveFade = smoothstep(0.56, 0.98, uDive);
    finalCol = mix(finalCol, mix(uCloudAmbientTop * 0.85, uSkyHorizon, 0.55), diveFade * 0.52);

    fragColor = vec4(max(finalCol, vec3(0.0)), 1.0);
  }
`;

/**
 * pmndrs postprocessing özel sinema efekti:
 * - Yalnızca ekranın dış kenarlarında süzülen ince kırınımlı lens yağmur damlacıkları
 * - Dalış anında radyal hız bulanıklığı + hafif optik kenar ayrışması
 * - Ultra-ince 35mm organik film greni
 */
const CINEMA_LENS_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uDive;
  uniform float uRain;
  uniform float uFlash;

  float dropHash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec2 rainDropOffset(vec2 uv, float t) {
    vec2 aspect = vec2(2.4, 1.0);
    vec2 st = uv * aspect * vec2(5.5, 4.2);
    float colShift = dropHash(vec2(floor(st.x), 1.7));
    st.y += t * (0.28 + colShift * 0.22) + colShift * 6.0;
    vec2 cell = floor(st);
    vec2 f = fract(st) - 0.5;

    float rnd = dropHash(cell);
    // Damlaların %62'si boş kalsın — sadece birkaç zarif damla
    if (rnd < 0.62) return vec2(0.0);

    float xWobble = sin(st.y * 2.2 + rnd * 12.0) * 0.16;
    float ySlide = -fract(t * 0.18 + rnd) * 0.5 + 0.25;
    vec2 dPos = vec2(f.x - xWobble, (f.y - ySlide) * 1.45);
    float d = length(dPos);
    float mask = smoothstep(0.22, 0.05, d);
    return dPos * mask * 0.042;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 sampleUv = uv;

    // Yalnızca sol/sağ dış %18 kenarlarda ince lens yağmur damlası kırınımı (orta başlığı asla bozmaz!)
    float edgeMask = smoothstep(0.28, 0.47, abs(uv.x - 0.5)) * uRain * (1.0 - uDive);
    if (edgeMask > 0.01) {
      vec2 dropOff = rainDropOffset(uv, uTime) * edgeMask;
      sampleUv = clamp(uv - dropOff, 0.001, 0.999);
    }

    vec2 toEdge = sampleUv - vec2(0.5);
    vec3 col;

    // Supersonik dalışta radyal hız bulanıklığı + ince kromatik kırılma
    float radial = uDive * 0.048;
    float chroma = uDive * 0.008 + uFlash * 0.002;
    if (radial > 0.002) {
      vec3 acc = vec3(0.0);
      for (int i = 0; i < 6; i++) {
        float fi = float(i) / 5.0;
        vec2 o = sampleUv - toEdge * (fi * radial);
        acc.r += texture2D(inputBuffer, clamp(o + toEdge * chroma, 0.001, 0.999)).r;
        acc.g += texture2D(inputBuffer, clamp(o, 0.001, 0.999)).g;
        acc.b += texture2D(inputBuffer, clamp(o - toEdge * chroma, 0.001, 0.999)).b;
      }
      col = acc / 6.0;
    } else if (chroma > 0.0005 || edgeMask > 0.01) {
      col.r = texture2D(inputBuffer, clamp(sampleUv + toEdge * chroma, 0.001, 0.999)).r;
      col.g = texture2D(inputBuffer, sampleUv).g;
      col.b = texture2D(inputBuffer, clamp(sampleUv - toEdge * chroma, 0.001, 0.999)).b;
    } else {
      col = inputColor.rgb;
    }

    // Ultra-ince organik 35mm film greni
    float grain = (dropHash(uv * 900.0 + fract(uTime * 17.0)) - 0.5) * 0.014;
    outputColor = vec4(max(col + grain, vec3(0.0)), inputColor.a);
  }
`;

class CinemaStormEffect extends Effect {
  constructor() {
    super("CinemaStormEffect", CINEMA_LENS_FRAGMENT, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform<number>>([
        ["uTime", new THREE.Uniform(0)],
        ["uDive", new THREE.Uniform(0)],
        ["uRain", new THREE.Uniform(0.6)],
        ["uFlash", new THREE.Uniform(0)]
      ])
    });
  }
}

type NaturalLightningEvent = {
  kind: "sheet" | "cloud-to-sea" | "anvil-crawler";
  group: THREE.Group | null;
  materials: THREE.MeshBasicMaterial[];
  life: number;
  maxLife: number;
  origin: THREE.Vector3;
  strikeXZ: THREE.Vector2;
  color: THREE.Color;
  peakIntensity: number;
};

/**
 * Özyinelemeli Midpoint-Displacement Fraktal Yıldırım Yolu (Organik Keskin Kırılmalar!)
 */
function buildFractalPath(
  start: THREE.Vector3,
  end: THREE.Vector3,
  generations: number,
  jitterScale: number
): THREE.Vector3[] {
  let pts: THREE.Vector3[] = [start.clone(), end.clone()];
  let disp = jitterScale;
  for (let g = 0; g < generations; g++) {
    const next: THREE.Vector3[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.x += (Math.random() - 0.5) * disp;
      mid.y += (Math.random() - 0.5) * disp * 0.35;
      mid.z += (Math.random() - 0.5) * disp * 0.6;
      next.push(mid, b);
    }
    pts = next;
    disp *= 0.54;
  }
  return pts;
}

function buildTaperedBoltRibbon(
  points: THREE.Vector3[],
  wStart: number,
  wEnd: number,
  color: THREE.Color,
  opacity: number
): { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial } {
  const n = points.length;
  const positions = new Float32Array(n * 2 * 3);
  const indices: number[] = [];
  const side = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const camFwd = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const halfW = THREE.MathUtils.lerp(wStart, wEnd, t) * 0.5;
    if (i < n - 1) tangent.subVectors(points[i + 1], points[i]).normalize();
    else if (i > 0) tangent.subVectors(points[i], points[i - 1]).normalize();

    side.crossVectors(tangent, camFwd);
    if (side.lengthSq() < 0.0001) side.set(1, 0, 0);
    else side.normalize();

    const p = points[i];
    positions[i * 6 + 0] = p.x - side.x * halfW;
    positions[i * 6 + 1] = p.y - side.y * halfW;
    positions[i * 6 + 2] = p.z - side.z * halfW;
    positions[i * 6 + 3] = p.x + side.x * halfW;
    positions[i * 6 + 4] = p.y + side.y * halfW;
    positions[i * 6 + 5] = p.z + side.z * halfW;

    if (i < n - 1) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false // HDR > 1.0 -> BloomEffect doğal sinema halesi oluşturur!
  });
  return { mesh: new THREE.Mesh(geo, mat), mat };
}

function buildNaturalFractalBolt(
  start: THREE.Vector3,
  end: THREE.Vector3,
  tint: THREE.Color,
  horizontal = false,
  scale = 1.0
): { group: THREE.Group; materials: THREE.MeshBasicMaterial[] } {
  const group = new THREE.Group();
  const materials: THREE.MeshBasicMaterial[] = [];

  const mainPts = buildFractalPath(start, end, 4, (horizontal ? 1.8 : 1.45) * scale);

  // HDR yüksek parlaklık renkleri (kor beyaz çekirdek + ince doğal atmosferik mavi-beyaz hale)
  const coreHdr = new THREE.Color(3.6, 3.8, 4.1);
  const haloHdr = tint.clone().multiplyScalar(1.55);

  const outer = buildTaperedBoltRibbon(
    mainPts,
    (horizontal ? 0.14 : 0.2) * scale,
    0.045 * scale,
    haloHdr,
    0.42
  );
  const core = buildTaperedBoltRibbon(
    mainPts,
    (horizontal ? 0.042 : 0.06) * scale,
    0.014 * scale,
    coreHdr,
    1.0
  );
  group.add(outer.mesh, core.mesh);
  materials.push(outer.mat, core.mat);

  // Doğal dallanan ikincil & üçüncül fraktal çatallar
  const branchCount = horizontal ? 5 : 6;
  for (let b = 0; b < branchCount; b++) {
    const idx = Math.floor(
      THREE.MathUtils.lerp(2, mainPts.length - 4, (b + 0.35 + Math.random() * 0.4) / branchCount)
    );
    const origin = mainPts[idx];
    const dir = horizontal
      ? new THREE.Vector3(
          (Math.random() - 0.5) * 3.4 * scale,
          (Math.random() - 0.5) * 1.1 * scale,
          (Math.random() - 0.5) * 1.4 * scale
        )
      : new THREE.Vector3(
          (Math.random() - 0.5) * 2.9 * scale,
          (-0.75 - Math.random() * 1.5) * scale,
          (Math.random() - 0.5) * 1.3 * scale
        );
    const bEnd = origin.clone().add(dir);
    const bPts = buildFractalPath(origin, bEnd, 3, 0.55 * scale);
    const bOuter = buildTaperedBoltRibbon(bPts, 0.075 * scale, 0.012 * scale, haloHdr, 0.38);
    const bCore = buildTaperedBoltRibbon(bPts, 0.025 * scale, 0.005 * scale, coreHdr, 0.9);
    group.add(bOuter.mesh, bCore.mesh);
    materials.push(bOuter.mat, bCore.mat);

    // İnce üçüncül kırık dal
    if (bPts.length > 4 && Math.random() < 0.65) {
      const subOrig = bPts[Math.floor(bPts.length * 0.45)];
      const subEnd = subOrig
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 1.4 * scale,
            (-0.35 - Math.random() * 0.6) * scale,
            (Math.random() - 0.5) * 0.6 * scale
          )
        );
      const subPts = buildFractalPath(subOrig, subEnd, 2, 0.28 * scale);
      const subMesh = buildTaperedBoltRibbon(subPts, 0.016 * scale, 0.004 * scale, coreHdr, 0.72);
      group.add(subMesh.mesh);
      materials.push(subMesh.mat);
    }
  }

  return { group, materials };
}

function disposeBoltGroup(group: THREE.Group) {
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    }
  });
}

function createMistTexture(): THREE.CanvasTexture {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(s / 2, s / 2, 4, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(210, 224, 240, 0.24)");
    g.addColorStop(0.5, "rgba(180, 198, 220, 0.09)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export type CumulusIntro3DProps = {
  stageId: string;
  onSelectStage: (stageId: string) => void;
  windBadgeText: string;
  windKmh: number;
  pressureHpa?: number;
  capeJkg?: number | null;
  totalWins: number;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  onStartDive: () => void;
  onDiveReveal?: () => void;
  onComplete: () => void;
  onSkip: () => void;
};

export default function CumulusIntro3D({
  stageId,
  onSelectStage,
  windBadgeText,
  windKmh,
  pressureHpa,
  totalWins,
  sfxEnabled,
  onToggleSfx,
  onStartDive,
  onDiveReveal,
  onComplete,
  onSkip
}: CumulusIntro3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [diving, setDiving] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [audioLive, setAudioLive] = useState(false);
  const [divePhaseText, setDivePhaseText] = useState("BAROMETRİK ŞOK · GÖZ KİLİTLENDİ");

  const divingRef = useRef(false);
  const diveStartRef = useRef(0);
  const completedRef = useRef(false);
  const revealFiredRef = useRef(false);
  const windKmhRef = useRef(windKmh);
  const stageIdRef = useRef(stageId);
  const sfxRef = useRef(sfxEnabled);
  const pointerRef = useRef({ tx: 0, ty: 0, x: 0, y: 0 });
  const manualBoltReqRef = useRef<{ ndcX: number; ndcY: number } | null>(null);
  const thunderShakeRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const onDiveRevealRef = useRef(onDiveReveal);

  useEffect(() => {
    windKmhRef.current = windKmh;
  }, [windKmh]);

  useEffect(() => {
    stageIdRef.current = stageId;
  }, [stageId]);

  useEffect(() => {
    sfxRef.current = sfxEnabled;
    if (!sfxEnabled) {
      queueMicrotask(() => setAudioLive(false));
    }
  }, [sfxEnabled]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onDiveRevealRef.current = onDiveReveal;
  }, [onDiveReveal]);

  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), 240);
    return () => window.clearTimeout(id);
  }, []);

  // Sayfaya kullanıcı etkileşimiyle gelindiyse gerçek fırtına sesini yumuşak fade-in ile otomatik başlat!
  useEffect(() => {
    let active = true;
    const tryStartAudio = async () => {
      if (!sfxRef.current) return;
      const running = await cumulusAudio.startIntroAmbience();
      if (active) setAudioLive(running);
    };
    void tryStartAudio();

    const unlockOnGesture = () => {
      if (!sfxRef.current) return;
      void cumulusAudio.startIntroAmbience().then((ok) => {
        if (active && ok) setAudioLive(true);
      });
    };
    window.addEventListener("pointerdown", unlockOnGesture, { once: true });
    window.addEventListener("keydown", unlockOnGesture, { once: true });
    return () => {
      active = false;
      window.removeEventListener("pointerdown", unlockOnGesture);
      window.removeEventListener("keydown", unlockOnGesture);
    };
  }, []);

  const triggerDive = () => {
    if (divingRef.current) return;
    divingRef.current = true;
    diveStartRef.current = performance.now();
    setDiving(true);
    setDivePhaseText("BAROMETRİK ŞOK · GÖZ KİLİTLENDİ");
    onStartDive();
  };

  const handleSelectStage = (nextId: string, idx: number) => {
    if (sfxRef.current) {
      void cumulusAudio.startIntroAmbience().then((ok) => {
        if (ok) setAudioLive(true);
      });
      cumulusAudio.playStageSelect(idx);
    }
    onSelectStage(nextId);
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

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch {
      queueMicrotask(() => setWebglFailed(true));
      return;
    }

    if (!renderer.capabilities.isWebGL2) {
      renderer.dispose();
      queueMicrotask(() => setWebglFailed(true));
      return;
    }

    let currentDpr = Math.min(window.devicePixelRatio || 1, 1.25);
    renderer.setPixelRatio(currentDpr);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping; // Tone mapping postprocessing AgX tarafından yapılır
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // WebGL2 Nubis 3D hacim dokuları (modül önbellekli singleton)
    const volumes = getNubisCloudTextures();
    const initLook = STAGE_LOOKS[stageIdRef.current] ?? STAGE_LOOKS.marmara;

    // --- PASS 1: WEBGL2 NUBIS VOLÜMETRİK SÜPER HÜCRE + GERSTNER FIRTINA DENİZİ ---
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const bgUniforms = {
      uBaseVolume: { value: volumes.baseVolume },
      uDetailVolume: { value: volumes.detailVolume },
      uBlueNoise: { value: volumes.blueNoise },
      uResolution: { value: new THREE.Vector2(1024, 576) },
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3(0, 2.5, 8.0) },
      uCamForward: { value: new THREE.Vector3(0, 0, -1) },
      uCamRight: { value: new THREE.Vector3(1, 0, 0) },
      uCamUp: { value: new THREE.Vector3(0, 1, 0) },
      uTanHalfFov: { value: Math.tan((48 * Math.PI) / 360) },
      uLightningPos: { value: new THREE.Vector3(0.4, 1.2, -12.8) },
      uLightningColor: { value: new THREE.Vector3(...initLook.boltTint) },
      uLightningFlash: { value: 0 },
      uStrikeXZ: { value: new THREE.Vector2(0.4, -12.8) },
      uStrikeGlow: { value: 0 },
      uDive: { value: 0 },
      uWindSpeed: { value: Math.max(12, windKmhRef.current) },
      uSkyZenith: { value: new THREE.Vector3(...initLook.skyZenith) },
      uSkyHorizon: { value: new THREE.Vector3(...initLook.skyHorizon) },
      uSunHorizonGlow: { value: new THREE.Vector3(...initLook.sunHorizonGlow) },
      uSunLightCol: { value: new THREE.Vector3(...initLook.sunLightCol) },
      uCloudAmbientTop: { value: new THREE.Vector3(...initLook.cloudAmbientTop) },
      uCloudBellyDark: { value: new THREE.Vector3(...initLook.cloudBellyDark) },
      uHailTint: { value: new THREE.Vector3(...initLook.hailTint) },
      uSunDir: { value: new THREE.Vector3(...initLook.sunDir) },
      uStormDensity: { value: initLook.stormDensity },
      uShearTilt: { value: initLook.shearTilt },
      uIsNight: { value: initLook.isNight }
    };

    const bgGeo = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: NUBIS_VERTEX_GLSL3,
      fragmentShader: NUBIS_FRAGMENT_GLSL3,
      uniforms: bgUniforms,
      depthTest: false,
      depthWrite: false
    });
    bgScene.add(new THREE.Mesh(bgGeo, bgMat));

    // --- PASS 2: ORGANİK ÖN PLAN (3D FRAKTAL YILDIRIM + EĞİMLİ YAĞMUR ŞERİTLERİ + SÜRÜKLENEN SİS) ---
    const fgScene = new THREE.Scene();
    const fgCamera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 140);

    // 2A. Rüzgarla Eğimli Yumuşak Uçlu 3D Yağmur İplikçikleri (2-segment 0->parlak->0 fade, keskin beyaz çizik YOK!)
    const RAIN_COUNT = 120;
    const rainPositions = new Float32Array(RAIN_COUNT * 4 * 3); // 2 line segments (4 vertices) per streak
    const rainColors = new Float32Array(RAIN_COUNT * 4 * 3);
    const rainSeeds: Array<{ x: number; y: number; z: number; spd: number; len: number; alpha: number }> = [];
    for (let i = 0; i < RAIN_COUNT; i++) {
      const alpha = 0.25 + Math.random() * 0.45;
      rainSeeds.push({
        x: (Math.random() - 0.5) * 24,
        y: (Math.random() - 0.3) * 12,
        z: -12 + Math.random() * 18,
        spd: 10.5 + Math.random() * 8.0,
        len: 0.38 + Math.random() * 0.52,
        alpha
      });
      // Segment 1: bottom tip (0) -> center (soft blue-white); Segment 2: center -> top tip (0)
      const base = i * 12;
      const r = 0.72 * alpha;
      const g = 0.8 * alpha;
      const b = 0.92 * alpha;
      // v0 (bottom tip = black -> invisible under AdditiveBlending)
      rainColors[base + 0] = 0;
      rainColors[base + 1] = 0;
      rainColors[base + 2] = 0;
      // v1 (mid)
      rainColors[base + 3] = r;
      rainColors[base + 4] = g;
      rainColors[base + 5] = b;
      // v2 (mid)
      rainColors[base + 6] = r;
      rainColors[base + 7] = g;
      rainColors[base + 8] = b;
      // v3 (top tip = black -> invisible)
      rainColors[base + 9] = 0;
      rainColors[base + 10] = 0;
      rainColors[base + 11] = 0;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
    rainGeo.setAttribute("color", new THREE.BufferAttribute(rainColors, 3));
    const rainMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    fgScene.add(new THREE.LineSegments(rainGeo, rainMat));

    // 2B. Alt Ön Planda Yavaşça Sürüklenen İnce Organik Sis Şeritleri (6 büyük yumuşak tabaka)
    const mistTex = createMistTexture();
    const mistSprites: Array<{ sprite: THREE.Sprite; baseX: number; y: number; z: number; spd: number }> = [];
    const mistMats: THREE.SpriteMaterial[] = [];
    for (let i = 0; i < 6; i++) {
      const mat = new THREE.SpriteMaterial({
        map: mistTex,
        color: 0xa6bbd4,
        transparent: true,
        opacity: 0.14,
        depthWrite: false
      });
      const sp = new THREE.Sprite(mat);
      const scale = 5.5 + (i % 3) * 2.2;
      sp.scale.set(scale * 2.1, scale * 0.72, 1);
      const bx = -10 + i * 4.2;
      const y = -2.35 + (i % 2) * 0.55;
      const z = -4.5 - (i % 3) * 2.4;
      sp.position.set(bx, y, z);
      fgScene.add(sp);
      mistSprites.push({ sprite: sp, baseX: bx, y, z, spd: 0.55 + (i % 3) * 0.25 });
      mistMats.push(mat);
    }

    // --- PASS 3: pmndrs POSTPROCESSING HDR SİNEMA HATTI (MİPMAP BLOOM + AGX + LENS DAMLALARI) ---
    const composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 0
    });

    const bgPass = new RenderPass(bgScene, bgCamera);
    const fgPass = new RenderPass(fgScene, fgCamera);
    fgPass.clear = false;

    const cinemaLensEffect = new CinemaStormEffect();
    const bloomEffect = new BloomEffect({
      mipmapBlur: true,
      luminanceThreshold: 1.08, // Yalnızca gerçek HDR yıldırım/güneş zirveleri parlar — bulutlar net kalır!
      luminanceSmoothing: 0.26,
      intensity: 0.62
    });
    const toneMappingEffect = new ToneMappingEffect({
      mode: ToneMappingMode.AGX
    });
    const vignetteEffect = new VignetteEffect({
      offset: 0.34,
      darkness: 0.56
    });

    const effectPass = new EffectPass(
      fgCamera,
      cinemaLensEffect,
      bloomEffect,
      toneMappingEffect,
      vignetteEffect
    );

    composer.addPass(bgPass);
    composer.addPass(fgPass);
    composer.addPass(effectPass);

    // Simplex-Noise Havadan Uçuş Türbülansı (asla tekrar etmeyen organik kamera hareketi!)
    const noise2D = createNoise2D();

    // 3 Tür Doğal Yıldırım Yöneticisi
    let activeBolt: NaturalLightningEvent | null = null;
    let nextBoltIn = 0.65;
    let strikeGlow = 0;

    const spawnNaturalLightning = (opts?: {
      forceKind?: NaturalLightningEvent["kind"];
      targetNdcX?: number;
      targetNdcY?: number;
      closeDiveBolt?: boolean;
      playAudio?: boolean;
    }) => {
      if (activeBolt?.group) {
        fgScene.remove(activeBolt.group);
        disposeBoltGroup(activeBolt.group);
      }
      activeBolt = null;

      const look = STAGE_LOOKS[stageIdRef.current] ?? STAGE_LOOKS.marmara;
      const tint = new THREE.Color(...look.boltTint);

      let kind: NaturalLightningEvent["kind"];
      if (opts?.forceKind) {
        kind = opts.forceKind;
      } else if (opts?.closeDiveBolt || opts?.targetNdcX !== undefined) {
        kind = "cloud-to-sea";
      } else {
        const roll = Math.random();
        kind = roll < 0.44 ? "sheet" : roll < 0.84 ? "cloud-to-sea" : "anvil-crawler";
      }

      let ox = 0.4;
      let oz = -12.5;
      let startY = 1.6;
      let group: THREE.Group | null = null;
      let materials: THREE.MeshBasicMaterial[] = [];
      let strikeXZ = new THREE.Vector2(0.4, -12.5);
      let maxLife = 0.58;
      let peakIntensity = 1.25;
      let thunderKind: ThunderKind = "deep";
      let distNorm = 0.45;

      if (kind === "sheet") {
        // Bulut içi şimşek (çizgi görünmez, dev bulut kulesi içeriden aydınlanır!)
        const angle = Math.random() * Math.PI * 2;
        const rad = 0.6 + Math.random() * 3.4;
        ox = 0.4 + Math.cos(angle) * rad;
        oz = -12.6 + Math.sin(angle) * rad * 0.7;
        startY = 0.2 + Math.random() * 2.6;
        maxLife = 0.52;
        peakIntensity = 1.15;
        thunderKind = "distant";
        distNorm = 0.68;
      } else if (kind === "anvil-crawler") {
        // Örs altında yatay yayılan örümcek şimşek
        const dirSign = Math.random() < 0.5 ? 1 : -1;
        ox = 0.4 - dirSign * (1.2 + Math.random() * 1.4);
        oz = -11.4 + (Math.random() - 0.5) * 2.0;
        startY = 1.7 + Math.random() * 0.9;
        const start = new THREE.Vector3(ox, startY, oz);
        const end = new THREE.Vector3(
          ox + dirSign * (4.6 + Math.random() * 2.4),
          startY + (Math.random() - 0.5) * 0.65,
          oz + (Math.random() - 0.5) * 1.4
        );
        const built = buildNaturalFractalBolt(start, end, tint, true, 1.0);
        group = built.group;
        materials = built.materials;
        fgScene.add(group);
        maxLife = 0.62;
        peakIntensity = 1.3;
        thunderKind = "deep";
        distNorm = 0.52;
      } else {
        // Fraktal Buluttan-Denize Yıldırım (Cloud-to-Sea)
        let scale = 1.0;
        if (opts?.closeDiveBolt) {
          ox = (Math.random() - 0.5) * 2.2;
          oz = -8.4;
          startY = 2.6;
          scale = 1.3;
          thunderKind = "close";
          distNorm = 0.14;
        } else if (opts?.targetNdcX !== undefined) {
          ox = THREE.MathUtils.clamp(opts.targetNdcX * 7.2, -6.8, 6.8);
          oz = -11.4 + (Math.random() - 0.5) * 1.6;
          startY = Math.max(0.6, 1.9 + (opts.targetNdcY ?? 0) * 1.6);
          scale = 1.12;
          thunderKind = "close";
          distNorm = 0.24;
        } else {
          const angle = Math.random() * Math.PI * 2;
          const rad = 0.9 + Math.random() * 3.1;
          ox = 0.4 + Math.cos(angle) * rad;
          oz = -12.0 + Math.sin(angle) * rad * 0.65;
          startY = 1.4 + Math.random() * 1.1;
          thunderKind = Math.random() < 0.45 ? "close" : "deep";
          distNorm = thunderKind === "close" ? 0.28 : 0.48;
        }

        const start = new THREE.Vector3(ox, startY, oz);
        const end = new THREE.Vector3(
          ox + (Math.random() - 0.5) * 2.2,
          -3.45,
          oz + (Math.random() - 0.5) * 1.4
        );
        const built = buildNaturalFractalBolt(start, end, tint, false, scale);
        group = built.group;
        materials = built.materials;
        fgScene.add(group);
        strikeXZ = new THREE.Vector2(end.x, end.z);
        strikeGlow = 1.0;
        bgUniforms.uStrikeXZ.value.copy(strikeXZ);
        maxLife = 0.64;
        peakIntensity = 1.5;
      }

      activeBolt = {
        kind,
        group,
        materials,
        life: maxLife,
        maxLife,
        origin: new THREE.Vector3(ox, startY * 0.7, oz),
        strikeXZ,
        color: tint,
        peakIntensity
      };

      if (opts?.playAudio && sfxRef.current) {
        const pan = THREE.MathUtils.clamp(ox / 7.0, -0.82, 0.82);
        cumulusAudio.playIntroThunder(distNorm, pan, thunderKind, () => {
          // Gerçek gök gürültüsü kameraya ulaştığı milisaniyede organik akustik şok sarsıntısı!
          thunderShakeRef.current = thunderKind === "close" ? 1.0 : 0.48;
        });
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, Math.round(rect.width));
      const h = Math.max(220, Math.round(rect.height));
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h, false);
      bgUniforms.uResolution.value.set(w * currentDpr, h * currentDpr);
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
    const tmpV3 = new THREE.Vector3();

    let diveBoltFired = false;
    let diveStage2Set = false;
    let avgFrameMs = 16.6;
    let perfCheckTimer = 0;

    let rafId = 0;
    let lastTs = performance.now();
    const startTs = lastTs;

    const animate = (now: number) => {
      if (document.visibilityState === "hidden") {
        lastTs = now;
        rafId = window.requestAnimationFrame(animate);
        return;
      }
      const rawMs = now - lastTs;
      const dt = Math.min(0.05, Math.max(0.001, rawMs / 1000));
      lastTs = now;
      const elapsed = (now - startTs) / 1000;

      // Akıllı Adaptive DPR (~60 FPS sabitleyici)
      avgFrameMs = avgFrameMs * 0.92 + Math.min(60, rawMs) * 0.08;
      perfCheckTimer += dt;
      if (perfCheckTimer > 1.8) {
        perfCheckTimer = 0;
        if (avgFrameMs > 26 && currentDpr > 0.72) {
          currentDpr = Math.max(0.72, Number((currentDpr - 0.14).toFixed(2)));
          resize();
        }
      }

      // Seçili cepheye göre 6 fotoğrafik meteoroloji rejimini yumuşakça morfla
      const look = STAGE_LOOKS[stageIdRef.current] ?? STAGE_LOOKS.marmara;
      const mLerp = Math.min(1, dt * 2.8);
      bgUniforms.uSkyZenith.value.lerp(tmpV3.set(...look.skyZenith), mLerp);
      bgUniforms.uSkyHorizon.value.lerp(tmpV3.set(...look.skyHorizon), mLerp);
      bgUniforms.uSunHorizonGlow.value.lerp(tmpV3.set(...look.sunHorizonGlow), mLerp);
      bgUniforms.uSunLightCol.value.lerp(tmpV3.set(...look.sunLightCol), mLerp);
      bgUniforms.uCloudAmbientTop.value.lerp(tmpV3.set(...look.cloudAmbientTop), mLerp);
      bgUniforms.uCloudBellyDark.value.lerp(tmpV3.set(...look.cloudBellyDark), mLerp);
      bgUniforms.uHailTint.value.lerp(tmpV3.set(...look.hailTint), mLerp);
      bgUniforms.uSunDir.value.lerp(tmpV3.set(...look.sunDir), mLerp).normalize();
      bgUniforms.uStormDensity.value = THREE.MathUtils.lerp(
        bgUniforms.uStormDensity.value,
        look.stormDensity,
        mLerp
      );
      bgUniforms.uShearTilt.value = THREE.MathUtils.lerp(
        bgUniforms.uShearTilt.value,
        look.shearTilt,
        mLerp
      );
      bgUniforms.uIsNight.value = THREE.MathUtils.lerp(
        bgUniforms.uIsNight.value,
        look.isNight,
        mLerp
      );

      pointerRef.current.x += (pointerRef.current.tx - pointerRef.current.x) * Math.min(1, dt * 3.5);
      pointerRef.current.y += (pointerRef.current.ty - pointerRef.current.y) * Math.min(1, dt * 3.5);

      // PERDE 1: Atmosferik Açılış Yaklaşımı (0s -> 2.8s)
      const introProgress = prefersReduced ? 1 : Math.min(1, elapsed / 2.8);
      const introEase = 1 - Math.pow(1 - introProgress, 3);

      // PERDE 3: 3-Aşamalı Bulut Duvarı Dalışı (2.15 sn)
      let diveT = 0;
      if (divingRef.current) {
        diveT = Math.min(1, (now - diveStartRef.current) / 2150);
        if (diveT > 0.24 && !diveStage2Set) {
          diveStage2Set = true;
          setDivePhaseText("SÜPER HÜCRE DUVARINA SUPERSONİK DALIŞ");
        }
        if (diveT > 0.36 && !diveBoltFired) {
          diveBoltFired = true;
          spawnNaturalLightning({ closeDiveBolt: true, playAudio: false });
        }
        if (diveT > 0.66 && !revealFiredRef.current) {
          revealFiredRef.current = true;
          setDivePhaseText("BULUT TABANI AÇILIYOR · CEPHEYE İNİŞ");
          setFadeOut(true);
          onDiveRevealRef.current?.();
        }
        if (diveT >= 1 && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
          return;
        }
      }

      const divePush =
        diveT < 0.2
          ? -Math.sin((diveT / 0.2) * Math.PI) * 0.06
          : Math.pow((diveT - 0.2) / 0.8, 2.05);
      const diveClamp = Math.max(0, divePush);

      // PERDE 2 (BEKLEME): 26s Yaşayan Havadan Sinema Yörüngesi + Simplex-Noise Türbülans!
      const orbitAngle = prefersReduced
        ? 0
        : Math.sin(elapsed * 0.24) * 0.38 + noise2D(elapsed * 0.06, 1.3) * 0.14;
      const orbitRadius =
        THREE.MathUtils.lerp(22.4, 19.6, introEase) + noise2D(elapsed * 0.08, 4.7) * 0.65;

      // Gerçek helikopter/uçak mikro hava boşluğu türbülansı
      const turbX = prefersReduced ? 0 : noise2D(elapsed * 0.42, 10.1) * 0.16;
      const turbY = prefersReduced ? 0 : noise2D(elapsed * 0.48, 22.4) * 0.12;
      const turbRoll = prefersReduced ? 0 : noise2D(elapsed * 0.35, 35.8) * 0.018;

      // Gök gürültüsü şok dalgası kamera sarsıntısı (hızlı sönümlenir)
      thunderShakeRef.current = Math.max(0, thunderShakeRef.current - dt * 2.8);
      const shockAmt = thunderShakeRef.current * thunderShakeRef.current;
      const shockX = shockAmt > 0.01 ? noise2D(elapsed * 32.0, 5.1) * 0.14 * shockAmt : 0;
      const shockY = shockAmt > 0.01 ? noise2D(elapsed * 34.0, 9.7) * 0.11 * shockAmt : 0;

      const idleX =
        0.4 + Math.sin(orbitAngle) * orbitRadius + pointerRef.current.x * 1.4 + turbX + shockX;
      const idleY =
        THREE.MathUtils.lerp(3.1, 0.32, introEase) +
        Math.sin(elapsed * 0.17) * 0.55 -
        pointerRef.current.y * 0.52 +
        turbY +
        shockY;
      const idleZ = -12.8 + Math.cos(orbitAngle) * orbitRadius;

      const camX = THREE.MathUtils.lerp(idleX, 0.4 + Math.sin(diveClamp * Math.PI) * 0.55, diveClamp);
      const camY = THREE.MathUtils.lerp(idleY, 1.6 - diveClamp * 3.8, diveClamp);
      const camZ = THREE.MathUtils.lerp(idleZ, -12.2, divePush);

      const targetX = THREE.MathUtils.lerp(0.45 + pointerRef.current.x * 0.6, 0.45, diveClamp);
      const targetY = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(1.55, 1.15, introEase) - pointerRef.current.y * 0.38,
        -5.8,
        Math.pow(diveClamp, 1.3)
      );
      const targetZ = THREE.MathUtils.lerp(-13.2, -15.0, diveClamp);

      fgCamera.position.set(camX, camY, camZ);
      lookTarget.set(targetX, targetY, targetZ);
      fgCamera.lookAt(lookTarget);

      const bank =
        -Math.cos(elapsed * 0.24) * 0.022 -
        pointerRef.current.x * 0.042 +
        turbRoll +
        Math.sin(diveClamp * Math.PI) * 0.22 +
        shockX * 0.25;
      fgCamera.rotateZ(bank);

      const nextFov = THREE.MathUtils.lerp(48, 84, Math.pow(diveClamp, 1.15));
      if (Math.abs(fgCamera.fov - nextFov) > 0.05) {
        fgCamera.fov = nextFov;
        fgCamera.updateProjectionMatrix();
      }

      fgCamera.updateMatrixWorld();
      forwardVec.set(0, 0, -1).applyQuaternion(fgCamera.quaternion).normalize();
      rightVec.set(1, 0, 0).applyQuaternion(fgCamera.quaternion).normalize();
      upVec.set(0, 1, 0).applyQuaternion(fgCamera.quaternion).normalize();

      bgUniforms.uTime.value = elapsed;
      bgUniforms.uCamPos.value.copy(fgCamera.position);
      bgUniforms.uCamForward.value.copy(forwardVec);
      bgUniforms.uCamRight.value.copy(rightVec);
      bgUniforms.uCamUp.value.copy(upVec);
      bgUniforms.uTanHalfFov.value = Math.tan((fgCamera.fov * Math.PI) / 360);
      bgUniforms.uDive.value = diveClamp;
      bgUniforms.uWindSpeed.value = Math.max(12, windKmhRef.current);

      strikeGlow = Math.max(0, strikeGlow - dt * 1.9);
      bgUniforms.uStrikeGlow.value = strikeGlow;

      // Yıldırım tetikleme (manuel gökyüzü tıklaması veya doğal aralık)
      if (manualBoltReqRef.current && !divingRef.current) {
        const req = manualBoltReqRef.current;
        manualBoltReqRef.current = null;
        spawnNaturalLightning({
          forceKind: "cloud-to-sea",
          targetNdcX: req.ndcX,
          targetNdcY: req.ndcY,
          playAudio: true
        });
        nextBoltIn = look.boltRateSec * (0.95 + Math.random() * 0.9);
      } else {
        nextBoltIn -= dt;
        if (nextBoltIn <= 0 && !divingRef.current) {
          spawnNaturalLightning({ playAudio: elapsed > 0.9 });
          nextBoltIn = look.boltRateSec * (0.75 + Math.random() * 1.15);
        }
      }

      // Gerçekçi çoklu geri-darbe (return-stroke) yıldırım zarfı
      if (activeBolt) {
        activeBolt.life -= dt;
        const r = Math.max(0, activeBolt.life / activeBolt.maxLife);
        const flicker =
          r > 0.78
            ? 1.0
            : r > 0.64
              ? 0.24
              : r > 0.48
                ? 0.92
                : r > 0.34
                  ? 0.18
                  : r > 0.22
                    ? 0.6
                    : r * 2.4;

        for (const m of activeBolt.materials) {
          m.opacity = Math.min(1, flicker);
        }

        bgUniforms.uLightningPos.value.copy(activeBolt.origin);
        bgUniforms.uLightningColor.value.set(
          activeBolt.color.r,
          activeBolt.color.g,
          activeBolt.color.b
        );
        bgUniforms.uLightningFlash.value = flicker * activeBolt.peakIntensity;

        if (activeBolt.life <= 0) {
          if (activeBolt.group) {
            fgScene.remove(activeBolt.group);
            disposeBoltGroup(activeBolt.group);
          }
          activeBolt = null;
          bgUniforms.uLightningFlash.value = 0;
        }
      } else {
        bgUniforms.uLightningFlash.value *= 0.84;
      }

      // 3D Eğimli Yumuşak Uçlu Rüzgarlı Yağmur İplikçikleri (şeffaf uçlar, şimşek ve dalışta parlar!)
      const rainAttr = rainGeo.getAttribute("position") as THREE.BufferAttribute;
      const windTilt = (look.shearTilt >= 0 ? 1 : -1) * (0.28 + windKmhRef.current * 0.008);
      const speedMult = 1 + diveClamp * 2.5;
      rainMat.opacity =
        (0.032 + look.rainIntensity * 0.062 + bgUniforms.uLightningFlash.value * 0.14 + diveClamp * 0.14) *
        (1 - diveClamp * 0.2);

      for (let i = 0; i < RAIN_COUNT; i++) {
        const s = rainSeeds[i];
        s.y -= s.spd * speedMult * dt;
        s.x += windTilt * s.spd * 0.45 * dt;
        s.z += diveClamp * 26 * dt;
        if (s.y < -4.2 || s.z > fgCamera.position.z + 1.5) {
          s.y = 5.6 + Math.random() * 2.6;
          s.x = fgCamera.position.x + (Math.random() - 0.5) * 22;
          s.z = fgCamera.position.z - 2.6 - Math.random() * 14;
        }
        const len = s.len * (1 + diveClamp * 2.9);
        const dx = windTilt * len * 0.45;
        const midX = s.x - dx * 0.5;
        const midY = s.y + len * 0.5;
        const topX = s.x - dx;
        const topY = s.y + len;
        const vBase = i * 4;
        rainAttr.setXYZ(vBase + 0, s.x, s.y, s.z);
        rainAttr.setXYZ(vBase + 1, midX, midY, s.z);
        rainAttr.setXYZ(vBase + 2, midX, midY, s.z);
        rainAttr.setXYZ(vBase + 3, topX, topY, s.z);
      }
      rainAttr.needsUpdate = true;

      // Alt Ön Planda Sürüklenen İnce Sis Tabakaları
      for (let i = 0; i < mistSprites.length; i++) {
        const m = mistSprites[i];
        const drift = ((elapsed * m.spd + i * 3.7) % 24) - 12;
        m.sprite.position.set(drift, m.y + Math.sin(elapsed * 0.4 + i) * 0.18, m.z);
        mistMats[i].opacity =
          (0.08 + look.rainIntensity * 0.08 + bgUniforms.uLightningFlash.value * 0.09) *
          (1 - diveClamp);
      }

      // Postprocessing uniform güncellemesi
      const uTimeEff = cinemaLensEffect.uniforms.get("uTime");
      const uDiveEff = cinemaLensEffect.uniforms.get("uDive");
      const uRainEff = cinemaLensEffect.uniforms.get("uRain");
      const uFlashEff = cinemaLensEffect.uniforms.get("uFlash");
      if (uTimeEff) uTimeEff.value = elapsed;
      if (uDiveEff) uDiveEff.value = diveClamp;
      if (uRainEff) uRainEff.value = look.rainIntensity;
      if (uFlashEff) uFlashEff.value = bgUniforms.uLightningFlash.value;

      composer.render(dt);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      cumulusAudio.stopIntroAmbience(0.22);
      roObs.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      if (activeBolt?.group) {
        disposeBoltGroup(activeBolt.group);
      }
      bgGeo.dispose();
      bgMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      mistMats.forEach((m) => m.dispose());
      mistTex.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const selectedStage =
    CUMULUS_STAGES.find((s) => s.id === stageId) ?? CUMULUS_STAGES[0];
  const activeLook = STAGE_LOOKS[stageId] ?? STAGE_LOOKS.marmara;

  const handleRootSkyPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (divingRef.current) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button")) return;
    if (sfxRef.current) {
      void cumulusAudio.startIntroAmbience().then((ok) => {
        if (ok) setAudioLive(true);
      });
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    const ndcY = -(((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2);
    manualBoltReqRef.current = { ndcX, ndcY };
  };

  return (
    <div
      onPointerDown={handleRootSkyPointer}
      className={`absolute inset-0 z-30 overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {!webglFailed ? (
        <div
          ref={containerRef}
          className="h-full w-full cursor-crosshair"
          title="Gökyüzüne tıkla: doğal yıldırım çaktır"
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,#1f2c3f_0%,#0c1524_52%,#050912_100%)]" />
      )}

      {/* Sinematik Film Açılış Arayüzü (Sıfır AI Klişesi — Saf Tipografi + Füme Obsidyen Cam) */}
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col justify-between gap-3 p-4 sm:p-7 transition-all duration-500 ${
          diving ? "scale-105 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Minimal Üst Telemetri & Gerçek Fırtına Sesi */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 transition-all duration-700 ${
            revealed ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] text-slate-200/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-100/85" />
            <span>{windBadgeText}</span>
            {pressureHpa !== undefined && (
              <span className="hidden sm:inline text-slate-300/75">
                · {Math.round(pressureHpa)} hPa
              </span>
            )}
            {totalWins > 0 && (
              <span className="hidden md:inline text-amber-200/85">
                · {totalWins} Zafer
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const nextOn = !sfxEnabled;
              onToggleSfx();
              if (nextOn) {
                void cumulusAudio.startIntroAmbience().then((ok) => {
                  if (ok) setAudioLive(true);
                });
              } else {
                setAudioLive(false);
              }
            }}
            aria-label={sfxEnabled ? "Fırtına sesini kapat" : "Fırtına sesini aç"}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-[#050912]/65 px-3.5 py-1.5 font-mono text-[11px] text-slate-100 transition-colors hover:border-white/35 hover:bg-[#050912]/85"
          >
            {sfxEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-slate-100" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>
              {!sfxEnabled
                ? "Sessiz"
                : audioLive
                  ? "Fırtına Sesi · Açık"
                  : "Sesi Başlat"}
            </span>
          </button>
        </div>

        {/* Sinematik Film Başlığı & Mimari Füme Cam Aksiyon */}
        <div
          className={`mx-auto flex max-w-xl flex-col items-center px-4 text-center transition-all duration-1000 ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-slate-200/80 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            {activeLook.tagline}
          </p>

          <h2 className="mt-1.5 sm:mt-2 font-display text-4xl font-bold tracking-[0.26em] sm:tracking-[0.30em] text-white drop-shadow-[0_14px_42px_rgba(0,0,0,0.95)] sm:text-6xl">
            CUMULUS
          </h2>

          <p className="mt-1.5 font-mono text-[11px] tracking-[0.44em] text-slate-200/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            BULUT SAVAŞI
          </p>

          <div className="pointer-events-auto mt-4 sm:mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={triggerDive}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-white/35 bg-[#070d19]/72 px-8 py-3.5 text-xs font-semibold tracking-[0.22em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-white/70 hover:bg-[#0b1324]/86 active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Play className="h-3.5 w-3.5 fill-white transition-transform duration-200 group-hover:translate-x-0.5" />
              <span>SAVAŞA BAŞLA</span>
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="rounded-full border border-white/15 bg-[#050912]/50 px-5 py-3.5 text-xs font-medium tracking-wider text-slate-200/90 transition-colors hover:border-white/35 hover:bg-[#050912]/80 hover:text-white"
            >
              Hızlı Geç
            </button>
          </div>

          <p className="mt-3.5 font-mono text-[10px] tracking-[0.16em] text-slate-200/65 drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
            GÖKYÜZÜNE TIKLA: YILDIRIM ÇAKTIR · CEPHE SEÇ: SÜPER HÜCRE DÖNÜŞÜR
          </p>
        </div>

        {/* Alt 6-Cephe Film Şeridi Seçici */}
        <div
          className={`pointer-events-auto mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-1.5 transition-all duration-700 ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {CUMULUS_STAGES.map((st, idx) => {
            const active = st.id === stageId;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStage(st.id, idx)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-white/55 bg-white/16 text-white shadow-[0_6px_24px_rgba(0,0,0,0.55)]"
                    : "border-white/12 bg-[#050912]/58 text-slate-200/85 hover:border-white/32 hover:bg-[#050912]/82 hover:text-white"
                }`}
              >
                <span className="font-mono text-[10px] opacity-65">0{st.index}</span>
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

      {/* Supersonik Bulut Dalışı esnasında sade sinematik odak şeridi */}
      {diving && !fadeOut && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
          <div className="rounded-full border border-white/25 bg-[#050912]/72 px-5 py-1.5 font-mono text-[11px] font-medium tracking-[0.26em] text-slate-100">
            {divePhaseText}
          </div>
          <div className="font-mono text-[10px] tracking-[0.32em] text-slate-300/80">
            {selectedStage.name.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}

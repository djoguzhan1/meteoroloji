"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { extractStormSceneDrive } from "@/lib/temporal-view";
import type { SceneAtmosphereInput } from "@/lib/weather-types";

type AtmosphereAudioProps = {
  atmosphere: SceneAtmosphereInput;
  enabled: boolean;
  volume: number;
  muffled: boolean;
  suspended?: boolean;
};

function AtmosphereAudioBase({
  atmosphere,
  enabled,
  volume,
  muffled,
  suspended = false
}: AtmosphereAudioProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const rainBandRef = useRef<BiquadFilterNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);

  const sceneDrive = useMemo(
    () => extractStormSceneDrive(atmosphere),
    [atmosphere]
  );

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();

      const len = ctx.sampleRate * 3;
      const pinkBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const pink = pinkBuffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.0526913;
        pink[i] = (b0 + b1 + b2 + w * 0.1848) * 0.06;
      }

      const rainBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const rain = rainBuffer.getChannelData(0);
      for (let i = 0; i < rain.length; i++) {
        rain[i] = (Math.random() * 2 - 1) * 0.14;
      }

      const windSource = ctx.createBufferSource();
      windSource.buffer = pinkBuffer;
      windSource.loop = true;

      const rainSource = ctx.createBufferSource();
      rainSource.buffer = rainBuffer;
      rainSource.loop = true;

      const rainBand = ctx.createBiquadFilter();
      rainBand.type = "bandpass";
      rainBand.frequency.value = 1800;
      rainBand.Q.value = 0.7;

      const windGain = ctx.createGain();
      windGain.gain.value = 0;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0;

      const mainFilter = ctx.createBiquadFilter();
      mainFilter.type = "lowpass";
      mainFilter.frequency.value = 3400;

      const panner = ctx.createStereoPanner();
      panner.pan.value = 0;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;

      windSource.connect(windGain);
      windGain.connect(mainFilter);

      rainSource.connect(rainBand);
      rainBand.connect(rainGain);
      rainGain.connect(mainFilter);

      mainFilter.connect(panner);
      panner.connect(masterGain);
      masterGain.connect(ctx.destination);

      windSource.start();
      rainSource.start();

      ctxRef.current = ctx;
      masterGainRef.current = masterGain;
      windGainRef.current = windGain;
      rainGainRef.current = rainGain;
      rainBandRef.current = rainBand;
      filterRef.current = mainFilter;
      pannerRef.current = panner;

      return ctx;
    } catch {
      return null;
    }
  }, []);

  // Autoplay Kalkanı: enabled && !suspended iken suspended AudioContext'i ilk etkileşimde uyandırır
  useEffect(() => {
    if (!enabled || suspended) return;

    const ctx = ensureContext();
    if (!ctx) return;

    if (ctx.state !== "suspended") return;

    ctx.resume().catch(() => {});

    const wakeContext = () => {
      window.removeEventListener("pointerdown", wakeContext);
      window.removeEventListener("keydown", wakeContext);
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", wakeContext, {
      once: true,
      passive: true
    });
    window.addEventListener("keydown", wakeContext, {
      once: true,
      passive: true
    });

    return () => {
      window.removeEventListener("pointerdown", wakeContext);
      window.removeEventListener("keydown", wakeContext);
    };
  }, [enabled, suspended, ensureContext]);

  useEffect(() => {
    if (!enabled || suspended) {
      let suspendTimer: number | null = null;
      if (ctxRef.current && masterGainRef.current) {
        const now = ctxRef.current.currentTime;
        masterGainRef.current.gain.cancelScheduledValues(now);
        masterGainRef.current.gain.setValueAtTime(
          masterGainRef.current.gain.value,
          now
        );
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.25);
      }
      if (suspended === true && ctxRef.current?.state === "running") {
        suspendTimer = window.setTimeout(() => {
          if (ctxRef.current?.state === "running") {
            ctxRef.current.suspend().catch(() => {});
          }
        }, 280);
      }
      return () => {
        if (suspendTimer !== null) {
          window.clearTimeout(suspendTimer);
        }
      };
    }

    const ctx = ensureContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const master = masterGainRef.current;
    const windGain = windGainRef.current;
    const rainGain = rainGainRef.current;
    const rainBand = rainBandRef.current;
    const filter = filterRef.current;
    const panner = pannerRef.current;

    if (!master || !windGain || !rainGain || !rainBand || !filter || !panner) {
      return;
    }

    const windNorm = Math.min(1, Math.max(0.12, atmosphere.windSpeed / 65));

    let targetRainGain = 0;
    let isSnowActive = false;

    if (!sceneDrive.isWet || sceneDrive.effectivePrecipType === "none") {
      targetRainGain = 0;
    } else if (sceneDrive.effectivePrecipType === "snow") {
      isSnowActive = true;
      rainBand.frequency.cancelScheduledValues(now);
      rainBand.frequency.linearRampToValueAtTime(760, now + 0.25);
      rainBand.Q.cancelScheduledValues(now);
      rainBand.Q.linearRampToValueAtTime(1.15, now + 0.25);
      targetRainGain =
        Math.min(1, 0.16 + sceneDrive.effectivePrecipIntensity * 0.74) * 0.28;
    } else {
      rainBand.frequency.cancelScheduledValues(now);
      rainBand.frequency.linearRampToValueAtTime(1800, now + 0.25);
      rainBand.Q.cancelScheduledValues(now);
      rainBand.Q.linearRampToValueAtTime(0.7, now + 0.25);
      targetRainGain =
        Math.min(1, 0.18 + sceneDrive.effectivePrecipIntensity * 0.82) * 0.5;
    }

    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(volume * 0.45, now + 0.3);

    windGain.gain.cancelScheduledValues(now);
    windGain.gain.linearRampToValueAtTime(windNorm, now + 0.35);

    rainGain.gain.cancelScheduledValues(now);
    rainGain.gain.linearRampToValueAtTime(targetRainGain, now + 0.35);

    const targetCutoff = muffled ? 620 : isSnowActive ? 2150 : 3400;
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.linearRampToValueAtTime(targetCutoff, now + 0.25);

    const pan = Math.sin((atmosphere.windDirection * Math.PI) / 180) * 0.35;
    panner.pan.cancelScheduledValues(now);
    panner.pan.linearRampToValueAtTime(pan, now + 0.2);
  }, [
    enabled,
    suspended,
    volume,
    muffled,
    atmosphere.windSpeed,
    atmosphere.windDirection,
    sceneDrive.isWet,
    sceneDrive.effectivePrecipType,
    sceneDrive.effectivePrecipIntensity,
    ensureContext
  ]);

  useEffect(() => {
    if (!enabled || suspended || !sceneDrive.canFlashLightning) return;

    const triggerThunder = () => {
      const ctx = ctxRef.current;
      const filter = filterRef.current;
      if (!ctx || !filter || ctx.state !== "running") return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(68, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 1.6);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * 0.28, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(now);
      osc.stop(now + 2.0);
    };

    const intervalMs = Math.max(
      3500,
      Math.round(8500 - sceneDrive.flashFrequencyHz * 1400)
    );

    const timer = window.setInterval(() => {
      if (Math.random() < 0.45) triggerThunder();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [
    enabled,
    suspended,
    sceneDrive.canFlashLightning,
    sceneDrive.flashFrequencyHz,
    volume
  ]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  return null;
}

const AtmosphereAudio = memo(AtmosphereAudioBase);
export default AtmosphereAudio;

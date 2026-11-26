"use client";

import { useCallback, useEffect, useRef } from "react";
import type { SceneAtmosphereInput } from "@/lib/weather-types";

type AtmosphereAudioProps = {
  atmosphere: SceneAtmosphereInput;
  enabled: boolean;
  volume: number;
  muffled: boolean;
};

export default function AtmosphereAudio({
  atmosphere,
  enabled,
  volume,
  muffled
}: AtmosphereAudioProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();

      // 3 saniyelik pembe gürültü (rüzgar katmanı)
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

      // 2 saniyelik beyaz gürültü (yağmur şıpırtısı katmanı)
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
      filterRef.current = mainFilter;
      pannerRef.current = panner;

      return ctx;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (ctxRef.current && masterGainRef.current) {
        const now = ctxRef.current.currentTime;
        masterGainRef.current.gain.cancelScheduledValues(now);
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.25);
      }
      return;
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
    const filter = filterRef.current;
    const panner = pannerRef.current;

    if (!master || !windGain || !rainGain || !filter || !panner) return;

    const windNorm = Math.min(1, Math.max(0.12, atmosphere.windSpeed / 65));
    const rainNorm =
      atmosphere.precipType === "rain"
        ? Math.min(1, Math.max(0.25, atmosphere.precipIntensity))
        : 0;

    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(volume * 0.45, now + 0.3);

    windGain.gain.cancelScheduledValues(now);
    windGain.gain.linearRampToValueAtTime(windNorm, now + 0.35);

    rainGain.gain.cancelScheduledValues(now);
    rainGain.gain.linearRampToValueAtTime(rainNorm * 0.5, now + 0.35);

    const targetCutoff = muffled ? 620 : 3400;
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.linearRampToValueAtTime(targetCutoff, now + 0.25);

    const pan = Math.sin((atmosphere.windDirection * Math.PI) / 180) * 0.35;
    panner.pan.cancelScheduledValues(now);
    panner.pan.linearRampToValueAtTime(pan, now + 0.2);
  }, [
    enabled,
    volume,
    muffled,
    atmosphere.windSpeed,
    atmosphere.windDirection,
    atmosphere.precipType,
    atmosphere.precipIntensity,
    ensureContext
  ]);

  // Fırtına modunda aralıklı düşük frekanslı gök gürültüsü
  useEffect(() => {
    if (!enabled || !atmosphere.isStorm) return;

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

    const timer = window.setInterval(() => {
      if (Math.random() < 0.45) triggerThunder();
    }, 6500);

    return () => window.clearInterval(timer);
  }, [enabled, atmosphere.isStorm, volume]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  return null;
}

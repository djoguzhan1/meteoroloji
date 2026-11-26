/**
 * CUMULUS 3.0 — Gerçek Doğa Kayıtlı Mekânsal Fırtına & Gök Gürültüsü Ses Motoru
 * - Public Domain / CC0 gerçek fırtına yağmuru ve gök gürültüsü kayıtları (/audio/cumulus/*.mp3)
 * - Fiziksel ses-hızı mesafe gecikmesi (önce ışık çakar, ardından gerçek gök gürültüsü gelir)
 * - StereoPannerNode ile yıldırımın 3D X konumuna göre sol/sağ konumlandırma
 * - Her çakışta ince playbackRate & atmosferik mesafe filtresi çeşitliliği
 * - Çevrimdışı / yükleme anında sıfır-hata prosedürel yedek motor
 */

export type ThunderKind = "close" | "deep" | "distant";

const AUDIO_URLS = {
  ambience: "/audio/cumulus/storm-ambience.mp3",
  close: "/audio/cumulus/thunder-close.mp3",
  deep: "/audio/cumulus/thunder-deep.mp3",
  distant: "/audio/cumulus/thunder-distant.mp3"
} as const;

type AudioKey = keyof typeof AUDIO_URLS;

class CumulusAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private lastLaunchAt = 0;
  private lastZapAt = 0;
  private lastReinforceAt = 0;
  private lastThunderAt = 0;

  // Gerçek kaydedilmiş CC0 AudioBuffer önbelleği
  private buffers: Partial<Record<AudioKey, AudioBuffer>> = {};
  private loadingPromise: Promise<void> | null = null;
  private ambienceDesired = false;

  // Açılış atmosfer düğümleri (gerçek kayıt veya yedek)
  private ambienceNodes: {
    master: GainNode;
    sources: AudioScheduledSourceNode[];
    isRealSample: boolean;
  } | null = null;

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) {
      this.ambienceDesired = false;
      this.stopIntroAmbience(0.22);
    }
  }

  isRunning(): boolean {
    return Boolean(this.ctx && this.ctx.state === "running" && this.enabled);
  }

  private getCtx(allowCreate = true): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.ctx && allowCreate) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Gerçek CC0 gök gürültüsü ve yağmur MP3 dosyalarını önbelleğe çeker ve çözer */
  preloadIntroAudio(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      const ctx = this.getCtx(true);
      if (!ctx) return;

      await Promise.all(
        (Object.keys(AUDIO_URLS) as AudioKey[]).map(async (key) => {
          if (this.buffers[key]) return;
          try {
            const res = await fetch(AUDIO_URLS[key]);
            if (!res.ok) return;
            const arr = await res.arrayBuffer();
            const decoded = await ctx.decodeAudioData(arr.slice(0));
            this.buffers[key] = decoded;
          } catch {
            // Çevrimdışı veya ağ hatasında prosedürel yedek devreye girer
          }
        })
      );

      // Eğer gerçek yağmur döngüsü hazır olduysa ve kullanıcı hâlâ introdaysa yumuşakça ona geç
      if (
        this.ambienceDesired &&
        this.enabled &&
        this.buffers.ambience &&
        (!this.ambienceNodes || !this.ambienceNodes.isRealSample)
      ) {
        this.stopIntroAmbience(0.35);
        this.mountRealAmbience();
      }
    })();

    return this.loadingPromise;
  }

  private createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * durationSec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.08 * white) / 1.08;
      data[i] = Math.max(-1, Math.min(1, white * 0.45 + last * 1.9));
    }
    return buf;
  }

  private createStereoPanner(ctx: AudioContext, pan: number): AudioNode {
    if (typeof ctx.createStereoPanner === "function") {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-0.85, Math.min(0.85, pan));
      return panner;
    }
    return ctx.createGain();
  }

  private mountRealAmbience() {
    if (!this.enabled || !this.buffers.ambience) return;
    const ctx = this.getCtx(true);
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.34, now + 1.6);
    master.connect(ctx.destination);

    // Gerçek fırtına yağmuru & rüzgar yatağı (dikişsiz crossfaded loop)
    const src = ctx.createBufferSource();
    src.buffer = this.buffers.ambience;
    src.loop = true;

    const eq = ctx.createBiquadFilter();
    eq.type = "lowshelf";
    eq.frequency.value = 140;
    eq.gain.value = 2.5;

    src.connect(eq).connect(master);
    src.start(now);

    this.ambienceNodes = { master, sources: [src], isRealSample: true };
  }

  /**
   * 3D giriş sahnesi için gerçek doğa yağmur/fırtına yatağını başlatır.
   * Tarayıcı autoplay durumunu (true = ses açık çalıyor) döner.
   */
  async startIntroAmbience(): Promise<boolean> {
    if (!this.enabled) return false;
    this.ambienceDesired = true;
    const ctx = this.getCtx(true);
    if (!ctx) return false;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Kullanıcı etkileşimi bekleniyor
      }
    }

    void this.preloadIntroAudio();

    if (ctx.state !== "running") {
      return false;
    }

    if (this.ambienceNodes) return true;

    if (this.buffers.ambience) {
      this.mountRealAmbience();
      return true;
    }

    // Gerçek MP3 çözülene kadar 0.5 sn'lik yumuşak rüzgar köprüsü
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(0.08, now + 0.8);
    master.connect(ctx.destination);

    const windSrc = ctx.createBufferSource();
    windSrc.buffer = this.createNoiseBuffer(ctx, 4.0);
    windSrc.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(260, now);
    bp.Q.value = 0.9;
    windSrc.connect(bp).connect(master);
    windSrc.start(now);

    this.ambienceNodes = { master, sources: [windSrc], isRealSample: false };
    return true;
  }

  stopIntroAmbience(fadeSec = 0.55) {
    this.ambienceDesired = false;
    if (!this.ambienceNodes || !this.ctx) return;
    const nodes = this.ambienceNodes;
    this.ambienceNodes = null;
    const now = this.ctx.currentTime;
    try {
      nodes.master.gain.cancelScheduledValues(now);
      nodes.master.gain.setValueAtTime(Math.max(0.0001, nodes.master.gain.value), now);
      nodes.master.gain.exponentialRampToValueAtTime(0.0001, now + fadeSec);
      window.setTimeout(() => {
        try {
          for (const s of nodes.sources) s.stop();
          nodes.master.disconnect();
        } catch {
          // already stopped
        }
      }, Math.ceil((fadeSec + 0.1) * 1000));
    } catch {
      // ignore
    }
  }

  /**
   * 3D yıldırıma senkronize GERÇEK kaydedilmiş gök gürültüsü + fiziksel ses-hızı gecikmesi + stereo pan.
   * onShockArrive: ses dalgası kameraya ulaştığında mikro sarsıntı tetikler.
   */
  playIntroThunder(
    distanceNorm = 0.45,
    pan = 0,
    kind?: ThunderKind,
    onShockArrive?: () => void
  ) {
    const ctx = this.getCtx(false);
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    if (now - this.lastThunderAt < 0.32) return;
    this.lastThunderAt = now;

    const chosenKind: ThunderKind =
      kind ?? (distanceNorm < 0.34 ? "close" : distanceNorm < 0.68 ? "deep" : "distant");

    // Fiziksel ses hızı gecikmesi: yakın yıldırım neredeyse anında çatlar, uzak şimşek gecikmeli gürler
    const delaySec =
      chosenKind === "close"
        ? 0.06 + distanceNorm * 0.14
        : chosenKind === "deep"
          ? 0.34 + distanceNorm * 0.38
          : 0.62 + distanceNorm * 0.55;

    if (onShockArrive) {
      window.setTimeout(onShockArrive, Math.round(delaySec * 1000));
    }

    const sample =
      this.buffers[chosenKind] ??
      this.buffers.deep ??
      this.buffers.close ??
      this.buffers.distant;

    const panner = this.createStereoPanner(ctx, pan);
    panner.connect(ctx.destination);

    if (sample) {
      const src = ctx.createBufferSource();
      src.buffer = sample;
      // Her çakışta ince doğal perde çeşitliliği (asla mekanik tekrar hissi vermez)
      src.playbackRate.value = 0.93 + Math.random() * 0.14;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value =
        chosenKind === "close"
          ? 16500
          : chosenKind === "deep"
            ? 5200 - distanceNorm * 2200
            : 1800;

      const gain = ctx.createGain();
      const targetVol =
        chosenKind === "close"
          ? 0.68 * (1 - distanceNorm * 0.25)
          : chosenKind === "deep"
            ? 0.58 * (1 - distanceNorm * 0.22)
            : 0.42 * (1 - distanceNorm * 0.18);

      gain.gain.setValueAtTime(Math.max(0.12, targetVol), now + delaySec);

      src.connect(lp).connect(gain).connect(panner);
      src.start(now + delaySec);
      return;
    }

    // Çevrimdışı yedek prosedürel gök gürültüsü
    const rumble = ctx.createBufferSource();
    rumble.buffer = this.createNoiseBuffer(ctx, 2.2);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(260 - distanceNorm * 70, now + delaySec);
    lp.frequency.exponentialRampToValueAtTime(46, now + delaySec + 1.9);
    const rumbleG = ctx.createGain();
    rumbleG.gain.setValueAtTime(0.001, now + delaySec);
    rumbleG.gain.linearRampToValueAtTime(0.24 * (1 - distanceNorm * 0.3), now + delaySec + 0.08);
    rumbleG.gain.exponentialRampToValueAtTime(0.0008, now + delaySec + 2.1);
    rumble.connect(lp).connect(rumbleG).connect(panner);
    rumble.start(now + delaySec);
    rumble.stop(now + delaySec + 2.15);
  }

  /**
   * Cephe seçimi sırasında ince doğal atmosferik klik tınısı.
   */
  playStageSelect(index = 0) {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;
    const baseFreq = 280 + (index % 6) * 34;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.32, now + 0.1);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.042, now + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);

    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playLaunch(count: number) {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastLaunchAt < 0.08) return;
    this.lastLaunchAt = now;

    const src = ctx.createBufferSource();
    src.buffer = this.createNoiseBuffer(ctx, 0.24);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(340 + Math.min(400, count * 6), now);
    filter.frequency.exponentialRampToValueAtTime(760, now + 0.18);
    filter.Q.value = 2.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.24);
  }

  playReinforce() {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastReinforceAt < 0.16) return;
    this.lastReinforceAt = now;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playCapture(isPlayer: boolean) {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = isPlayer ? [392, 523.25, 659.25] : [261.6, 220];

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + i * 0.045);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + i * 0.045);
      gain.gain.linearRampToValueAtTime(0.06, now + i * 0.045 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.26);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.28);
    });
  }

  playLightning() {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastZapAt < 0.14) return;
    this.lastZapAt = now;

    const src = ctx.createBufferSource();
    src.buffer = this.createNoiseBuffer(ctx, 0.14);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(1400, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    src.connect(hp).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.14);
  }

  playEvolution(isSupercell: boolean) {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;

    const sample = isSupercell ? this.buffers.deep : this.buffers.distant;
    if (sample) {
      const src = ctx.createBufferSource();
      src.buffer = sample;
      src.playbackRate.value = isSupercell ? 0.96 : 1.08;
      const g = ctx.createGain();
      g.gain.setValueAtTime(isSupercell ? 0.36 : 0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      src.connect(g).connect(ctx.destination);
      src.start(now);
      src.stop(now + 1.85);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer(ctx, 0.85);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(isSupercell ? 280 : 210, now);
      lp.frequency.exponentialRampToValueAtTime(55, now + 0.8);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(isSupercell ? 0.24 : 0.17, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.82);

      src.connect(lp).connect(g).connect(ctx.destination);
      src.start(now);
      src.stop(now + 0.85);
    }

    const notes = isSupercell ? [330, 440, 659.25, 880] : [293.66, 440, 587.33];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.055);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.001, now + i * 0.055);
      og.gain.linearRampToValueAtTime(0.055, now + i * 0.055 + 0.03);
      og.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.36);
      osc.connect(og).connect(ctx.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.38);
    });
  }

  playShockwave() {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.55);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.24, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  playVictory(won: boolean) {
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = won ? [261.63, 329.63, 392, 523.25] : [261.63, 233.08, 196];
    chord.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now + i * 0.08);
      g.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.75);
      osc.connect(g).connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.78);
    });
  }

  /**
   * 3-Aşamalı Sinematik Bulut Duvarı Dalışı (2.15 sn):
   * Gerçek yakın gök gürültüsü + barometrik sub-bass şok + Mach rüzgar yırtılması!
   */
  playIntroDive() {
    this.stopIntroAmbience(0.42);
    const ctx = this.getCtx(true);
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Derin barometrik sub-bass şok
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(118, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 1.75);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.28, now + 0.14);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    sub.connect(subGain).connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 1.95);

    // 2. Bulut duvarını yaran hava akımı
    const wind = ctx.createBufferSource();
    wind.buffer = this.createNoiseBuffer(ctx, 2.1);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(180, now);
    bp.frequency.exponentialRampToValueAtTime(1550, now + 1.15);
    bp.frequency.exponentialRampToValueAtTime(280, now + 2.0);
    bp.Q.value = 1.2;
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.001, now);
    windGain.gain.linearRampToValueAtTime(0.2, now + 0.6);
    windGain.gain.exponentialRampToValueAtTime(0.001, now + 2.05);
    wind.connect(bp).connect(windGain).connect(ctx.destination);
    wind.start(now);
    wind.stop(now + 2.1);

    // 3. Dalış ortasında (~0.75s) GERÇEK yakın yıldırım çatlaması & gök gürültüsü!
    const closeSample = this.buffers.close ?? this.buffers.deep;
    if (closeSample) {
      const src = ctx.createBufferSource();
      src.buffer = closeSample;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.65, now + 0.72);
      g.gain.exponentialRampToValueAtTime(0.001, now + 3.4);
      src.connect(g).connect(ctx.destination);
      src.start(now + 0.72);
      src.stop(now + 3.45);
    }
  }
}

export const cumulusAudio = new CumulusAudioEngine();

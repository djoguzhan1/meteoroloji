/**
 * Prosedürel Web Audio API fırtına & bulut efekt sentezleyicisi (harici ses dosyası gerektirmez).
 */
class CumulusAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private lastLaunchAt = 0;
  private lastZapAt = 0;
  private lastReinforceAt = 0;

  setEnabled(v: boolean) {
    this.enabled = v;
  }

  private getCtx(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * durationSec);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  playLaunch(count: number) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (now - this.lastLaunchAt < 0.08) return;
    this.lastLaunchAt = now;

    // Yumuşak bant-geçişli esinti sesi
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
    const ctx = this.getCtx();
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
    const ctx = this.getCtx();
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
    const ctx = this.getCtx();
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
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Tok gök gürültüsü gümbürtüsü
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

    // Yükselen fırtına tınısı
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
    const ctx = this.getCtx();
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
    const ctx = this.getCtx();
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
   * 3D Açılış -> Bulut Dalışı sinematik ses efekti:
   * Barometrik sub-bass düşüş + yükselen yüksek irtifa rüzgar uğultusu + şimşek çakışı.
   */
  playIntroDive() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Derin barometrik sub-bass dalışı
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(118, now);
    sub.frequency.exponentialRampToValueAtTime(34, now + 1.35);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.22, now + 0.14);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
    sub.connect(subGain).connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 1.48);

    // 2. Bulut katmanını yaran jet rüzgarı taraması
    const wind = ctx.createBufferSource();
    wind.buffer = this.createNoiseBuffer(ctx, 1.55);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(220, now);
    bp.frequency.exponentialRampToValueAtTime(1450, now + 0.92);
    bp.frequency.exponentialRampToValueAtTime(380, now + 1.5);
    bp.Q.value = 1.6;
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.001, now);
    windGain.gain.linearRampToValueAtTime(0.16, now + 0.55);
    windGain.gain.exponentialRampToValueAtTime(0.001, now + 1.52);
    wind.connect(bp).connect(windGain).connect(ctx.destination);
    wind.start(now);
    wind.stop(now + 1.55);

    // 3. Atmosferik akor parlaması (açılış heyecanı)
    const notes = [220, 329.63, 440, 659.25];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + 0.08 + i * 0.06);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.001, now + 0.08 + i * 0.06);
      og.gain.linearRampToValueAtTime(0.045, now + 0.25 + i * 0.06);
      og.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
      osc.connect(og).connect(ctx.destination);
      osc.start(now + 0.08 + i * 0.06);
      osc.stop(now + 1.4);
    });
  }
}

export const cumulusAudio = new CumulusAudioEngine();

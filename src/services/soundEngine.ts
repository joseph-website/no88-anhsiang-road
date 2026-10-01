/**
 * Procedural Web Audio Synthesizer Engine
 * Generates eerie ambient drones, heartbeat, typewriters, static glitch, elevator bells, and UI clicks
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isBgmEnabled: boolean = false;
  private isAmbientEnabled: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmRunning: boolean = false;
  private bgmTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private currentDroneOsc: OscillatorNode | null = null;

  private masterVolume: number = 0.5;
  private sfxVolume: number = 0.5;
  private bgmVolume: number = 0.4;
  private rainVolume: number = 0.4;
  private sfxGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first user interaction
    try {
      const savedMaster = localStorage.getItem('ROOM404_VOL_MASTER');
      const savedSfx = localStorage.getItem('ROOM404_VOL_SFX');
      const savedBgm = localStorage.getItem('ROOM404_VOL_BGM');
      const savedRain = localStorage.getItem('ROOM404_VOL_RAIN');
      if (savedMaster !== null) this.masterVolume = parseFloat(savedMaster);
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);
      if (savedBgm !== null) this.bgmVolume = parseFloat(savedBgm);
      if (savedRain !== null) this.rainVolume = parseFloat(savedRain);
    } catch {}
  }

  private initCtx() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext initialization failed or deferred:', e);
    }
  }

  /**
   * Explicitly unlock Web Audio on first user gesture (Click, Touch, Keydown)
   * Plays a 1-sample silent buffer to unlock iOS Safari WebKit audio pipeline
   */
  public unlockAudio(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.initCtx();
        if (!this.ctx) {
          resolve(false);
          return;
        }

        const finishUnlock = () => {
          try {
            // Play 1-frame silent buffer to fully un-suspend iOS Safari hardware pipeline
            if (this.ctx && this.ctx.state === 'running') {
              const buffer = this.ctx.createBuffer(1, 1, 22050);
              const source = this.ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(this.ctx.destination);
              source.start(0);
            }
          } catch {}
          resolve(true);
        };

        if (this.ctx.state === 'suspended') {
          this.ctx.resume().then(finishUnlock).catch(() => resolve(false));
        } else {
          finishUnlock();
        }
      } catch (e) {
        console.warn('Web Audio unlock failed:', e);
        resolve(false);
      }
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    if (muted) {
      this.stopNoirBgm();
      this.stopThunderstormAmbiance();
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public getRainVolume(): number {
    return this.rainVolume;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('ROOM404_VOL_MASTER', this.masterVolume.toString());
    } catch {}
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('ROOM404_VOL_SFX', this.sfxVolume.toString());
    } catch {}
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('ROOM404_VOL_BGM', this.bgmVolume.toString());
    } catch {}
    if (this.bgmGain && this.ctx) {
      // scale with default base 0.25
      this.bgmGain.gain.setValueAtTime(this.bgmVolume * 0.3, this.ctx.currentTime);
    }
  }

  public setRainVolume(vol: number) {
    this.rainVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('ROOM404_VOL_RAIN', this.rainVolume.toString());
    } catch {}
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setValueAtTime(this.rainVolume * 0.25, this.ctx.currentTime);
    }
  }

  public setSfxAndMusic(enabled: boolean) {
    this.isMuted = !enabled;
    this.isBgmEnabled = enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(enabled ? 0.5 : 0, this.ctx.currentTime);
    }
    if (enabled) {
      this.startNoirBgm(0.12);
    } else {
      this.stopNoirBgm();
    }
  }

  public isMusicAndSfxEnabled(): boolean {
    return !this.isMuted;
  }

  public setAmbient(enabled: boolean) {
    this.isAmbientEnabled = enabled;
    if (enabled) {
      this.startThunderstormAmbiance(0.08);
    } else {
      this.stopThunderstormAmbiance();
    }
  }

  public isAmbientOn(): boolean {
    return this.isThunderstormRunning || this.isAmbientEnabled;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  // Procedural Atmospheric Noir BGM Synthesizer
  public startNoirBgm(volume = 0.12) {
    if (this.isMuted || this.isBgmRunning) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isBgmRunning = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    // Noir mystery chord sequence (Dm9 -> Bbmaj7 -> Gm9 -> A7alt)
    const chords = [
      { bass: 73.42, notes: [146.83, 174.61, 220.00, 261.63, 329.63] }, // Dm9
      { bass: 58.27, notes: [116.54, 174.61, 220.00, 293.66] },         // Bbmaj7
      { bass: 49.00, notes: [98.00, 146.83, 174.61, 233.08, 293.66] },   // Gm9
      { bass: 55.00, notes: [110.00, 164.81, 196.00, 246.94, 277.18] }   // A7sus4/A7
    ];

    let chordIndex = 0;
    const playChordStep = () => {
      if (!this.isBgmRunning || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;
      const curChord = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      // 1. Deep sub-bass pad
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(curChord.bass, now);
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(140, now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.28, now + 0.8);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(now);
      bassOsc.stop(now + 4.8);

      // 2. Soft Rhodes / Bell tones
      curChord.notes.forEach((freq, i) => {
        if (!this.ctx || !this.bgmGain) return;
        const noteTime = now + 0.15 + i * 0.45 + (Math.random() * 0.1);
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const noteFilter = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(750, noteTime);
        noteFilter.frequency.exponentialRampToValueAtTime(220, noteTime + 2.5);

        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.10, noteTime + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.8);

        osc.connect(noteFilter);
        noteFilter.connect(noteGain);
        noteGain.connect(this.bgmGain);
        osc.start(noteTime);
        osc.stop(noteTime + 2.8);
      });
    };

    playChordStep();
    this.bgmTimer = window.setInterval(playChordStep, 4600);
  }

  public stopNoirBgm() {
    this.isBgmRunning = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmGain && this.ctx) {
      try {
        this.bgmGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      } catch {
        // ignore
      }
      setTimeout(() => {
        if (this.bgmGain) {
          try {
            this.bgmGain.disconnect();
          } catch {
            // ignore
          }
          this.bgmGain = null;
        }
      }, 500);
    }
  }

  public isBgmPlaying(): boolean {
    return this.isBgmRunning;
  }

  // UI Click sound
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Paper rustle / rule pick sound
  public playPaper() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  // Glitch static burst
  public playGlitch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.sin(i / 10) > 0 ? 1 : 0.2);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  // Elevator Chime
  public playElevatorChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, now + 0.25); // A4

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now + 0.25);
    osc2.stop(now + 1.5);
  }

  // Physical switch click
  public playSwitch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.setValueAtTime(160, this.ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Door knock
  public playKnock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    [0, 0.12, 0.24].forEach((delay) => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    });
  }

  // Key turning in lock & metallic tumblers unlocking
  public playKeyUnlock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // 1. Metal key scrape
    const oscKey = this.ctx.createOscillator();
    const gainKey = this.ctx.createGain();
    oscKey.type = 'triangle';
    oscKey.frequency.setValueAtTime(1200, t);
    oscKey.frequency.exponentialRampToValueAtTime(600, t + 0.08);
    gainKey.gain.setValueAtTime(0.2, t);
    gainKey.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    oscKey.connect(gainKey);
    gainKey.connect(this.masterGain);
    oscKey.start(t);
    oscKey.stop(t + 0.09);

    // 2. Heavy lock tumbler click (clack)
    [0.08, 0.16].forEach((delay, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const clickTime = t + delay;
      const oscClick = this.ctx.createOscillator();
      const gainClick = this.ctx.createGain();
      oscClick.type = 'sine';
      oscClick.frequency.setValueAtTime(idx === 0 ? 320 : 180, clickTime);
      oscClick.frequency.exponentialRampToValueAtTime(80, clickTime + 0.06);
      gainClick.gain.setValueAtTime(0.25, clickTime);
      gainClick.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.07);
      oscClick.connect(gainClick);
      gainClick.connect(this.masterGain);
      oscClick.start(clickTime);
      oscClick.stop(clickTime + 0.07);
    });
  }

  // Heavy door opening / creak
  public playDoor() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Door latch unlatch
    const latchOsc = this.ctx.createOscillator();
    const latchGain = this.ctx.createGain();
    latchOsc.type = 'square';
    latchOsc.frequency.setValueAtTime(280, t);
    latchOsc.frequency.setValueAtTime(140, t + 0.03);
    latchGain.gain.setValueAtTime(0.18, t);
    latchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    latchOsc.connect(latchGain);
    latchGain.connect(this.masterGain);
    latchOsc.start(t);
    latchOsc.stop(t + 0.06);

    // Low wooden resonance swing
    const doorOsc = this.ctx.createOscillator();
    const doorGain = this.ctx.createGain();
    doorOsc.type = 'sine';
    doorOsc.frequency.setValueAtTime(95, t + 0.05);
    doorOsc.frequency.linearRampToValueAtTime(65, t + 0.35);
    doorGain.gain.setValueAtTime(0.22, t + 0.05);
    doorGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    doorOsc.connect(doorGain);
    doorGain.connect(this.masterGain);
    doorOsc.start(t + 0.05);
    doorOsc.stop(t + 0.4);
  }

  // Metal dial click for rotary safe dial
  public playSafeDialTick(frequencyOffset: number = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + frequencyOffset, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.025);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.025);
  }

  // Metallic clunk/jam when rotary dial hits a locked ratchet direction
  public playRatchetLockJam() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Water drop plink
  public playWaterDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Phone dead tone / busy signal
  public playPhoneTone() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(480, this.ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(620, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.6);
    osc2.stop(this.ctx.currentTime + 0.6);
  }

  // CCTV switch beep
  public playCctvBeep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Rapid faint entity typing sound (Audio Hint: 1 second before fake rule manifests)
  public playEntityTypingCue() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const keyDelays = [0, 0.08, 0.15, 0.22, 0.31, 0.38, 0.46, 0.55, 0.63, 0.72];
    keyDelays.forEach((delay) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const randomFreq = 1800 + (Math.random() * 400 - 200);
      osc.frequency.setValueAtTime(randomFreq, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.035);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.045);
    });
  }

  // Meta System Glitch burst with distortion and red flash tone
  public playMetaGlitchBurst() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(640, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.9);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(8, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.0);
  }

  // Typewriter mechanical click (Old Mechanical Typewriter)
  public playTypewriter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const randomFreq = 1600 + (Math.random() * 300 - 150);
    osc.frequency.setValueAtTime(randomFreq, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    // Mechanical noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.02);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
    noiseSource.start(t);
    noiseSource.stop(t + 0.025);
  }

  // Heartbeat sound (Lowpass filter + dual pitch downward drop: Lub-Dub)
  public playSingleHeartbeat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // 1st thump (Lub)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const filter1 = this.ctx.createBiquadFilter();

    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(120, t);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(95, t);
    osc1.frequency.exponentialRampToValueAtTime(38, t + 0.12);

    gain1.gain.setValueAtTime(0.65, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.masterGain);

    osc1.start(t);
    osc1.stop(t + 0.15);

    // 2nd thump (Dub)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const filter2 = this.ctx.createBiquadFilter();

    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(100, t + 0.16);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(75, t + 0.16);
    osc2.frequency.exponentialRampToValueAtTime(30, t + 0.3);

    gain2.gain.setValueAtTime(0.45, t + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(this.masterGain);

    osc2.start(t + 0.16);
    osc2.stop(t + 0.33);
  }

  // Deep blood red surge / cognitive dread pulse sound
  public playBloodPulse() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Sub-bass heavy drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(90, t);
    filter.frequency.exponentialRampToValueAtTime(30, t + 1.8);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 1.8);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.85);

    // Accompanying double heavy thump
    this.playSingleHeartbeat();
  }

  // Ominous heavy distant door knock sequence
  public playHeavyOminousKnock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const knockDelays = [0, 0.28, 0.62, 1.05];
    knockDelays.forEach((delay, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime + delay;

      // Heavy hollow wood impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(180 - idx * 15, now);
      filter.Q.setValueAtTime(3.5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110 - idx * 10, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.16);

      const vol = 0.38 + idx * 0.05; // Knock gets slightly louder and more urgent
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.19);
    });
  }

  // Clock rewind & temporal stutter sound
  public playClockRewind() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const ticks = 8;
    for (let i = 0; i < ticks; i++) {
      const delay = i * 0.09;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 - i * 140, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    }
  }

  // Inspect Success (Mysterious metallic resonance: E5 -> B5 -> E6 with B6 overtone)
  public playInspectSuccess() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, t); // E5
    osc1.frequency.setValueAtTime(987.77, t + 0.08); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.16); // E6

    gain1.gain.setValueAtTime(0.35, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, t + 0.16); // B6 metallic overtone

    gain2.gain.setValueAtTime(0.18, t + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    osc1.start(t);
    osc1.stop(t + 0.7);
    osc2.start(t + 0.16);
    osc2.stop(t + 0.55);
  }

  // Unified SFX Dispatcher
  public playSFX(type: string) {
    if (this.isMuted) return;
    switch (type) {
      case 'heartbeat':
        this.playSingleHeartbeat();
        break;
      case 'glitch':
        this.playGlitch();
        break;
      case 'typewriter':
        this.playTypewriter();
        break;
      case 'inspect_success':
      case 'inspectSuccess':
        this.playInspectSuccess();
        break;
      case 'click':
        this.playClick();
        break;
      case 'paper':
        this.playPaper();
        break;
      case 'switch':
        this.playSwitch();
        break;
      case 'knock':
        this.playKnock();
        break;
      case 'camera':
        this.playCamera();
        break;
      case 'resolution':
      case 'victory':
        this.playResolutionChord();
        break;
      case 'tension':
        this.playTensionSting();
        break;
      case 'elevator':
        this.playElevatorChime();
        break;
      default:
        this.playClick();
        break;
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Start continuous heartbeat based on SAN
  public updateSanHeartbeat(san: number) {
    this.updateHeartbeat(san);
  }

  public updateHeartbeat(san: number) {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (san < 40 && san > 0 && !this.isMuted) {
      this.playSingleHeartbeat();
      // Intervals: 39 SAN -> 1200ms, 10 SAN -> 750ms
      const interval = Math.max(650, 750 + (san / 40) * 450);
      this.heartbeatTimer = window.setInterval(() => {
        this.playSingleHeartbeat();
      }, interval);
    }
  }

  // Tension Sting (when encounter fake guard or danger)
  public playTensionSting() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [110, 116.54, 155.56, 220].forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  // Victory / Clarity chord
  public playResolutionChord() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.18, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.1);
      osc.stop(now + 2.5);
    });
  }

  // Ambient Drone loop
  public startAmbientDrone() {
    if (this.isMuted || this.currentDroneOsc) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.currentDroneOsc = this.ctx.createOscillator();
    this.currentDroneOsc.type = 'sine';
    this.currentDroneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);

    this.currentDroneOsc.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.currentDroneOsc.start();
  }

  // Hallucination distorted whisper / voice-like resonance
  public playHallucinationWhisper() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 1.6;

    // Filtered noise formant burst to simulate disembodied whisper
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Formant filters to mimic vocal resonance
    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(800 + Math.random() * 400, now);
    filter1.Q.setValueAtTime(6, now);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.setValueAtTime(2200 + Math.random() * 800, now);
    filter2.Q.setValueAtTime(8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + dur);
  }

  // High-pitched psychological tinnitus (stress / sanity breakdown)
  public playTinnitus() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 2.2;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(4600 + Math.random() * 600, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  // Old Elevator Mechanical Motor Hum & Cable Creak
  public playElevatorMotorHum() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 2.4;

    // 1. Deep motor rumble (low frequency square / sawtooth filtered)
    const motorOsc = this.ctx.createOscillator();
    const motorFilter = this.ctx.createBiquadFilter();
    const motorGain = this.ctx.createGain();

    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(48, now);
    motorOsc.frequency.linearRampToValueAtTime(54, now + 0.8);
    motorOsc.frequency.linearRampToValueAtTime(45, now + dur);

    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(140, now);

    motorGain.gain.setValueAtTime(0.01, now);
    motorGain.gain.linearRampToValueAtTime(0.22, now + 0.3);
    motorGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    motorOsc.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(this.masterGain);

    motorOsc.start(now);
    motorOsc.stop(now + dur);

    // 2. Metallic cable friction squeak
    const cableOsc = this.ctx.createOscillator();
    const cableGain = this.ctx.createGain();
    cableOsc.type = 'triangle';
    cableOsc.frequency.setValueAtTime(320, now + 0.4);
    cableOsc.frequency.exponentialRampToValueAtTime(190, now + 1.1);

    cableGain.gain.setValueAtTime(0.001, now + 0.4);
    cableGain.gain.linearRampToValueAtTime(0.07, now + 0.6);
    cableGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    cableOsc.connect(cableGain);
    cableGain.connect(this.masterGain);

    cableOsc.start(now + 0.4);
    cableOsc.stop(now + 1.2);
  }

  // Distant hollow footsteps echoing in concrete hallway
  public playDistantFootsteps(stepsCount = 3) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const baseInterval = 0.55;
    for (let i = 0; i < stepsCount; i++) {
      const stepTime = this.ctx.currentTime + i * (baseInterval + (Math.random() * 0.08));
      
      // Low thud
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(80 + Math.random() * 20, stepTime);
      thudOsc.frequency.exponentialRampToValueAtTime(30, stepTime + 0.12);

      const vol = 0.12 + Math.random() * 0.06;
      thudGain.gain.setValueAtTime(vol, stepTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.14);

      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain);
      thudOsc.start(stepTime);
      thudOsc.stop(stepTime + 0.14);

      // Distant shoe friction / reverb noise burst
      const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.3;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(600, stepTime);
      noiseFilter.Q.setValueAtTime(2.5, stepTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, stepTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.08);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(stepTime);
      noiseSource.stop(stepTime + 0.08);
    }
  }

  // Office Rest Ambient (Warm antique pendulum clock and soothing restoration hum)
  public playOfficeRestAmbient() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Clock tick-tock sequence
    [0, 0.45, 0.9, 1.35].forEach((offset, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const tickOsc = this.ctx.createOscillator();
      const tickGain = this.ctx.createGain();
      tickOsc.type = 'triangle';
      tickOsc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 700, now + offset);
      tickGain.gain.setValueAtTime(0.06, now + offset);
      tickGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.03);

      tickOsc.connect(tickGain);
      tickGain.connect(this.masterGain);
      tickOsc.start(now + offset);
      tickOsc.stop(now + offset + 0.03);
    });

    // Soothing warm restoration chord
    [220, 277.18, 329.63, 440].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.2 + idx * 0.1);
      gain.gain.setValueAtTime(0.08, now + 0.2 + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + 0.2 + idx * 0.1);
      osc.stop(now + 2.4);
    });
  }

  // Sensory focus / Environment observation sound
  public playObserveEnvironment(san: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    if (san < 35) {
      // Low SAN: Distorted whisper + deep sub-bass ominous pulse + static glitch
      this.playHallucinationWhisper();
      this.playSingleHeartbeat();
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(38, now);
      subOsc.frequency.exponentialRampToValueAtTime(22, now + 1.2);
      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 1.2);
    } else if (san < 70) {
      // Mid SAN: Eerie hollow wind draft + resonant metallic ping
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(4, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.8);

      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(620, now + 0.1);
      ping.frequency.exponentialRampToValueAtTime(220, now + 0.9);
      pingGain.gain.setValueAtTime(0.08, now + 0.1);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      ping.connect(pingGain);
      pingGain.connect(this.masterGain);
      ping.start(now + 0.1);
      ping.stop(now + 0.9);
    } else {
      // High SAN: Crisp airy focus sweep & subtle clear resonance
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  }

  // Tactile Tactical Flashlight click on/off with authentic switch snap and LED driver hum
  public playFlashlightToggle(isOn: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. Mechanical switch transient snap (high tactile click)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(isOn ? 1400 : 750, now);
    clickOsc.frequency.exponentialRampToValueAtTime(isOn ? 350 : 120, now + 0.025);

    clickGain.gain.setValueAtTime(0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.025);

    // 2. Body resonance thud (flashlight aluminum chassis reverberation)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(isOn ? 260 : 180, now);
    thudOsc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

    thudGain.gain.setValueAtTime(0.18, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start(now);
    thudOsc.stop(now + 0.04);

    // 3. When turning ON: High-intensity LED driver capacitor charge hum & beam emission shimmer
    if (isOn) {
      const humOsc = this.ctx.createOscillator();
      const humGain = this.ctx.createGain();
      humOsc.type = 'sine';
      humOsc.frequency.setValueAtTime(5800, now + 0.01);
      humOsc.frequency.linearRampToValueAtTime(9200, now + 0.08);

      humGain.gain.setValueAtTime(0.001, now);
      humGain.gain.linearRampToValueAtTime(0.07, now + 0.015);
      humGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.12);

      humOsc.connect(humGain);
      humGain.connect(this.masterGain);
      humOsc.start(now + 0.01);
      humOsc.stop(now + 0.12);
    }
  }

  // Soothing Mental Refresh / Focus / SAN Recovery Harmonic Chime
  public playMentalRefresh() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Soothing crystalline harmonic chord: D4 (293.7Hz), A4 (440Hz), F#5 (739.99Hz), A5 (880Hz)
    const harmonics = [
      { freq: 293.66, delay: 0.0, gain: 0.16, decay: 1.4 },
      { freq: 440.00, delay: 0.06, gain: 0.14, decay: 1.6 },
      { freq: 587.33, delay: 0.12, gain: 0.11, decay: 1.8 },
      { freq: 739.99, delay: 0.18, gain: 0.09, decay: 2.0 },
      { freq: 880.00, delay: 0.24, gain: 0.06, decay: 2.2 }
    ];

    harmonics.forEach(({ freq, delay, gain, decay }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      g.gain.setValueAtTime(0.001, now + delay);
      g.gain.linearRampToValueAtTime(gain, now + delay + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0005, now + delay + decay);

      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + decay);
    });

    // Gentle soft breath / warm wind sweep to simulate deep inhalation/exhalation
    try {
      const bufferSize = this.ctx.sampleRate * 0.8;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.03;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.4);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.8);
      filter.Q.setValueAtTime(1.8, now);

      const breathGain = this.ctx.createGain();
      breathGain.gain.setValueAtTime(0.001, now);
      breathGain.gain.linearRampToValueAtTime(0.06, now + 0.3);
      breathGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      whiteNoise.connect(filter);
      filter.connect(breathGain);
      breathGain.connect(this.masterGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.8);
    } catch {}
  }

  // Warm water drink soothing sound
  public playWaterDrink() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Gentle water drops
    for (let i = 0; i < 3; i++) {
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(600 + i * 180, now + i * 0.12);
      dropOsc.frequency.exponentialRampToValueAtTime(1100 + i * 120, now + i * 0.12 + 0.06);

      dropGain.gain.setValueAtTime(0.12, now + i * 0.12);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.08);

      dropOsc.connect(dropGain);
      dropGain.connect(this.masterGain);
      dropOsc.start(now + i * 0.12);
      dropOsc.stop(now + i * 0.12 + 0.08);
    }

    // Followed by subtle warm refresh chime
    setTimeout(() => {
      this.playMentalRefresh();
    }, 280);
  }

  // Deduction epiphany / contradiction cracked breakthrough chord
  public playContradictionBreakthrough() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Dramatic mystery solve arpeggio: D4, F#4, A4, D5, F#5
    const freqs = [293.66, 369.99, 440.00, 587.33, 739.99];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.01, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.9);
    });
  }

  // Anomaly siren/glitch alert sound
  public playAnomalyWarning(tier: 1 | 2 | 3 = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = tier === 3 ? 'sawtooth' : 'triangle';
    const baseFreq = tier === 3 ? 120 : tier === 2 ? 180 : 260;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 2.5, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.45);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Quick timer tick sound for countdown
  public playTimerTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // One-shot deep horror heartbeat thump
  public playHeartbeat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Lub
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65, now);
    osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // Dub
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(28, now + 0.32);
    gain2.gain.setValueAtTime(0.38, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.34);
  }

  // Horror screeching dissonance stab
  public playViolinStab() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freqs = [880, 932.33, 1174.66, 1244.51]; // Dissonant cluster
    freqs.forEach(freq => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq + 40, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  // Deep psychological dread sub-bass pulse
  public playDeepDreadPulse() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(42, now);
    osc.frequency.exponentialRampToValueAtTime(26, now + 0.9);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.95);
  }

  // Creepy detuned dissonance chord for high psychological tension
  public playPsychologicalDissonance() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chord = [110, 116.54, 155.56, 233.08]; // Dark diminished tension
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq + (idx % 2 === 0 ? 3 : -3), now + 1.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.3);
    });
  }

  // Corkboard pushpin insertion sound
  public playPinTack() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Red string line connect / thread strum sound
  public playStringConnect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now); // E4
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Enhanced realistic mechanical typewriter keystroke
  public playTypewriterKeystroke() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // 1. Metal striker click
    const strikerOsc = this.ctx.createOscillator();
    const strikerGain = this.ctx.createGain();
    strikerOsc.type = 'square';
    strikerOsc.frequency.setValueAtTime(800 + Math.random() * 400, now);
    strikerGain.gain.setValueAtTime(0.16, now);
    strikerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    strikerOsc.connect(strikerGain);
    strikerGain.connect(this.masterGain);
    strikerOsc.start(now);
    strikerOsc.stop(now + 0.025);

    // 2. Chassis thud
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(160 + Math.random() * 40, now);
    thudGain.gain.setValueAtTime(0.18, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start(now);
    thudOsc.stop(now + 0.06);
  }

  // Typewriter line-end warning bell
  public playTypewriterBell() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093, now); // C7 bell chime
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  // Deafening manic mechanical typewriter barrage for 4F anomalies
  public playDeafeningTypewriterFlurry(durationSeconds = 2.6) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const baseTime = this.ctx.currentTime;
    const numStrokes = Math.floor(durationSeconds * 12); // ~12 strokes per second

    // Sub-bass dread resonance
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55, baseTime);
    subOsc.frequency.exponentialRampToValueAtTime(42, baseTime + durationSeconds);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(140, baseTime);

    subGain.gain.setValueAtTime(0.25, baseTime);
    subGain.gain.linearRampToValueAtTime(0.35, baseTime + durationSeconds * 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.001, baseTime + durationSeconds);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.masterGain);

    subOsc.start(baseTime);
    subOsc.stop(baseTime + durationSeconds);

    // Barrage of rapid mechanical keystrokes
    let currentOffset = 0.05;
    for (let i = 0; i < numStrokes; i++) {
      const strokeTime = baseTime + currentOffset;
      const isAccented = i % 4 === 0 || i === numStrokes - 1;

      // 1. Metal striker click
      const strikerOsc = this.ctx.createOscillator();
      const strikerGain = this.ctx.createGain();
      strikerOsc.type = i % 2 === 0 ? 'square' : 'triangle';
      strikerOsc.frequency.setValueAtTime(900 + Math.random() * 600, strokeTime);
      strikerGain.gain.setValueAtTime(isAccented ? 0.28 : 0.16, strokeTime);
      strikerGain.gain.exponentialRampToValueAtTime(0.001, strokeTime + 0.035);

      strikerOsc.connect(strikerGain);
      strikerGain.connect(this.masterGain);
      strikerOsc.start(strokeTime);
      strikerOsc.stop(strokeTime + 0.04);

      // 2. Chassis thud / mechanical plink
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(150 + Math.random() * 80, strokeTime);
      thudGain.gain.setValueAtTime(isAccented ? 0.32 : 0.18, strokeTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, strokeTime + 0.07);

      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain);
      thudOsc.start(strokeTime);
      thudOsc.stop(strokeTime + 0.07);

      // Random jitter between keystrokes (45ms to 95ms)
      currentOffset += 0.045 + Math.random() * 0.05;
      if (currentOffset >= durationSeconds - 0.1) break;
    }

    // Carriage return bell ringing twice amidst the chaos
    const bell1Time = baseTime + durationSeconds * 0.45;
    const bell2Time = baseTime + durationSeconds * 0.88;

    [bell1Time, bell2Time].forEach((bellTime) => {
      if (!this.ctx || !this.masterGain) return;
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(2093, bellTime);
      bellGain.gain.setValueAtTime(0.24, bellTime);
      bellGain.gain.exponentialRampToValueAtTime(0.001, bellTime + 0.65);

      bellOsc.connect(bellGain);
      bellGain.connect(this.masterGain);
      bellOsc.start(bellTime);
      bellOsc.stop(bellTime + 0.65);
    });
  }

  // Radio Static Noise Generator & Frequency Sweep
  private radioNoiseSource: AudioBufferSourceNode | null = null;
  private radioFilter: BiquadFilterNode | null = null;
  private radioGain: GainNode | null = null;

  public startRadioTuningNoise(frequencyHz = 1200) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    if (this.radioNoiseSource) this.stopRadioTuningNoise();

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.radioNoiseSource = this.ctx.createBufferSource();
    this.radioNoiseSource.buffer = buffer;
    this.radioNoiseSource.loop = true;

    this.radioFilter = this.ctx.createBiquadFilter();
    this.radioFilter.type = 'bandpass';
    this.radioFilter.frequency.setValueAtTime(frequencyHz, this.ctx.currentTime);
    this.radioFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    this.radioGain = this.ctx.createGain();
    this.radioGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    this.radioNoiseSource.connect(this.radioFilter);
    this.radioFilter.connect(this.radioGain);
    this.radioGain.connect(this.masterGain);

    this.radioNoiseSource.start();
  }

  public setRadioFrequency(freq: number) {
    if (this.radioFilter && this.ctx) {
      this.radioFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    }
  }

  public stopRadioTuningNoise() {
    if (this.radioNoiseSource) {
      try {
        this.radioNoiseSource.stop();
        this.radioNoiseSource.disconnect();
      } catch {
        // ignore
      }
      this.radioNoiseSource = null;
    }
  }

  public playRadioStaticSweep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.6;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + dur * 0.7);
    filter.frequency.exponentialRampToValueAtTime(800, now + dur);
    filter.Q.setValueAtTime(6.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + dur);
  }

  // Thunderstorm Spatial Ambient Loop & Sub-bass Thunder Engine
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private thunderstormInterval: number | null = null;
  private isThunderstormRunning = false;

  public startThunderstormAmbiance(volume = 0.1) {
    if (this.isMuted || this.isThunderstormRunning) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isThunderstormRunning = true;

    // Continuous filtered rain noise
    const rainBufferSize = this.ctx.sampleRate * 3;
    const rainBuffer = this.ctx.createBuffer(1, rainBufferSize, this.ctx.sampleRate);
    const rainData = rainBuffer.getChannelData(0);
    for (let i = 0; i < rainBufferSize; i++) {
      rainData[i] = (Math.random() * 2 - 1) * 0.7;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = rainBuffer;
    this.rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(850, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    this.rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    this.rainSource.start();

    // Occasional rolling distant thunder
    this.playThunderRumble();
    this.thunderstormInterval = window.setInterval(() => {
      if (Math.random() > 0.35) {
        this.playThunderRumble();
      }
    }, 12000);
  }

  public playThunderRumble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 3.5;

    // Deep sub rumble
    const thunderOsc = this.ctx.createOscillator();
    const thunderGain = this.ctx.createGain();
    thunderOsc.type = 'sine';
    thunderOsc.frequency.setValueAtTime(55, now);
    thunderOsc.frequency.exponentialRampToValueAtTime(28, now + dur);

    thunderGain.gain.setValueAtTime(0.01, now);
    thunderGain.gain.linearRampToValueAtTime(0.28, now + 0.3);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    thunderOsc.connect(thunderGain);
    thunderGain.connect(this.masterGain);
    thunderOsc.start(now);
    thunderOsc.stop(now + dur);

    // Filtered crash noise
    const noiseBufferSize = Math.floor(this.ctx.sampleRate * 2.2);
    const noiseBuffer = this.ctx.createBuffer(1, noiseBufferSize, this.ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(220, now);
    noiseFilter.frequency.linearRampToValueAtTime(90, now + 2.0);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.25);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + 2.2);
  }

  public stopThunderstormAmbiance() {
    this.isThunderstormRunning = false;
    if (this.thunderstormInterval) {
      clearInterval(this.thunderstormInterval);
      this.thunderstormInterval = null;
    }
    if (this.rainSource) {
      try {
        this.rainSource.stop();
        this.rainSource.disconnect();
      } catch {
        // ignore
      }
      this.rainSource = null;
    }
  }

  public isThunderstormPlaying(): boolean {
    return this.isThunderstormRunning;
  }

  public playTension() {
    this.playTensionSting();
  }

  public playChime() {
    this.playElevatorChime();
  }

  // Camera Shutter Click + Motor Wind
  public playCamera() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    // Shutter snap click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);

    // Mechanical film winding noise
    setTimeout(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (i % 80 < 40 ? 1 : 0.2);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      noise.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start();
    }, 90);
  }

  public stopAmbientDrone() {
    if (this.currentDroneOsc) {
      try {
        this.currentDroneOsc.stop();
        this.currentDroneOsc.disconnect();
      } catch {
        // ignore
      }
      this.currentDroneOsc = null;
    }
  }

  // Tape cassette and classified audio playback SFX
  public playVoiceMemoClick() {
    this.playClick();
    this.playResolutionChord();
  }

  public playTapeInsert() {
    this.playPaper();
    this.playClick();
  }
}

export const sound = new SoundEngine();
export const Room88SoundEngine = sound;
export const playSFX = (type: string) => sound.playSFX(type);

// Browser Window Global Bindings & Hooks
if (typeof window !== 'undefined') {
  (window as unknown as { playSFX: (type: string) => void }).playSFX = (type: string) => sound.playSFX(type);
  (window as unknown as { Room88SoundEngine: typeof sound }).Room88SoundEngine = sound;

  const originalModifySanity = (window as unknown as { modifySanity?: (amt: number) => void }).modifySanity;
  (window as unknown as { modifySanity: (amt: number) => void }).modifySanity = (amt: number) => {
    if (typeof originalModifySanity === 'function') {
      originalModifySanity(amt);
    }
    const currentSan = (window as unknown as { gameState?: { san?: number } }).gameState?.san ?? 100;
    sound.updateHeartbeat(currentSan);
  };

  const originalDeepInspect = (window as unknown as { triggerDeepInspect?: (itemId?: string) => void }).triggerDeepInspect;
  (window as unknown as { triggerDeepInspect: (itemId?: string) => void }).triggerDeepInspect = (itemId?: string) => {
    sound.playSFX('inspect_success');
    if (typeof originalDeepInspect === 'function') {
      return originalDeepInspect(itemId);
    }
  };
  (window as unknown as { performDeepInspect: (itemId?: string) => void }).performDeepInspect = (window as unknown as { triggerDeepInspect: (itemId?: string) => void }).triggerDeepInspect;

  const originalAnomalyEffect = (window as unknown as { triggerAnomalyEffect?: (level?: number) => void }).triggerAnomalyEffect;
  (window as unknown as { triggerAnomalyEffect: (level?: number) => void }).triggerAnomalyEffect = (level?: number) => {
    sound.playSFX('glitch');
    if (typeof originalAnomalyEffect === 'function') {
      originalAnomalyEffect(level);
    }
  };
}

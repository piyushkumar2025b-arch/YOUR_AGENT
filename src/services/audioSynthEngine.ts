/**
 * Audio Synthesis & Sequencing Engine
 * Built on Web Audio API: Zero external dependencies, zero latency, offline-ready.
 * Provides polyphonic piano synthesis, drum machine physical modeling,
 * step sequencer scheduling with swing, audio visualizer analysis, and audio recording.
 */

export type PianoPreset = "grand" | "rhodes" | "synth" | "felt" | "chiptune" | "organ";

export type DrumKitType = "808" | "909" | "acoustic" | "synthwave" | "lofi";

export type DrumInstrument =
  | "kick"
  | "snare"
  | "hihat_closed"
  | "hihat_open"
  | "clap"
  | "tom_low"
  | "tom_high"
  | "crash";

export interface DrumTrackConfig {
  id: DrumInstrument;
  name: string;
  keyTrigger: string;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  muted: boolean;
  solo: boolean;
  steps: boolean[]; // 16 steps
  accents: number[]; // 1 = normal, 2 = accent, 0.5 = ghost
}

export interface DrumPatternPreset {
  name: string;
  bpm: number;
  swing: number;
  tracks: Record<DrumInstrument, boolean[]>;
}

// Note frequencies from C1 to B7
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getNoteFrequency(noteWithOctave: string): number {
  const match = noteWithOctave.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 440;
  const note = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(note);
  if (noteIndex === -1) return 440;
  // A4 = 440Hz, noteIndex 9 in octave 4 is MIDI 69
  const midi = (octave + 1) * 12 + noteIndex;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  // Active playing piano notes for sustain & release
  private activeVoices: Map<string, { stop: () => void; gain: GainNode }> = new Map();
  private sustainPedalDown: boolean = false;
  private sustainedNotes: Set<string> = new Set();

  // Sequencer state
  private isSequencerRunning: boolean = false;
  private bpm: number = 120;
  private swing: number = 0; // 0 to 1
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private onStepCallback: ((step: number) => void) | null = null;
  private drumTracks: DrumTrackConfig[] = [];
  private currentKit: DrumKitType = "808";

  // Recorder state
  private mediaDest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Limiter / Compressor to avoid any clipping with simultaneous layers
      this.masterLimiter = this.ctx.createDynamicsCompressor();
      this.masterLimiter.threshold.setValueAtTime(-3, this.ctx.currentTime);
      this.masterLimiter.knee.setValueAtTime(4, this.ctx.currentTime);
      this.masterLimiter.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterLimiter.release.setValueAtTime(0.15, this.ctx.currentTime);

      // Spectrum & Oscilloscope Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;

      // Reverb Convolver
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.generateImpulseResponse(2.2, 2.0);

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Signal routing:
      // Dry -> masterGain
      // Send -> reverbNode -> reverbGain -> masterGain
      // masterGain -> masterLimiter -> analyser -> destination
      this.dryGain.connect(this.masterGain);
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);

      this.masterGain.connect(this.masterLimiter);
      this.masterLimiter.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Recording destination
      try {
        this.mediaDest = this.ctx.createMediaStreamDestination();
        this.masterLimiter.connect(this.mediaDest);
      } catch (err) {
        console.debug("MediaStreamDestination setup notice:", err);
      }
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public getContext(): AudioContext {
    return this.init();
  }

  public getAnalyser(): AnalyserNode | null {
    this.init();
    return this.analyser;
  }

  public setMasterVolume(val: number) {
    const ctx = this.init();
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1.5, val)), ctx.currentTime, 0.05);
    }
  }

  public setReverbAmount(val: number) {
    const ctx = this.init();
    if (this.reverbGain) {
      this.reverbGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime, 0.05);
    }
  }

  // Algorithmic Impulse Response Generator for pristine Reverb
  private generateImpulseResponse(duration: number, decay: number): AudioBuffer {
    const ctx = this.init();
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay);
      // Multi-tap white noise with spatial phase
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  // ==========================================
  // PIANO SYNTHESIS
  // ==========================================

  public playPianoNote(noteWithOctave: string, preset: PianoPreset = "grand", velocity: number = 0.8) {
    const ctx = this.init();
    const now = ctx.currentTime;
    const freq = getNoteFrequency(noteWithOctave);

    // Stop existing note if already playing to avoid voice buildup
    this.stopPianoNote(noteWithOctave, true);

    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);

    // Filter for warmth & acoustic realism
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";

    const vel = Math.max(0.1, Math.min(1, velocity));

    if (preset === "grand") {
      // Concert Grand Piano: Fundamental + gentle overtones + percussion strike attack
      filter.frequency.setValueAtTime(Math.min(12000, freq * 7 * (0.6 + vel * 0.4)), now);
      filter.Q.setValueAtTime(1.2, now);

      // Osc 1: Fundamental Triangle
      const osc1 = ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, now);

      // Osc 2: Sine (body warm resonance)
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq, now);

      // Osc 3: Detuned overtone for acoustic string richness
      const osc3 = ctx.createOscillator();
      osc3.type = "sawtooth";
      osc3.frequency.setValueAtTime(freq * 2, now);
      const osc3Gain = ctx.createGain();
      osc3Gain.gain.setValueAtTime(0.15 * vel, now);
      osc3Gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      // Attack transient click
      const clickOsc = ctx.createOscillator();
      clickOsc.type = "sine";
      clickOsc.frequency.setValueAtTime(freq * 4, now);
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.2 * vel, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      // ADSR Envelope
      voiceGain.gain.linearRampToValueAtTime(0.7 * vel, now + 0.008);
      voiceGain.gain.exponentialRampToValueAtTime(0.45 * vel, now + 0.35);
      voiceGain.gain.exponentialRampToValueAtTime(0.15 * vel, now + 3.0);

      osc1.connect(voiceGain);
      osc2.connect(voiceGain);
      osc3.connect(osc3Gain).connect(voiceGain);
      clickOsc.connect(clickGain).connect(voiceGain);

      voiceGain.connect(filter);
      filter.connect(this.dryGain!);
      filter.connect(this.reverbNode!);

      [osc1, osc2, osc3, clickOsc].forEach((o) => {
        o.start(now);
      });

      const stopVoice = () => {
        const releaseTime = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(releaseTime);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, releaseTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.35);
        setTimeout(() => {
          try {
            [osc1, osc2, osc3, clickOsc].forEach((o) => {
              o.stop();
              o.disconnect();
            });
            voiceGain.disconnect();
            filter.disconnect();
          } catch {}
        }, 400);
      };

      this.activeVoices.set(noteWithOctave, { stop: stopVoice, gain: voiceGain });

    } else if (preset === "rhodes") {
      // Rhodes Electric Piano: Bell-like tine tone + tremolo
      filter.frequency.setValueAtTime(Math.min(9000, freq * 4.5), now);
      filter.Q.setValueAtTime(2.0, now);

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      const tineOsc = ctx.createOscillator();
      tineOsc.type = "sine";
      tineOsc.frequency.setValueAtTime(freq * 3, now); // 3rd harmonic tine
      const tineGain = ctx.createGain();
      tineGain.gain.setValueAtTime(0.3 * vel, now);
      tineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      // Tremolo LFO
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(4.8, now); // 4.8 Hz tremolo
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.12, now);
      lfo.connect(lfoGain.gain);

      voiceGain.gain.linearRampToValueAtTime(0.65 * vel, now + 0.012);
      voiceGain.gain.exponentialRampToValueAtTime(0.35 * vel, now + 0.8);
      voiceGain.gain.exponentialRampToValueAtTime(0.08 * vel, now + 4.0);

      osc1.connect(voiceGain);
      tineOsc.connect(tineGain).connect(voiceGain);
      voiceGain.connect(filter);
      filter.connect(this.dryGain!);
      filter.connect(this.reverbNode!);

      [osc1, tineOsc, lfo].forEach((o) => o.start(now));

      const stopVoice = () => {
        const releaseTime = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(releaseTime);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, releaseTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.45);
        setTimeout(() => {
          try {
            [osc1, tineOsc, lfo].forEach((o) => { o.stop(); o.disconnect(); });
            voiceGain.disconnect();
            filter.disconnect();
          } catch {}
        }, 500);
      };

      this.activeVoices.set(noteWithOctave, { stop: stopVoice, gain: voiceGain });

    } else if (preset === "synth") {
      // 80s Poly Synth Lead: Detuned Sawtooths + Resonant Filter Sweep
      filter.frequency.setValueAtTime(Math.min(10000, freq * 8 * vel), now);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.2);
      filter.Q.setValueAtTime(4.5, now);

      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = ctx.createOscillator();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(freq * 1.004, now); // slight chorus detune

      const subOsc = ctx.createOscillator();
      subOsc.type = "square";
      subOsc.frequency.setValueAtTime(freq * 0.5, now); // sub octave
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.25 * vel, now);

      voiceGain.gain.linearRampToValueAtTime(0.5 * vel, now + 0.02);
      voiceGain.gain.exponentialRampToValueAtTime(0.35 * vel, now + 0.4);

      osc1.connect(voiceGain);
      osc2.connect(voiceGain);
      subOsc.connect(subGain).connect(voiceGain);
      voiceGain.connect(filter);
      filter.connect(this.dryGain!);
      filter.connect(this.reverbNode!);

      [osc1, osc2, subOsc].forEach((o) => o.start(now));

      const stopVoice = () => {
        const releaseTime = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(releaseTime);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, releaseTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.4);
        setTimeout(() => {
          try {
            [osc1, osc2, subOsc].forEach((o) => { o.stop(); o.disconnect(); });
            voiceGain.disconnect();
            filter.disconnect();
          } catch {}
        }, 450);
      };

      this.activeVoices.set(noteWithOctave, { stop: stopVoice, gain: voiceGain });

    } else if (preset === "felt") {
      // Soft Felt Piano: Warm, intimate, low-passed sine/triangle
      filter.frequency.setValueAtTime(Math.min(2200, freq * 2.8), now);
      filter.Q.setValueAtTime(0.7, now);

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq, now);

      voiceGain.gain.linearRampToValueAtTime(0.6 * vel, now + 0.035);
      voiceGain.gain.exponentialRampToValueAtTime(0.3 * vel, now + 0.6);
      voiceGain.gain.exponentialRampToValueAtTime(0.05 * vel, now + 3.2);

      osc1.connect(voiceGain);
      osc2.connect(voiceGain);
      voiceGain.connect(filter);
      filter.connect(this.dryGain!);
      filter.connect(this.reverbNode!);

      [osc1, osc2].forEach((o) => o.start(now));

      const stopVoice = () => {
        const releaseTime = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(releaseTime);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, releaseTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.3);
        setTimeout(() => {
          try {
            [osc1, osc2].forEach((o) => { o.stop(); o.disconnect(); });
            voiceGain.disconnect();
            filter.disconnect();
          } catch {}
        }, 350);
      };

      this.activeVoices.set(noteWithOctave, { stop: stopVoice, gain: voiceGain });

    } else if (preset === "chiptune") {
      // 8-Bit Retro Chiptune: Pure Square waves with fast frequency slide
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq * 1.5, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.03);

      voiceGain.gain.setValueAtTime(0.4 * vel, now);
      voiceGain.gain.exponentialRampToValueAtTime(0.2 * vel, now + 0.2);

      osc.connect(voiceGain);
      voiceGain.connect(this.dryGain!);

      osc.start(now);

      const stopVoice = () => {
        const releaseTime = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(releaseTime);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, releaseTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.12);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
            voiceGain.disconnect();
          } catch {}
        }, 150);
      };

      this.activeVoices.set(noteWithOctave, { stop: stopVoice, gain: voiceGain });

    } else if (preset === "organ") {
      // Church Pipe Organ: Multi-rank additive blend
      const harmonics = [1, 2, 3, 4, 6];
      const harmonicGains = [0.4, 0.25, 0.15, 0.1, 0.05];
      const oscs: OscillatorNode[] = [];

      harmonics.forEach((h, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * h, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(harmonicGains[idx] * vel, now);
        osc.connect(g).connect(voiceGain);
        oscs.push(osc);
      });

      voiceGain.gain.linearRampToValueAtTime(0.6 * vel, now + 0.03);

      voiceGain.connect(this.dryGain!);
      voiceGain.connect(this.reverbNode!);

      oscs.forEach((o) => o.start(now));

      const stopVoice = () => {
        const releaseTime = ctx.currentTime;
        voiceGain.gain.cancelScheduledValues(releaseTime);
        voiceGain.gain.setValueAtTime(voiceGain.gain.value, releaseTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.35);
        setTimeout(() => {
          try {
            oscs.forEach((o) => { o.stop(); o.disconnect(); });
            voiceGain.disconnect();
          } catch {}
        }, 400);
      };

      this.activeVoices.set(noteWithOctave, { stop: stopVoice, gain: voiceGain });
    }
  }

  public stopPianoNote(noteWithOctave: string, immediate: boolean = false) {
    if (this.sustainPedalDown && !immediate) {
      this.sustainedNotes.add(noteWithOctave);
      return;
    }

    const voice = this.activeVoices.get(noteWithOctave);
    if (voice) {
      voice.stop();
      this.activeVoices.delete(noteWithOctave);
    }
  }

  public setSustainPedal(isDown: boolean) {
    this.sustainPedalDown = isDown;
    if (!isDown) {
      // Release all sustained notes
      this.sustainedNotes.forEach((note) => {
        const voice = this.activeVoices.get(note);
        if (voice) {
          voice.stop();
          this.activeVoices.delete(note);
        }
      });
      this.sustainedNotes.clear();
    }
  }

  public isSustainPedalDown(): boolean {
    return this.sustainPedalDown;
  }

  // ==========================================
  // DRUM SYNTHESIS (8 Physical Modeling Instruments)
  // ==========================================

  public setDrumKit(kit: DrumKitType) {
    this.currentKit = kit;
  }

  public triggerDrum(instrument: DrumInstrument, volume: number = 0.9, timeOffset: number = 0) {
    const ctx = this.init();
    const time = ctx.currentTime + timeOffset;
    const kit = this.currentKit;

    switch (instrument) {
      case "kick":
        this.playKick(ctx, time, volume, kit);
        break;
      case "snare":
        this.playSnare(ctx, time, volume, kit);
        break;
      case "hihat_closed":
        this.playHiHatClosed(ctx, time, volume, kit);
        break;
      case "hihat_open":
        this.playHiHatOpen(ctx, time, volume, kit);
        break;
      case "clap":
        this.playClap(ctx, time, volume, kit);
        break;
      case "tom_low":
        this.playTom(ctx, time, volume, 110, 55, kit);
        break;
      case "tom_high":
        this.playTom(ctx, time, volume, 180, 90, kit);
        break;
      case "crash":
        this.playCrash(ctx, time, volume, kit);
        break;
    }
  }

  // 1. Kick Drum (808 Sub Boom / Punchy Acoustic)
  private playKick(ctx: AudioContext, time: number, vol: number, kit: DrumKitType) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startFreq = kit === "808" ? 165 : kit === "acoustic" ? 140 : 180;
    const endFreq = kit === "808" ? 38 : kit === "acoustic" ? 48 : 42;
    const decayDuration = kit === "808" ? 0.65 : kit === "acoustic" ? 0.28 : 0.38;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08);

    gain.gain.setValueAtTime(1.1 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decayDuration);

    // Optional click transient
    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.setValueAtTime(250, time);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.4 * vol, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

    osc.connect(gain);
    click.connect(clickGain);

    gain.connect(this.dryGain!);
    clickGain.connect(this.dryGain!);

    osc.start(time);
    click.start(time);
    osc.stop(time + decayDuration + 0.05);
    click.stop(time + 0.02);
  }

  // 2. Snare Drum (Dual Tone + Filtered Noise Snap)
  private playSnare(ctx: AudioContext, time: number, vol: number, kit: DrumKitType) {
    // Body oscillator
    const toneOsc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    toneOsc.type = "triangle";
    toneOsc.frequency.setValueAtTime(kit === "808" ? 220 : 185, time);
    toneOsc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    toneGain.gain.setValueAtTime(0.6 * vol, time);
    toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    // Snare wires noise buffer
    const bufferSize = ctx.sampleRate * 0.25;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.setValueAtTime(kit === "synthwave" ? 800 : 1200, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85 * vol, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + (kit === "synthwave" ? 0.35 : 0.22));

    toneOsc.connect(toneGain).connect(this.dryGain!);
    noise.connect(noiseFilter).connect(noiseGain).connect(this.dryGain!);
    if (kit === "synthwave") {
      noiseGain.connect(this.reverbNode!);
    }

    toneOsc.start(time);
    noise.start(time);
    toneOsc.stop(time + 0.18);
    noise.stop(time + 0.35);
  }

  // 3. Closed Hi-Hat (Metallic Ringing Filter)
  private playHiHatClosed(ctx: AudioContext, time: number, vol: number, kit: DrumKitType) {
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const fundamental = kit === "808" ? 40 : 44;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(8500, time);
    bandpass.Q.setValueAtTime(1.4, time);

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(7000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);

    ratios.forEach((ratio) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(fundamental * ratio, time);
      osc.connect(bandpass);
      osc.start(time);
      osc.stop(time + 0.07);
    });

    bandpass.connect(highpass).connect(gain).connect(this.dryGain!);
  }

  // 4. Open Hi-Hat
  private playHiHatOpen(ctx: AudioContext, time: number, vol: number, kit: DrumKitType) {
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const fundamental = kit === "808" ? 40 : 44;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(8000, time);
    bandpass.Q.setValueAtTime(1.2, time);

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(6500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.75 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

    ratios.forEach((ratio) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(fundamental * ratio, time);
      osc.connect(bandpass);
      osc.start(time);
      osc.stop(time + 0.42);
    });

    bandpass.connect(highpass).connect(gain).connect(this.dryGain!);
    gain.connect(this.reverbNode!);
  }

  // 5. Hand Clap / 808 Multi-Burst Snap
  private playClap(ctx: AudioContext, time: number, vol: number, _kit: DrumKitType) {
    const bufferSize = ctx.sampleRate * 0.3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100, time);
    filter.Q.setValueAtTime(3, time);

    // Multi-burst triggers to emulate multiple hands clapping
    const bursts = [0, 0.011, 0.024, 0.036];
    bursts.forEach((offset, idx) => {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const gain = ctx.createGain();
      const isFinal = idx === bursts.length - 1;
      const dur = isFinal ? 0.22 : 0.02;

      gain.gain.setValueAtTime(0.7 * vol, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + dur);

      noise.connect(filter).connect(gain).connect(this.dryGain!);
      gain.connect(this.reverbNode!);

      noise.start(time + offset);
      noise.stop(time + offset + dur + 0.02);
    });
  }

  // 6. Tom Low & High (Resonant Sweep)
  private playTom(ctx: AudioContext, time: number, vol: number, startFreq: number, endFreq: number, _kit: DrumKitType) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.2);

    gain.gain.setValueAtTime(0.85 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain).connect(this.dryGain!);
    osc.start(time);
    osc.stop(time + 0.28);
  }

  // 7. Crash Cymbal (Wide Stereo Shimmer Noise)
  private playCrash(ctx: AudioContext, time: number, vol: number, _kit: DrumKitType) {
    const bufferSize = ctx.sampleRate * 1.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(4500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.65 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    noise.connect(filter).connect(gain).connect(this.dryGain!);
    gain.connect(this.reverbNode!);

    noise.start(time);
    noise.stop(time + 1.3);
  }

  // ==========================================
  // SEQUENCER SCHEDULER WITH SWING & LOOKAHEAD
  // ==========================================

  public setSequencerConfig(bpm: number, swing: number, tracks: DrumTrackConfig[]) {
    this.bpm = Math.max(40, Math.min(260, bpm));
    this.swing = Math.max(0, Math.min(0.75, swing));
    this.drumTracks = tracks;
  }

  public startSequencer(onStep: (step: number) => void) {
    this.init();
    if (this.isSequencerRunning) return;

    this.isSequencerRunning = true;
    this.onStepCallback = onStep;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.05;

    this.schedulerLoop();
  }

  public stopSequencer() {
    this.isSequencerRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public isRunning(): boolean {
    return this.isSequencerRunning;
  }

  private schedulerLoop = () => {
    if (!this.isSequencerRunning || !this.ctx) return;

    const scheduleAheadTime = 0.1; // schedule 100ms in advance
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }

    this.timerId = window.setTimeout(this.schedulerLoop, 25);
  };

  private advanceStep() {
    // 16th note seconds = (60 / bpm) / 4
    const secondsPer16th = 60.0 / this.bpm / 4.0;

    // Apply swing on even steps (0, 2, 4 are on the beat; 1, 3 are offbeats)
    let stepDuration = secondsPer16th;
    if (this.currentStep % 2 === 0) {
      stepDuration = secondsPer16th * (1 + this.swing);
    } else {
      stepDuration = secondsPer16th * (1 - this.swing);
    }

    this.nextNoteTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleStep(step: number, time: number) {
    // Notify UI for active playback head indicator (synchronized with audio clock)
    const ctx = this.ctx!;
    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
    setTimeout(() => {
      if (this.isSequencerRunning && this.onStepCallback) {
        this.onStepCallback(step);
      }
    }, delayMs);

    // Any track soloed?
    const hasSolo = this.drumTracks.some((t) => t.solo);

    this.drumTracks.forEach((track) => {
      if (track.muted) return;
      if (hasSolo && !track.solo) return;

      if (track.steps[step]) {
        const accent = track.accents ? track.accents[step] || 1 : 1;
        const volume = Math.min(1.2, track.volume * accent);
        this.triggerDrum(track.id, volume, Math.max(0, time - ctx.currentTime));
      }
    });
  }

  // ==========================================
  // AUDIO RECORDING & WAV EXPORT
  // ==========================================

  public startRecording(): boolean {
    const ctx = this.init();
    if (!this.mediaDest) return false;

    try {
      this.recordedChunks = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      this.mediaRecorder = new MediaRecorder(this.mediaDest.stream, { mimeType });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.warn("Failed to start MediaRecorder:", err);
      return false;
    }
  }

  public stopRecording(): Promise<{ blob: Blob; url: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("Not currently recording"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        this.isRecording = false;
        resolve({ blob, url });
      };

      this.mediaRecorder.stop();
    });
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

// Global Singleton Instance
export const audioSynthEngine = new AudioSynthEngine();

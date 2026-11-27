import { AudioSettings, VoiceCharacter } from '../types/media';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private currentCustomAudio: HTMLAudioElement | null = null;
  private isSpeaking = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.2,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, volume), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick(settings: AudioSettings) {
    if (settings.muted || settings.sfxVolume <= 0) return;
    this.playTone(580, 0.07, 'triangle', 0.14 * settings.sfxVolume);
  }

  playTick(settings: AudioSettings, hand: 'hour' | 'minute' = 'minute') {
    if (settings.muted || settings.sfxVolume <= 0) return;
    if (hand === 'hour') {
      this.playTone(620, 0.045, 'triangle', 0.08 * settings.sfxVolume);
    } else {
      this.playTone(960, 0.032, 'sine', 0.065 * settings.sfxVolume);
    }
  }

  playCorrect(settings: AudioSettings) {
    if (settings.muted || settings.sfxVolume <= 0) return;
    const v = 0.2 * settings.sfxVolume;
    this.playTone(523.25, 0.14, 'triangle', v, 0);
    this.playTone(659.25, 0.14, 'triangle', v, 0.09);
    this.playTone(783.99, 0.24, 'triangle', v, 0.18);
  }

  playWrong(settings: AudioSettings) {
    if (settings.muted || settings.sfxVolume <= 0) return;
    const v = 0.16 * settings.sfxVolume;
    this.playTone(330, 0.16, 'sine', v, 0);
    this.playTone(261.63, 0.22, 'sine', v, 0.13);
  }

  playStar(settings: AudioSettings) {
    if (settings.muted || settings.sfxVolume <= 0) return;
    const v = 0.18 * settings.sfxVolume;
    this.playTone(659.25, 0.1, 'sine', v, 0);
    this.playTone(880, 0.12, 'sine', v, 0.08);
    this.playTone(1046.5, 0.22, 'sine', v, 0.16);
  }

  playLevelUp(settings: AudioSettings) {
    if (settings.muted || settings.sfxVolume <= 0) return;
    const v = 0.2 * settings.sfxVolume;
    const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.16, 'triangle', v, idx * 0.09);
    });
  }

  playVictory(settings: AudioSettings) {
    if (settings.muted || settings.sfxVolume <= 0) return;
    const v = 0.22 * settings.sfxVolume;
    const melody = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.12 },
      { f: 783.99, d: 0.14, t: 0.24 },
      { f: 1046.5, d: 0.35, t: 0.38 },
      { f: 783.99, d: 0.14, t: 0.62 },
      { f: 1046.5, d: 0.45, t: 0.76 },
    ];
    melody.forEach((m) => this.playTone(m.f, m.d, 'triangle', v, m.t));
  }

  startBackgroundMusic(settings: AudioSettings) {
    this.stopBackgroundMusic();
    if (settings.muted || !settings.bgMusicEnabled || settings.musicVolume <= 0) return;

    const scale = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33];
    this.musicTimer = window.setInterval(() => {
      if (this.isSpeaking) return;
      const note = scale[this.musicStep % scale.length];
      this.playTone(note, 0.32, 'sine', 0.065 * settings.musicVolume);
      this.musicStep += 1;
    }, 680);
  }

  stopBackgroundMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  stopNarration() {
    this.isSpeaking = false;
    if (this.currentCustomAudio) {
      this.currentCustomAudio.pause();
      this.currentCustomAudio.currentTime = 0;
      this.currentCustomAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }

  speak(
    text: string,
    settings: AudioSettings,
    overrideCharacter?: VoiceCharacter,
    customSlotKey?: string
  ) {
    this.stopNarration();
    if (
      settings.muted ||
      settings.narrationEnabled === false ||
      settings.narrationVolume <= 0 ||
      !text.trim()
    ) {
      return;
    }

    if (customSlotKey && settings.customAudioMap[customSlotKey]) {
      try {
        const audio = new Audio(settings.customAudioMap[customSlotKey]);
        audio.volume = Math.min(1, Math.max(0, settings.narrationVolume));
        this.isSpeaking = true;
        audio.onended = () => {
          this.isSpeaking = false;
        };
        audio.onerror = () => {
          this.isSpeaking = false;
        };
        this.currentCustomAudio = audio;
        audio.play().catch(() => {
          this.isSpeaking = false;
        });
        return;
      } catch {
        // Fallback to SpeechSynthesis
      }
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'id-ID';
      utter.volume = Math.min(1, Math.max(0, settings.narrationVolume));

      const char = overrideCharacter ?? settings.voiceCharacter;
      if (char === 'tiki') {
        utter.pitch = 1.24;
        utter.rate = 0.98;
      } else if (char === 'bimo') {
        utter.pitch = 0.98;
        utter.rate = 0.96;
      } else {
        utter.pitch = 1.05;
        utter.rate = 0.94;
      }

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
      if (idVoice) {
        utter.voice = idVoice;
      }

      this.isSpeaking = true;
      utter.onend = () => {
        this.isSpeaking = false;
      };
      utter.onerror = () => {
        this.isSpeaking = false;
      };

      window.speechSynthesis.speak(utter);
    } catch {
      this.isSpeaking = false;
    }
  }
}

export const audioEngine = new AudioEngine();

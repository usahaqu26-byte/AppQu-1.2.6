// Web Audio API Synthesizer for Emergency Siren (No external mp3 needed)
class SireneAudioService {
  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: any = null;
  private isPlaying: boolean = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startSiren() {
    if (this.isPlaying) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.osc = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.osc.type = 'sawtooth';
      this.gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);

      this.osc.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      let up = true;
      let freq = 600;
      this.osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      this.intervalId = setInterval(() => {
        if (!this.audioCtx || !this.osc) return;
        if (up) {
          freq += 80;
          if (freq >= 1200) up = false;
        } else {
          freq -= 80;
          if (freq <= 600) up = true;
        }
        this.osc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.05);
      }, 50);

      this.osc.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext siren failed to start:', e);
    }
  }

  stopSiren() {
    if (!this.isPlaying) return;
    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.isPlaying = false;
    } catch (e) {
      console.warn('AudioContext siren failed to stop:', e);
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const sireneAudio = new SireneAudioService();

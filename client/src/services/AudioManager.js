
export class AudioManager {
  constructor() {
    this.music = null;
    this.sounds = []; // Track playing sounds
    this.volume = parseFloat(localStorage.getItem('audioVolume') || '0.5');
  }

  playMusic(src, loop = true) {
    // Standardize URL for comparison
    const fullSrc = new URL(src, window.location.origin).href;

    if (this.music) {
      if (this.music.src === fullSrc && !this.music.paused) return; 
      this.music.pause();
      this.music = null;
    }

    this.music = new Audio(src);
    this.music.loop = loop;
    this.music.volume = this.volume;
    
    this.music.play().catch(error => {
      console.warn("Music play blocked: ", error);
    });
  }

  playSound(src) {
    const sound = new Audio(src);
    sound.volume = this.volume;
    
    this.sounds.push(sound);
    sound.onended = () => {
      this.sounds = this.sounds.filter(s => s !== sound);
    };

    sound.play().catch(e => console.warn("Sound play failed:", e));
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.music) {
      this.music.volume = volume;
    }
    // Update all currently playing sounds
    this.sounds.forEach(s => s.volume = volume);
    localStorage.setItem('audioVolume', volume);
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0; // Reset to start
      this.music = null;
    }
  }

  stopAllSounds() {
    this.sounds.forEach(s => {
      s.pause();
      s.currentTime = 0;
    });
    this.sounds = [];
  }

  // Helper to ensure audio starts after user interaction
  resumeAudio() {
    if (this.music && this.music.paused) {
      this.music.play().catch(() => {});
    }
  }
}

export const audioManager = new AudioManager();

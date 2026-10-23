// Audio Synthesizer utilizing Web Audio API for zero-dependency trading alerts
class SoundManager {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Chime for Zone Alerts (Support / Resistance touches)
  playZoneAlert(type: 'support' | 'resistance' = 'resistance') {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'resistance') {
        // High ascending chime
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6
      } else {
        // Warning chime
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35); // A4
      }

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  // Intense alarm for High Volatility (Pump or Dump)
  playVolatilityAlert(direction: 'pump' | 'dump' = 'pump') {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = direction === 'pump' ? 'triangle' : 'sawtooth';
      const baseFreq = direction === 'pump' ? 700 : 350;

      // Pulse modulation
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.1);
      osc.frequency.linearRampToValueAtTime(baseFreq, now + 0.2);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.3);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch (e) {
      console.warn('Volatility audio error:', e);
    }
  }
}

export const soundManager = new SoundManager();

// Web Notifications API helper
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      });
    } catch (e) {
      console.warn('Browser notification failed:', e);
    }
  }
}

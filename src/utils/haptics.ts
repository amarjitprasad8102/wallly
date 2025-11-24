import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class HapticsManager {
  private isAvailable = false;

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    try {
      // Check if haptics is available (mainly for mobile devices)
      this.isAvailable = 'vibrate' in navigator || typeof Haptics !== 'undefined';
    } catch (error) {
      console.log('Haptics not available:', error);
      this.isAvailable = false;
    }
  }

  async light() {
    if (!this.isAvailable) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Fallback to vibration API
      navigator.vibrate?.(10);
    }
  }

  async medium() {
    if (!this.isAvailable) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      navigator.vibrate?.(20);
    }
  }

  async heavy() {
    if (!this.isAvailable) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      navigator.vibrate?.(30);
    }
  }

  async success() {
    if (!this.isAvailable) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      navigator.vibrate?.(15);
    }
  }

  async warning() {
    if (!this.isAvailable) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      navigator.vibrate?.(20);
    }
  }

  async error() {
    if (!this.isAvailable) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      navigator.vibrate?.([10, 50, 10]);
    }
  }
}

export const haptics = new HapticsManager();

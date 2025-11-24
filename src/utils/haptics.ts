class HapticsManager {
  private isAvailable = false;
  private Haptics: any = null;
  private ImpactStyle: any = null;
  private NotificationType: any = null;

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    try {
      // Check if vibrate API is available (works in most browsers)
      this.isAvailable = 'vibrate' in navigator;
      
      // Try to load Capacitor Haptics (for native mobile apps)
      try {
        const haptics = await import('@capacitor/haptics');
        this.Haptics = haptics.Haptics;
        this.ImpactStyle = haptics.ImpactStyle;
        this.NotificationType = haptics.NotificationType;
      } catch (error) {
        // Capacitor not available - will use vibrate API fallback
        console.log('Capacitor Haptics not available, using vibrate API');
      }
    } catch (error) {
      console.log('Haptics not available:', error);
      this.isAvailable = false;
    }
  }

  async light() {
    if (!this.isAvailable) return;
    try {
      if (this.Haptics && this.ImpactStyle) {
        await this.Haptics.impact({ style: this.ImpactStyle.Light });
      } else {
        navigator.vibrate?.(10);
      }
    } catch (error) {
      navigator.vibrate?.(10);
    }
  }

  async medium() {
    if (!this.isAvailable) return;
    try {
      if (this.Haptics && this.ImpactStyle) {
        await this.Haptics.impact({ style: this.ImpactStyle.Medium });
      } else {
        navigator.vibrate?.(20);
      }
    } catch (error) {
      navigator.vibrate?.(20);
    }
  }

  async heavy() {
    if (!this.isAvailable) return;
    try {
      if (this.Haptics && this.ImpactStyle) {
        await this.Haptics.impact({ style: this.ImpactStyle.Heavy });
      } else {
        navigator.vibrate?.(30);
      }
    } catch (error) {
      navigator.vibrate?.(30);
    }
  }

  async success() {
    if (!this.isAvailable) return;
    try {
      if (this.Haptics && this.NotificationType) {
        await this.Haptics.notification({ type: this.NotificationType.Success });
      } else {
        navigator.vibrate?.(15);
      }
    } catch (error) {
      navigator.vibrate?.(15);
    }
  }

  async warning() {
    if (!this.isAvailable) return;
    try {
      if (this.Haptics && this.NotificationType) {
        await this.Haptics.notification({ type: this.NotificationType.Warning });
      } else {
        navigator.vibrate?.(20);
      }
    } catch (error) {
      navigator.vibrate?.(20);
    }
  }

  async error() {
    if (!this.isAvailable) return;
    try {
      if (this.Haptics && this.NotificationType) {
        await this.Haptics.notification({ type: this.NotificationType.Error });
      } else {
        navigator.vibrate?.([10, 50, 10]);
      }
    } catch (error) {
      navigator.vibrate?.([10, 50, 10]);
    }
  }
}

export const haptics = new HapticsManager();

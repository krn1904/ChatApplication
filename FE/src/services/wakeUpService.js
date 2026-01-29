const config = require('../config.js');

class WakeUpService {
  constructor() {
    this.backendUrl = config.BackendHTTP;
    this.maxRetries = 3; // Reduced from 10
    this.retryDelay = 3000; // Increased from 2000ms to 3000ms
    this.isChecking = false; // Prevent concurrent checks
    this.lastCheckTime = 0;
    this.checkCooldown = 5000; // Minimum time between checks
  }

  async wakeUpBackend() {
    // Prevent concurrent checks
    if (this.isChecking) {
      return false;
    }

    // Cooldown between checks
    const now = Date.now();
    if (now - this.lastCheckTime < this.checkCooldown) {
      return false;
    }

    this.isChecking = true;
    this.lastCheckTime = now;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${this.backendUrl}/health`, {
          method: 'GET',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          this.isChecking = false;
          return true;
        }
      } catch (error) {
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay);
        }
      }
    }
    
    this.isChecking = false;
    return false;
  }

  async ensureBackendReady() {
    const isAwake = await this.wakeUpBackend();
    
    if (isAwake) {
      // Give backend a moment to fully initialize
      await this.delay(500);
      return true;
    }
    
    return false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const wakeUpServiceInstance = new WakeUpService();
export default wakeUpServiceInstance;

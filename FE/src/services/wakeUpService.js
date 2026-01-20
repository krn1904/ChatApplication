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
      console.log('Backend check already in progress...');
      return false;
    }

    // Cooldown between checks
    const now = Date.now();
    if (now - this.lastCheckTime < this.checkCooldown) {
      console.log('Backend check on cooldown...');
      return false;
    }

    this.isChecking = true;
    this.lastCheckTime = now;
    console.log('Attempting to wake up backend...');
    
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
          console.log(`✓ Backend is awake! Attempt ${attempt}/${this.maxRetries}`);
          this.isChecking = false;
          return true;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`⏱ Wake-up attempt ${attempt}/${this.maxRetries} timed out`);
        } else {
          console.warn(`✗ Wake-up attempt ${attempt}/${this.maxRetries} failed:`, error?.message || error);
        }
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay);
        }
      }
    }
    
    console.error('❌ Failed to wake up backend after all attempts');
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

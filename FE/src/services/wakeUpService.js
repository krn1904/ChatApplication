const config = require('../config.js');

class WakeUpService {
  constructor() {
    this.backendUrl = config.BackendHTTP;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  async wakeUpBackend() {
    console.log('Attempting to wake up backend...');
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.backendUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log(`Backend is awake! Attempt ${attempt}/${this.maxRetries}`);
          return true;
        }
      } catch (error) {
        console.warn(`Wake-up attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }
    
    console.error('Failed to wake up backend after all attempts');
    return false;
  }

  async ensureBackendReady() {
    return new Promise(async (resolve) => {
      const isAwake = await this.wakeUpBackend();
      
      if (isAwake) {
        // Give backend a moment to fully initialize
        setTimeout(() => resolve(true), 1000);
      } else {
        resolve(false);
      }
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new WakeUpService();

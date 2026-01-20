const https = require('https');
const http = require('http');

class KeepAlive {
  constructor(url, interval = 14 * 60 * 1000) { // 14 minutes
    this.url = url;
    this.interval = interval;
    this.intervalId = null;
  }

  start() {
    console.log(`Starting keep-alive for ${this.url}`);
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.interval);
    
    // Initial ping
    this.ping();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Keep-alive stopped');
    }
  }

  ping() {
    const protocol = this.url.startsWith('https') ? https : http;
    const request = protocol.get(this.url, (res) => {
      console.log(`Keep-alive ping: ${res.statusCode} at ${new Date().toISOString()}`);
    });

    request.on('error', (err) => {
      console.error('Keep-alive ping failed:', err.message);
    });

    request.setTimeout(10000, () => {
      request.abort();
      console.error('Keep-alive ping timeout');
    });
  }
}

module.exports = KeepAlive;
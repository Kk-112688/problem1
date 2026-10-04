const { timestamp, sleep } = require('./utils');

/**
 * Fixed-window rate limiter: at most `maxRequests` writes are allowed inside
 * each `windowMs` window. A window is [windowStart, windowStart + windowMs).
 * Once the count for the current window is exhausted, callers wait until a
 * new window starts rather than being rejected.
 */
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.windowStart = Date.now();
    this.count = 0;
  }

  async acquire(label) {
    for (;;) {
      const now = Date.now();

      if (now - this.windowStart >= this.windowMs) {
        this.windowStart = now;
        this.count = 0;
      }

      if (this.count < this.maxRequests) {
        this.count += 1;
        console.log(
          `[${timestamp()}] [RATE]   ${label} got write slot (${this.count}/${this.maxRequests} this window)`
        );
        return;
      }

      const waitMs = this.windowMs - (now - this.windowStart) + 10;
      console.log(`[${timestamp()}] [RATE]   ${label} rate-limited, waiting ${waitMs}ms for next window`);
      await sleep(waitMs);
    }
  }
}

module.exports = { RateLimiter };

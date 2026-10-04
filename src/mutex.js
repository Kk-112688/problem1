const { timestamp } = require('./utils');
const config = require('../config');

/**
 * Promise-based mutex. Within Node's single-threaded event loop, a worker
 * that holds lock X and `await`s lock Y while another worker holds Y and
 * awaits X creates a genuine circular wait: neither `acquire()` promise can
 * ever resolve, since resolution only happens on the other side's release.
 * That is the deadlock this whole demo is built to trigger.
 *
 * This never breaks the deadlock or stops anything — it only watches how
 * long a caller has been queued for this lock and logs an "IN DEADLOCK"
 * warning if that exceeds DEADLOCK_WATCHDOG_MS, which is well above any
 * normal queuing delay seen under non-deadlock contention.
 */
class Mutex {
  constructor(name) {
    this.name = name;
    this._locked = false;
    this._queue = [];
  }

  acquire(label) {
    return new Promise((resolve) => {
      const grant = () => {
        this._locked = true;
        console.log(`[${timestamp()}] [LOCK]   ${label} acquired  ${this.name}`);
        resolve(() => this._release(label));
      };

      if (!this._locked) {
        grant();
        return;
      }

      console.log(`[${timestamp()}] [LOCK]   ${label} waiting for ${this.name} ...`);
      const waitStart = Date.now();

      const scheduleWatchdog = () =>
        setTimeout(() => {
          const waitedMs = Date.now() - waitStart;
          console.log(
            `[${timestamp()}] [DEADLOCK] ${label} is IN DEADLOCK — still waiting for ${this.name} after ${waitedMs}ms`
          );
          entry.watchdog = scheduleWatchdog();
        }, config.DEADLOCK_WATCHDOG_MS);

      const entry = {
        watchdog: scheduleWatchdog(),
        grant: () => {
          clearTimeout(entry.watchdog);
          grant();
        }
      };
      this._queue.push(entry);
    });
  }

  _release(label) {
    console.log(`[${timestamp()}] [LOCK]   ${label} released  ${this.name}`);
    this._locked = false;
    const next = this._queue.shift();
    if (next) next.grant();
  }
}

module.exports = { Mutex };

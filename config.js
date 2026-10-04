const path = require('path');

module.exports = {
  NUM_WORKERS: parseInt(process.env.NUM_WORKERS, 10) || 10,
  MAX_WRITES_PER_WINDOW: parseInt(process.env.MAX_WRITES_PER_WINDOW, 10) || 30,
  WINDOW_MS: parseInt(process.env.WINDOW_MS, 10) || 10000,
  CSV_FILE: process.env.CSV_FILE || path.join(__dirname, 'output', 'random_numbers.csv'),
  MIN_DELAY_MS: parseInt(process.env.MIN_DELAY_MS, 10) || 50,
  MAX_DELAY_MS: parseInt(process.env.MAX_DELAY_MS, 10) || 300,
  // How long a worker must be stuck waiting on a single lock before it is
  // reported as deadlocked. Kept well above MAX_DELAY_MS so normal queuing
  // under contention is never mistaken for a deadlock.
  DEADLOCK_WATCHDOG_MS: parseInt(process.env.DEADLOCK_WATCHDOG_MS, 10) || 2000
};

const config = require('./config');
const { SharedResource } = require('./src/sharedResources');
const { RateLimiter } = require('./src/rateLimiter');
const { CsvWriter } = require('./src/csvWriter');
const { runWorker } = require('./src/worker');

async function main() {
  const resourceA = new SharedResource('ResourceA');
  const resourceB = new SharedResource('ResourceB');
  const rateLimiter = new RateLimiter(config.MAX_WRITES_PER_WINDOW, config.WINDOW_MS);
  const csvWriter = new CsvWriter(config.CSV_FILE);
  await csvWriter.init();

  console.log(`Writing to ${config.CSV_FILE}`);
  console.log(
    `Starting ${config.NUM_WORKERS} workers (rate limit ${config.MAX_WRITES_PER_WINDOW} writes / ${config.WINDOW_MS}ms).`
  );
  console.log(`Even-numbered workers acquire ResourceA -> ResourceB; odd-numbered workers acquire ResourceB -> ResourceA.`);
  console.log(`This opposite lock ordering is expected to deadlock the process once contention lines up. There is no`);
  console.log(`timeout: once deadlocked, affected workers hang forever and the process must be stopped manually (Ctrl+C).`);
  console.log('---');

  const workers = [];
  for (let i = 0; i < config.NUM_WORKERS; i++) {
    const group = i % 2 === 0 ? 'A' : 'B';
    workers.push(runWorker(i, group, { resourceA, resourceB }, rateLimiter, csvWriter));
  }

  // Intentionally never resolves once a deadlock occurs.
  await Promise.all(workers);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

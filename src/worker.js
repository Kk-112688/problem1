const { sleep, randomDelay, timestamp } = require('./utils');

/**
 * Each worker is an infinite async loop simulating one "thread". Workers in
 * group 'A' acquire ResourceA then ResourceB; workers in group 'B' acquire
 * them in the opposite order. Once enough workers from each group are
 * holding one lock and waiting on the other at the same time, a circular
 * wait (deadlock) is guaranteed. There is no detector or timeout here on
 * purpose: a worker that deadlocks simply stops forever, exactly like a
 * real deadlocked thread would.
 */
async function runWorker(id, group, { resourceA, resourceB }, rateLimiter, csvWriter) {
  const label = `Worker-${id}[${group}]`;
  const first = group === 'A' ? resourceA : resourceB;
  const second = group === 'A' ? resourceB : resourceA;

  // Stagger the two groups' start times: group A starts immediately so a
  // few same-order cycles succeed and the rate limiter kicks in first; group
  // B joins a couple seconds later, at which point opposite lock ordering
  // between the groups makes the deadlock inevitable.
  const startDelay =
    group === 'A' ? id * 30 + Math.floor(Math.random() * 50) : 3000 + id * 30 + Math.floor(Math.random() * 50);
  await sleep(startDelay);

  for (;;) {
    const releaseFirst = await first.lock.acquire(label);
    await sleep(randomDelay());

    const releaseSecond = await second.lock.acquire(label);

    const resourceAValue = resourceA.generate();
    const resourceBValue = resourceB.generate();
    const randomNumber = resourceAValue + resourceBValue;

    releaseSecond();
    releaseFirst();

    await rateLimiter.acquire(label);

    const releaseCsv = await csvWriter.lock.acquire(label);
    try {
      await csvWriter.writeRow({
        timestamp: timestamp(),
        workerId: id,
        group,
        resourceAValue,
        resourceBValue,
        randomNumber
      });
      console.log(`[${timestamp()}] [WRITE]  ${label} wrote randomNumber=${randomNumber}`);
    } finally {
      releaseCsv();
    }

    await sleep(randomDelay());
  }
}

module.exports = { runWorker };

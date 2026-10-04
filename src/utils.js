const config = require('../config');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  const { MIN_DELAY_MS, MAX_DELAY_MS } = config;
  return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function timestamp() {
  return new Date().toISOString();
}

module.exports = { sleep, randomDelay, timestamp };

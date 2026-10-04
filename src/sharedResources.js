const { Mutex } = require('./mutex');

/**
 * A shared resource that contributes one piece of the random number data.
 * Every access to `.value` must go through this resource's own lock.
 */
class SharedResource {
  constructor(name) {
    this.name = name;
    this.lock = new Mutex(name);
    this.value = 0;
  }

  generate() {
    this.value = Math.floor(Math.random() * 1000);
    return this.value;
  }
}

module.exports = { SharedResource };

const fs = require('fs');
const path = require('path');
const { Mutex } = require('./mutex');

const HEADER = 'timestamp,workerId,group,resourceAValue,resourceBValue,randomNumber\n';

/**
 * The CSV file is itself a shared resource: every write to it must go
 * through this writer's own lock, separate from the two data resources.
 */
class CsvWriter {
  constructor(filePath) {
    this.filePath = filePath;
    this.lock = new Mutex('CSVFile');
  }

  async init() {
    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(this.filePath, HEADER, { flag: 'w' });
  }

  async writeRow({ timestamp, workerId, group, resourceAValue, resourceBValue, randomNumber }) {
    const line = `${timestamp},${workerId},${group},${resourceAValue},${resourceBValue},${randomNumber}\n`;
    await fs.promises.appendFile(this.filePath, line);
  }
}

module.exports = { CsvWriter };

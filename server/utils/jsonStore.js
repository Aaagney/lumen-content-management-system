const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function ensureFile(name, defaultValue) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const fp = filePath(name);
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

function readJSON(name, defaultValue = []) {
  ensureFile(name, defaultValue);
  const raw = fs.readFileSync(filePath(name), 'utf-8');
  try {
    return JSON.parse(raw || JSON.stringify(defaultValue));
  } catch (err) {
    console.error(`Failed to parse ${name}.json, resetting to default.`, err);
    writeJSON(name, defaultValue);
    return defaultValue;
  }
}

// Very simple write lock to avoid interleaved writes corrupting a file
// under concurrent requests (this is a lightweight JSON store, not a DB).
const writeQueues = {};

function writeJSON(name, data) {
  ensureFile(name, []);
  const fp = filePath(name);
  const tmpPath = `${fp}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, fp);
  return data;
}

/**
 * Read-modify-write helper that serializes writes to the same file so
 * two near-simultaneous requests don't clobber each other under Node's
 * single-threaded event loop with async I/O.
 */
async function update(name, defaultValue, mutateFn) {
  const previous = writeQueues[name] || Promise.resolve();
  const next = previous.then(async () => {
    const current = readJSON(name, defaultValue);
    const result = await mutateFn(current);
    writeJSON(name, current);
    return result;
  });
  writeQueues[name] = next.catch(() => {});
  return next;
}

module.exports = { readJSON, writeJSON, update, filePath };

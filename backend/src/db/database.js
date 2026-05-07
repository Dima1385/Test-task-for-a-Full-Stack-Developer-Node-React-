const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/jobs.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id         TEXT PRIMARY KEY,
        status     TEXT NOT NULL DEFAULT 'queued',
        progress   REAL NOT NULL DEFAULT 0,
        option     TEXT,
        value      REAL,
        result     TEXT,
        error      TEXT,
        createdAt  TEXT NOT NULL
      )
    `);
  }
  return db;
}

function insertJob({ id, option, value, createdAt }) {
  const stmt = getDb().prepare(`
    INSERT INTO jobs (id, status, progress, option, value, createdAt)
    VALUES (@id, 'queued', 0, @option, @value, @createdAt)
  `);
  stmt.run({ id, option, value, createdAt });
}

function getJobById(id) {
  return getDb().prepare('SELECT * FROM jobs WHERE id = ?').get(id) || null;
}

function updateJob(id, fields) {
  const columns = Object.keys(fields)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  const stmt = getDb().prepare(`UPDATE jobs SET ${columns} WHERE id = @id`);
  stmt.run({ ...fields, id });
}

module.exports = { insertJob, getJobById, updateJob };

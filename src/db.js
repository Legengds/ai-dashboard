const path = require('path');

// Use /tmp for Vercel serverless (ephemeral but writable)
const dbPath = path.join(process.env.VERCEL ? '/tmp' : __dirname, '..', 'database.sqlite');

const Database = require('better-sqlite3');
let db;

try {
  db = new Database(dbPath);
  // Initialize database schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      widget TEXT NOT NULL,
      element TEXT,
      timestamp INTEGER NOT NULL,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (e) {
  console.log('DB init error:', e.message);
  // Fallback: use in-memory if file not writable
  db = new Database(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      widget TEXT NOT NULL,
      element TEXT,
      timestamp INTEGER NOT NULL,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

module.exports = db;

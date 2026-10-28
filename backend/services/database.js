const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'scans.db');
const db = new Database(dbPath);

// Enable WAL mode for fast concurrent reads and writes
db.pragma('journal_mode = WAL');

// Initialize scans schema
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    hostname TEXT,
    risk_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    summary TEXT,
    features_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * Save a new scan result
 */
function saveScan(scan) {
  const stmt = db.prepare(`
    INSERT INTO scans (url, hostname, risk_score, risk_level, confidence, summary, features_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    scan.url,
    scan.hostname || '',
    scan.riskScore,
    scan.riskLevel,
    scan.confidence,
    scan.summary || '',
    JSON.stringify(scan.features || [])
  );

  return getScanById(info.lastInsertRowid);
}

/**
 * Retrieve a scan by ID
 */
function getScanById(id) {
  const stmt = db.prepare(`
    SELECT * FROM scans WHERE id = ?
  `);
  const row = stmt.get(id);
  if (!row) return null;

  return {
    id: row.id,
    url: row.url,
    hostname: row.hostname,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    confidence: row.confidence,
    summary: row.summary,
    features: JSON.parse(row.features_json),
    createdAt: row.created_at
  };
}

/**
 * Get all scans, ordered from newest to oldest
 */
function getAllScans(limit = 100) {
  const stmt = db.prepare(`
    SELECT * FROM scans ORDER BY id DESC LIMIT ?
  `);
  const rows = stmt.all(limit);

  return rows.map(row => ({
    id: row.id,
    url: row.url,
    hostname: row.hostname,
    riskScore: row.risk_score,
    riskLevel: row.risk_level,
    confidence: row.confidence,
    summary: row.summary,
    features: JSON.parse(row.features_json),
    createdAt: row.created_at
  }));
}

/**
 * Delete a scan by ID
 */
function deleteScan(id) {
  const stmt = db.prepare(`
    DELETE FROM scans WHERE id = ?
  `);
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Clear all history (optional utility)
 */
function clearAllScans() {
  const stmt = db.prepare(`DELETE FROM scans`);
  stmt.run();
  return true;
}

module.exports = {
  db,
  saveScan,
  getScanById,
  getAllScans,
  deleteScan,
  clearAllScans
};

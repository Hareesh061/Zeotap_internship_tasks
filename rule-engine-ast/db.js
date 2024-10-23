const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error('Error opening database:', err.message);
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_string TEXT NOT NULL,
    ast_json TEXT NOT NULL
  )`);
});

module.exports = db;

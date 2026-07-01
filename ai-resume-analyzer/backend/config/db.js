const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '..', `${process.env.DB_NAME || 'resume_analyzer'}.sqlite`);

let db;

const save = () => {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
};

const api = {
  prepare: (sql) => {
    let stmt = null;
    return {
      get: (...params) => {
        if (!stmt) stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          stmt.free();
          stmt = null;
          const row = {};
          cols.forEach((c, i) => { row[c] = vals[i]; });
          return row;
        }
        stmt.free();
        stmt = null;
        return undefined;
      },
      all: (...params) => {
        if (!stmt) stmt = db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          const row = {};
          cols.forEach((c, i) => { row[c] = vals[i]; });
          rows.push(row);
        }
        stmt.free();
        stmt = null;
        return rows;
      },
      run: (...params) => {
        if (!stmt) stmt = db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        stmt.free();
        stmt = null;
        const lastInsertRowid = db.exec("SELECT last_insert_rowid()")[0]?.values[0][0] || null;
        const changes = db.getRowsModified();
        save();
        return { lastInsertRowid, changes };
      }
    };
  }
};

const initDB = async () => {
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    ats_score INTEGER DEFAULT NULL,
    missing_skills TEXT DEFAULT NULL,
    suggestions TEXT DEFAULT NULL,
    extracted_text TEXT DEFAULT NULL,
    upload_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  save();
  console.log('Database initialized successfully');
};

module.exports = { db: api, initDB };

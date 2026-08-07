const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '..', `${process.env.DB_NAME || 'resume_analyzer'}.sqlite`);

let db;

const save = () => {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  db.run('PRAGMA foreign_keys = ON');
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

  db.run('PRAGMA foreign_keys = ON');

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
    keyword_score INTEGER DEFAULT NULL,
    section_score INTEGER DEFAULT NULL,
    matched_skills TEXT DEFAULT NULL,
    missing_skills TEXT DEFAULT NULL,
    summary TEXT DEFAULT NULL,
    section_feedback TEXT DEFAULT NULL,
    suggestions TEXT DEFAULT NULL,
    extracted_text TEXT DEFAULT NULL,
    upload_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  const resumeColumns = (db.exec('PRAGMA table_info(resumes)')[0]?.values || []).map((c) => c[1]);
  const migrations = {
    keyword_score: 'keyword_score INTEGER DEFAULT NULL',
    section_score: 'section_score INTEGER DEFAULT NULL',
    matched_skills: 'matched_skills TEXT DEFAULT NULL',
    summary: 'summary TEXT DEFAULT NULL',
    section_feedback: 'section_feedback TEXT DEFAULT NULL',
    parse_score: 'parse_score INTEGER DEFAULT NULL',
    role_label: 'role_label TEXT DEFAULT NULL',
    jd_keyword_count: 'jd_keyword_count INTEGER DEFAULT NULL',
    job_description: 'job_description TEXT DEFAULT NULL',
    target_role: 'target_role TEXT DEFAULT NULL',
    category_scores: 'category_scores TEXT DEFAULT NULL',
    extracted: 'extracted TEXT DEFAULT NULL',
    strengths: 'strengths TEXT DEFAULT NULL',
    weaknesses: 'weaknesses TEXT DEFAULT NULL',
    formatting_issues: 'formatting_issues TEXT DEFAULT NULL',
    section_analysis: 'section_analysis TEXT DEFAULT NULL',
    keyword_match_pct: 'keyword_match_pct INTEGER DEFAULT NULL',
    skills_match_pct: 'skills_match_pct INTEGER DEFAULT NULL',
    matched_jd_keywords: 'matched_jd_keywords TEXT DEFAULT NULL',
    missing_keywords: 'missing_keywords TEXT DEFAULT NULL',
    grammar_suggestions: 'grammar_suggestions TEXT DEFAULT NULL',
    project_suggestions: 'project_suggestions TEXT DEFAULT NULL',
    achievement_suggestions: 'achievement_suggestions TEXT DEFAULT NULL',
    final_review: 'final_review TEXT DEFAULT NULL'
  };
  Object.entries(migrations).forEach(([column, ddl]) => {
    if (!resumeColumns.includes(column)) {
      db.run(`ALTER TABLE resumes ADD COLUMN ${ddl}`);
    }
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id)');

  save();
  console.log('Database initialized successfully');
};

module.exports = { db: api, initDB };

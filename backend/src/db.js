const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { databaseFile } = require('./config');
const resolvedFile = databaseFile === ':memory:' ? databaseFile : path.resolve(__dirname, '..', databaseFile);
if (resolvedFile !== ':memory:') fs.mkdirSync(path.dirname(resolvedFile), { recursive: true });
const db = new DatabaseSync(resolvedFile);
db.exec('PRAGMA foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS lop (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maLop TEXT NOT NULL UNIQUE,
    tenLop TEXT NOT NULL,
    khoa TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sinh_vien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mssv TEXT NOT NULL UNIQUE,
    hoTen TEXT NOT NULL,
    ngaySinh TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    gpa REAL NOT NULL,
    lopId INTEGER NOT NULL,
    FOREIGN KEY (lopId) REFERENCES lop(id)
  );
  CREATE INDEX IF NOT EXISTS idx_sinh_vien_lop ON sinh_vien(lopId);
  CREATE INDEX IF NOT EXISTS idx_sinh_vien_gpa ON sinh_vien(gpa);
`);
module.exports = db;

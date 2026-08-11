// one shared SQLite connection for the whole app
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "campusconnect.db"); // path to the database file

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  }
});

db.run("PRAGMA foreign_keys = ON"); // Enables foreign-key rules, such as requiring organizer_id to match a real user.


// General methods for doing database queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

module.exports = { db, run, get, all };
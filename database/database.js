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

module.exports = db;
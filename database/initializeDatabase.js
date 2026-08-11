const fs = require("fs");
const path = require("path");
const { db }= require("./database");

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema, (err) => {
  if (err) {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  }
  console.log("Database initialized successfully.");
  db.close();
});
/*Since database.js uses module.exports = { db, ... } to export multiple things, importing it without {} grabbed the entire wrapper object instead of the database instance itself—which is why Node complained that .exec() wasn't a function.

By using const { db } = require("./database"), you're extracting just the db instance from that export object so all the database methods work as expected.

Now that your initializeDatabase.js matches his fix and your database is properly seeded, your environment is completely synced with the team's setup.*/
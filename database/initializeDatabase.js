const fs = require("fs"); // file system module to read the schema.sql file
const path = require("path");
const db = require("./database");

const schemaPath = path.join(__dirname, "schema.sql"); // path to the schema.sql file
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema, (err) => {
  if (err) {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  }
  console.log("Database initialized successfully.");
  db.close();
});
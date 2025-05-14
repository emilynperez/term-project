const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.sqlite');

db.serialize(() => {
  db.run("ALTER TABLE products ADD COLUMN category TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Migration failed:", err.message);
    } else {
      console.log("Migration completed or already applied.");
    }
    db.close();
  });
});

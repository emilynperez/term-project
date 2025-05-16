const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.sqlite');

db.serialize(() => {
  db.run("ALTER TABLE products ADD COLUMN category TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Migration failed (products):", err.message);
    } else {
      console.log("Category column checked for products.");
    }
  });

  db.run("ALTER TABLE users ADD COLUMN bio TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Migration failed (bio):", err.message);
    } else {
      console.log("Bio column checked for users.");
    }
  });

  db.run("ALTER TABLE users ADD COLUMN profile_image TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Migration failed (profile_image):", err.message);
    } else {
      console.log("Profile image column checked for users.");
    }
  });
});

db.close();

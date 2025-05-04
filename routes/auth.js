const express = require("express");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();
const db = new sqlite3.Database("./data/database.sqlite");

// Register user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    (err) => {
      if (err) {
        console.error("Registration error:", err.message);
        return res.status(400).send("Email already registered.");
      }
      res.redirect("/signin");
    }
  );
});

// Login user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).send("Invalid email or password.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      res.redirect("/");
    } else {
      res.status(401).send("Invalid email or password.");
    }
  });
});

module.exports = router;

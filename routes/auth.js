const express = require("express");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

const db = new sqlite3.Database("./data/database.sqlite");

// Register
router.get("/register", (req, res) => {
  res.render("register", { title: "Register - berrybag" });
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, hashed],
    function (err) {
      if (err) {
        return res.render("register", { error: "Email already registered", title: "Register - berrybag" });
      }
      res.redirect("/");
    }
  );
});

// Sign In
router.get("/signin", (req, res) => {
  res.render("signin", { title: "Sign In - berrybag" });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.render("signin", { error: "Invalid credentials", title: "Sign In - berrybag" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render("signin", { error: "Incorrect password", title: "Sign In - berrybag" });

    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.redirect("/");
  });
});

// Profile
router.get("/profile", (req, res) => {
  if (!req.session.user) return res.redirect("/signin");
  res.render("profile", { title: "Profile - berrybag" });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).send("Invalid email or password.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      return res.redirect('/');
    } else {
      return res.status(401).send("Invalid email or password.");
    }
  });
});


// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;


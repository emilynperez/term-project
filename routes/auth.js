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
  const { name, email, password, address, phone } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (name, email, password, address, phone, is_admin) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, hashed, address || "", phone || "", 0],
    function (err) {
      if (err) {
        return res.render("register", {
          error: "Email already registered",
          title: "Register - berrybag",
        });
      }
      req.session.user = { id: this.lastID, name, email, is_admin: 0 };
      res.redirect("/auth/profile");
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
    if (err || !user)
      return res.render("signin", {
        error: "Invalid credentials",
        title: "Sign In - berrybag",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.render("signin", {
        error: "Incorrect password",
        title: "Sign In - berrybag",
      });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      is_admin: user.is_admin,
    };
    res.redirect("/auth/profile");
  });
});

// View Profile
router.get("/profile", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/signin");

  db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
    if (err || !user) return res.redirect("/auth/signin");

    res.render("profile", {
      title: "Profile - berrybag",
      user,
    });
  });
});

// Edit Profile Form
router.get("/profile/edit", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/signin");

  db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
    if (err || !user) return res.redirect("/auth/signin");

    res.render("edit_profile", {
      title: "Edit Profile - berrybag",
      user,
    });
  });
});

// Handle Profile Edit
router.post("/profile/edit", (req, res) => {
  const { name, email, address, phone, bio, profile_image } = req.body;
  const userId = req.session.user.id;

  db.run(
    "UPDATE users SET name = ?, email = ?, address = ?, phone = ?, bio = ?, profile_image = ? WHERE id = ?",
    [name, email, address, phone, bio, profile_image, userId],
    function (err) {
      if (err) {
        return res.render("edit_profile", {
          error: "Update failed.",
          user: req.body,
        });
      }

      req.session.user.name = name;
      req.session.user.email = email;
      res.redirect("/auth/profile");
    }
  );
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;

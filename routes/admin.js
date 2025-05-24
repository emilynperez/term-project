const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/database.sqlite");

// Middleware to ensure only admins can access
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.is_admin !== 1) {
    return res.status(403).send("Access denied.");
  }
  next();
}

// Manage products (existing)
router.get("/products", requireAdmin, (req, res) => {
  const categories = ["Cats", "Toys", "Accessories"];

  db.all("SELECT * FROM products", (err, products) => {
    if (err) return res.status(500).send("Failed to load products");
    res.render("admin_products", { products, categories });
  });
});

// Add product (existing)
router.post("/products", requireAdmin, (req, res) => {
  const { name, description, price, image, category } = req.body;
  db.run(
    "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, image, category],
    (err) => {
      if (err) return res.status(500).send("Failed to add product.");
      res.redirect("/admin/products");
    }
  );
});

// 💥 NEW: Admin user management page
router.get("/users", requireAdmin, (req, res) => {
  db.all("SELECT id, name, email, is_admin FROM users", (err, users) => {
    if (err) return res.status(500).send("Failed to load users.");
    res.render("admin_users", { users });
  });
});

// 💥 NEW: Promote or demote a user
router.post("/users/:id/toggle-admin", requireAdmin, (req, res) => {
  const userId = req.params.id;

  db.get("SELECT is_admin FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) return res.status(404).send("User not found.");

    const newStatus = user.is_admin === 1 ? 0 : 1;

    db.run(
      "UPDATE users SET is_admin = ? WHERE id = ?",
      [newStatus, userId],
      (err) => {
        if (err) return res.status(500).send("Failed to update user.");
        res.redirect("/admin/users");
      }
    );
  });
});

module.exports = router;
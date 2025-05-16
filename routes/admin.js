const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/database.sqlite");

router.get("/products", (req, res) => {
  const categories = ["Cats", "Toys", "Accessories"];

  db.all("SELECT * FROM products", (err, products) => {
    if (err) return res.status(500).send("Failed to load products");
    res.render("admin_products", { products, categories });
  });
});


router.post("/products", (req, res) => {
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

module.exports = router;


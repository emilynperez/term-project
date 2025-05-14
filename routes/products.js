const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/database.sqlite");

router.get("/", (req, res) => {
  const category = req.query.category;
  let query = "SELECT * FROM products";
  if (category) {
    query += " WHERE category = ?";
  }
  db.all(query, category ? [category] : [], (err, products) => {
    if (err) return res.status(500).send("DB error.");
    res.render("products", { products });
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/database.sqlite");

router.get("/", (req, res) => {
  const category = req.query.category;
  let query = "SELECT * FROM products";
  let params = [];
  let title = "Products";

  if (category) {
    query += " WHERE category = ?";
    params.push(category);
    title = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize
  }

  db.all(query, params, (err, products) => {
    if (err) return res.status(500).send("DB error.");
    res.render("products", { products, title });
  });
});

module.exports = router;

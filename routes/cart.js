const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/database.sqlite");

// Middleware to ensure cart exists
function ensureCart(req, res, next) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
}

router.get("/", ensureCart, (req, res) => {
  const cart = req.session.cart || [];
  res.render("cart", { cart });
});

router.post("/add/:id", ensureCart, (req, res) => {
  const productId = parseInt(req.params.id);
  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
    if (err || !product) {
      return res.status(404).send("Product not found");
    }
    req.session.cart.push(product);
    res.status(200).json({ cartCount: req.session.cart.length });
  });
});

router.post("/remove/:id", ensureCart, (req, res) => {
  const productId = parseInt(req.params.id);
  req.session.cart = req.session.cart.filter(p => p.id !== productId);
  res.redirect("back");
});

module.exports = router;
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

const db = new sqlite3.Database("./data/database.sqlite");

// Middleware to require login
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ success: false, message: "Login required" });
  next();
}

// GET /cart – show current user's cart items
router.get("/", requireLogin, (req, res) => {
  const userId = req.session.user.id;

  db.all(`
    SELECT products.*, cart_items.id AS cart_item_id
    FROM cart_items
    JOIN products ON cart_items.product_id = products.id
    WHERE cart_items.user_id = ?
  `, [userId], (err, items) => {
    if (err) return res.status(500).send("Database error loading cart.");
    res.render("cart", { cart: items });
  });
});

// POST /cart/add/:id – add item to cart
router.post("/add/:id", requireLogin, (req, res) => {
  const userId = req.session.user.id;
  const productId = parseInt(req.params.id);

  db.run("INSERT INTO cart_items (user_id, product_id) VALUES (?, ?)", [userId, productId], function(err) {
    if (err) return res.status(500).json({ success: false, message: "Failed to add to cart." });

    db.get("SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?", [userId], (err, row) => {
      const count = row?.count || 0;
      return res.json({ success: true, cartCount: count, message: "Item added to cart!" });
    });
  });
});

// POST /cart/remove/:cartItemId – remove specific cart entry
router.post("/remove/:cartItemId", requireLogin, (req, res) => {
  const cartItemId = parseInt(req.params.cartItemId);

  db.run("DELETE FROM cart_items WHERE id = ?", [cartItemId], (err) => {
    if (err) return res.status(500).send("Failed to remove item.");
    res.redirect("/cart");
  });
});

module.exports = router;

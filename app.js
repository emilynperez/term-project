const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "berrybag_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// DB connection
const db = new sqlite3.Database("./data/database.sqlite");

// Middleware: share user + cart count globally
app.use((req, res, next) => {
  if (req.session.user) {
    db.get(
      "SELECT COUNT(*) AS count FROM cart_items WHERE user_id = ?",
      [req.session.user.id],
      (err, row) => {
        res.locals.cartCount = row ? row.count : 0;
        res.locals.user = req.session.user;
        next();
      }
    );
  } else {
    res.locals.cartCount = 0;
    res.locals.user = null;
    next();
  }
});

// Route imports
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");

// Route setups
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// Homepage with slides + categories
app.get("/", (req, res) => {
  const slides = JSON.parse(fs.readFileSync("./public/slides.json", "utf8"));

  db.all("SELECT DISTINCT category FROM products", (err, categories) => {
    if (err) return res.status(500).send("Failed to load categories");

    res.render("index", {
      slides,
      categories: categories.map((c) => c.category),
      requireLogin: req.query.requireLogin || null,
    });
  });
});

// Static pages
app.get("/about", (req, res) => res.render("about"));
app.get("/faq", (req, res) => res.render("faq"));
app.get("/payment", (req, res) => res.render("payment"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`) 
);

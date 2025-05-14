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

// DB
const db = new sqlite3.Database("./data/database.sqlite");

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// Homepage with slideshow
app.get("/", (req, res) => {
  const slides = JSON.parse(fs.readFileSync("./public/slides.json", "utf8"));

  db.all("SELECT DISTINCT category FROM products", (err, categories) => {
    if (err) return res.status(500).send("Failed to load categories");

    res.render("index", {
      user: req.session.user,
      slides,
      categories: categories.map((c) => c.category),
    });
  });
});

app.get("/signin", (req, res) => res.render("signin"));
app.get("/register", (req, res) => res.render("register"));
app.get("/payment", (req, res) => res.render("payment"));
app.get("/profile", (req, res) => {
  if (!req.session.user) return res.redirect("/signin");
  res.render("profile", { user: req.session.user });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

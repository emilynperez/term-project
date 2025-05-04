const express = require("express");
const path = require("path");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database("./data/database.sqlite");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));

// Serve pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "homepage.html"));
});

app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/signin.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/register.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/profile.html"));
});

app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/products.html"));
});

app.get("/payment.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/payment.html"));
});

// Provide profile data if user is logged in
app.get("/profile-data", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  db.get("SELECT name, email, address, phone FROM users WHERE id = ?", [req.session.userId], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "User not found" });

    res.json(row);
  });
});

// Auth routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

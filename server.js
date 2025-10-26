const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Load .env

const app = express();

// Enable CORS
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Database Connection (Aiven MySQL)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: true } // Required by Aiven
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to Aiven MySQL successfully!");
  }
});

// GET all users
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// POST new user
app.post("/users", (req, res) => {
  const { full_name, email, phone, password } = req.body;

  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)";
  db.query(sql, [full_name, email, phone, password], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "success", id: result.insertId });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

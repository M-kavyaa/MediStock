const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Check DB connection
db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully ✅");
  }
});

// API 1: Get all Kendras
app.get("/api/kendras", (req, res) => {
  const query = "SELECT kendra_code,kendra_name,state,district from kendras";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// API 2: Login
app.post("/api/login", (req, res) => {
  const { username, password, role, kendra_code} = req.body;

  let query = "SELECT * FROM users WHERE username=? AND password=? AND role=?";
  let params = [username, password, role];

  if (role === "SHOPKEEPER") {
    query += " AND kendra_code=?";
    params.push(kendra_code);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      res.json({ success: true, message: "Login Successful ✅" });
    } else {
      res.json({ success: false, message: "Invalid Credentials ❌" });
    }
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

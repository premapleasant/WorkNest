const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Token required");

  jwt.verify(token, "PremaPleasant", (err, decoded) => {
    if (err) return res.status(401).send("Invalid token");
    req.user = decoded;
    next();
  });
};

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "Work_Nest",
  password: "PremaPleasant",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Mysql connected Successfully");
});

const noise = [
  "/ws",
  "/manifest.json",
  "/static/js/bundle.js.map",
  "/.well-known/appspecific/com.chrome.devtools.json",
];

app.use((req, res, next) => {
  if (!noise.includes(req.url)) {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).send("Error");
    return res.status(200).send("User registered");
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? OR name = ?";
  db.query(sql, [email, email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).send("Invalid username/email");

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid password");

    const token = jwt.sign({ id: user.id, name: user.name }, "secretkey", {
      expiresIn: "1h",
    });
    return res.json({ token, name: user.name });
  });
});

app.get("/tasks", verifyToken, (req, res) => {
  const sql = "SELECT * FROM tasks WHERE user_id = ?";
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).send("Error fetching tasks");
    res.json(results);
  });
});

app.post("/tasks", verifyToken, (req, res) => {
  const { title, description } = req.body;
  const sql =
    "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, 'home')";
  db.query(sql, [req.user.id, title, description], (err, result) => {
    if (err) return res.status(500).send("Error adding task");
    res.status(200).send("Task added");
  });
});

app.put("/tasks/:id", verifyToken, (req, res) => {
  const { title, description } = req.body;
  const sql =
    "UPDATE tasks SET title = ?, description = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [title, description, req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).send("Error updating task");
    res.status(200).send("Task updated");
  });
});

app.put("/tasks/:id/archive", verifyToken, (req, res) => {
  const sql =
    "UPDATE tasks SET status = 'archive' WHERE id = ? AND user_id = ?";
  db.query(sql, [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).send("Error archiving task");
    res.status(200).send("Task archived");
  });
});

app.put("/tasks/:id/unarchive", verifyToken, (req, res) => {
  const sql = "UPDATE tasks SET status = 'home' WHERE id = ? AND user_id = ?";
  db.query(sql, [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).send("Error unarchiving task");
    res.status(200).send("Task moved back to home");
  });
});

app.put("/tasks/:id/trash", verifyToken, (req, res) => {
  const sql = "UPDATE tasks SET status = 'trash' WHERE id = ? AND user_id = ?";
  db.query(sql, [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).send("Error moving task to trash");
    res.status(200).send("Task moved to trash");
  });
});

app.put("/tasks/:id/restore", verifyToken, (req, res) => {
  const sql = "UPDATE tasks SET status = 'home' WHERE id = ? AND user_id = ?";
  db.query(sql, [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).send("Error restoring task");
    res.status(200).send("Task restored to home");
  });
});

app.delete("/tasks/:id", verifyToken, (req, res) => {
  const sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
  db.query(sql, [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).send("Error deleting task");
    res.status(200).send("Task deleted permanently");
  });
});

app.get("/user", verifyToken, (req, res) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).send("Error fetching user");
     res.json(results[0]);
  });
});

app.listen(3000, () => {
  console.log("Server Running in 5000");
});

require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const db = require("better-sqlite3")("ourApp.db");
db.pragma("journal_mode = WAL");

//database setup here
const createTables = db.transaction(() => {
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username STRING NOT NULL UNIQUE,
    password STRING NOT NULL
    )
    `
  ).run();
});
createTables();

//database setup ends here
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use(function (req, res, next) {
  res.locals.errors = [];
  next();
});

app.get("/", (req, res) => {
  res.render("homepage");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {
  const errors = [];

  if (typeof req.body.username !== "string") req.body.username = "";
  if (typeof req.body.password !== "string") req.body.password = "";

  req.body.username = req.body.username.trim();

  if (!req.body.username) errors.push("You must provide a username.");
  if (req.body.username.length && req.body.username.length < 3)
    errors.push("Username must be at least 3 characters.");
  if (req.body.username.length && req.body.username.length > 10)
    errors.push("Username should not be more than 10 characters.");
  if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/))
    errors.push("Usernames can only contain letters and numbers");

  if (!req.body.password) errors.push("You must provide a password.");
  if (req.body.password.length && req.body.password.length < 6)
    errors.push("Password must be at least 6 characters.");
  if (req.body.password.length && req.body.password.length > 20)
    errors.push("Password should not exceed 20 characters.");

  if (errors.length) {
    return res.render("homepage", { errors });
  }

  //After successful user registration
  // 1. save the new user into a database
  const salt = bcrypt.genSaltSync(10);
  req.body.password = bcrypt.hashSync(req.body.password, salt)
  
  const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
  const result = ourStatement.run(req.body.username, req.body.password)

  const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?")
  const ourUser = lookupStatement.get(result.lastInsertRowid)

  // 2. log the user in by giving them a cookie
  const ourTokenValue = jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, skyColor: "blue", userid: ourUser.id, username: ourUser.username}, process.env.JWTSECRET)

  res.cookie("ourSimpleApp", "supertopsecretvalue", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24
  })

  res.send("Thank you!")
});

app.listen(3000);

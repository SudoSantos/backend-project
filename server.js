const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

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
    errors.push("Username must be more than 3 characters.");
  if (req.body.username.length && req.body.username.length > 10)
    errors.push("Username should not be more than 10 characters.");
  if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Usernames can only contain letters and numbers");

  if (errors.length){
    return res.render("homepage", {errors})
  }else{
    res.send("Thank you for filling out the form.")
  }

  res.send("Thank you for filling out the form");
});

app.listen(3000);

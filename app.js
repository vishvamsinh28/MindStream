const express = require("express");
const app = express();
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const usersRoute = require("./routes/users");
const dashboardRoute = require("./routes/dashboard");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  const userAgent = req.headers["user-agent"];
  if (userAgent.match(/mobile/i)) {
    res.sendFile(path.join(__dirname, "public", "mobile.html"));
  } else {
    next();
  }
});

app.use(
  session({
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(flash());

app.use("/", usersRoute);
app.use("/dashboard", dashboardRoute);

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: "true",
});
mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

app.get("/", (req, res) => {
  const username = req.session.username;
  const user_id = req.session.user_id;
  res.render("home.ejs", { username, user_id });
});

app.use(function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  res.render("error", {
    err: error.message,
  });
});

app.listen("3000", (req, res) => {
  console.log("Listening on port 3000");
});

var express = require("express");
var app = express();
var db = require("./db");
const cors = require('cors');
var UserController = require("./models/user/UserController");
var AuthController = require("./auth/AuthController");

app.use(cors());
app.use("/users", UserController);
app.use("/api/auth", AuthController);

module.exports = app;

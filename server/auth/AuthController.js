const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const User = require("../models/user/User");
const VerifyToken = require("./verifyToken");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");

router.post("/register", (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create(
    {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    },
    (err, user) => {
      if (err) return res.status(500).send("problem registering user.");
      const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400
      });
      res.status(200).send({ auth: true, token: token });
    }
  );
});

router.get("/me", VerifyToken, (req, res, next) => {
  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");

    res.status(200).send(user);
  });
});


router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({ message: "Error on the Server" });

    if (!user)
      return res.status(404).send({ auth: false, message: "User not Found" });

    const validPassword = bcrypt.compareSync(req.body.password, user.password);

    if (!validPassword)
      return res
        .send(401)
        .send({ auth: false, message: "invalid password", token: null });

    const token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400
    });
    res.status(200).send({ auth: true, token });
  });
});

router.get("/logout", (req, res) => {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const dotenv = require("dotenv").config();

// const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const { json } = require("body-parser");

router.post(
  "/signup",
//   body('email').isEmail,
//   body('password').isLength({ min: 6 }),
  (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
    // console.log("creating user")
    User.findOne({ email: req.body.email.toLowerCase() })
      .exec()
      .then((user) => {
        // const errors = validationResult(req);
        if (user) {
          return res.status(409).json({
            message: "Email address already exists",
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email.toLowerCase(),
                password: hash,
              });
              user
                .save()
                .then((result) => {
                  console.log(result);
                  res.status(201).json({
                    message: "User created",
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({
                    error: err,
                  });
                });
            }
          });
        }
      });
  }
);

router.get("/", checkAuth, (req, res, next) => {
  User.find()
    .select("-__v -password")
    .then((docs) => {
      const result = {
        count: docs.length,
        services: docs,
      };
      res.status(200).json({ result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: error });
    });
});

router.get("/:userId", checkAuth, (req, res, next) => {
  User.findById(req.params.userId)
    .then((doc) => {
      console.log(doc);
      if (!doc) {
        return res.status(404).json({ message: "user not found" });
      }
      res.status(200).json({
        id: doc._id,
        email: doc.email,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/login", (req, res, next) => {
  console.log(process.env.JWT_KEY);
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length <= 0) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Incorrect Password",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              id: user[0].id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token,
          });
        }
        res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.put("/changepassword/:userId", (req, res, next) => {
  const id = req.params.userId;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  User.findById(id)
    .then((user) => {
      if (!user) {
        res.status(401).json({
          message: "Invalid user",
        });
        return;
      }
      bcrypt.compare(oldPassword, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Something went wrong. Please contact support",
          });
        }
        console.log("restlt ==> ", result);
        if (result) {
          bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            }
            console.log("saving user");
            user.password = hash;
            user.save().then((result) => {
              res.status(200).json({
                message: "Password successfully updated",
              });
            });
          });
          return;
        }
        return res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:userId", checkAuth, (req, res, next) => {
  User.findOne({ _id: req.params.userId })
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      doc.delete().then(() => {
        res.status(200).json({
          message: "User deleted",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;

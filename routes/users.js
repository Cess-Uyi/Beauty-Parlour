const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const dotenv = require("dotenv").config();
const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Appointment = require("../models/appointment");
const { json } = require("body-parser");

const UsersController = require("../controllers/users");

router.post(
  "/signup",
  [
    body("fullName")
      .optional()
      .matches(/^[a-zA-Z][a-zA-Z\s]*$/),
    body("email").isEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must have 6 or more characters"),
    body("userType")
      .isIn(["customer", "vendor"])
      .withMessage('User Type must be either "customer" or "vendor"'),
  ],
  UsersController.users_create_user
);

router.get(
  "/",
  // checkAuth,
  UsersController.users_get_allUsers
);

router.get("/customers", checkAuth, UsersController.users_get_customers);

router.get("/pending", checkAuth, UsersController.users_get_pending);

router.delete(
  "/pending/cancel/:appId",
  checkAuth,
  UsersController.users_cancel_appointment
);

router.get(
  "/transaction-history",
  checkAuth,
  UsersController.users_transaction_history
);

router.post("/login", UsersController.users_login);

router.post("/book", checkAuth, UsersController.users_book_appointment);

router.get("/services", UsersController.services_get_all);

router.get("/services/:serviceName", UsersController.services_get_one);

router.put(
  "/changepassword/:userId",
  checkAuth,
  UsersController.users_changePassword
);

router.put("/forgotpassword", UsersController.users_forgotPassword);

router.put(
  "/reset-password",
  [
    body("confirmPassword", "Passwords do not match").custom(
      (value, { req }) => value === req.body.newPassword
    ),
  ],
  UsersController.users_reset_password
);

router.get("/:userId", checkAuth, UsersController.users_get_user);

router.delete("/:userId", checkAuth, UsersController.users_delete_user);

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const dotenv = require("dotenv").config();
const { body, validationResult } = require("express-validator");
const { json } = require("body-parser");

const User = require("../models/user");
const Appointment = require("../models/appointment");

const AdminController = require("../controllers/admin");
const { replaceOne } = require("../models/user");

// SUSPEND VENDOR OR USER
router.put("/suspend-user/:userId", AdminController.admin_suspend_user);

router.post("/deactivate-user/:userId", AdminController.admin_deactivate_user);

router.post("/activate-user/:userId", AdminController.admin_activate_user);

router.get("/allAppointments", AdminController.admin_all_appointments);

router.get("/transaction-history", AdminController.admin_transaction_history);

router.post(
  "/services/",
  [body("name").isAlpha().withMessage("Service name must be alphabetic")],
  checkAuth,
  AdminController.services_create_service
);

router.put(
  "/services/:serviceId",
  checkAuth,
  AdminController.services_edit_service
);

router.delete(
  "/services/:serviceName",
  checkAuth,
  AdminController.services_delete_service
);

module.exports = router;

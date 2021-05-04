const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");
const dotenv = require("dotenv").config();

const Vendor = require("../models/vendor");
const { json } = require("body-parser");

router.post((req, res, next) => {});

module.exports = router;

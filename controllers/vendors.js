const User = require("../models/user");
const Appointment = require("../models/appointment");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const EmailService = require("../services/email-service");

exports.vendors_create_vendor = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  User.findOne({ email: req.body.email.toLowerCase() })
    .exec()
    .then((user) => {
      if (user) {
        return res.status(409).json({
          message: "Email address already exists",
        });
      }
      let vendor = req.body.vendor;
      if (!vendor) {
        vendor = {};
      }
      const username = req.body.email.split("@")[0];
      const userRole = 3;
      return bcrypt
        .hash(req.body.password, 10)
        .then((hashedPassword) => {
          const newUser = User({
            fullName: req.body.fullName,
            username: username,
            email: req.body.email.toLowerCase(),
            phoneNo: req.body.phoneNo,
            password: hashedPassword,
            userType: req.body.userType,
            userRole: userRole,
            vendor: vendor,
          });
          newUser.save().then((user) => {
            res.status(201).json({
              data: user,
              message: "account created",
            });
          });
          EmailService.sendMail(
            "Welcome to Beauty Parlour",
            "<b>Your account has been successfully registered with Beauty Parlour</b>",
            [req.body.email],
            null,
            "Beauty Parlour"
          );
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: err });
        });
    });
};

exports.vendors_get_all = (req, res, next) => {
  User.find({ userType: "vendor" })
    .exec()
    .then((vendor) => {
      res.status(200).json({
        count: vendor.length,
        vendors: vendor,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: error });
    });
};

exports.vendors_upload_photos = (req, res, next) => {
  console.log(req.files);
  User.findById(req.userData.id).then((user) => {
    if (!user) {
      return res.status(400).json({
        message: "invalid auth",
      });
    }
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      user.vendor.photos.push({
        filePath: file.path,
        mimeType: file.mimetype,
      });
    }
    return user.save().then((result) => {
      res.status(200).json({
        message: "photos uploaded successfully",
        result,
      });
    });
  });
};

exports.vendors_get_pending = (req, res, next) => {
  Appointment.find({ vendorId: req.userData.id, status: "pending" })
    // .populate('userId', '-vendor -password -createdAt -updatedAt -__v')
    .then((docs) => {
      const result = {
        count: docs.length,
        pending: docs,
      };
      res.status(200).json({ result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.vendors_finish_appointment = (req, res, next) => {
  Appointment.findOne({ _id: req.params.appId })
    .then((doc) => {
      console.log(doc);
      if (!doc) {
        return res.status(404).json({
          message: "invalid appointment",
        });
      }
      if (doc.status == "finished") {
        return res.status(400).json({
          message: "appointment has already been finished",
        });
      }
      doc.status = "finished";
      doc.price = req.body.price;
      return doc.save().then((result) => {
        res.status(200).json({
          message: "Appointment finished",
          doc,
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.vendors_edit_shop = (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .then((docs) => {
      if (!docs) {
        return res.status(401).json({
          message: "Vendor not found",
        });
      }

      docs.vendor = req.body.vendor;
      docs.fullName = req.body.fullName;
      docs.phoneNo = req.body.phoneNo;
      docs.address = req.body.address;

      return docs.save().then((result) => {
        res.status(200).json({
          message: "Shop updated",
          request: {
            type: "GET",
            url: "http://localhost/v1/vendor/" + id,
          },
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

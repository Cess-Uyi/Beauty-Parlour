const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Appointment = require("../models/appointment");
const Service = require("../models/service");
const { validationResult } = require("express-validator");

exports.admin_suspend_user = (req, res, next) => {
  User.findById(req.params.userId)
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (doc.userStatus == "deactivated") {
        return res.status(400).json({
          message: "User has been deactivated",
        });
      }
      if (doc.userStatus == "suspended") {
        return res.status(400).json({
          message: "User is already on suspension",
        });
      }
      doc.userStatus = "suspended";
      doc.lockoutEnd = +new Date() + 7 * 24 * 60 * 60 * 1000;
      return doc.save().then((result) => {
        res.status(200).json({
          message: "User successfully suspended",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.admin_deactivate_user = (req, res, next) => {
  User.findById(req.params.userId)
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (doc.userStatus == "inactive") {
        return res.status(400).json({
          message: "User is already inactive",
        });
      }
      doc.userStatus = "inactive";
      return doc.save().then((result) => {
        res.status(200).json({
          message: "User successfully deactivated",
          doc,
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.admin_activate_user = (req, res, next) => {
  User.findById(req.params.userId)
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (doc.userStatus == "active") {
        return res.status(400).json({
          message: "User is already active",
        });
      }
      doc.userStatus = "active";
      return doc.save().then((result) => {
        res.status(200).json({
          message: "User successfully reactivated",
          doc,
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.admin_all_appointments = (req, res, next) => {
  Appointment.find({ status: "pending" })
    .then((docs) => {
      const result = {
        count: docs.length,
        services: docs,
      };
      res.status(200).json({ result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.admin_transaction_history = (req, res, next) => {
  Appointment.find({ status: "finished" })
    .then((docs) => {
      const result = {
        count: docs.length,
        services: docs,
      };
      res.status(200).json({ result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.services_create_service = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const service = new Service({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name.toLowerCase(),
  });
  Service.findOne({ name: req.body.name.toLowerCase() })
    .then((doc) => {
      if (doc) {
        return res.status(400).json({
          message: "service already exists",
        });
      }
      service.save().then((result) => {
        console.log(result);
        res.status(201).json({
          message: "Service successfully registered",
          registeredService: {
            id: result._id,
            name: result.name,
          },
          viewAllServices: {
            type: "GET",
            url: "http://localhost:5000/v1/services",
          },
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.services_edit_service = (req, res, next) => {
  const id = req.params.serviceId;
  const serviceName = req.body.name.toLowerCase();

  Service.findById(id)
    .select("-__v -createdAt -updatedAt")
    .then((service) => {
      if (!service) {
        res.status(400).json({ message: "Record not found" });
        return false;
      }
      return Service.findOne({
        name: serviceName,
      }).then((doMatch) => {
        if (doMatch) {
          res.status(400).json({ message: "Service name previously exists" });
          return false;
        }
        service.name = serviceName;
        return service.save().then((result) => {
          res.status(200).json({
            message: "Service successfully updated",
            viewThisService: {
              type: "GET",
              url: "http://localhost:5000/v1/services/" + serviceName,
            },
          });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.services_delete_service = (req, res, next) => {
  const name = req.params.serviceName.toLowerCase();
  Service.findOne({ name: name }).then((doc) => {
    if (!doc) {
      res.status(404).json({ message: "Service not found" });
      return false;
    }
  });
  Service.deleteOne({ name: name })
    .then((result) => {
      res.status(200).json({
        message: "Service deleted",
        request: "POST",
        url: "http://localhost5000/v1/services",
        data: { name: "String" },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

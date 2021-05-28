const User = require("../models/user");
const Appointment = require("../models/appointment");
const Service = require("../models/service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const EmailService = require("../services/email-service");
const { v4: uuidv4 } = require('uuid');

exports.users_create_user = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  User.findOne({ email: req.body.email.toLowerCase() }).then((user) => {
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
    const userRole = 2;
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

exports.users_get_allUsers = (req, res, next) => {
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
      res.status(500).json({ error: err });
    });
};

exports.users_get_customers = (req, res, next) => {
  User.find({ userType: "customer" })
    .select("-vendor -password -__v -createdAt -updatedAt")
    .exec()
    .then((customer) => {
      res.status(200).json({
        count: customer.length,
        customers: customer,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: error });
    });
};

exports.users_get_user = (req, res, next) => {
  User.findById(req.params.userId)
    .then((doc) => {
      console.log(doc);
      if (!doc) {
        return res.status(404).json({ message: "user not found" });
      }
      res.status(200).json({
        doc,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.users_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length <= 0) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      if (user[0].userStatus == "inactive") {
        return res.status(401).json({
          message: "Access denied",
        });
      }
      if (user[0].userStatus == "suspended") {
        const today = new Date();
        if (user[0].lockoutEnd.getTime() > today.getTime()) {
          return res.status(401).json({
            message:
              "Account Suspended. You can have access to your account again on " +
              user[0].lockoutEnd.getTime(),
          });
        }
        user[0].userStatus = "active";
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
};

exports.users_book_appointment = (req, res, next) => {
  const userId = req.userData.id;
  Appointment.findOne({
    userId: req.userData.id,
    status: "pending",
    dateTime: req.body.dateTime,
  })
    .then((appt) => {
      if (appt) {
        return res.status(400).json({
          message:
            "You already have an appointment slated for this time. Kindly cancel this pre-existing appointment to book another for this time.",
          appt,
        });
      }
      const appointment = new Appointment({
        userId,
        vendorId: req.body.vendorId,
        serviceId: req.body.serviceId,
        dateTime: req.body.dateTime,
        additionalInfo: req.body.additionalInfo,
      });
      appointment.save().then((appointmentId) => {
        Appointment.findById(appointmentId)
          .populate("vendorId userId", "vendor.businessName email fullName")
          .then((response) => {
            res.status(201).json({
              appointmentDetail: response,
              stateCode: 201,
            });
            EmailService.sendMail(
              "New Appointment",
              `<b>Hi ${response.userId.fullName}, \n Your appointment with ${response.vendorId.vendor.businessName} by ${response.dateTime} has been successfully scheduled.</b>`,
              [req.userData.email],
              null,
              "Beauty Parlour"
            );

            EmailService.sendMail(
              "New Appointment",
              `Hi ${
                response.vendorId.vendor.businessName
              }, \n You have a new appointment with ${
                (response, userId.fullName)
              } by ${response.dateTime}. Check your profile for more details.`,
              [response.vendorId.email],
              null,
              "Beauty Parlour"
            );
          });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.users_get_pending = (req, res, next) => {
  Appointment.find({ userId: req.userData.id, status: "pending" })
    .populate("userId", "-vendor -password -createdAt -updatedAt -__v")
    .then((docs) => {
      const result = {
        count: docs.length,
        pending: docs,
      };
      return res.status(200).json({ result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.users_cancel_appointment = (req, res, next) => {
  Appointment.findOne({ _id: req.params.appId })
    .then((doc) => {
      console.log(doc);
      if (!doc) {
        return res.status(404).json({
          message: "invalid appointment",
        });
      }
      if (doc.status == "cancelled") {
        return res.status(400).json({
          message: "appointment has been previously cancelled",
        });
      }
      doc.status = "cancelled";
      return doc.save().then((result) => {
        res.status(200).json({
          message: "Appointment cancelled",
          requester: req.userData.id,
          doc,
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.users_transaction_history = (req, res, next) => {
  Appointment.find({
    $or: [{ userId: req.userData.id }, { vendorId: req.userData.id }],
    status: "finished",
  })
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: "no transaction history",
        });
      }
      const result = {
        count: doc.length,
        pending: doc,
      };
      return res.status(200).json({ result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.services_get_all = (req, res, next) => {
  const perPage = Number(req.query.perPage) || 5;
  const currentPage = Number(req.query.currentPage) || 1;
  Service.find()
    .select("name _id")
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .then((docs) => {
      const result = {
        count: docs.length,
        services: docs.map((doc) => {
          return {
            id: doc._id,
            serviceName: doc.name,
          };
        }),
      };
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: error });
    });
};

exports.services_get_one = (req, res, next) => {
  const name = req.params.serviceName.toLowerCase();
  Service.find({ name: name })
    .select("name _id")
    .then((doc) => {
      console.log(doc);
      if (doc.length <= 0) {
        res.status(404).json({ message: "No valid entry found for service" });
        return false;
      }
      console.log("From database", doc);
      res.status(200).json({
        id: doc._id,
        service: doc,
        request: {
          type: "GET",
          url: "http://localhost:5000/v1/services",
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};


exports.users_changePassword = (req, res, next) => {
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
        console.log("result ==> ", result);
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
};


exports.users_forgotPassword = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      // const newPassword = uuidv4().replace(/-/g,"").toUpperCase();
      const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
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
            message:
              "New password sent to your email. You can now login with your new password",
          });
        });
        EmailService.sendMail(
          "New Password",
          `<b>Your new passsword is ${newPassword}. Ensure to change your password after logging in</b>`,
          [user.email],
          null,
          "Beauty Parlour"
        );
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};


exports.users_delete_user = (req, res, next) => {
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
}
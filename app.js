const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const userRoutes = require("./routes/users");
const vendorRoutes = require("./routes/vendors");
const adminRoutes = require("./routes/admin");

mongoose.connect(
  "mongodb+srv://cess-uyi:succy2151@testcluster.vdw3h.mongodb.net/test",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.get("/", function (req, res) {
  res.send("hello world");
});

app.use("/v1/user", userRoutes);
app.use("/v1/vendor", vendorRoutes);
app.use("/v1/admin", adminRoutes);

app.use("*", (req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

module.exports = app;

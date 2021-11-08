const express = require("express");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const { body, validationResult } = require("express-validator");

const VendorsController = require("../controllers/vendors");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

router.post(
  "/signup",
  [
    body("email").isEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must have 6 or more characters"),
    body("vendor.businessName").isString(),
    body("vendor.businessCategory")
      .isIn(["salon", "spa", "makeup", "nails"])
      .withMessage(
        "Business Category must be either salon, spa, makeup or nails"
      ),
    body("userType")
      .isIn(["customer", "vendor"])
      .withMessage('User Type must be either "customer" or "vendor"'),
  ],
  VendorsController.vendors_create_vendor
);

router.get("/", VendorsController.vendors_get_all);

router.post(
  "/upload-photos",
  checkAuth,
  upload.array("vendorPhotos", 12),
  VendorsController.vendors_upload_photos
);

router.get("/pending", checkAuth, VendorsController.vendors_get_pending);

router.post(
  "/pending/finish/:appId",
  checkAuth,
  VendorsController.vendors_finish_appointment
);

router.put("/edit-shop/:userId", VendorsController.vendors_edit_shop);

module.exports = router;

const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
    },

    username: {
      required: true,
      type: String,
    },

    email: {
      required: true,
      type: String,
    },

    phoneNo: {
      required: true,
      type: String,
    },

    password: {
      required: true,
      type: String,
    },

    userType: {
      required: true,
      type: String,
    },

    userRole: {
      required: true,
      type: Number,
      Enumerator: [1, 2, 3],
    },

    userStatus: {
      required: true,
      type: String,
      default: "active",
    },

    lockoutEnd: {
      required: false,
      type: Date,
      default: null,
    },

    vendor: {
      businessName: {
        type: String,
      },
      businessCategory: [],
      address: [
        {
          streetName: {
            type: String,
          },
          city: {
            type: String,
          },
          state: {
            type: String,
          },
        },
      ],
      photos: [
        {
          filePath: {
            type: String,
            required: false,
          },
          mimeType: {
            type: String,
            required: false,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

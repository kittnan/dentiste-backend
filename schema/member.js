const mongoose = require("mongoose");
const member = mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
    },
    idCard: {
      type: String,
      required: true,
    },
    titleName: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    position: {
      type: String,
    },
    description: {
      type: String,
    },
    updateBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("members", member);

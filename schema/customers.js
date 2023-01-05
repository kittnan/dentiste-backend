const mongoose = require("mongoose");
const customer = mongoose.Schema(
  {
    customerId: {
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
    birthDay: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    xrayImage: {
      type: [String],
    },
    congenitalDisease: {
      type: String,
    },
    allergic: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    // nextMeet: {
    //   status:Boolean,
    //   date:Date
    // },
    tokenLine: {
      type: String,
    },
    updateBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("customers", customer);

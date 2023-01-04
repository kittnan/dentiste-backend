const mongoose = require("mongoose");
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const data = mongoose.Schema(
  {
    customerId: {
      type: ObjectId,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: ObjectId,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date
    },
    updateBy: {
      type: ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: false,
      default:''
    },

  },
  { timestamps: true }
);
module.exports = mongoose.model("queues", data);

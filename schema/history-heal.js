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
    healList: {
      type: [],
      required: true,
    },
    sideList: {
      type: [],
      required: true,
    },
    description: {
      type: String,
      default:''
    },
   

  },
  { timestamps: true }
);
module.exports = mongoose.model("historyHeal", data);

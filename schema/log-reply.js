const mongoose = require("mongoose");
const data = mongoose.Schema(
  {
    reply: Boolean,
    tokenLine: String,
    queueId: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("logReply", data);

const mongoose = require("mongoose");
const data = mongoose.Schema({
    reply: String,
    tokenLine: String,
    queueId: String,
}, { timestamps: true });
module.exports = mongoose.model("logReply", data);
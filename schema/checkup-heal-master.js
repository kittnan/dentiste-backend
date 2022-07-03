const mongoose = require("mongoose");
const checkupHeal = mongoose.Schema(
  {
    groupType: String,
    group: String,
    code: String,
    checked: Boolean,
    items: [],
  },
  { timestamps: true }
);
module.exports = mongoose.model("checkupHeal", checkupHeal);

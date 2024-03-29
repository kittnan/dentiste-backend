// ! import package
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const fileUpload = require("express-fileupload");

// ! routes
const customers = require("./routes/customers");
const members = require("./routes/members");
const checkup = require("./routes/checkup-heal-master");
const queue = require("./routes/queue");
const doctor = require("./routes/doctor");
const historyHeal = require("./routes/history-heal");
const line = require("./routes/line");
const files = require("./routes/files");
const static = require("./routes/static");

// ! connect cloud database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  })
  .then(() => console.log("database connected"))
  .catch((err) => console.log(err));

// ! middle ware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
var router = express.Router();

// ! route
app.use("/customers", customers);
app.use("/members", members);
app.use("/checkup", checkup);
app.use("/queue", queue);
app.use("/doctor", doctor);
app.use("/historyHeal", historyHeal);
app.use("/line", line);
app.use("/files", files);
app.use("/static", static);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`start server in port ${port}`));

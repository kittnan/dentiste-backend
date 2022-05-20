// ! import package
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

// ! routes
const customers = require("./routes/customers");
const members = require("./routes/members");


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
var router = express.Router();


// ! route
app.use("/customers", customers);
app.use("/members", members);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`start server in port ${port}`));

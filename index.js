// ! import package
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

// ! routes
// const blogRoute = require("./routes/blog");


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

// ! route
// app.use("/api", blogRoute);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`start server in port ${port}`));

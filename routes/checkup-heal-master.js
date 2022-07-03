const express = require("express");
const Router = express.Router();

let checkup = require("../schema/checkup-heal-master");

Router.get("/", (req, res, next) => {
  checkup.find({}).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.post("/add", (req, res, next) => {
  checkup.insertMany(req.body, (err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});
Router.put("/update/:id", (req, res, next) => {
  const { id } = req.params;
  checkup.findByIdAndUpdate(id, { $set: req.body }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.delete("/delete/:id", (req, res, next) => {
  const { id } = req.params;
  checkup.findByIdAndDelete(id).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

module.exports = Router;

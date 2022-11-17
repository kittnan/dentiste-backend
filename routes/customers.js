const express = require("express");
const Router = express.Router();

let Customers = require("../schema/customers");

Router.get("/last", (req, res, next) => {
  Customers.aggregate([
    {
      $match: {},
    },
  ])
    .sort({ customerId: -1 })
    .limit(1)
    .exec((err, result) => {
      if (err) res.json(err);
      res.json(result);
    });
});

Router.get("/", (req, res, next) => {
  Customers.aggregate([
    {
      $match: {},
    },
  ])
    .sort({ customerId: 1 })
    .exec((err, rs) => {
      if (err) {
        res.json(err);
      } else {
        res.json(rs);
      }
    });
});

Router.post("/add", (req, res, next) => {
  Customers.insertMany(req.body, (err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.put("/update/:id", (req, res, next) => {
  const { id } = req.params;
  Customers.updateOne({ _id: id }, { $set: req.body }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.delete("/delete/:id", (req, res, next) => {
  const { id } = req.params;
  Customers.deleteOne({ _id: id }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

module.exports = Router;

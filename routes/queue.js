const express = require("express");
const Router = express.Router();

let Queue = require("../schema/queue");

Router.get("/", (req, res, next) => {
  Queue.aggregate([
    {
      $match: {},
    },
  ])
    .sort({ memberId: 1 })
    .exec((err, rs) => {
      if (err) {
        res.json(err);
      } else {
        res.json(rs);
      }
    });
});

Router.post("/add", (req, res, next) => {
  Queue.insertMany(req.body, (err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});


Router.put("/update/:id", (req, res, next) => {
  const { id } = req.params;
  Queue.updateOne({ _id: id }, { $set: req.body }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.delete("/delete/:id", (req, res, next) => {
  const { id } = req.params;
  Queue.deleteOne({ _id: id }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

module.exports = Router;

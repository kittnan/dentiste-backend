const express = require("express");
const Router = express.Router();
var mongoose = require('mongoose');
let Member = require("../schema/member");

Router.get("/last", (req, res, next) => {
  Member.aggregate([
    {
      $match: {},
    },
  ])
    .sort({ memberId: -1 })
    .limit(1)
    .exec((err, result) => {
      if (err) res.json(err);
      res.json(result);
    });
});

Router.get("/", (req, res, next) => {
  const { id } = req.query;
  let con = {}
  if(id){
    con = {
      _id:mongoose.Types.ObjectId(id)
    }
  }
  Member.aggregate([
    {
      $match: con,
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
Router.get("/doctor", (req, res, next) => {
  Member.aggregate([
    {
      $match: {
        position: "doctor",
      },
    },
  ]).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.post("/add", (req, res, next) => {
  Member.insertMany(req.body, (err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.post("/login", (req, res, next) => {
  const con = [
    {
      $match: {
        username: req.body.username,
        password: req.body.password,
      },
    },
  ];
  Member.aggregate(con, (err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});
Router.put("/update/:id", (req, res, next) => {
  const { id } = req.params;
  Member.updateOne({ _id: id }, { $set: req.body }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.delete("/delete/:id", (req, res, next) => {
  const { id } = req.params;
  Member.deleteOne({ _id: id }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

module.exports = Router;

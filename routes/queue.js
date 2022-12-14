const express = require("express");
const Router = express.Router();
const moment = require("moment");
const ObjectID = require("mongodb").ObjectID;
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

Router.get("/day", (req, res, next) => {
  const { doctorId } = req.query;
  var startDate = moment().startOf("day").toDate();
  var endDate = moment().endOf("day").toDate();
  const con = {
    $match: {
      startDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    },
  };
  if (doctorId && doctorId != "null") {
    con["$match"]["doctorId"] = new ObjectID(doctorId);
  }
  Queue.aggregate([con])
    .sort({ startDate: 1 })
    .exec((err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
});
Router.get("/week", (req, res, next) => {
  const { doctorId } = req.query;
  var startDate = moment().startOf("week").add(1, "day").toDate();
  var endDate = moment().endOf("week").add(1, "day").toDate();
  const con = {
    $match: {
      startDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    },
  };
  if (doctorId && doctorId != "null") {
    con["$match"]["doctorId"] = new ObjectID(doctorId);
  }
  Queue.aggregate([con])
    .sort({ startDate: 1 })
    .exec((err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
});
Router.get("/month", (req, res, next) => {
  const { doctorId } = req.query;
  var startDate = moment().startOf("month").toDate();
  var endDate = moment().endOf("month").toDate();
  const con = {
    $match: {
      startDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    },
  };
  if (doctorId && doctorId != "null") {
    con["$match"]["doctorId"] = new ObjectID(doctorId);
  }
  Queue.aggregate([con])
    .sort({ startDate: 1 })
    .exec((err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
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

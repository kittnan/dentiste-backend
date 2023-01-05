const express = require("express");
const Router = express.Router();
const moment = require("moment");
const ObjectID = require("mongodb").ObjectID;
let historyHeal = require("../schema/history-heal");

Router.get("/", (req, res, next) => {
  historyHeal.aggregate([
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

Router.get("/customerId", (req, res, next) => {
  const { customerId } = req.query;
  const con = {
    $match: {
      customerId: new ObjectID(customerId)
    },
  };

  historyHeal.aggregate([con])
    .exec((err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
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
  historyHeal.aggregate([con])
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
  historyHeal.aggregate([con])
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
  historyHeal.aggregate([con])
    .sort({ startDate: 1 })
    .exec((err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
});
Router.get("/period", (req, res, next) => {
  let { doctorId, start, end } = req.query;
  if (start == end) {
    end = moment(end).endOf("day");
  }
  var startDate = moment(start).toDate();
  var endDate = moment(end).toDate();
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
  historyHeal.aggregate([con])
    .sort({ startDate: 1 })
    .exec((err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
});

Router.post("/add", async (req, res, next) => {
  console.log(req.body);
  const foo = await historyHeal.aggregate([
    {
      $match: {
        doctorId: new ObjectID(req.body.doctorId),
        startDate: {
          $eq: new Date(req.body.startDate),
        },
      },
    },
  ]);
  if (foo && foo.length > 0) {
    res.json({ error: true, data: foo });
  } else {
    historyHeal.insertMany(req.body, (err, rs) => {
      if (err) {
        res.json(err);
      } else {
        res.json(rs);
      }
    });
  }
});

Router.put("/update/:id", (req, res, next) => {
  const { id } = req.params;
  historyHeal.updateOne({ _id: id }, { $set: req.body }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

Router.delete("/delete/:id", (req, res, next) => {
  const { id } = req.params;
  historyHeal.deleteOne({ _id: id }).exec((err, rs) => {
    if (err) {
      res.json(err);
    } else {
      res.json(rs);
    }
  });
});

module.exports = Router;

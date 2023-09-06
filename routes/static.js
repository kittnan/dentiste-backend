const express = require("express");
const Router = express.Router();
var mongoose = require("mongoose");
let Queues = require("../schema/queue");

Router.get("/", async (req, res, next) => {
  let arr = [];

  const total = await Queues.aggregate([
    {
      $match: {
        status: {
          $nin: ["waitConfirm", "waitDoctor"],
        },
      },
    },
    { $count: "count" },
  ]);
  const healed = await Queues.aggregate([
    {
      $match: {
        status: {
          $in: ["healed", "finish"],
        },
      },
    },
    { $count: "count" },
  ]);
  const cancel = await Queues.aggregate([
    {
      $match: {
        status: {
          $in: ["cancel"],
        },
      },
    },
    { $count: "count" },
  ]);
  const lost = await Queues.aggregate([
    {
      $match: {
        status: {
          $in: ["lost"],
        },
      },
    },
    { $count: "count" },
  ]);
  const nextMeet = await Queues.aggregate([
    {
      $match: {
        status: {
          $in: ["next"],
        },
      },
    },
    { $count: "count" },
  ]);
  const waitConfirm = await Queues.aggregate([
    {
      $match: {
        status: {
          $in: ["waitConfirm"],
        },
      },
    },
    { $count: "count" },
  ]);
  const waitDoctor = await Queues.aggregate([
    {
      $match: {
        status: {
          $in: ["waitDoctor"],
        },
      },
    },
    { $count: "count" },
  ]);
  arr = [
    {
      name: "total",
      value: "จำนวนครั้งที่เคยใช้บริการ",
      count: total[0].count,
      percent: 1,
    },
    {
      name: "healed",
      value: "รักษาสำเร็จ",
      count: healed[0].count,
      percent: healed[0].count / total[0].count,
    },
    {
      name: "cancel",
      value: "ยกเลิกนัด",
      count: cancel[0].count,
      percent: cancel[0].count / total[0].count,
    },
    {
      name: "lost",
      value: "ไม่มานัด",
      count: lost[0].count,
      percent: lost[0].count / total[0].count,
    },
    {
      name: "nextMeet",
      value: "เลื่อนนัด",
      count: nextMeet[0].count,
      percent: nextMeet[0].count / total[0].count,
    },
    // {
    //   name: "waitConfirm",
    //   value: "รอยืนยันคิว",
    //   count: waitConfirm[0].count,
    //   percent: waitConfirm[0].count / total[0].count,
    // },
    // {
    //   name: "waitDoctor",
    //   value: "รอตรวจ",
    //   count: waitDoctor[0].count,
    //   percent: waitDoctor[0].count / total[0].count,
    // },
  ];
  res.json(arr);
});

module.exports = Router;

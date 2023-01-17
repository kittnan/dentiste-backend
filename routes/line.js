const express = require("express");
const Router = express.Router();
var mongoose = require("mongoose");
const moment = require("moment");
const line = require("@line/bot-sdk");
const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret,
};

let Member = require("../schema/member");
let Customers = require("../schema/customers");
let Queue = require("../schema/queue");

const client = new line.Client(config);

// webhook callback
Router.post("/webhook", (req, res) => {
  if (!req.body.events) {
    return res.status(500).end();
  }
  // handle events separately
  Promise.all(
    req.body.events.map((event) => {
      if (
        event.replyToken === "00000000000000000000000000000000" ||
        event.replyToken === "ffffffffffffffffffffffffffffffff"
      ) {
        return;
      }
      return handleEvent(event);
    })
  )
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  console.log("e", event);
  if (event.message.type === "text") {
    // return client.replyMessage(event.replyToken, {
    //   type: "text",
    //   text: "ข้อมูลคิว",
    //   wrap: true,
    // });
    if (event.message.text.length === 13 && !isNaN(event.message.text)) {
      console.log(event.message.text);
      const data = await Customers.aggregate([
        {
          $match: {
            idCard: event.message.text,
            // startDate:{
            //   $gte: new Date()
            // }
          },
        },
        {
          $lookup: {
            from: "queues",
            localField: "_id",
            foreignField: "customerId",
            as: "queues",
          },
        },
      ]);
      if (data && data[0]?.queues?.length > 0) {
        const len = data[0]?.queues?.length - 1;
        const queue = data[0]?.queues[len];
        const date = moment(queue.startDate)
          .locale("th")
          .format("d MMM YYYY, HH:mm")
          .toString();

        // var fs = require("fs");
        // var mime = "image/jpg";
        // var encoding = "base64";
        // var d = fs
        //   .readFileSync(
        //     "D:/ProjectClinic/github-mos/dentiste-backend/linerichmenu_8.jpg"
        //   )
        //   .toString(encoding);
        // var uri = "data:" + mime + ";" + encoding + "," + d;

        return client.replyMessage(event.replyToken, [
          {
            type: "text",
            text: `คนไข้: ${queue.customerName}\nหมอ: ${queue.doctorName}\nวันเวลา: ${date}`,
            wrap: true,
          },
          {
            type: "text",
            text: `QR CODE`,
            wrap: true,
          },
          {
            type: "image",
            originalContentUrl:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/QR_deWP.svg/1200px-QR_deWP.svg.png",
            previewImageUrl:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/QR_deWP.svg/1200px-QR_deWP.svg.png",
          },
        ]);
      } else {
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "ไม่มีนัด",
          wrap: true,
        });
      }
    }
    if (event.message.text === "ที่อยู่") {
      return client.replyMessage(event.replyToken, {
        type: "location",
        title: "Intercountry Centre for Oral Health",
        address:
          "548 ถนน เชียงใหม่-ลำพูน ตำบลวัดเกต อำเภอเมืองเชียงใหม่ เชียงใหม่ 50000",
        latitude: 18.7597445,
        longitude: 99.0062138,
      });
    }
    if (event.message.text === "ติดต่อ") {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: `เวลาทำการ\nวันจันทร์ 8:30–20:30\nวันอังคาร 8:30–20:30\nวันพุธ 8:30–20:30\nวันพฤหัสบดี 8:30–20:30\nวันศุกร์ 8:30–20:30\nวันเสาร์ 9:00–17:00\nวันอาทิตย์ 9:00–17:00\nเบอร์โทรติดต่อ: 053140142`,
        wrap: true,
      });
    }
    if (event.message.text === "คิววันนัด") {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "โปรดพิมเลขบัตรประชาชน 13 หลัก",
        wrap: true,
      });
    }
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "ข้อมูลไม่ถูกต้อง",
      wrap: true,
    });
  }
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: "ข้อมูลไม่ถูกต้อง",
    wrap: true,
  });
}

function make_base() {
  var canvas = document.createElement("canvas");
  context = canvas.getContext("2d");

  base_image = new Image();
  base_image.src = "../linerichmenu_8.jpg";
  base_image.onload = function () {
    context.drawImage(base_image, 100, 100);
  };
  return canvas.toDataURL("image/jpeg");
}

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
  let con = {};
  if (id) {
    con = {
      _id: mongoose.Types.ObjectId(id),
    };
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

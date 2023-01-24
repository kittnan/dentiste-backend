const express = require("express");
const Router = express.Router();
var mongoose = require("mongoose");
const moment = require("moment");
const line = require("@line/bot-sdk");
const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret,
};
const Blob = require("buffer");

var QRCode = require("qrcode");
const axios = require("axios").default;
var fs = require("fs");
var FormData = require("form-data");

let Member = require("../schema/member");
let Customers = require("../schema/customers");
let Queue = require("../schema/queue");
const ObjectID = require("mongodb").ObjectID;

const client = new line.Client(config);

Router.post("/sendQR", async (req, res, next) => {
  const queue = req.body;
  const customer = await Customers.aggregate([
    {
      $match: {
        _id: ObjectID(queue.customerId),
      },
    },
  ]);

  if (!!customer) {
    if (customer[0]?.tokenLine) {
      const qrCodeUrl = await genQr(`${process.env.PATHWEB}?id=${queue._id}`);
      const resSendLine = await sendLine(queue.tokenLine, queue, qrCodeUrl);
      console.log(resSendLine);
      res.json({ data: resSendLine });
    } else {
      res.json({ data: "ยังไม่ได้ลงทะเบียน" });
    }
  } else {
    res.json({ data: "ไม่มีข้อมูลคนไข้" });
  }
});

function sendLine(tokenLine, queue, url) {
  var data = JSON.stringify({
    to: tokenLine,
    messages: [
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
        originalContentUrl: url,
        previewImageUrl: url,
      },
    ],
  });

  var config = {
    method: "post",
    url: "https://api.line.me/v2/bot/message/push",
    headers: {
      Authorization:
        "Bearer kMlpnWTHetSTngKWE7NlAL28iNaAvv/Z6Qx/W58QE3smWyQDsecMpS1w6id+3akW1aNpsnV8Hy6YQtcXg0ipths+byz7nZ5NUd7QekO5T6GrU407wm9kMlCMZpTbV9z4SeQVCovCd9O1gYeV24sQSQdB04t89/1O/w1cDnyilFU=",
      "Content-Type": "application/json",
    },
    data: data,
  };

  return axios(config);
}

Router.get("/send", (req, res, next) => {
  var data = JSON.stringify({
    to: "U7114fcc26a0c4c4e27e1f4f7bd70e814",
    messages: [
      {
        type: "text",
        text: "ทักไปแล้วน๊า",
      },
    ],
  });

  var config = {
    method: "post",
    url: "https://api.line.me/v2/bot/message/push",
    headers: {
      Authorization:
        "Bearer kMlpnWTHetSTngKWE7NlAL28iNaAvv/Z6Qx/W58QE3smWyQDsecMpS1w6id+3akW1aNpsnV8Hy6YQtcXg0ipths+byz7nZ5NUd7QekO5T6GrU407wm9kMlCMZpTbV9z4SeQVCovCd9O1gYeV24sQSQdB04t89/1O/w1cDnyilFU=",
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
});

async function genQr(text) {
  const fileName = new Date().getTime() + ".jpg";
  await QRCode.toFile(fileName, text);
  var data = new FormData();
  data.append("file", fs.createReadStream(fileName));
  data.append("allowedDownloads", "0");
  data.append("expiryDays", "0");

  var config = {
    method: "post",
    url: "https://project.sodacanhomelab.uk/api/files/add",
    headers: {
      apikey: "z6ZOdIAeE5csnBTz0VoBvhzQJelHIc",
      ...data.getHeaders(),
    },
    data: data,
  };

  const res = await axios(config);
  if (res) {
    fs.unlink(fileName, (err) => {
      if (err) console.log(err);
    });
    const url = res.data.HotlinkUrl + res.data.FileInfo.HotlinkId;
    return url;
  } else {
    return "";
  }
}

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
      const idCard = event.message.text;
      const data = await Customers.aggregate([
        {
          $match: {
            idCard: idCard,
            startDate: {
              $gte: new Date(),
            },
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
      // console.log(data[0].queues);
      if (data && data[0]?.tokenLine) {
        if (data && data[0].queues.length > 0) {
          const url = await genQr(
            `${process.env.PATHWEB}?id=${data[0].queues._id}`
          );
          const queueFilter = data[0].queues.filter((q) => {
            if (new Date(q.startDate).getTime() >= new Date().getTime())
              return true;
            return false;
          });
          const len = queueFilter.length - 1;
          const queue = queueFilter[len];
          const date = moment(queue.startDate)
            .locale("th")
            .format("Do MMM YYYY, HH:mm")
            .toString();
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
              originalContentUrl: url,
              previewImageUrl: url,
            },
          ]);
        } else {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: "ไม่มีนัด",
            wrap: true,
          });
        }
      } else {
        console.log(data);
        const update = await Customers.updateOne(
          { _id: data[0]._id },
          { $set: { tokenLine: event.source.userId }, ...data[0] }
        );
        if (data && data[0].queues.length > 0) {
          const url = await genQr(
            `${process.env.PATHWEB}?id=${data[0].queues._id}`
          );
          const queueFilter = data[0].queues.filter((q) => {
            if (new Date(q.startDate).getTime() >= new Date().getTime())
              return true;
            return false;
          });
          const len = queueFilter.length - 1;
          const queue = queueFilter[len];
          const date = moment(queue.startDate)
            .locale("th")
            .format("Do MMM YYYY, HH:mm")
            .toString();
          return client.replyMessage(event.replyToken, [
            {
              type: "text",
              text: "ลงทะเบียนสำเร็จ",
              wrap: true,
            },
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
              originalContentUrl: url,
              previewImageUrl: url,
            },
          ]);
        } else {
          return client.replyMessage(event.replyToken, [
            {
              type: "text",
              text: "ลงทะเบียนสำเร็จ",
              wrap: true,
            },
            {
              type: "text",
              text: "ไม่มีนัด",
              wrap: true,
            },
          ]);
        }
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

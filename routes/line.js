const express = require("express");
const Router = express.Router();
var mongoose = require("mongoose");
const moment = require("moment");
const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret,
};
var QRCode = require("qrcode");
const axios = require("axios").default;
var fs = require("fs");
var FormData = require("form-data");

let Customers = require("../schema/customers");
let Queue = require("../schema/queue");
let LogReply = require("../schema/log-reply");
const ObjectID = require("mongodb").ObjectID;

const client = new line.Client(config);

var cron = require("node-cron");

autoRunAt8();
autoRun4Hr()
    // ! function รันตอน 8 โมง เช้าของทุกวัน
async function autoRunAt8() {
    // const job = cron.schedule('0 10 22 * * *', async function() {
    const job = cron.schedule('0 0 8 * * *', async function() {
        console.log("cron.schedule");

        const clearReply = await LogReply.updateMany({
            createdAt: {
                $lte: new Date()
            }
        }, { $set: { reply: "noReply" } })
        console.log('clearReply', clearReply)

        const minDate = moment().add(1, "day").startOf("day").toISOString();
        const maxDate = moment().add(1, "day").endOf("day").toISOString();
        const queues = await Queue.aggregate([{
            $match: {
                startDate: {
                    $gte: new Date(minDate),
                    $lte: new Date(maxDate),
                },
                status: "waitConfirm",
            },
        }, ]);
        for (let i = 0; i < queues.length; i++) {
            const customer = await Customers.aggregate([{
                $match: {
                    _id: ObjectID(queues[i].customerId),
                },
            }, ]);
            if (customer && customer.length > 0 && customer[0].tokenLine) {
                const qrCodeUrl = await genQr(
                    `${process.env.PATHWEB}?id=${queues[i]._id}`
                );
                const resSendLine = await sendLine(
                    customer[0].tokenLine,
                    queues[i],
                    qrCodeUrl,
                    true
                );
                await LogReply.create({
                    reply: 'false',
                    queueId: queues[i]._id,
                    tokenLine: customer[0].tokenLine,
                });
            }
        }
    });
}



// ! function รัน ทุกๆ 12.00 16.00 20.00
async function autoRun4Hr() {
    // const job = cron.schedule('*/15 * * * * *', async function() {
    const job = cron.schedule('0 0 12,16,20 * * *', async function() {
        console.log("cron.autoRun4Hr");
        const mo = moment().startOf('day').toISOString()
        const reply = await LogReply.aggregate([{
            $match: {
                reply: 'false',
                createdAt: {
                    $gte: new Date(mo)
                }
            }
        }])
        for (let i = 0; i < reply.length; i++) {
            const queue = await Queue.aggregate([{
                $match: {
                    _id: ObjectID(reply[i].queueId)
                }
            }])

            const qrCodeUrl = await genQr(
                `${process.env.PATHWEB}?id=${queue[0]._id}`
            );
            const resSendLine = await sendLine(
                reply[0].tokenLine,
                queue[0],
                qrCodeUrl, true
            );

        }

    });
}


// ! api สำหรับนัดครั้งหน้า และ เลื่อนนัด
Router.post("/sendQR", async(req, res, next) => {
    const queue = req.body.data;
    const customer = await Customers.aggregate([{
        $match: {
            _id: ObjectID(queue.customerId),
        },
    }, ]);
    if (customer && customer.length > 0) {
        if (customer[0].tokenLine) {
            const qrCodeUrl = await genQr(`${process.env.PATHWEB}?id=${queue._id}`);
            const resSendLine = await sendLine(
                customer[0].tokenLine,
                queue,
                qrCodeUrl, false
            );
            // console.log(resSendLine);

            res.json({ data: "ok" });
        } else {
            res.json({ data: "ยังไม่ได้ลงทะเบียน" });
        }
    } else {
        res.json({ data: "ไม่มีข้อมูลคนไข้" });
    }
});

// ! function ส่งไลน์
function sendLine(tokenLine, queue, url, footer) {

    let foot = {
        type: "text",
        text: `ถ้ารับทราบแล้วกรุณาพิมพ์ตอบกลับว่า ok`,
        wrap: true,
    }
    if (!footer) foot = {
        type: "text",
        text: `ยินดีให้บริการ`,
        wrap: true,
    }


    const date = moment(queue.startDate)
        .locale("th")
        .format("Do MMM YYYY, HH:mm")
        .toString();
    var data = JSON.stringify({
        to: tokenLine,
        messages: [{
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
            foot
        ],
    });

    var config = {
        method: "post",
        url: "https://api.line.me/v2/bot/message/push",
        headers: {
            Authorization: "Bearer kMlpnWTHetSTngKWE7NlAL28iNaAvv/Z6Qx/W58QE3smWyQDsecMpS1w6id+3akW1aNpsnV8Hy6YQtcXg0ipths+byz7nZ5NUd7QekO5T6GrU407wm9kMlCMZpTbV9z4SeQVCovCd9O1gYeV24sQSQdB04t89/1O/w1cDnyilFU=",
            "Content-Type": "application/json",
        },
        data: data,
    };

    return axios(config);
}

// Router.get("/send", (req, res, next) => {
//     var data = JSON.stringify({
//         to: "U7114fcc26a0c4c4e27e1f4f7bd70e814",
//         messages: [{
//             type: "text",
//             text: "ทักไปแล้วน๊า",
//         }, ],
//     });

//     var config = {
//         method: "post",
//         url: "https://api.line.me/v2/bot/message/push",
//         headers: {
//             Authorization: "Bearer kMlpnWTHetSTngKWE7NlAL28iNaAvv/Z6Qx/W58QE3smWyQDsecMpS1w6id+3akW1aNpsnV8Hy6YQtcXg0ipths+byz7nZ5NUd7QekO5T6GrU407wm9kMlCMZpTbV9z4SeQVCovCd9O1gYeV24sQSQdB04t89/1O/w1cDnyilFU=",
//             "Content-Type": "application/json",
//         },
//         data: data,
//     };

//     axios(config)
//         .then(function(response) {
//             console.log(JSON.stringify(response.data));
//         })
//         .catch(function(error) {
//             console.log(error);
//         });
// });

// ! function gen QR
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

//! webhook callback from line and reply
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


// ! handle event line and reply format
async function handleEvent(event) {
    // console.log("e", event);
    if (event.message.type === "text") {
        console.log(event.message.text.toLowerCase())
        if (event.message.text.toLowerCase() == 'ok') {
            const clearReply = await LogReply.updateMany({
                tokenLine: event.source.userId
            }, { $set: { reply: "reply" } })
            console.log('clearReply', clearReply)
            if (clearReply && clearReply.modifiedCount > 0) {
                return client.replyMessage(event.replyToken, [{
                        type: "text",
                        text: `ขอบคุณที่ใช้บริการ`,
                        wrap: true,
                    },

                ]);
            }
        }

        if (event.message.text.length === 13 && !isNaN(event.message.text)) {
            const idCard = event.message.text;
            const customer = await Customers.aggregate([{
                $match: {
                    idCard: idCard,
                },
            }, ]);

            const queues = await Customers.aggregate([{
                    $match: {
                        idCard: idCard,
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
                {
                    $match: {
                        "queues.startDate": {
                            $gte: new Date(),
                        },

                    },
                },
            ]).sort({
                "queues.startDate": -1
            })
            console.log(queues);
            if (queues && queues.length > 0 && queues[0].tokenLine) {
                if (queues && queues[0].queues.length > 0) {
                    let currentQueue = queues[0].queues[queues[0].queues.length - 1]
                    const url = await genQr(
                        `${process.env.PATHWEB}?id=${currentQueue._id}`
                    );
                    const queueFilter = queues[0].queues.filter((q) => {
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
                    return client.replyMessage(event.replyToken, [{
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
                const bodyUpdate = {
                    ...customer[0],
                    tokenLine: event.source.userId,
                };
                const update = await Customers.updateOne({ _id: customer[0]._id }, { $set: bodyUpdate });




                if (queues && queues.length > 0 && queues[0].queues.length > 0) {
                    const url = await genQr(
                        `${process.env.PATHWEB}?id=${queues[0].queues[0]._id}`
                    );
                    const queueFilter = queues[0].queues.filter((q) => {
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
                    return client.replyMessage(event.replyToken, [{
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
                    if (customer.length > 0 && customer[0].tokenLine) {
                        return client.replyMessage(event.replyToken, [{
                            type: "text",
                            text: "ไม่มีนัด",
                            wrap: true,
                        }, ]);
                    }
                    return client.replyMessage(event.replyToken, [{
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
                address: "548 ถนน เชียงใหม่-ลำพูน ตำบลวัดเกต อำเภอเมืองเชียงใหม่ เชียงใหม่ 50000",
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


module.exports = Router;
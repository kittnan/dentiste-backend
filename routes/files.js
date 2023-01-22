const express = require("express");
const Router = express.Router();
const moment = require("moment");
const ObjectID = require("mongodb").ObjectID;
const fs = require("fs");

Router.post("/upload", async (req, res, next) => {
  const Files =
    req.files?.Files?.length > 0 ? req.files.Files : [req.files.Files];
  console.log(Files);
  res.json(await uploadFile(Files));
});

function uploadFile(Files) {
  return new Promise((resolve) => {
    let arr = [];
    for (let i = 0; i < Files.length; i++) {
      const timeStamp = new Date().getTime();
      const fileName = `${Files[i].name}`;
      Files[i].mv(`${process.env.PATHFILELOCAL}/${fileName}`);
      arr.push({
        name: fileName,
        path: `${process.env.PATHFILELINK}/${fileName}`,
        size: Files[i].size,
        date: new Date(timeStamp),
      });
      if (i + 1 === Files.length) resolve(arr);
    }
  });
}

Router.delete("/delete/", (req, res, next) => {
  const { path } = req.query;
  const pathLocal = `${process.env.PATHFILELOCAL}/${path}`;
  fs.unlink(pathLocal, (err) => {
    if (err) res.status(500);
    res.json(true);
  });
});

module.exports = Router;

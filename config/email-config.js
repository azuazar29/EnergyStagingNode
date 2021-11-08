"use strict";
const nodemailer = require("nodemailer");


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "mailfortesting.azar@gmail.com", // generated ethereal user
    pass: "azuazar21", // generated ethereal password
  },
});

module.exports = transporter




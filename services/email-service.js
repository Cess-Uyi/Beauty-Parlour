const nodemailer = require("nodemailer");

module.exports.sendMail = function (
  subject,
  body,
  toEmails = []
) {
  fromEmail = process.env.EMAIL_USERNAME;
  fromName = process.env.EMAIL_FROM_NAME;
  if (!subject || !body || !toEmails || toEmails.length <= 0) {
    return false;
  }

  let commaSeparatedToEmails = toEmails.join(",");

  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter
    .sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: commaSeparatedToEmails, // list of receivers
      subject: subject,
      // text: "Hello world?",
      html: body, // html body
    })
    .then((result) => console.log("Message sent: %s", result.messageId))
    .catch((error) => console.error(error));
};
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// load recipients and parse
const recipients = JSON.parse(fs.readFileSync("recipients.json", "utf-8")).recipients;

// create transporter with SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// get dropbox link and subject from command line arguments
const dropboxLink = process.argv[2];
const subject = process.argv[3] || "New Circumference music!";

// email options for each recipient
const options = {
  from: process.env.EMAIL_USER,
  subject: subject,
  text: `New Circumference music! ${dropboxLink}`,
};

// send email to each recipient
recipients.forEach((recipient: string) => {
  transporter
    .sendMail({ ...options, to: recipient })
    .then((info) => console.log(`Email sent to ${recipient}: ${info.response}`))
    .catch((error) => console.error(`Error sending email to ${recipient}:`, error));
});

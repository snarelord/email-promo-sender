#!/usr/bin/env node

import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

// create transporter with SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// get dropbox link and subject from command line arguments
const dropboxLink = process.argv[2];
const subject = process.argv[3] || "New music!";

// email options for each recipient
const options = {
  from: process.env.EMAIL_USER,
  subject: subject,
  text: `New Circumference music! ${dropboxLink}`,
};

// send email to each recipient
export async function sendEmails() {
  let currentRecipient = "unknown";
  try {
    // load recipients and parse
    const recipients = JSON.parse(fs.readFileSync("recipients.json", "utf-8")).recipients;
    for (const recipient of recipients) {
      currentRecipient = recipient; // track current recipient
      const info = await transporter.sendMail({ ...options, to: recipient });
      console.log(`Email sent to ${recipient}: ${info.response}`);
    }
  } catch (error) {
    console.error(`Error sending email to ${currentRecipient}:`, error);
  }
}

// only run when the file is executed directly (from command line, not when imported in tests)
if (require.main === module) {
  sendEmails();
}

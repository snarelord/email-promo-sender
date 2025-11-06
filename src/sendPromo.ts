#!/usr/bin/env node

import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function sendEmails() {
  const text = process.argv[2];
  const dropboxLink = process.argv[3];

  if (!text || !dropboxLink) {
    console.log("Missing text or link!");
    return;
  }

  const options = {
    from: process.env.EMAIL_USER,
    subject: "New music!",
    text: `${text}: ${dropboxLink}`,
  };

  let currentRecipient = ""; // redundant

  try {
    const recipients = JSON.parse(fs.readFileSync("recipients.json", "utf-8")).recipients;
    for (const recipient of recipients) {
      currentRecipient = recipient;

      const info = await transporter.sendMail({ ...options, to: recipient });
      console.log(`Email sent to ${recipient}: ${info.response}`);
    }
  } catch (error) {
    console.error(`Error sending email to ${currentRecipient}:`, error);
  }
}

if (require.main === module) {
  sendEmails();
}

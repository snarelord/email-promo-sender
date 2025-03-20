// read list of recipient emails
// use dropbox link in composed email
// log emails to avoid resending
// send using via SMTP using nodemailer

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({});

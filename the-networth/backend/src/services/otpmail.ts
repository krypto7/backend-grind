import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendOTP = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });

  const source = fs.readFileSync(
    path.join(__dirname, "../templates/sentOTP.html"),
    "utf8",
  );

  const template = handlebars.compile(source);
  const html = template({ otp });

  const mailConfiguration = {
    from: process.env.EMAIL_USER as string,
    to: to,
    subject: "Verify your OTP",
    text: `Your OTP is: ${otp}`,
    html: html,
  };

  await transporter.sendMail(mailConfiguration);
};

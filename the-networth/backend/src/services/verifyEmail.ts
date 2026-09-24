import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });

  const verifyUrl = `${process.env.FRONTEND_URL as string}/verify-email?token=${token}`;

  const source = fs.readFileSync(
    path.join(__dirname, "../templates/verifyEmail.html"),
    "utf8",
  );

  console.log("source=====", source);

  const template = handlebars.compile(source);
  const html = template({ verifyUrl });

  const mailConfiguration = {
    from: process.env.EMAIL_USER as string,
    to: to,
    subject: "Verify your email",
    text: `Click the link below to verify your email: ${process.env.FRONTEND_URL as string}/verify-email?token=${token}`,
    html: html,
  };

  await transporter.sendMail(mailConfiguration);
};

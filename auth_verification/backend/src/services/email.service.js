import "../config/env.js";
import nodemailer from "nodemailer";
import { verifyEmailTemplate } from "../templates/verifyEmailTemplate.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verifyEmail = async (token, email) => {
  if (!process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL is missing. Set it in your .env file.");
  }

  const recipient = typeof email === "string" ? email.trim() : "";

  if (!recipient) {
    throw new Error(
      "Recipient email is missing. Cannot send verification email.",
    );
  }

  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Nishant Auth App" <${process.env.SMTP_USER}>`,
      to: recipient,
      subject: "Verify your email",
      // text: `Click this link to verify your email: ${verificationURL}`,
      html: verifyEmailTemplate(verificationURL),
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw err;
  }
};

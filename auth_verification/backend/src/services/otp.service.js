import nodemailer from "nodemailer";
import dotenv from "dotenv";

export const sendOtpMail = async (email, otp) => {
  console.log("======otp", otp);
  const recipient = typeof email === "string" ? email.trim() : "";
  if (!recipient) {
    throw new Error(
      "Recipient email is missing. Cannot send verification email.",
    );
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOption = {
    from: process.env.SMTP_USER,
    to: recipient,
    subject: "Password reset OTP",
    html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 10 minutes </p>`,
  };

  await transporter.sendMail(mailOption);
};

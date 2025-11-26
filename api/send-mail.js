// api/send-mail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Only needed for local testing

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`, // sender name/email
      to: process.env.RECIPIENT_EMAIL,
      subject: "New Contact Form Submission",
      html: `
        <h2>New Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}

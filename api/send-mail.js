import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Sanitize input server-side
function sanitizeServer(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (m) => {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m];
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    nonce,
    firstName, lastName, email, address, city, state, zip,
    meeting, item, comment
  } = req.body;

  // Nonce check (simple demo; replace with server-side token in production)
  if (!nonce || nonce.length < 5) {
    return res.status(403).json({ error: "Invalid request" });
  }

  // Required field validation
  if (!firstName || !lastName || !email || !comment || !meeting) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  // Email format validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Sanitize all inputs
  const safeFirstName = sanitizeServer(firstName);
  const safeLastName = sanitizeServer(lastName);
  const safeEmail = sanitizeServer(email);
  const safeAddress = sanitizeServer(address);
  const safeCity = sanitizeServer(city);
  const safeState = sanitizeServer(state);
  const safeZip = sanitizeServer(zip);
  const safeMeeting = sanitizeServer(meeting);
  const safeItem = sanitizeServer(item);
  const safeComment = sanitizeServer(comment);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"${safeFirstName} ${safeLastName}" <${safeEmail}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Public Comment: ${safeMeeting}`,
      html: `
        <h2>New Public Comment Submission</h2>
        <p><strong>First Name:</strong> ${safeFirstName}</p>
        <p><strong>Last Name:</strong> ${safeLastName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Address:</strong> ${safeAddress}</p>
        <p><strong>City:</strong> ${safeCity}</p>
        <p><strong>State:</strong> ${safeState}</p>
        <p><strong>Zip:</strong> ${safeZip}</p>
        <p><strong>Meeting Selection:</strong> ${safeMeeting}</p>
        <p><strong>Item # / General Comment:</strong> ${safeItem}</p>
        <p><strong>Comment:</strong><br>${safeComment}</p>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({ error:"Method not allowed" });

  const body = req.body;
  const { nonce, comment, ...ratings } = body;

  if(!nonce) return res.status(400).json({ error:"Invalid request" });

  // Define question text mapping
  const questionTexts = {
    q1: "1. How reliable is the current ferry schedule between St. Thomas and St. John?",
    q2: "2. How well are delays and cancellations communicated to passengers?",
    q3: "3. How would you rate the overall condition and cleanliness of the ferries in service?",
    q4: "4. How satisfied are you with seating, comfort, and onboard amenities?",
    q5: "5. How satisfied are you with the ticketing process (in-person, kiosk, or online)?",
    q6: "6. How would you rate customer service provided by ferry staff?",
    q7: "7. How safe do you feel while boarding, riding, and disembarking the ferry?",
    q8: "8. How well do crew members follow and enforce safety procedures?",
    q9: "9. How well does current ferry frequency meet community needs?",
    q10: "10. How adequate is the vessel capacity during peak times?",
    q11: "11. How would you rate your experience at the Red Hook terminal?",
    q12: "12. How would you rate your experience at the Cruz Bay terminal?",
    q13: "13. How accessible are the ferries and terminals for seniors, individuals with disabilities, and families?",
    q14: "14. How aware are you of the ferry companies’ request for a rate increase?",
    q15: "15. How affordable do you find the current ferry rates for residents, commuters, and students?",
    q16: "16. How would you rate the impact a fare increase would have on your household or business?",
    q17: "17. How strongly do you support or oppose the proposed rate increase?",
    q18: "18. How well do you feel the ferry operators have justified the need for a rate increase?",
    q19: "19. Should any rate increase be contingent on specific improvements (reliability, financial transparency, vessel availability, etc.)?",
    q20: "20. How important is modernization (digital ticketing, real-time tracking, etc.) for the ferry system?",
    q21: "21. How effectively do ferry operators communicate about outages, repairs, and schedule changes?"
  };

  let html = "<h2>PSC Ferry Project – Public Comment Form Submission</h2>";

  for(const [key,value] of Object.entries(ratings)){
    const question = questionTexts[key] || key;
    html += `<p><strong>${question}</strong><br>Rating: ${value}</p>`;
  }

  html += `<p><strong>Final Comment:</strong> ${comment || "N/A"}</p>`;

  try{
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT=="465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"PSC Public Comment Form" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: "New PSC Ferry Public Comment Form Submission",
      html
    });

    res.status(200).json({ success:true });
  } catch(err){
    console.error("Error sending email:", err);
    res.status(500).json({ error:"Failed to send email" });
  }
}

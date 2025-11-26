import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import sendMail from "./api/send-mail.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Routes
app.post("/send-mail", sendMail);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from a .env file
dotenv.config();

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Example: Gmail SMTP server
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASSWORD, // Your app password from .env
  },
});

export default transporter;
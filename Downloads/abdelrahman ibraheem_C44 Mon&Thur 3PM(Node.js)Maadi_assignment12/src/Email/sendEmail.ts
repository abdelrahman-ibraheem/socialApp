import type { SendMailOptions } from 'nodemailer';
import transporter from './mailer';
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  // Define email options
  const mailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error sending email:', error.message);
    } else {
      console.error('An unknown error occurred while sending email');
    }
  }
}

// Example usage
sendEmail(
  'recipient@example.com',
  'Hello from TypeScript!',
  '<h1>Hello World</h1><p>This is an email sent from a Node.js app using Nodemailer.</p>'
);
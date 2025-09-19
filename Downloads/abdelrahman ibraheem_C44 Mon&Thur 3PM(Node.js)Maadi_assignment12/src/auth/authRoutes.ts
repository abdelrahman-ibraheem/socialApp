
import type { Request, Response } from 'express';
import  express from 'express';
import bcrypt from 'bcrypt';
import transporter from '../Email/mailer'; // Your Nodemailer transporter
import  type { userModel,IUser } from '../modules/usermodule/user.model';
import { generateEmailConfirmationToken } from '../utils/tokenGenerator';
  const user = require('../models/user.model').user;

const router = express.Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Generate confirmation token
    const { token, expires } = generateEmailConfirmationToken();

    // 3. Create and save the new user
    const newUser: IUser =user ({
      username,
      email,
      password: hashedPassword,
      isVerified: false, // User is not verified initially
      emailConfirmationToken: token,
      emailConfirmationExpires: expires,
     
    });
    ;
    // 4. Create the confirmation link
    // Make sure to replace this URL with your actual frontend domain
    const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

    // 5. Send the email with the confirmation link
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm Your Email Address',
      html: `
        <h1>Email Confirmation</h1>
        <p>Thank you for registering. Please confirm your email address by clicking the link below:</p>
        <a href="${confirmationUrl}">Confirm Email</a>
      `,
    };
         
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered. Please check your email to confirm.' });

  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(409).json({ message: 'User with that email or username already exists.' });
    }
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});

export default router;
import type { Request, Response } from 'express';
import  bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Fake in-memory users DB (replace with MongoDB/Postgres/Prisma etc.)
const users = [
  { id: 1, email: 'test@example.com', password: bcrypt.hashSync('123456', 10) }
];

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Signin successful',
      token
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

import type { NextFunction, Request, Response } from 'express'
import { validationError } from '../../utils/Error';
import { json } from '../../../node_modules/zod/index.cjs';
import { signupSchema } from './user.validation';
// import type { ApplicationException } from "../../utils/Error";

interface IUserServices {
  signUp(req: Request, res: Response, next: NextFunction): Promise<Response>;
  getUser(req: Request, res: Response, next: NextFunction): Response;
}

interface SignUpDTO {
  name: string;
  email: string;
  age?: number;
}

export class UserServices implements IUserServices {
  constructor() {}

  async signUp(req: Request, res: Response, next: NextFunction): Promise<Response> {
    let { name, email, age }: SignUpDTO = req.body;
const result = await signupSchema.safeParseAsync(req.body)
if (!result.success) {
   return res.json({validationErr:JSON.parse(result.error.message)})
  
}

    return res.json({ msg: "hello from user Router" });
  }

  getUser(req: Request, res: Response, next: NextFunction): Response {
    return res.json({
      name: "Ahmed",
      age: 25
    });
  }
}

module.exports = { UserServices };

// src/models/User.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Optional if you handle social logins
  isVerified: boolean; // Field to track email verification
  emailConfirmationToken: string | null;
  emailConfirmationExpires: Date | null;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, // Default to false
  emailConfirmationToken: { type: String, default: null },
  emailConfirmationExpires: { type: Date, default: null },
});

export const User = mongoose.model<IUser>('User', UserSchema);
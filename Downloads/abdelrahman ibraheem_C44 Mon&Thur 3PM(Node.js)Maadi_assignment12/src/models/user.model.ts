
import { Schema } from 'mongoose';
import { model } from 'mongoose';

export interface IUser extends Document  {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  otp: string;
  expiresAt: Date;
  phone: string;
  emailOtp: {
    otp: string;
    expiresAt: Date;
  };
}
const userSchema = new Schema<IUser>({
firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailOtp: {
    otp: String,
    expiresAt: Date,
  },
  phone: {
    type:String,
    password: {
    type: String,
    required: true,
  },
  emailOtp: {
    otp: String,
    expiresAt: Date,
  },
  phone: {
    type: String,
  },
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

export const userModel = model<IUser>('User', userSchema);

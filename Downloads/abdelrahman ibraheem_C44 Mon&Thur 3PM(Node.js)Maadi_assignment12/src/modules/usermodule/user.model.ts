
import { Schema } from 'mongoose';
import { model } from 'mongoose';
type  otpType={
otp : string,
expiresAt: Date|undefined
      
}
export interface IUser extends Document  {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  otp: string;
  expiresAt?: Date;
  phone: string;
  emailOtp:  otpType
  passwordOtp?: otpType,
    
      isConfirmed: Boolean ,
      iscredentialsUpdated: Date



    
  };

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
      type : undefined,
  },
   passwordOtp: {
    otp: String,
    expiresAt: Date,
  },
  phone: {
    type: String,
  },
  isConfirmed: {
    type: Boolean,
    default: false, 
  },
isCOnfirmed: {
    type: Boolean,
    default: false,},
    iscredentialsUpdated: {
      type: Date,
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

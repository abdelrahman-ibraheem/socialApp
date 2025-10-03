import {  type NextFunction, type Request, type Response } from 'express'
import { NOtFoundexception,NotConfirmed,ExpiredOTPException, NotValidEmail ,ApplicationException,InvalidCredentialsException,invalidOtpException} from '../../utils/Error';
import { UserRepo } from './user.repo';
import { compareHash, createHash } from '../../utils/hash';
import { createOtp } from '../../Email/email.Otp';
import { userModel, type IUser } from './user.model';
import { template } from '../../utils/generateHTML';
import { emailEmitter } from '../../Email/event.event';
import type { confirmEmailDTO, resendOtpDTO,loginDTO ,forgetPasswordDTO } from './user.DTO';
import type { signupDTO } from './user.DTO';
import { successHandler } from '../../Email/successHandler';
import { createjwt } from '../../utils/jwt';
import{ nanoid } from 'nanoid';
import { TokenTypesEnum, type iRequest } from '../../middleware/auth.middleware';
import { decodeToken } from '../../middleware/auth.middleware';
import type { HydratedDocument } from 'mongoose';
import { uploadMulterFile, uploadSingleLargeFile } from '../../utils/multer/s3.services';

import bcrypt from "bcrypt";
import  { Router } from "express";
import { PostModel } from "../postModule/postModel";
import { sendEmail } from "../../Email/sendEmail";
 interface IUserServices {
  signUp(req: Request, res: Response, next: NextFunction): Promise<Response>;
  getUser(req: Request, res: Response, next: NextFunction): Promise<Response>;
  confirmEmail(req: Request, res: Response, next: NextFunction): Promise<Response>;
  forgetPassword(req: Request, res: Response, next: NextFunction): Promise<Response>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response>;
  resendOtp(req: Request, res: Response, next: NextFunction): Promise<Response>;
  login(req: Request, res: Response, next: NextFunction): Promise<Response>; 
  profileImage(req: Request, res: Response, next: NextFunction): Promise<Response>; 
  coverImage(req: Request, res: Response, next: NextFunction): Promise<Response>;
    updatePassword(req: Request, res: Response, next: NextFunction): Promise<Response>;
    requestEmailChange(req: Request, res: Response, next: NextFunction): Promise<Response>;
    updateInfo(req: Request, res: Response, next: NextFunction): Promise<Response>;

        confirmEmailChange(req: Request, res: Response, next: NextFunction): Promise<Response>;
    likePost(req: Request, res: Response, next: NextFunction): Promise<Response>;
    unlikePost(req: Request, res: Response, next: NextFunction): Promise<Response>;
    sendTagEmail(req: Request, res: Response, next: NextFunction): Promise<Response>;


  
  
}



export class UserServices implements IUserServices {

 private  usermodel= new UserRepo()
  constructor() {}

    signUp = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { firstName,lastName, email,password }:signupDTO = req.body;
const isExist = await this.usermodel.findByEmail({
  email,options:{lean:true}

})
if (isExist) {
  throw new NotValidEmail();
}


  const otp = createOtp();
    const subject = "use this otp to confirm your email";
  const html = template( otp, `${firstName} ${lastName}`, subject);
  emailEmitter.publish("send-email-activation-code", { to: email, subject, html });
  const user = await userModel.create({
    email,
    firstName,
    lastName,
    password,
    emailOtp: {
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    }
  });

return successHandler  ({ res, data: user});
}

 confirmEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { email, otp } = req.body as confirmEmailDTO;
  const user = await this.usermodel.findByEmail({ email: email as string });
  if (!user) {
    throw new NOtFoundexception("user not found");
  }
if (user.isConfirmed) {
  throw  new ApplicationException("user already verified", 400);
  
}
if (!user.emailOtp || user.emailOtp!.expiresAt!.getTime() <= Date.now()) {
  throw new ExpiredOTPException();
}
if (!await compareHash(otp,user.emailOtp.otp)) {
  throw new invalidOtpException("invalid otp")
} 

user.isConfirmed= true
await user.save();
return successHandler({ res,});
// You can add your logic here, for now just return a response
}
 
resendOtp=  async (req: Request, res: Response):Promise<Response> => {
  const { email }:resendOtpDTO = req.body;
const user = await this.usermodel.findByEmail({ email });
if (!user) {
  throw new NOtFoundexception("user not found");    
}
if (user.isConfirmed) {
  throw new ApplicationException("user already verified",400)
}
if (!user.emailOtp || user.emailOtp!.expiresAt!.getTime() <= Date.now()) {
  throw new ExpiredOTPException();
}

const otp = createOtp();

const subject = "resend otp to confirm your email";
  const html = template( otp, `${user.firstname} ${user.lastname}`, subject);
  emailEmitter.publish("send-email-activation-code", { to: email, subject, html });
 user.emailOtp = {
    otp: await createHash(otp),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  await user.save();
 
return successHandler({ res, msg: "otp resent successfully" });
}

 login= async (req: Request, res: Response):Promise<Response> => {  
 const { email, password }:loginDTO = req.body;
 const user = await this.usermodel.findByEmail({ email });
  if (!user||!await compareHash(password,user?.password)) {
    throw new InvalidCredentialsException("user not found");

    

  }
 
 if (!user.isConfirmed) {
      throw new NotConfirmed("please confirm your email first");
    }
    
    const jti = nanoid();
    
    const accesToken : string =createjwt(
      {
        id:user._id,

      },process.env.ACCESS_SIGNATURE as string,{ 
      jwtid:jti,
        expiresIn:'1H'
      },


    )
    const refreshToken:string = createjwt(
    {  id:user._id,},
      process.env.REFRESH_SIGNATURE as string,{
              jwtid:jti,

        expiresIn:'7D'}  
      
    )
    return successHandler({ res, data: { accesToken, refreshToken } });
 
}


refreshToken = async (req: Request, res: Response): Promise<Response> => {
  const authorization = req.headers.authorization as string;
  const {user,payload} = await decodeToken({ authorization, tokenType: TokenTypesEnum.refresh });
      
  
    const accesToken : string =createjwt(
      {
        id:user._id,

      },process.env.ACCESS_SIGNATURE as string,{ 
      jwtid:payload.jti,
        expiresIn:'1H'
      },


    )
return successHandler({ res, data: { accesToken } });
} 



async getUser(req: Request, res: Response): Promise<Response> {
  const User = await this.usermodel.findOne({
    filter: {
      email: "abdoibraheem0000@gmail.com"
    },
    options: { lean: true }
  });
  return successHandler({ res, data: User });
}

forgetPassword = async (req: Request, res: Response, ): Promise<Response> => {
  const {email}:forgetPasswordDTO = req.body;
  const user = await this.usermodel.findByEmail({ email });
  if (!user) {
    throw new NOtFoundexception("user not found");
  }
if (!user.isConfirmed) {
  throw new NotConfirmed("please confirm your email first");
}

const otp = createOtp();
  const subject = "use this otp to reset your password";
  const html = template( otp, `${user.firstname} ${user.lastname}`, subject);
  emailEmitter.publish("send-reset-password-email", { to: email, subject, html });

user.passwordOtp= {
  
 otp :await createHash(otp),
  expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

};

user.iscredentialsUpdated = new Date(Date.now());
await user.save();
return successHandler({ res, msg: "reset password otp sent to your email" });


}
resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email, otp, password } = req.body;

  // find user
  const user = await this.usermodel.findByEmail({ email });
  if (!user) {
    throw new NOtFoundexception("User not found");
  }

  // check if reset request exists
  if (!user.passwordOtp || !user.passwordOtp.otp) {
    throw new ApplicationException("No reset request found", 409);
  }

  // check expiry
 if (!user.passwordOtp?.expiresAt || user.passwordOtp.expiresAt.getTime() <= Date.now()) {
  throw new ExpiredOTPException();
}

  // check OTP validity
  const isValidOtp = await compareHash(otp, user.passwordOtp.otp);
  if (!isValidOtp) {
    throw new invalidOtpException("Invalid OTP");
  }

  // update password + remove OTP field
  await user.updateOne({
    password: await createHash(password),
    $unset: { passwordOtp: "" },
  });

  return successHandler({ res, msg: "Password reset successfully" });
};

profileImage = async (req: Request, res: Response) => {
  const user = res.locals.user as HydratedDocument<IUser>;
  const path = await uploadSingleLargeFile({
    file: req.file as Express.Multer.File
  });

  user.profileImage = path;   // ✅ works now if added to IUser
  await user.save();

  return successHandler({ res, data: path });
}

coverImage = async (req: Request, res: Response) => {
  const user = res.locals.user as HydratedDocument<IUser>;
  const paths = await uploadMulterFile({
    files: req.files as Express.Multer.File[]  
  });

user.coverImage = paths;  
await user.save();

  return successHandler({ res, data: paths });
}




/* ----------------- UPDATE PASSWORD ----------------- */
 updatePassword = async (req: Request, res: Response) => {
    try {
      const { userId, oldPassword, newPassword } = req.body;

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Old password incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.json({ msg: "Password updated successfully" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };




  /* ----------------- UPDATE BASIC INFO ----------------- */
  updateInfo = async (req: Request, res: Response) => {
    try {
      const { userId, firstName, lastName, bio } = req.body;

      const user = await userModel.findByIdAndUpdate(
        userId,
        { firstName, lastName, bio },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      return res.json({ msg: "Info updated successfully", user });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };

  /* ----------------- REQUEST EMAIL CHANGE (OTP) ----------------- */
  requestEmailChange = async (req: Request, res: Response) => {
    try {
      const { userId, newEmail } = req.body;

      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
      user.tempEmail = newEmail;
      await user.save();

 
      return res.json({ msg: "OTP sent to your current email" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };

  confirmEmailChange = async (req: Request, res: Response) => {
    try {
      const { userId, otp } = req.body;

      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ msg: "User not found" });

      if (user.otp === otp && user.otpExpires && user.otpExpires > new Date()) {
        if (!user.tempEmail) return res.status(400).json({ msg: "No email to update" });

        user.email = user.tempEmail;
      
        await user.save();

        return res.json({ msg: "Email updated successfully" });
      }

      return res.status(400).json({ msg: "Invalid or expired OTP" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };

  /* ----------------- LIKE POST ----------------- */
  likePost = async (req: Request, res: Response) => {
    try {
      const { userId, postId } = req.body;

      const post = await PostModel.findById(postId);
      if (!post) return res.status(404).json({ msg: "Post not found" });

      if (!post.likes.includes(userId)) {
        post.likes.push(userId);
        await post.save();
      }

      return res.json({ msg: "Post liked", likes: post.likes.length });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };

  /* ----------------- UNLIKE POST ----------------- */
  unlikePost = async (req: Request, res: Response) => {
    try {
      const { userId, postId } = req.body;

      const post = await PostModel.findById(postId);
      if (!post) return res.status(404).json({ msg: "Post not found" });

      post.likes = post.likes.filter((id) => id.toString() !== userId);
      await post.save();

      return res.json({ msg: "Post unliked", likes: post.likes.length });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };

  /* ----------------- SEND TAG EMAIL ----------------- */
 sendTagEmail = async (req: Request, res: Response) => {
    try {
      const { to, tags } = req.body;

      if (!to || !tags) {
        return res.status(400).json({ msg: "Recipient email and tags are required" });
      }

      const html = `<h1>Social App Notification</h1><p>Tags: ${tags.join(", ")}</p>`;
      await sendEmail(to);

      return res.json({ msg: "Email sent successfully" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };}


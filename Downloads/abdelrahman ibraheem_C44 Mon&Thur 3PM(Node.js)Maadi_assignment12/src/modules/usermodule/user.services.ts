import {  type NextFunction, type Request, type Response } from 'express'
import { ExpiredOTPException, NotValidEmail, validationError } from '../../utils/Error';
import { UserRepo } from './user.repo';
import { compareHash, createHash } from '../../utils/hash';
import  { ApplicationException } from "../../utils/Error";
import { createOtp } from '../../Email/email.Otp';
import { userModel } from './user.model';
import { template } from '../../utils/generateHTML';
import { NOtFoundexception } from '../../utils/Error';
import { emailEmitter } from '../../Email/event.event';
import type { confirmEmailDTO, resendOtpDTO } from './user.DTO';
import type { signupDTO } from './user.DTO';
import { successHandler } from '../../Email/successHandler';
import type { loginDTO ,forgetPasswordDTO} from './user.DTO';
 import { InvalidCredentialsException,invalidOtpException } from '../../utils/Error'; 
 import { NotConfirmed } from '../../utils/Error';
import { createjwt } from '../../utils/jwt';
import { id } from 'zod/v4/locales';
import {  date, success } from 'zod';
import { customAlphabet } from 'nanoid';
import{ nanoid } from 'nanoid';
import{} from './user.model'
import { TokenTypesEnum, type iRequest } from '../../middleware/auth.middleware';
import { decodeToken } from '../../middleware/auth.middleware';

 interface IUserServices {
  signUp(req: Request, res: Response, next: NextFunction): Promise<Response>;
  getUser(req: Request, res: Response, next: NextFunction): Promise<Response>;
  confirmEmail(req: Request, res: Response, next: NextFunction): Promise<Response>;
  forgetPassword(req: Request, res: Response, next: NextFunction): Promise<Response>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response>;
  resendOtp(req: Request, res: Response, next: NextFunction): Promise<Response>;
  login(req: Request, res: Response, next: NextFunction): Promise<Response>;  
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
    password: createHash(password),
    emailOtp: {
      otp: await createHash(otp),
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

}


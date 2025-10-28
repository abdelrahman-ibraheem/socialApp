import { pl } from "zod/v4/locales";
import { userModel, type IUser } from "../modules/usermodule/user.model";
import { UserRepo } from "../modules/usermodule/user.repo";
import { ApplicationException, invalidTokenException, NotConfirmed, NOtFoundexception } from "../utils/Error";
import { verifyJWT } from "../utils/jwt";
import type { HydratedDocument, ObjectId } from "mongoose";
import type { promises } from "nodemailer/lib/xoauth2";
import type { NextFunction } from "express";


 export interface iRequest extends Request {
    user: Partial<IUser>;
 }

export enum TokenTypesEnum {
  access = "access",
  refresh = "refresh",
}

export interface payload {
    id :ObjectId,
    iat:number,
    exp:number,
    jti:string
}
 const usermodel= new UserRepo(userModel)
export const decodeToken = async ({
  authorization , 
  tokenType=TokenTypesEnum.access ,
}: {
  authorization?: string|undefined;
  tokenType?: TokenTypesEnum;
}):Promise<{user: HydratedDocument<IUser>,payload:payload}>=> {
  if (!authorization) {
    throw new invalidTokenException();
  }

  // check Bearer prefix
  if (!authorization.startsWith(process.env.BEARER_KEY as string)) {
    throw new invalidTokenException();
  }

  // extract the token after "Bearer "
  const token = authorization.split(" ")[1];
  if (!token) {
    throw new invalidTokenException();
  }

  const secret =
    tokenType == TokenTypesEnum.access?
       (process.env.ACCESS_SIGNATURE as string)
      : (process.env.REFRESH_SIGNATURE as string);

  const payload = verifyJWT({ token, secret });


  const user =  await userModel.findById(payload.id)
    if (!user) {
        throw new NOtFoundexception("user not found")
    }  
    if (!user.isConfirmed) {
        throw new NotConfirmed("please confirm your email first");

};
if (user.iscredentialsUpdated?.getTime()>=payload.iat*1000) {
          throw new ApplicationException("plaese login again",409);

  
};
return {user,payload}
}

export const auth =()=>{
    return async (req:iRequest,res:any,next:NextFunction)=>{
const {user,payload} = await decodeToken({
  authorization: req.headers.get("authorization") as string,

});
res.locales.user = user;
res.locals.payload = payload;

next();
    }
}


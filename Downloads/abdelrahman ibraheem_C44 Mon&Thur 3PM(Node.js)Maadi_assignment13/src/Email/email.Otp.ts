import { customAlphabet } from "nanoid";
export const createOtp = ( )=>{
    const  otp = customAlphabet('1234567890',6)()
    return otp;

}
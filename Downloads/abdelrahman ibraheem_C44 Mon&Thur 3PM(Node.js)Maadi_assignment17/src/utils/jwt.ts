import type { PrivateKey,Secret,SignOptions ,JwtPayload} from "jsonwebtoken";
import { sign, verify } from "jsonwebtoken";
import type {payload} from "../middleware/auth.middleware"

export const createjwt= (playload:string|object,Secret:Secret,options?:SignOptions)=>{
    const token = sign(playload,Secret,options);
    return token;
}
export const verifyJWT=({token,secret}:{token:string,secret:Secret}):payload=>{
    const playload = verify(token,secret) as payload
    return playload;
}
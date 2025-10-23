import { z } from 'zod';
import { confirmEmailSchema,signupSchema,resendOtpSchema,loginSchema,forgetPasswordSchema} from './user.validation';

export type signupDTO = z.infer<typeof signupSchema>;

export type confirmEmailDTO = z.infer<typeof confirmEmailSchema>;
export type resendOtpDTO = z.infer<typeof resendOtpSchema>;
export type loginDTO = z.infer<typeof loginSchema>;
export type forgetPasswordDTO = z.infer<typeof forgetPasswordSchema>;
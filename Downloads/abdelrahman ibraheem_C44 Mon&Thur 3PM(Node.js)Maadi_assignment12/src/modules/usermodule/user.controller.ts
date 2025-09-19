import {Router} from 'express';
import  { UserServices } from './user.services';
import { userModel } from './user.model';
import { validation } from '../../middleware/validation.middleware';
import { confirmEmailSchema, forgetPasswordSchema } from './user.validation';
import { resendOtpSchema } from './user.validation';
import * as authValidation from '../../middleware/validation.middleware';
import { loginSchema } from './user.validation';
import {auth    } from '../../middleware/auth.middleware'
const router = Router();
const userServices = new UserServices();
router.patch('/resend-otp',validation(resendOtpSchema), userServices.resendOtp )
router.post('/signup',userServices.signUp  ) 
router.patch('/confirm-email',validation(confirmEmailSchema), userServices.confirmEmail ) 
router.post('/login', userServices.login )
router.post('/forget-password',validation(forgetPasswordSchema), userServices.forgetPassword )
router.post('/reset-password', userServices.resetPassword )
router.get('/get-user',auth, userServices.getUser )
router.post('refresh-token', userServices.refreshToken )
export default router;


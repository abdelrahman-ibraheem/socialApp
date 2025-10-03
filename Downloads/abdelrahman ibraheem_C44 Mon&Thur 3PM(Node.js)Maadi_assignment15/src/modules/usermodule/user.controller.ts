import { Router } from "express";
import { UserServices } from "./user.services";
import { validation } from "../../middleware/validation.middleware";
import { confirmEmailSchema, forgetPasswordSchema, resendOtpSchema, loginSchema } from "./user.validation";
import { auth } from "../../middleware/auth.middleware";
import { uploadFile } from "../../utils/multer/multer"; 

const router = Router();
const userServices = new UserServices();

router.patch("/resend-otp", validation(resendOtpSchema), userServices.resendOtp);
router.post("/signup", userServices.signUp);
router.patch("/confirm-email", validation(confirmEmailSchema), userServices.confirmEmail);
router.post("/login", validation(loginSchema), userServices.login);
router.post("/forget-password", validation(forgetPasswordSchema), userServices.forgetPassword);
router.post("/reset-password", userServices.resetPassword);
router.get("/get-user", auth, userServices.getUser);
router.post("/refresh-token", userServices.refreshToken);
router.post( "/update-password",auth,userServices.updatePassword)
router.patch("/cover-images",auth,uploadFile({}).array("coverImages", 5), userServices.coverImage);
router.patch("/profile-image",auth, uploadFile({}).single("image"), userServices.profileImage);
router.post( "/request-Email",auth,userServices.requestEmailChange)
router.post( "/confirm-Email-change",auth,userServices.confirmEmailChange)
router.post( "/update-info",auth,userServices.updateInfo)
router.post( "/Send-tag-Email",auth,userServices.sendTagEmail)
router.post( "/like-post",auth,userServices.likePost)
router.post( "/unlike-post",auth,userServices.unlikePost)


export default router;

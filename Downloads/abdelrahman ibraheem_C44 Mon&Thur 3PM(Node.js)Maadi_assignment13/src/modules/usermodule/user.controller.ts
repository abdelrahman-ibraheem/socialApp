import { Router } from "express";
import { UserServices } from "./user.services";
import { validation } from "../../middleware/validation.middleware";
import { confirmEmailSchema, forgetPasswordSchema, resendOtpSchema, loginSchema } from "./user.validation";
import { auth } from "../../middleware/auth.middleware";
import { uploadFile } from "../../multer/multer"; 

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

router.patch("/cover-images",auth,uploadFile({}).array("coverImages", 5), userServices.coverImage);
router.patch("/profile-image",auth, uploadFile({}).single("image"), userServices.profileImage);

export default router;

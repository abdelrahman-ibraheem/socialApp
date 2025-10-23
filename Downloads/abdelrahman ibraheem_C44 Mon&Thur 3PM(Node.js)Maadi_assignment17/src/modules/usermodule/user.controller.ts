import { Router } from "express";
import { UserServices } from "./user.services";
import { validation } from "../../middleware/validation.middleware";
import { confirmEmailSchema,forgetPasswordSchema,resendOtpSchema,loginSchema,} from "./user.validation";
import { auth } from "../../middleware/auth.middleware";
import { uploadFile } from "../../utils/multer/multer";
import { chatRoutes } from "../chatmodule/chat.controler";

export const userRouters = {
  base: "/users",
  resendOtp: "/resend-otp",
  signUp: "/signup",
  confirmEmail: "/confirm-email",
  login: "/login",
  forgetPassword: "/forget-password",
  resetPassword: "/reset-password",
  getUser: "/get-user",
  refreshToken: "/refresh-token",
  updatePassword: "/update-password",
  coverImages: "/cover-images",
  profileImage: "/profile-image",
  requestEmailChange: "/request-Email",
  confirmEmailChange: "/confirm-Email-change",
  updateInfo: "/update-info",
  sendEmailToTags: "/send-tag-email",
  blockUser: "/block-user/:id",
  deleteFriendRequest: "/delete-friend-request/:id",
  unFriend: "/unfriend/:id",
};

const router = Router();
router.use('/:userId/chat', auth, (chatRoutes.base, router));
const userServices = new UserServices();

// ✅ Auth & Account
router.patch(userRouters.resendOtp, validation(resendOtpSchema), userServices.resendOtp);
router.post(userRouters.signUp, userServices.signUp);
router.patch(userRouters.confirmEmail, validation(confirmEmailSchema), userServices.confirmEmail);
router.post(userRouters.login, validation(loginSchema), userServices.login);
router.post(userRouters.forgetPassword, validation(forgetPasswordSchema), userServices.forgetPassword);
router.post(userRouters.resetPassword, userServices.resetPassword);
router.get(userRouters.getUser, auth, userServices.getUser);
router.post(userRouters.refreshToken, userServices.refreshToken);
router.post(userRouters.updatePassword, auth, userServices.updatePassword);

// ✅ Media
router.patch(userRouters.coverImages, auth, uploadFile({}).array("coverImages", 5), userServices.coverImage);
router.patch(userRouters.profileImage, auth, uploadFile({}).single("image"), userServices.profileImage);

// ✅ Email change
router.post(userRouters.requestEmailChange, auth, userServices.requestEmailChange);
router.post(userRouters.confirmEmailChange, auth, userServices.confirmEmailChange);

// ✅ Profile & Tags
router.post(userRouters.updateInfo, auth, userServices.updateInfo);
router.post(userRouters.sendEmailToTags, auth, userServices.sendEmailToTags);

// ✅ Friendship & Blocking
router.post(userRouters.blockUser, auth, userServices.blockUser);
router.delete(userRouters.deleteFriendRequest, auth, userServices.deleteFriendRequest);
router.delete(userRouters.unFriend, auth, userServices.unFriend);

export default router;

import { Router } from "express";
import { postServices } from "../postModule/post.services"; 
import { uploadFile } from "../../utils/multer/multer";
import { validation } from "../../middleware/validation.middleware";
import { auth } from "../../middleware/auth.middleware";
import { createPostSchema } from "./post.validation";

const router = Router();

export const postRouters = {
  base: "/posts",
  createPost: "/",
  like_unlike:"/like-unlike",
  updatePost:'/update-post'
};

const postService = new postServices();

router.post(
  postRouters.createPost,
  auth, // ✅ middleware
  uploadFile({}).array("attachments", 4),
  validation(createPostSchema), 
  postService.createPost 
);
router.patch(postRouters.like_unlike,auth,postService.likePost)
router.patch(postRouters.updatePost,uploadFile({}).array('newAttachments',4))

export default router;

import { Router } from "express";
import { auth } from "../../middleware/auth.middleware";
import { validation } from "../../middleware/validation.middleware";
import { createPostSchema } from "./post.validation";
import { postServices } from "./post.services";
import { uploadFile } from "../../utils/multer/multer";

const router = Router();
const postService = new postServices();

export const postRouters = {
  base: "/posts",
  createPost: "/",
  like_unlike: "/like-unlike",
  updatePost: "/update-post/:id",
  freezePost: "/freeze/:id",
  hardDeletePost: "/hard-delete/:id",
  sendEmail: "/send-email",
  blockUser: "/block/:id",
  getPostById: "/:id",
  deleteFriendRequest: "/delete-friend-request/:id",
  unFriend: "/unfriend/:friendId",
};

// ✅ Create Post
router.post(postRouters.createPost,auth,uploadFile({}).array("attachments", 4),validation(createPostSchema),postService.createPost
);

// ✅ Update Post
router.patch(postRouters.updatePost,auth,uploadFile({}).array("newAttachments", 4),postService.updatePost
);

// ✅ Like / Unlike Post
router.patch(postRouters.like_unlike, auth, postService.likePost);

// ✅ Freeze Post
router.patch(postRouters.freezePost, auth, postService.freezePost);

// ✅ Hard Delete Post
router.delete(postRouters.hardDeletePost, auth, postService.hardDeletePost);




// ✅ Get Post by ID
router.get(postRouters.getPostById, auth, postService.getPostById);


// ✅ Delete Friend Request

export default router;

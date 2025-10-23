import { Router } from "express";
import { commentServices } from "./comment.services";
import { auth } from "../../middleware/auth.middleware";

// ✅ Define route paths
export const commentRouters = {
  updateComment: "/update",
  getCommentById: "/:id",
  getCommentWithReply: "/:id/replies",
  freezeComment: "/:id/freeze",
  hardDeleteComment: "/:id",
};



// ✅ Initialize Router and Service
const router = Router();
const commentService = new commentServices();


router.patch(
  commentRouters.updateComment,
  auth,
  commentService.updateComment
);


// ✅ Get a single comment by ID
router.get(
  commentRouters.getCommentById,
  auth,
  commentService.getCommentById
);

// ✅ Get comment with replies
router.get(
  commentRouters.getCommentWithReply,
  auth,
  commentService.getCommentWithReply
);

// ✅ Freeze a comment
router.patch(
  commentRouters.freezeComment,
  auth,
  commentService.freezeComment
);

// ✅ Hard delete a comment and its replies
router.delete(
  commentRouters.hardDeleteComment,
  auth,
  commentService.hardDeleteComment
);

export default router;

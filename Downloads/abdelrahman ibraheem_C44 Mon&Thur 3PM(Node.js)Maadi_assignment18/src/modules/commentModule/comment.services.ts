import type { Request, Response } from "express";
import type { HydratedDocument } from "mongoose";
import type { IComment } from "../commentModule/comment.Types";
import { commentRepo } from "../commentModule/comment.repo";
import { UserRepo } from "../usermodule/user.repo";
import { NOtFoundexception } from "../../utils/Error";
import { successHandler } from "../../utils/Email/successHandler";

interface IcommentService {
  updateComment(req: Request, res: Response): Promise<Response>;
  getCommentById(req: Request, res: Response): Promise<Response>;
  freezeComment(req: Request, res: Response): Promise<Response>;
  hardDeleteComment(req: Request, res: Response): Promise<Response>;
  getCommentWithReply(req: Request, res: Response): Promise<Response>;

}

export class commentServices implements IcommentService {
  private commentModel = new commentRepo();
  private userModel = new UserRepo();

  updateComment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const commentId = req.params.id as string;
    const { content }: { content: string } = req.body;

    // 🟢 Find comment by ID
    const comment = await this.commentModel.findOne({ filter: { _id: commentId } });
    if (!comment) throw new NOtFoundexception("Comment not found");

    // 🟢 Check if the comment is frozen
    if (comment.isFrozen) {
      return res.status(400).json({ msg: "Cannot update a frozen comment" });
    }

    // 🟢 Update the comment content
    const updatedComment = await this.commentModel.updateOne(
      { _id: commentId },
      { $set: { content } }
    );

    // 🟢 Success response
    return successHandler({
      res,
      msg: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
};


  // ✅ Freeze a comment
  freezeComment = async (req: Request, res: Response): Promise<Response> => {
    const commentId = req.params.id;

    const comment = await this.commentModel.findOne({ filter: { _id: commentId } });
    if (!comment) throw new NOtFoundexception("Comment not found");

    await this.commentModel.updateOne({ _id: commentId }, { isFrozen: true });

    return successHandler({ res, msg: "Comment frozen successfully" });
  };

  // ✅ Hard delete comment + replies
  hardDeleteComment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const commentId = req.params.id as string;

      const comment = await this.commentModel.findOne({ filter: { _id: commentId } });
      if (!comment) throw new NOtFoundexception("Comment not found");

      // Delete replies first
      await this.commentModel.deleteMany({ filter: { replyTo: commentId } });

      // Delete the comment itself
      await this.commentModel.deleteOne({ filter: { _id: commentId } });

      return successHandler({ res, msg: "Comment and replies deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };

  // ✅ Get single comment
  getCommentById = async (req: Request, res: Response): Promise<Response> => {
    const commentId = req.params.id;

    const comment = await this.commentModel.findOne({ filter: { _id: commentId } });
    if (!comment) throw new NOtFoundexception("Comment not found");

    return successHandler({ res, data: comment });
  };

  // ✅ Get comment and its replies
  getCommentWithReply = async (req: Request, res: Response): Promise<Response> => {
    const commentId = req.params.id;

    const comment = await this.commentModel.findOne({ filter: { _id: commentId } });
    if (!comment) throw new NOtFoundexception("Comment not found");

    const replies = await this.commentModel.find({ filter: { replyTo: commentId } });

    return successHandler({ res, data: { comment, replies } });
  };
}

// src/modules/commentModule/comment.DTO.ts
import type { Types } from "mongoose";

export interface createCommentDto {
  postId: Types.ObjectId;
  content: string;
  replyTo?: Types.ObjectId;
}

export interface updateCommentDto {
  content?: string;
}

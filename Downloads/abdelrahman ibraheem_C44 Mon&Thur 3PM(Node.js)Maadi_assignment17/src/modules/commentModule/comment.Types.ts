// src/modules/commentModule/comment.types.ts
import type { Types } from "mongoose";

export interface IComment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  createdBy: Types.ObjectId;
  content: string;
  replyTo?: Types.ObjectId | null;
  isFrozen?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


// src/modules/commentModule/comment.model.ts
import { Schema, model } from "mongoose";
import type { IComment } from "./comment.Types";

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false, // removes __v
  }
);

// 🔗 Optional: populate replies automatically if needed
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "replyTo",
});

commentSchema.set("toObject", { virtuals: true });
commentSchema.set("toJSON", { virtuals: true });

export const commentModel = model<IComment>("Comment", commentSchema);

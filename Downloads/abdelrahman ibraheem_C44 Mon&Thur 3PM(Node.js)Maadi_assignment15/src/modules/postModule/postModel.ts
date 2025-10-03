import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },

    // 👍 likes system
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const PostModel = mongoose.model<IPost>("Post", PostSchema);
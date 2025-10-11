import mongoose, { Schema, Document, type HydratedDocument } from "mongoose";
import { PostAvailabilityEnum } from "./post.types";
import type{ IPost } from "./post.types";
import type { IUser } from "../usermodule/user.model";

export const availabilityCondition = (user: HydratedDocument<IUser>) => {
  return [
    {
      availability: PostAvailabilityEnum.PUBLIC,
    },
    {
      availability: PostAvailabilityEnum.PRIVATE,
      createdBy: user._id,
    },
    {
      availability: PostAvailabilityEnum.FRIENDS,
      createdBy: { $in: [...user.friends, user._id] },
    },
    {
      availability: PostAvailabilityEnum.PRIVATE,
      tags: { $in: user._id },
    },
  ];
};








export const PostAvailabilityCond =(user:HydratedDocument<IUser>)=>{
  return [
{
  Availability: PostAvailabilityEnum.PUBLIC
},
{
  Availability: PostAvailabilityEnum.PRIVATE,
  createdBy: user._id
},
{
  Availability: PostAvailabilityEnum.FRIENDS,
  createdBy: {
    $in:[...(user.friends||[])]
  }
}

  ]
}

const PostSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: true,
    },
    attachments: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    availability: {
      type: String,
      enum: [
        PostAvailabilityEnum.PUBLIC,
        PostAvailabilityEnum.PRIVATE,
        PostAvailabilityEnum.FRIENDS,
      ],
      default: PostAvailabilityEnum.PUBLIC,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    assetsFolderId: String,
    id: {type:Number},
    frozen:{type:Boolean},
     text:{type:String},
     commentId:{type:Number},
      blocked:{type:Boolean},
     name:{type:String},
      fromId:{type:Number},
     toId:{type:Number},
     user1:{type:Number},
     user2:{type:Number},



  },
  { timestamps: true } 
);


export interface Post {
  id: number;
  userId: number;
  content: string;
  frozen: boolean;
}

export interface Comment {
  id: number;
  postId: number; // <-- important
  userId: number;
  text: string;
  frozen: boolean;
}

export interface Reply {
  id: number;
  commentId: number;
  userId: number;
  text: string;
}

export interface User {
  id: number;
  name: string;
  blockedUsers: number[]; // ids of blocked users
  friends: number[]; // ids of friends
}

export interface FriendRequest {
  id: number;
  fromId: number;
  toId: number;
  status: "pending" | "accepted" | "rejected";
}

export interface Friendship {
  id: number;
  user1: number;
  user2: number;
}

// ---------- SOCIAL ACTIONS ----------
export class SocialActions {
  posts: Post[] = [];
  comments: Comment[] = [];
  replies: Reply[] = [];
  users: User[] = [];
  friendRequests: FriendRequest[] = [];
  friendships: Friendship[] = [];

}






export const PostModel = mongoose.model<IPost>("Post", PostSchema);

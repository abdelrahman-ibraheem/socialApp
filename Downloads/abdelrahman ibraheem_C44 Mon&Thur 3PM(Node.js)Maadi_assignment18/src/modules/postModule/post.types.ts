import mongoose, { Types, type HydratedDocument } from "mongoose";

export enum PostAvailabilityEnum {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends',

}export interface IPost extends Document {
  attachments: string;
    friends: number[]; 
  content: string;
  createdBy: mongoose.Types.ObjectId;
  availability: PostAvailabilityEnum;
  allowComments: boolean;
  likes: mongoose.Types.ObjectId[];
  tags: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  assetsFolderId: string;
  createdAt: Date;
  updatedAt: Date;
    id: number;
  frozen: boolean;
 text: string;
  commentId: number;
 blocked: boolean;
 name:string;
  fromId: number;
  toId: number;
    user1: number;
  user2: number;
  deleteOne:{type:Function}
  deleteMany:{type:Function}
  updateOne:{type:Function}
  findOne:{type:Function}
  create:{type:Function}
  unFriend:{type:Function}
  deleteFriendRequest:{type:Function}
replyTo:{type: string},
    status: "pending" | "accepted" | "rejected";
    



      


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




export type postDocument = HydratedDocument<IPost>

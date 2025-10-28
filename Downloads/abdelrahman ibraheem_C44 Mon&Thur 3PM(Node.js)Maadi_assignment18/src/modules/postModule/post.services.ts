import type { Request, Response } from "express";
import { successHandler } from "../../utils/Email/successHandler";
import { postRepo } from "./post.repo";
import { UserRepo } from "../usermodule/user.repo";
import type { createPostDto } from "./post.DTO";
import type { IPost, PostAvailabilityEnum } from "./post.types";
import { Types, type HydratedDocument } from "mongoose";
import { deleteFiles, uploadMulterFile } from "../../utils/multer/s3.services";
import { NOtFoundexception } from "../../utils/Error";
import type { IUser } from "../usermodule/user.model";
import { availabilityCondition } from "./post.Model";
import { sendEmail } from "../../utils/Email/sendEmail";
interface IpostService {
  createPost(req: Request, res: Response): Promise<Response>;
  updatePost(req: Request, res: Response): Promise<Response>;
  likePost(req: Request, res: Response): Promise<Response>;
  freezePost (req: Request, res: Response): Promise<Response>,
  hardDeletePost  (req: Request, res: Response): Promise<Response> 
  getPostById  (req: Request, res: Response): Promise<Response>


}
export class postServices implements IpostService {
  private postModel = new postRepo();
  private userModel = new UserRepo();
  createPost = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { allowComments, availability, content, tags = [] }: createPostDto =
        req.body;
      const files: Express.Multer.File[] = req.files as Express.Multer.File[];
      const assetsFolderId = Date.now().toString();
      const path = `users/${res.locals.user._id}/posts/${assetsFolderId}`;
      if (tags?.length > 0) {
        const users = await this.userModel.find({
          filter: { _id: { $in: tags } }, 
        });
        if (!users || users.length !== tags.length) {
          throw new Error("There are some users missing");
        }
      }  
      return successHandler({ res, msg: "Post created successfully" });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };
updatePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const postId = req.params.id as string;
    const {
      content,
      availability,
      allowComments,
      newAttatchments = [],
      removedAttatchments = [],
      newTags = [],
      removedTags = [],
    }: {
      content: string;
      availability: PostAvailabilityEnum;
      allowComments: boolean;
      newAttatchments: string[];
      removedAttatchments: string[];
      newTags: Types.ObjectId[];
      removedTags: Types.ObjectId[];
    } = req.body;
    const newAttachments = req.files as Express.Multer.File[];
        let attachmentsLInks: string[] = [];

    const post = (await this.postModel.findOne({
    filter: { _id: postId, createdBy: res.locals.user._id },
    })) as HydratedDocument<IPost> | null;
    if (!post) {
    throw new NOtFoundexception("post not found");
    }
const users = await this.userModel.find({
      filter: { _id: postId, $in:newTags },

})
if (newTags?.length!=users.length) {
  throw new NOtFoundexception('some tags not found')
} 
if ( newAttachments.length) {
  attachmentsLInks= await uploadMulterFile({
    files:newAttachments,
    path:`users/${ res.locals.user._id}/posts/${post.assetsFolderId}`
  })
  
} 

    

    let attachments = [...(post.attachments || []), ...(attachmentsLInks || [])];
    if (removedAttatchments?.length) {
      attachments = attachments.filter(
        (link) => !removedAttatchments.includes(link)
      );
    }
    let tags = [...(post.tags || []), ...(newTags || [])];
    if (removedTags?.length) {
      tags = tags.filter((tag: Types.ObjectId) => !removedTags.includes(tag));
    }
    await post.updateOne({
      content,
      availability,
      allowComments,
      attachments,
      tags,
    });
    if (removedAttatchments?.length) {
      await deleteFiles({ urls: removedAttatchments });
    }
    await post.updateOne({
      $set:{ 
        content:content||post.content,
        allowComments:allowComments||post.allowComments,
        availability:availability||post.availability,
        attachments:{
          $setUnion:[
            {
              $setDifference:[
                "$attachments",
                removedAttatchments
              ]
            },attachmentsLInks
            
          ]
        },
        tags:{
          $setUnion:[
            {setDifference:[
              "$tags",
              removedTags

            ]
          },
          newTags

          ]
        }
      }
    })



    return successHandler({
      res,
      msg: "Post updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ msg: error.message });
  }
};
  likePost = async (req: Request, res: Response): Promise<Response> => {
    const {
      postId,
      likeType,
    }: { postId: Types.ObjectId; likeType: "like" | "unlike" } = req.body;
    const user: HydratedDocument<IUser> = res.locals.user;
    const post = await this.postModel.findOne({
      filter: {
        _id: postId,
        $or: availabilityCondition(user),
      },
    });
    if (!post) {
      throw new NOtFoundexception("Post not found");
    }
    if (likeType === "like") {
      await post.updateOne({
        $addToSet: { likes: user._id },
      });
    } else {
      await post.updateOne({
        $pull: { likes: user._id },
      });
    }
    await post.save();
    return successHandler({ res, data: post });
  };
   freezePost = async (req: Request, res: Response): Promise<Response> => {
    const postId = req.params.id;

    const post = await this.postModel.findOne({ filter: { _id: postId } });
    if (!post) throw new NOtFoundexception("Post not found");

    await post.updateOne({ isFrozen: true });
    return successHandler({ res, msg: "Post frozen successfully" });
  };
   hardDeletePost = async (req: Request, res: Response): Promise<Response> => {
    const postId = req.params.id;

    const post = await this.postModel.findOne({ filter: { _id: postId } });
    if (!post) throw new NOtFoundexception("Post not found");

    // Delete all comments + replies related to post
    await this.postModel.deleteMany({ filter: { postId } });

    // Delete post attachments from S3
   const hydratedPost = post as HydratedDocument<IPost>;
   if (Array.isArray(hydratedPost.attachments) && hydratedPost.attachments.length > 0) {
  await deleteFiles({ urls: hydratedPost.attachments as string[] });
}

    // Delete the post itself
    await this.postModel.deleteOne({ filter: { _id: postId } });

    return successHandler({ res, msg: "Post and related comments deleted" });
  }
  ;  getPostById = async (req: Request, res: Response): Promise<Response> => {
    const postId = req.params.id;

    const post = await this.postModel.findOne({
      filter: { _id: postId },
    });

    if (!post) throw new NOtFoundexception("Post not found");

    return successHandler({ res, data: post });
  };


}



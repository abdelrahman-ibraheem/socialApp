import { Model } from "mongoose";
import { DBRepo } from "../../dp/dp.repo";
import type { IPost } from "./post.types";
import { PostModel } from "./post.Model";

export class postRepo extends DBRepo<IPost> {
  constructor(
    protected override readonly model: Model<IPost> = PostModel as unknown as Model<IPost>
  ) {
    super(model);
  }
}

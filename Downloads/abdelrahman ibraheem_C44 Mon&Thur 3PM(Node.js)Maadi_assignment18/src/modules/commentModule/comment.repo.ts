// src/modules/commentModule/comment.repo.ts

import { commentModel } from "./comment.model";
import type { IComment } from "./comment.Types";
import type {
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  HydratedDocument,
} from "mongoose";

export class commentRepo {
  // ✅ Find a single comment
  async findOne(
    filter: FilterQuery<IComment>,
    projection?: any,
    options?: QueryOptions
  ): Promise<HydratedDocument<IComment> | null> {
    return commentModel.findOne(filter, projection, options).exec();
  }

  // ✅ Find multiple comments
  async find(
    filter: FilterQuery<IComment>,
    projection?: any,
    options?: QueryOptions
  ): Promise<HydratedDocument<IComment>[]> {
    return commentModel.find(filter, projection, options).exec();
  }

  // ✅ Create a new comment
  async create(data: Partial<IComment>): Promise<HydratedDocument<IComment>> {
    return commentModel.create(data);
  }

 
async updateOne(
  filter: FilterQuery<IComment>,
  update: UpdateQuery<IComment>,
  options: QueryOptions = { new: true }
): Promise<HydratedDocument<IComment> | null> {
  return commentModel.findOneAndUpdate(filter, update, options).exec();
}


  // ✅ Delete a single comment
  async deleteOne(
    filter: FilterQuery<IComment>,
  ): Promise<void> {
    await commentModel.deleteOne(filter).exec();
  }
async deleteMany(
  filter: FilterQuery<IComment>,
): Promise<void> {
  await commentModel.deleteMany(filter ).exec();
}

}

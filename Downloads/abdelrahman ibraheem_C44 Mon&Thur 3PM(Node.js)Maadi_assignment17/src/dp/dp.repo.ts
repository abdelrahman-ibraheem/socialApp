import type {
  Model,
  HydratedDocument,
  FilterQuery,
  QueryOptions,
  FlattenMaps,
  Types,
  Document,
} from "mongoose";
import type { IPost } from "../modules/postModule/post.types";

export abstract class DBRepo<T> {
  constructor(protected readonly model: Model<T>) {}

  // create
create = async (data: Partial<T>): Promise<HydratedDocument<T>> => {
  const doc = await this.model.create(data);
  return doc;}

unFriend    = async (userId1: number, userId2: number): Promise<void> => {
    await this.model.updateOne(
      { _id: userId1 },
      { $pull: { friends: userId2 } }
    );
    await this.model.updateOne(
      { _id: userId2 },
      { $pull: { friends: userId1 } }
    );
  }
 

  // Delete many documents
  async deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount?: number }> {
    return await this.model.deleteMany(filter);
  }
   async deleteOne(filter: FilterQuery<T>): Promise<{ deletedCount?: number }> {
    return await this.model.deleteOne(filter);
  }


  
  deleteFriendRequest = async (friendRequestId: number): Promise<void> => {  
    await this.model.updateOne(
      { "friendRequests.id": friendRequestId },
      { $pull: { friendRequests: { id: friendRequestId } } }
    );
  }
  // findOne

  findOne = async ({
    filter,
    projection,
    options,
  }: {
    filter: FilterQuery<T>;
    projection?: any;
    options?: QueryOptions;
  }): Promise<
    FlattenMaps<HydratedDocument<T>> | HydratedDocument<T> | Document<HydratedDocument<T>> | null
  > => {
    let query = this.model.findOne(filter, projection, options) as any;

    if (options?.lean) {
      query = query.lean();
    }

    const doc = await query.exec();
    return doc;
  };

  // findById
  findById = async ({
    id,
    projection,
    options,
  }: {
    id: Types.ObjectId | string;
    projection?: any;
    options?: QueryOptions;
  }): Promise<
    FlattenMaps<HydratedDocument<T>> | HydratedDocument<T> | Document<HydratedDocument<T>> | null
  > => {
    let query = this.model.findById(id, projection, options) as any;

    if (options?.lean) {
      query = query.lean();
    }

    const doc = await query.exec();
    return doc;

  };
  
}

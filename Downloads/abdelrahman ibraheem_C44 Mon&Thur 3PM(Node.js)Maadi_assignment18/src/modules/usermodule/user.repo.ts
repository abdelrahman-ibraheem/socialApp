
import type { FlattenMaps, HydratedDocument, Model, QueryOptions, RootFilterQuery } from "mongoose";
import type { ProjectionFields } from "mongoose";
import { DBRepo } from "../../dp/dp.repo";
import type { IUser } from "./user.model";
import { userModel } from "./user.model";

export class UserRepo extends DBRepo<IUser> {
    constructor(protected readonly model: Model<IUser> = userModel) {
        super(model);
    }

    findByEmail = async ({
        email,
        projection,
        options,
    }: {
        email: string;
        projection?: ProjectionFields<IUser>;
        options?: QueryOptions;
    }): Promise<FlattenMaps<HydratedDocument<IUser>> | HydratedDocument<IUser> | null> => {
        const query = this.model.findOne({ email }, projection, options);
        if (options?.lean) {
            query.lean();
        }
        const user = await query.exec();
        return user;
    };

    find = async ({
        filter,
        projection,
        options,
    }: {
        filter: RootFilterQuery<IUser>; 
        projection?: ProjectionFields<IUser>;
        options?: QueryOptions;
    }): Promise<(FlattenMaps<HydratedDocument<IUser>> | HydratedDocument<IUser>)[]> => {
        const query = this.model.find(filter, projection, options);
        if (options?.lean) {
            query.lean();
        }
        const doc = await query.exec();
        return doc; 
    };
      async updateOne(filter: any, update: any) {
    return this.model.updateOne(filter, update);
  }
}


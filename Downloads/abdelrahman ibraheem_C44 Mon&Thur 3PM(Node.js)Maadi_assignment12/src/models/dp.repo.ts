import type {
  Model,
  HydratedDocument,
  FilterQuery,
  QueryOptions,
  FlattenMaps,
  Types,
  Document,
} from "mongoose";

export abstract class DBRepo<T> {
  constructor(protected readonly model: Model<T>) {}

  // create
create = async (data: Partial<T>): Promise<HydratedDocument<T>> => {
  const doc = await this.model.create(data);
  return doc;}


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

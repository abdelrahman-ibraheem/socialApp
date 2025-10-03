import { ApplicationException } from "../Error";
import multer, { memoryStorage, diskStorage } from "multer";
import type { Request } from "express";

export enum StoreIn {
  disk = "disk",
  memory = "memory"
}

export const fileTypes = {
  images: ["image/jpeg", "image/png", "image/gif"]
};

export const uploadFile = ({
  storeIn = StoreIn.memory,
  type = fileTypes.images
}: {
  storeIn?: StoreIn;
  type?: string[];
}): multer.Multer => {
  const storage =
    storeIn === StoreIn.memory
      ? memoryStorage()
      : diskStorage({});

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: CallableFunction
  ) => {
    if (!type.includes(file.mimetype)) {
      return cb(new ApplicationException("in-valid file format", 409), false);
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter });
};

import { StoreIn } from "./multer";
import { createReadStream } from "fs";
import { S3Config } from "./s3Config";
import { ApplicationException } from "../Error";
import {
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  type DeleteObjectCommandOutput,
  type DeleteObjectsCommandOutput,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { string } from "zod";

// -----------------------------
// Upload small files
// -----------------------------
export const upLoadFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
  storeIn = StoreIn.memory,
}: {
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
  storeIn?: StoreIn;
}): Promise<string> => {
  const Key = `socialApp/${path}/${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key,
    Body: storeIn === StoreIn.memory ? file.buffer : createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await S3Config().send(command);

  if (!command.input.Key) {
    throw new ApplicationException("Failed to upload file to S3", 500);
  }

  return command.input.Key;
};

// -----------------------------
// Upload large files
// -----------------------------
export const uploadSingleLargeFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
  storeIn = StoreIn.memory,
}: {
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
  storeIn?: StoreIn;
}): Promise<string> => {
  const Key = `socialApp/${path}/${nanoid(15)}__${file.originalname}`;

  const Body = storeIn === StoreIn.memory ? file.buffer : createReadStream(file.path);

  const upload = new Upload({
    client: S3Config(),
    params: {
      Bucket,
      ACL,
      Key,
      Body,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  return Key;
};

// -----------------------------
// Upload multiple files
// -----------------------------
export const uploadMulterFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  files,
  storeIn = StoreIn.memory,
}: {
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
  storeIn?: StoreIn;
}): Promise<string[]> => {
  const keys: string[] = [];
  for (const file of files) {
    const key = await upLoadFile({
      Bucket,
      ACL,
      path,
      file,
      storeIn,
    });
    keys.push(key);
  }
  return keys;
};

// -----------------------------
// Create pre-signed URL
// -----------------------------
export const createPreSignedURL = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  ContentType,
  OriginalName,
  expiresIn = 180,
}: {
  Bucket?: string;
  path?: string;
  ContentType: string;
  OriginalName: string;
  expiresIn?: number;
}) => {
  const Key = `${process.env.APPLICATION_NAME}/${path}/${uuid()}-presigned-${OriginalName}`;

  const command = new PutObjectCommand({
    Bucket,
    Key,
    ContentType,
  });

  const url = await getSignedUrl(S3Config(), command, {
    expiresIn,
  });

  return {
    url,
    key: Key,
  };
};

export const getFile= async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key, 
}:{
    Bucket?: string;
    Key: string
})=>{
    const command = new GetObjectCommand({
     Bucket,
     Key
    })
    return await S3Config().send(command);
}
// -----------------------------
// Delete one file
// -----------------------------
export const deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({ Bucket, Key });
  return await S3Config().send(command);
};

// -----------------------------
// Delete multiple files
// -----------------------------
export const deleteFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}): Promise<DeleteObjectsCommandOutput> => {
  const objects = urls.map((url) => ({ Key: url }));

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: { Objects: objects, Quiet },
  });

  return await S3Config().send(command);
};

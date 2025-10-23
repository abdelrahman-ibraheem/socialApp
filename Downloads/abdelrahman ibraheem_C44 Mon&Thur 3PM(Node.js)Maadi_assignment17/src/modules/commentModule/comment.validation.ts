import Joi from "joi";
import { Types } from "mongoose";

// ✅ Custom validator for MongoDB ObjectId
const objectId = Joi.string().custom((value: string, helpers: Joi.CustomHelpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId validation");

// ✅ Create Comment Validation Schema
export const createCommentSchema = Joi.object({
  postId: objectId.required(),
  content: Joi.string().min(1).max(500).required(),
  replyTo: objectId.optional(),
});

// ✅ Update Comment Validation Schema
export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).optional(),
});

import z from "zod";
import { PostAvailabilityEnum } from "./post.types";

export const createPostSchema = z.object({
    content: z.string().optional(),

    attachments: z.array(z.any()).optional(),

    availability: z
      .enum([
        PostAvailabilityEnum.PUBLIC,
        PostAvailabilityEnum.PRIVATE,
        PostAvailabilityEnum.FRIENDS,
      ])
      .default(PostAvailabilityEnum.PUBLIC)
      .optional(),

    allowComments: z.boolean().default(true).optional(),

    tags: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.content && (!data.attachments || data.attachments.length == 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either content or attachments are required",
        path: ["content", "attachments"],
      });
    }
  });

import {z} from "zod";

export const MetaChildSchema = z.looseObject({
  title: z.string(),
  icon: z.string().optional(),
  introduction: z.string().optional(),
  childrenIcon: z.record(z.string(), z.string()).optional(),
});

export const MetaFileSchema = z.looseObject({
  title: z.string().optional(),
  introduction: z.string().optional(),
  children: z.record(z.string(), MetaChildSchema).optional(),
});

export type MetaChild = z.infer<typeof MetaChildSchema>;
export type MetaFile = z.infer<typeof MetaFileSchema>;

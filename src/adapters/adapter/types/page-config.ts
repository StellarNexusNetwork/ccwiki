import {z} from "zod";

export const PageConfigFileSchema = z.looseObject({
  name: z.string(),
  icon: z.string().optional(),
});

export type PageConfig = z.infer<typeof PageConfigFileSchema>;

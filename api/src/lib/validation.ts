import { z } from "zod";

export const taskInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  payload: z.string().max(1000).optional().default(""),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

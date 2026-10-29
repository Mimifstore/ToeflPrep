import { z } from "zod";

export const navigationSchema = z.object({
  sessionId: z.string().cuid(),

  questionId: z.string().cuid(),
});

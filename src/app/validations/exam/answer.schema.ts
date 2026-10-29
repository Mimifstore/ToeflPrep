import { z } from "zod";

export const answerSchema = z.object({
  sessionId: z.string().cuid(),

  questionId: z.string().cuid(),

  answer: z.string().min(1),
});

import { z } from "zod";

export const saveAnswerSchema = z.object({
  sessionId: z.string().min(1),

  questionId: z.string().min(1),

  answer: z.string().nullable(),
});

import { z } from "zod";

export const submitExamSchema = z.object({
  sessionId: z.string().min(1),
});
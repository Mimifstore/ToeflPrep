import { z } from "zod";

export const submitSchema = z.object({
  sessionId: z.string().cuid(),
});

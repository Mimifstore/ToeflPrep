import { z } from "zod";

export const resultParamsSchema = z.object({
  sessionId: z.string().cuid(),
});

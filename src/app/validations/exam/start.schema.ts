import { z } from "zod";

export const startExamSchema =
  z.object({
    ujianId: z
      .string()
      .min(1, "Ujian wajib dipilih"),
  });
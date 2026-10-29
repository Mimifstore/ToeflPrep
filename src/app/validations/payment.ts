import { z } from "zod";

export const paymentSchema = z.object({
  ujianId: z.string().min(1, "Ujian wajib dipilih"),
});
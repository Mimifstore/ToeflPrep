/*
  Warnings:

  - You are about to drop the column `lastPlayedAt` on the `ExamAudioTrack` table. All the data in the column will be lost.
  - You are about to drop the column `totalPlay` on the `ExamAudioTrack` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ExamAudioTrack` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExamAudioTrack" DROP CONSTRAINT "ExamAudioTrack_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ExamAudioTrack" DROP CONSTRAINT "ExamAudioTrack_sessionId_fkey";

-- DropIndex
DROP INDEX "ExamAudioTrack_sessionId_idx";

-- AlterTable
ALTER TABLE "ExamAudioTrack" DROP COLUMN "lastPlayedAt",
DROP COLUMN "totalPlay",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "ExamAudioTrack" ADD CONSTRAINT "ExamAudioTrack_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAudioTrack" ADD CONSTRAINT "ExamAudioTrack_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

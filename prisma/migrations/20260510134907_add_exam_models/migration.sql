/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ExamAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ExamAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `listeningScore` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the column `readingScore` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the column `structureScore` on the `ExamResult` table. All the data in the column will be lost.
  - You are about to drop the column `isPassed` on the `ExamSession` table. All the data in the column will be lost.
  - You are about to drop the column `totalExit` on the `ExamSession` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ExamSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExamAnswer" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ExamResult" DROP COLUMN "listeningScore",
DROP COLUMN "readingScore",
DROP COLUMN "structureScore";

-- AlterTable
ALTER TABLE "ExamSession" DROP COLUMN "isPassed",
DROP COLUMN "totalExit",
DROP COLUMN "updatedAt",
ADD COLUMN     "currentQuestionId" TEXT;

-- CreateTable
CREATE TABLE "ExamSessionQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamSessionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAudioTrack" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "totalPlay" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3),

    CONSTRAINT "ExamAudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamSessionQuestion_sessionId_idx" ON "ExamSessionQuestion"("sessionId");

-- CreateIndex
CREATE INDEX "ExamSessionQuestion_order_idx" ON "ExamSessionQuestion"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSessionQuestion_sessionId_questionId_key" ON "ExamSessionQuestion"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "ExamAudioTrack_sessionId_idx" ON "ExamAudioTrack"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamAudioTrack_sessionId_questionId_key" ON "ExamAudioTrack"("sessionId", "questionId");

-- CreateIndex
CREATE INDEX "ExamAnswer_questionId_idx" ON "ExamAnswer"("questionId");

-- CreateIndex
CREATE INDEX "ExamSession_status_idx" ON "ExamSession"("status");

-- AddForeignKey
ALTER TABLE "ExamSessionQuestion" ADD CONSTRAINT "ExamSessionQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSessionQuestion" ADD CONSTRAINT "ExamSessionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAudioTrack" ADD CONSTRAINT "ExamAudioTrack_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAudioTrack" ADD CONSTRAINT "ExamAudioTrack_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "ExamAudioTrack" DROP CONSTRAINT "ExamAudioTrack_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ExamAudioTrack" DROP CONSTRAINT "ExamAudioTrack_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "ExamAudioTrack" ADD CONSTRAINT "ExamAudioTrack_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAudioTrack" ADD CONSTRAINT "ExamAudioTrack_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

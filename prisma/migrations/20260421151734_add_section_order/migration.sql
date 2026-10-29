/*
  Warnings:

  - You are about to drop the `CategoryPenilaian` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_categoryPenilaianId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOption" DROP CONSTRAINT "QuestionOption_questionId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "section" INTEGER NOT NULL;

-- DropTable
DROP TABLE "CategoryPenilaian";

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryPenilaianId_fkey" FOREIGN KEY ("categoryPenilaianId") REFERENCES "CategoryScore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

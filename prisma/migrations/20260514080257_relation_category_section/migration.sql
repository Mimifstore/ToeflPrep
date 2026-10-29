/*
  Warnings:

  - You are about to drop the column `section` on the `CategoryScore` table. All the data in the column will be lost.
  - Added the required column `sectionId` to the `CategoryScore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_examId_fkey";

-- AlterTable
ALTER TABLE "CategoryScore" DROP COLUMN "section",
ADD COLUMN     "sectionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CategoryScore" ADD CONSTRAINT "CategoryScore_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

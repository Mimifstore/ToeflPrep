-- AlterTable
ALTER TABLE "ExamSession" ADD COLUMN     "currentSection" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fullscreenWarning" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tabWarning" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "examId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Ujian" ADD COLUMN     "passingScore" INTEGER NOT NULL DEFAULT 450;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

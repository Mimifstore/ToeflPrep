-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'WAITING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Ujian" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "programId" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,
    "timeType" TEXT NOT NULL DEFAULT 'SINGLE',
    "totalTime" INTEGER,
    "listeningTime" INTEGER,
    "structureTime" INTEGER,
    "readingTime" INTEGER,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "shuffleAnswers" BOOLEAN NOT NULL DEFAULT false,
    "showAnswer" BOOLEAN NOT NULL DEFAULT false,
    "showNavigation" BOOLEAN NOT NULL DEFAULT true,
    "showQuestionNumber" BOOLEAN NOT NULL DEFAULT true,
    "autoNextQuestion" BOOLEAN NOT NULL DEFAULT false,
    "showPrevNextButton" BOOLEAN NOT NULL DEFAULT true,
    "questionDisplayType" TEXT NOT NULL DEFAULT 'OPTION',
    "maxExitAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "invoice" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ujianId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentType" TEXT,
    "snapToken" TEXT,
    "midtransOrderId" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "paymentResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExamAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ujianId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserExamAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_invoice_key" ON "Transaction"("invoice");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_midtransOrderId_key" ON "Transaction"("midtransOrderId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_ujianId_idx" ON "Transaction"("ujianId");

-- CreateIndex
CREATE UNIQUE INDEX "UserExamAccess_transactionId_key" ON "UserExamAccess"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserExamAccess_userId_ujianId_key" ON "UserExamAccess"("userId", "ujianId");

-- AddForeignKey
ALTER TABLE "Ujian" ADD CONSTRAINT "Ujian_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ujian" ADD CONSTRAINT "Ujian_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExamAccess" ADD CONSTRAINT "UserExamAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExamAccess" ADD CONSTRAINT "UserExamAccess_ujianId_fkey" FOREIGN KEY ("ujianId") REFERENCES "Ujian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExamAccess" ADD CONSTRAINT "UserExamAccess_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

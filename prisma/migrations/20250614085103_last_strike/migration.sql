/*
  Warnings:

  - A unique constraint covering the columns `[subjectInstanceId]` on the table `Enrolment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Enrolment" DROP CONSTRAINT "Enrolment_studentId_fkey";

-- DropIndex
DROP INDEX "Enrolment_subjectInstanceId_studentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_subjectInstanceId_key" ON "Enrolment"("subjectInstanceId");

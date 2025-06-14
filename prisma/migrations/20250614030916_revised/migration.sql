/*
  Warnings:

  - You are about to drop the column `userId` on the `Enrolment` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `SubjectInstance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subjectInstanceId,studentId]` on the table `Enrolment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `Enrolment` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Requirement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `Requirement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `Submission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `Submission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `filePath` on table `Submission` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Enrolment_userId_subjectInstanceId_key";

-- AlterTable
ALTER TABLE "Enrolment" DROP COLUMN "userId",
ADD COLUMN     "studentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Requirement" DROP COLUMN "createdById",
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "SubjectInstance" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "filePath" SET NOT NULL;

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "fetchID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Student',
    "gradeLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "studentNumber" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianContact" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_fetchID_key" ON "Student"("fetchID");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentNumber_key" ON "Student"("studentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_subjectInstanceId_studentId_key" ON "Enrolment"("subjectInstanceId", "studentId");

-- AddForeignKey
ALTER TABLE "Enrolment" ADD CONSTRAINT "Enrolment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

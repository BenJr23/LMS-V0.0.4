/*
  Warnings:

  - You are about to drop the column `email` on the `Enrolment` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Enrolment` table. All the data in the column will be lost.
  - You are about to drop the column `gradeLevel` on the `Enrolment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Enrolment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Enrolment" DROP COLUMN "email",
DROP COLUMN "fullName",
DROP COLUMN "gradeLevel",
DROP COLUMN "status";

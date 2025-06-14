/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Enrolment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Enrolment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enrolment" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Enrolment_email_key" ON "Enrolment"("email");

/*
  Warnings:

  - Added the required column `userId` to the `SubjectInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubjectInstance" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropIndex
DROP INDEX "Student_email_key";

-- DropIndex
DROP INDEX "Student_fetchID_key";

-- DropIndex
DROP INDEX "Student_studentNumber_key";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT;

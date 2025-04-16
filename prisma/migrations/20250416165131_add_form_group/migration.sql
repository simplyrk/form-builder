-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "formGroup" TEXT;

-- AlterTable
ALTER TABLE "ResponseField" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT;

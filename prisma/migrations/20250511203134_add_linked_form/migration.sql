-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "linkedFormId" TEXT;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_linkedFormId_fkey" FOREIGN KEY ("linkedFormId") REFERENCES "Form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

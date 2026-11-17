-- AlterTable
ALTER TABLE "companyprofile"."promos" ADD COLUMN     "training_id" VARCHAR(36);

-- AlterTable
ALTER TABLE "companyprofile"."trainings" ADD COLUMN     "location" VARCHAR(200),
ADD COLUMN     "time_end" VARCHAR(5),
ADD COLUMN     "time_start" VARCHAR(5);

-- AddForeignKey
ALTER TABLE "companyprofile"."promos" ADD CONSTRAINT "promos_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "companyprofile"."trainings"("id") ON DELETE SET NULL ON UPDATE CASCADE;


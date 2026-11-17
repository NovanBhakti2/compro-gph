-- AlterTable
ALTER TABLE "companyprofile"."trainings" ADD COLUMN     "trainer_id" VARCHAR(36);

-- CreateTable
CREATE TABLE "companyprofile"."trainers" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "title" VARCHAR(100) NOT NULL DEFAULT 'Trainer',
    "signature_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "companyprofile"."trainings" ADD CONSTRAINT "trainings_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "companyprofile"."trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;


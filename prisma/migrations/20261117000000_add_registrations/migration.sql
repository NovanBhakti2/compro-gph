-- AlterTable
ALTER TABLE "companyprofile"."trainings" ADD COLUMN     "registration_open" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registrations_purged_at" TIMESTAMP(3),
ADD COLUMN     "registrations_purged_count" INTEGER;

-- CreateTable
CREATE TABLE "companyprofile"."registrations" (
    "id" VARCHAR(36) NOT NULL,
    "training_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "email_key" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registrations_training_id_idx" ON "companyprofile"."registrations"("training_id");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_training_id_email_key_key" ON "companyprofile"."registrations"("training_id", "email_key");

-- AddForeignKey
ALTER TABLE "companyprofile"."registrations" ADD CONSTRAINT "registrations_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "companyprofile"."trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;


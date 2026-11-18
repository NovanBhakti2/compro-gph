-- AlterTable
ALTER TABLE "companyprofile"."registrations" ADD COLUMN     "decided_at" TIMESTAMP(3),
ADD COLUMN     "notified_at" TIMESTAMP(3),
ADD COLUMN     "status" VARCHAR(10) NOT NULL DEFAULT 'PENDING';


-- Sign-ups made before approval existed were accepted as they came
UPDATE "companyprofile"."registrations" SET "status" = 'APPROVED', "decided_at" = "created_at";

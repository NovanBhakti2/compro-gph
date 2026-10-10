-- AlterTable
ALTER TABLE "companyprofile"."news" ADD COLUMN "gallery_label" VARCHAR(100),
ADD COLUMN "gallery_title" VARCHAR(255),
ADD COLUMN "gallery" JSONB;

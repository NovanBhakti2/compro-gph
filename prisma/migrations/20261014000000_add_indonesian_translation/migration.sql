-- AlterTable
ALTER TABLE "companyprofile"."news" ADD COLUMN "title_id" VARCHAR(255),
ADD COLUMN "excerpt_id" VARCHAR(500),
ADD COLUMN "content_id" TEXT,
ADD COLUMN "key_topics_title_id" VARCHAR(255),
ADD COLUMN "key_topics_id" JSONB,
ADD COLUMN "gallery_label_id" VARCHAR(100),
ADD COLUMN "gallery_title_id" VARCHAR(255);

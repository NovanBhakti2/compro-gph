-- AlterTable
ALTER TABLE "companyprofile"."news" ADD COLUMN "key_topics_title" VARCHAR(255),
ADD COLUMN "key_topics" JSONB;

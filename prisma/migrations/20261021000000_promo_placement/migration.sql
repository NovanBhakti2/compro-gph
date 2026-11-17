-- AlterTable
ALTER TABLE "companyprofile"."promos" ADD COLUMN     "show_in_news" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_popup" BOOLEAN NOT NULL DEFAULT true;

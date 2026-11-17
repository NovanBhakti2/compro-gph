-- CreateTable
CREATE TABLE "companyprofile"."promos" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "image_url_id" VARCHAR(500),
    "cta_label" VARCHAR(100),
    "cta_label_id" VARCHAR(100),
    "cta_url" VARCHAR(500),
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "show_on" VARCHAR(10) NOT NULL DEFAULT 'HOME',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promos_pkey" PRIMARY KEY ("id")
);

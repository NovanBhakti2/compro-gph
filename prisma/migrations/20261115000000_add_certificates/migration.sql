-- CreateTable
CREATE TABLE "companyprofile"."trainings" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "claim_until" TIMESTAMP(3),
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companyprofile"."certificates" (
    "id" VARCHAR(36) NOT NULL,
    "training_id" VARCHAR(36) NOT NULL,
    "participant_name" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(150),
    "contact_key" VARCHAR(150) NOT NULL,
    "year" INTEGER NOT NULL,
    "seq" INTEGER NOT NULL,
    "number" VARCHAR(30) NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainings_slug_key" ON "companyprofile"."trainings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_number_key" ON "companyprofile"."certificates"("number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_code_key" ON "companyprofile"."certificates"("code");

-- CreateIndex
CREATE INDEX "certificates_training_id_idx" ON "companyprofile"."certificates"("training_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_training_id_contact_key_key" ON "companyprofile"."certificates"("training_id", "contact_key");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_year_seq_key" ON "companyprofile"."certificates"("year", "seq");

-- AddForeignKey
ALTER TABLE "companyprofile"."certificates" ADD CONSTRAINT "certificates_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "companyprofile"."trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;


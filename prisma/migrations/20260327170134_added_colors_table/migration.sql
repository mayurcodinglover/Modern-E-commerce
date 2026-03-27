-- CreateTable
CREATE TABLE "colors" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "hex_code" VARCHAR(7),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colors_name_key" ON "colors"("name");

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address_line1" VARCHAR(255) NOT NULL,
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

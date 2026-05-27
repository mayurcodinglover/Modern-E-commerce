-- CreateTable
CREATE TABLE "whishlist" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whishlist_user_id_idx" ON "whishlist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "whishlist_user_id_product_id_key" ON "whishlist"("user_id", "product_id");

-- AddForeignKey
ALTER TABLE "whishlist" ADD CONSTRAINT "whishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whishlist" ADD CONSTRAINT "whishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

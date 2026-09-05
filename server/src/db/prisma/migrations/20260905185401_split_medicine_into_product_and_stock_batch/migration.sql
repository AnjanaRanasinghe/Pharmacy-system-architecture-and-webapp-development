/*
  Warnings:

  - You are about to drop the column `medicine_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `medicine_id` on the `purchase_items` table. All the data in the column will be lost.
  - You are about to drop the column `medicine_id` on the `sale_items` table. All the data in the column will be lost.
  - You are about to drop the `medicines` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[po_number]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoice_number]` on the table `sales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batch_number` to the `purchase_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiry_date` to the `purchase_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `purchase_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `po_number` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batch_id` to the `sale_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_number` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_category_id_fkey";

-- DropForeignKey
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_medicine_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_medicine_id_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_medicine_id_fkey";

-- DropIndex
DROP INDEX "purchase_items_medicine_id_idx";

-- DropIndex
DROP INDEX "sale_items_medicine_id_idx";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "medicine_id",
ADD COLUMN     "batch_id" TEXT,
ADD COLUMN     "product_id" TEXT;

-- AlterTable
ALTER TABLE "purchase_items" DROP COLUMN "medicine_id",
ADD COLUMN     "batch_number" TEXT NOT NULL,
ADD COLUMN     "expiry_date" DATE NOT NULL,
ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "expected_delivery" DATE,
ADD COLUMN     "po_number" TEXT NOT NULL,
ADD COLUMN     "sequence_number" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "sale_items" DROP COLUMN "medicine_id",
ADD COLUMN     "batch_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "invoice_number" TEXT NOT NULL,
ADD COLUMN     "sequence_number" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "medicines";

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "default_supplier_id" TEXT,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "reorder_level" INTEGER NOT NULL DEFAULT 20,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_batches" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "purchase_item_id" TEXT,
    "batch_number" TEXT NOT NULL,
    "expiry_date" DATE NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_default_supplier_id_idx" ON "products"("default_supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_batches_purchase_item_id_key" ON "stock_batches"("purchase_item_id");

-- CreateIndex
CREATE INDEX "stock_batches_product_id_idx" ON "stock_batches"("product_id");

-- CreateIndex
CREATE INDEX "stock_batches_expiry_date_idx" ON "stock_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "purchase_items_product_id_idx" ON "purchase_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_po_number_key" ON "purchases"("po_number");

-- CreateIndex
CREATE INDEX "sale_items_batch_id_idx" ON "sale_items"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_invoice_number_key" ON "sales"("invoice_number");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_default_supplier_id_fkey" FOREIGN KEY ("default_supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_purchase_item_id_fkey" FOREIGN KEY ("purchase_item_id") REFERENCES "purchase_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "stock_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "stock_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

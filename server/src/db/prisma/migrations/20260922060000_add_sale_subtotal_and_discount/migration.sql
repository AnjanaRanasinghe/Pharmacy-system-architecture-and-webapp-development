-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal_amount" DECIMAL(10,2) NOT NULL;

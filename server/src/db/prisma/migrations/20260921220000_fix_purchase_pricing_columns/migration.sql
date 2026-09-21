-- schema.prisma already declared purchasedAmount/purchasePrice/sellingAmount/sellingPrice
-- on PurchaseItem and purchasePrice on StockBatch, but no prior migration ever created
-- these columns in the database — it still had the old single cost_price column from
-- before purchases were split into "amount paid" + "per-unit price". This backfills the
-- new columns from the existing data instead of dropping cost_price outright.

-- 1. Add the new columns as nullable so existing rows aren't rejected.
ALTER TABLE "purchase_items"
  ADD COLUMN "purchased_amount" DECIMAL(10,2),
  ADD COLUMN "purchase_price" DECIMAL(10,2),
  ADD COLUMN "selling_amount" DECIMAL(10,2),
  ADD COLUMN "selling_price" DECIMAL(10,2);

ALTER TABLE "stock_batches"
  ADD COLUMN "purchase_price" DECIMAL(10,2);

-- 2. Backfill purchase pricing from the old per-unit cost_price and quantity.
UPDATE "purchase_items"
SET
  "purchase_price" = "cost_price",
  "purchased_amount" = "cost_price" * "quantity";

-- 3. Backfill selling pricing from the product's current selling price — no historical
--    selling price was recorded per purchase, so this is the closest available estimate.
UPDATE "purchase_items" pi
SET
  "selling_price" = p."selling_price",
  "selling_amount" = p."selling_price" * pi."quantity"
FROM "products" p
WHERE p."id" = pi."product_id";

UPDATE "stock_batches"
SET "purchase_price" = "cost_price";

-- 4. Now that every row has a value, enforce NOT NULL.
ALTER TABLE "purchase_items"
  ALTER COLUMN "purchase_price" SET NOT NULL,
  ALTER COLUMN "purchased_amount" SET NOT NULL,
  ALTER COLUMN "selling_amount" SET NOT NULL,
  ALTER COLUMN "selling_price" SET NOT NULL;

ALTER TABLE "stock_batches"
  ALTER COLUMN "purchase_price" SET NOT NULL;

-- 5. Drop the old column now superseded by the new pricing fields.
ALTER TABLE "purchase_items" DROP COLUMN "cost_price";
ALTER TABLE "stock_batches" DROP COLUMN "cost_price";

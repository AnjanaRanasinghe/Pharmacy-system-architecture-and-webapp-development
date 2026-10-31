import readline from "readline";
import { PrismaClient } from "@prisma/client";

// Run this exactly ONCE, on the real shop PC, right before the pharmacy goes live —
// never on a system that already has real sales/purchases in it. It permanently
// deletes every row in every table and resets invoice/PO/return numbering back to 1.
const TABLES = [
  "notifications",
  "sale_return_items",
  "sale_returns",
  "sale_items",
  "sales",
  "stock_batches",
  "purchase_items",
  "purchases",
  "products",
  "suppliers",
  "categories",
  "customers",
  "users",
  "pharmacy_settings",
];

async function main() {
  console.log("\n!! FACTORY RESET !!");
  console.log("This permanently deletes EVERY medicine, sale, purchase, user, and setting,");
  console.log("and resets invoice numbering back to 1. This cannot be undone.");
  console.log("Only do this once, when setting up a brand-new shop PC.\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer: string = await new Promise((resolve) => rl.question('Type "RESET" to continue: ', resolve));
  rl.close();

  if (answer.trim() !== "RESET") {
    console.log("Aborted — nothing was changed.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${TABLES.join(", ")} RESTART IDENTITY CASCADE;`);
  await prisma.$disconnect();

  console.log("\nDone. The database is empty and all numbering starts from 1 again.");
  console.log("Start the app, register the real admin account, then fill in Settings.");
}

main().catch((err) => {
  console.error("Factory reset failed:", err);
  process.exit(1);
});

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { ScrapedProduct } from "./scraper";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log("=================================================");
  console.log("🇮🇳  India Bazaar — Product Dataset Seed Utility");
  console.log("=================================================");

  const seedDir = path.resolve(__dirname, "../../scripts/seed/data");
  if (!fs.existsSync(seedDir)) {
    console.error(`[Seed] Seed directory not found at: ${seedDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(seedDir).filter(f => f.endsWith(".json"));
  console.log(`[Seed] Discovered ${files.length} category dataset files:`, files.join(", "));

  let totalProducts = 0;
  const categorySummary: Record<string, number> = {};

  for (const file of files) {
    const category = path.basename(file, ".json");
    const filePath = path.join(seedDir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const items: ScrapedProduct[] = JSON.parse(content);
      categorySummary[category] = items.length;
      totalProducts += items.length;

      // Verify required fields from docs/DATASET_CONTRIBUTION_GUIDE.md
      for (const item of items) {
        if (!item.name || !item.brand || !item.price || !item.mrp) {
          console.warn(`[Seed] Warning: Item in ${file} missing core attributes: ${item.name}`);
        }
        if (!item.manufacturerName || !item.countryOfOrigin) {
          console.warn(`[Seed] Warning: Item missing Legal Metrology fields: ${item.name}`);
        }
      }
    } catch (err) {
      console.error(`[Seed] Failed parsing ${file}:`, (err as Error).message);
    }
  }

  console.log("\n📊 Seed Catalog Summary:");
  for (const [cat, count] of Object.entries(categorySummary)) {
    console.log(`  - Category [${cat}]: ${count} verified products`);
  }
  console.log(`\nTotal Products Prepared: ${totalProducts}`);

  if (!process.env.DATABASE_URL) {
    console.log("\n⚠️  DATABASE_URL environment variable is not configured.");
    console.log("ℹ️  Datasets are verified and available under scripts/seed/data/");
    console.log("ℹ️  Frontend will utilize the rich offline mock store fallback seamlessly.");
    console.log("To push to PostgreSQL: set DATABASE_URL=postgresql://... and run 'pnpm run seed'\n");
    return;
  }

  try {
    console.log("\nConnecting to PostgreSQL database...");
    const { db, productsTable, categoriesTable } = await import("@workspace/db");

    console.log("Populating database with seed entries...");
    for (const file of files) {
      const filePath = path.join(seedDir, file);
      const items: ScrapedProduct[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      for (const item of items) {
        await db.insert(productsTable).values({
          name: item.name,
          description: item.description,
          price: item.price,
          mrp: item.mrp,
          discount: item.discount,
          category: item.category,
          subcategory: item.subcategory ?? null,
          brand: item.brand,
          images: item.images,
          rating: item.rating,
          reviewCount: item.reviewCount,
          stock: item.stock,
          seller: item.seller,
          isFeatured: item.isFeatured ?? false,
          manufacturerName: item.manufacturerName,
          manufacturerAddress: item.manufacturerAddress,
          countryOfOrigin: item.countryOfOrigin,
          netQuantity: item.netQuantity,
          gstSlab: item.gstSlab,
          dimensions: item.dimensions ?? null,
          barcode: item.barcode ?? null,
        }).onConflictDoNothing();
      }
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (err) {
    console.error("❌ Database seeding error:", (err as Error).message);
  }
}

runSeed().catch(console.error);

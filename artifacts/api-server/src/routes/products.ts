import { Router, type IRouter } from "express";
import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import { db, productsTable, categoriesTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function buildProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    mrp: p.mrp,
    discount: p.discount,
    category: p.category,
    subcategory: p.subcategory ?? null,
    brand: p.brand,
    images: p.images,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    seller: p.seller,
    isFeatured: p.isFeatured,
    manufacturerName: p.manufacturerName ?? null,
    manufacturerAddress: p.manufacturerAddress ?? null,
    countryOfOrigin: p.countryOfOrigin ?? "India",
    netQuantity: p.netQuantity ?? null,
    gstSlab: p.gstSlab ?? 18,
    dimensions: p.dimensions ?? null,
    barcode: p.barcode ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    category,
    search,
    brand,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    page = 1,
    limit = 20,
  } = parsed.data;

  const conditions: ReturnType<typeof eq>[] = [];

  if (category) conditions.push(eq(productsTable.category, category));
  if (brand) conditions.push(eq(productsTable.brand, brand));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (minPrice !== undefined) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(productsTable.price, maxPrice));
  if (minRating !== undefined) conditions.push(gte(productsTable.rating, minRating));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (sortBy) {
    case "price_asc":
      orderBy = productsTable.price;
      break;
    case "price_desc":
      orderBy = sql`${productsTable.price} desc`;
      break;
    case "rating":
      orderBy = sql`${productsTable.rating} desc`;
      break;
    case "newest":
      orderBy = sql`${productsTable.createdAt} desc`;
      break;
    default:
      orderBy = sql`${productsTable.reviewCount} desc`;
  }

  const offset = (Number(page) - 1) * Number(limit);

  const [products, countResult] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(Number(limit))
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    products: products.map(buildProduct),
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isFeatured, true))
    .orderBy(sql`${productsTable.rating} desc`)
    .limit(12);
  res.json(products.map(buildProduct));
});

router.get("/products/deals", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(gte(productsTable.discount, 30))
    .orderBy(sql`${productsTable.discount} desc`)
    .limit(12);
  res.json(products.map(buildProduct));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(buildProduct(product));
});

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      productCount: c.productCount,
    }))
  );
});

export default router;

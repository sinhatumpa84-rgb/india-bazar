import {
  pgTable,
  text,
  serial,
  timestamp,
  real,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  productCount: integer("product_count").notNull().default(0),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  mrp: real("mrp").notNull(),
  discount: integer("discount").notNull().default(0),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  brand: text("brand").notNull(),
  images: text("images").array().notNull().default([]),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  seller: text("seller").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  manufacturerName: text("manufacturer_name"),
  manufacturerAddress: text("manufacturer_address"),
  countryOfOrigin: text("country_of_origin").default("India"),
  netQuantity: text("net_quantity"),
  gstSlab: integer("gst_slab").default(18),
  dimensions: text("dimensions"),
  barcode: text("barcode"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

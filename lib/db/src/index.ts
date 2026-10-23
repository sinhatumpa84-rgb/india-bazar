import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "[DB Warning] DATABASE_URL is not set. Database operations will require DATABASE_URL.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/indiabazar" });
export const db = drizzle(pool, { schema });

export * from "./schema";

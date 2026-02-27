import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const defaultDatabaseUrl =
  "postgresql://postgres:password@helium/heliumdb?sslmode=disable";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

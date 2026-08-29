import "dotenv/config"

import { drizzle } from "drizzle-orm/neon-serverless"
import { migrate } from "drizzle-orm/neon-serverless/migrator"
import { Pool } from "@neondatabase/serverless"

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool)

await migrate(db, { migrationsFolder: "./drizzle" })

await pool.end()

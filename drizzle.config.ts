import type { Config } from "drizzle-kit"

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      "postgresql://neondb_owner:npg_YA2zOQ5KxjaP@ep-spring-cherry-afla7dp4.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
  },
  verbose: true,
  strict: true,
} satisfies Config

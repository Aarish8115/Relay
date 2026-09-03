import type { Edge } from "@xyflow/react"
import { jsonb, pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

export type WorkflowGraph = { nodes: StepNodeType[]; edges: Edge[] }

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  graph: jsonb("graph").$type<WorkflowGraph>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Workflow = typeof workflows.$inferInsert

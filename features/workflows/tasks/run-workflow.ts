import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"

import { getWorkflow } from "@/features/data"
import { browserbase, Stagehand } from "@browserbasehq/stagehand"
import { interpolate } from "../lib/interpolate"
import { nodeExecutors } from "../nodes/node-executors"
import type { NodeType } from "../nodes/node-registry"

type RunStepOutput =
  | null
  | boolean
  | number
  | string
  | RunStepOutput[]
  | { [key: string]: RunStepOutput }

export type RunStep = {
  id: string
  type?: NodeType
  title?: string
  status: "pending" | "running" | "done" | "failed"
  startedAt?: string
  finishedAt?: string
  durationMs?: number
  output?: RunStepOutput
  error?: string
}

// The Trigger.dev task the Run button fires. It loads the saved graph, works out
// what order the nodes should run in, and walks them. For now each node just
// announces itself — real execution (per-node executors, live progress, browser
// sessions) gets layered on from here.
export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({ workflowId, orgId }: { workflowId: string; orgId: string }) => {
    const workflow = await getWorkflow(orgId, workflowId)
    if (!workflow?.graph) throw new Error(`Workflow ${workflowId} has no graph`)

    const { nodes, edges } = workflow.graph
    const byId = new Map(nodes.map((n) => [n.id, n]))

    // Run only connected nodes — anything touching an edge. Orphans dropped on
    // the canvas are skipped. toposort orders them and throws on a cycle.
    const connected = new Set(edges.flatMap((e) => [e.source, e.target]))
    const order = toposort
      .array(
        nodes.map((n) => n.id),
        edges.map((e) => [e.source, e.target])
      )
      .filter((id) => connected.has(id))
    const steps: RunStep[] = order.map((id) => {
      const node = byId.get(id)!
      return {
        id,
        type: node.data.type,
        title: node.data.title,
        status: "pending",
      }
    })
    const nodeOutputs: Record<string, unknown> = {}

    metadata.set("steps", steps)

    logger.log(`Running workflow ${workflow.name}`, { steps: order.length })

    let stagehand: Stagehand | undefined
    let browser: Awaited<ReturnType<typeof browserbase.launch>> | undefined
    const getStagehand = async () => {
      if (stagehand) return stagehand
      const apiKey = process.env.BROWSERBASE_API_KEY
      const extensionId = process.env.BROWSERBASE_STAGEHAND_EXTENSION_ID
      if (!apiKey) throw new Error("BROWSERBASE_API_KEY is required")

      browser = await browserbase.launch({
        apiKey,
        extensionId,
        api_timeout: 3600,
        userMetadata: { stagehand: "true" },
      })
      stagehand = await Stagehand.create({
        browser,
        model: { modelName: "google/gemini-2.5-flash" },
        logging: { level: "off" },
      })
      return stagehand
    }

    try {
      for (const id of order) {
        const node = byId.get(id)!
        logger.log(`Running step: ${node.data.title}`)

        const executor = nodeExecutors[node.data.type]
        const values = Object.fromEntries(
          Object.entries(node.data.values).map(([key, value]) => [
            key,
            interpolate(value, nodeOutputs),
          ])
        )
        const step = steps.find((item) => item.id === id)!
        const startedAt = new Date()
        step.status = "running"
        step.startedAt = startedAt.toISOString()
        metadata.set("steps", steps)
        await metadata.flush()

        try {
          const output = executor
            ? await executor({ values, getStagehand })
            : undefined
          nodeOutputs[id] = output
          step.status = "done"
          step.finishedAt = new Date().toISOString()
          step.durationMs = Date.now() - startedAt.getTime()
          step.output = output as RunStepOutput
          metadata.set("steps", steps)
          await metadata.flush()
        } catch (error) {
          step.status = "failed"
          step.finishedAt = new Date().toISOString()
          step.durationMs = Date.now() - startedAt.getTime()
          step.error = error instanceof Error ? error.message : String(error)
          metadata.set("steps", steps)
          await metadata.flush()
          throw error
        }
      }
    } finally {
      try {
        if (stagehand) {
          await stagehand.close()
        } else {
          await browser?.close()
        }
      } catch (error) {
        logger.warn("Browser session cleanup failed", {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return { steps }
  },
})

import type { Stagehand } from "@browserbasehq/stagehand"

import type {
  ActionNodeType,
  NodeType,
} from "@/features/workflows/nodes/node-registry"
import { agent } from "@/features/workflows/nodes/agent"
import { act } from "@/features/workflows/nodes/act"
import { extract } from "@/features/workflows/nodes/extract"
import { openUrl } from "@/features/workflows/nodes/open-url"
import { observe } from "@/features/workflows/nodes/observe"
import { sendEmail } from "@/features/workflows/nodes/send-email"

export type NodeContext = {
  values: Record<string, string>
  getStagehand: () => Promise<Stagehand>
}

export type NodeExecutor = (ctx: NodeContext) => Promise<unknown>

export const nodeExecutors: Partial<Record<NodeType, NodeExecutor>> = {
  agent: async ({ values, getStagehand }) =>
    agent({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  act: async ({ values, getStagehand }) =>
    act({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  extract: async ({ values, getStagehand }) =>
    extract({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  observe: async ({ values, getStagehand }) =>
    observe({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  "open-url": async ({ values, getStagehand }) =>
    openUrl({ stagehand: await getStagehand(), url: values.url }),
  "send-email": async ({ values }) =>
    sendEmail({
      to: values.to,
      subject: values.subject,
      body: values.body,
    }),
} satisfies Record<ActionNodeType, NodeExecutor>

"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  createWorkflow,
  deleteWorkflow,
  saveWorkflowGraph,
} from "@/features/data"
import { liveblocks } from "@/lib/liveblocks"
import { runs, tasks } from "@trigger.dev/sdk"
import { helloWorldTask } from "@/trigger/example"
import { WorkflowGraph } from "@/db/schema"

export async function createWorkflowAction(name: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const workflow = await createWorkflow(orgId, name)

  revalidatePath("/workflows", "layout")
  redirect(`/workflows/${workflow.id}`)
}

export async function deleteWorkflowAction(id: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const workflow = await deleteWorkflow(orgId, id)

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  await liveblocks.deleteRoom(workflow.id)
  revalidatePath("/workflows", "layout")
  redirect("/")
}

export async function runWorkflowAction({
  id,
  graph,
}: {
  id: string
  graph: WorkflowGraph
}) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  await saveWorkflowGraph({ orgId, id, graph })

  const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
    message: "Hello from right-sidebar",
  })

  return handle
}

export async function cancelWorkflowRunAction(runId: string) {
  const { orgId } = await auth()
  if (!orgId) throw new Error("No active organization found.")
  await runs.cancel(runId)
}

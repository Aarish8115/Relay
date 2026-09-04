"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type { runWorkflowTask, RunStep } from "../tasks/run-workflow"

export type WorkflowRun = ReturnType<
  typeof useRealtimeRunsWithTag<typeof runWorkflowTask>
>["runs"][number]

type WorkflowRunsContextValue = {
  runs: WorkflowRun[]
  latestRun: WorkflowRun | undefined
  steps: RunStep[] | undefined
  isLive: boolean
}

const WorkflowRunsContext = createContext<WorkflowRunsContextValue | undefined>(
  undefined
)

export function WorkflowRunsProvider({
  workflowId,
  publicAccessToken,
  children,
}: {
  workflowId: string
  publicAccessToken: string
  children: ReactNode
}) {
  const { runs } = useRealtimeRunsWithTag<typeof runWorkflowTask>(
    `workflow:${workflowId}`,
    {
      accessToken: publicAccessToken,
    }
  )

  const latestRun = runs.reduce<(typeof runs)[number] | undefined>(
    (latest, run) =>
      !latest || run.createdAt.getTime() > latest.createdAt.getTime()
        ? run
        : latest,
    undefined
  )
  const steps = (latestRun?.output?.steps ?? latestRun?.metadata?.steps) as
    RunStep[] | undefined

  return (
    <WorkflowRunsContext.Provider
      value={{
        runs,
        latestRun,
        steps,
        isLive: Boolean(latestRun?.isQueued || latestRun?.isExecuting),
      }}
    >
      {children}
    </WorkflowRunsContext.Provider>
  )
}

export function useLatestRunSteps(): WorkflowRunsContextValue {
  return useWorkflowRuns()
}

export function useWorkflowRuns(): WorkflowRunsContextValue {
  const context = useContext(WorkflowRunsContext)
  if (!context) {
    throw new Error(
      "useWorkflowRuns must be used within a WorkflowRunsProvider"
    )
  }

  return context
}

"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type { RunStep } from "../tasks/run-workflow"

type WorkflowRunsContextValue = {
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
  const { runs } = useRealtimeRunsWithTag(`workflow:${workflowId}`, {
    accessToken: publicAccessToken,
  })

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
        steps,
        isLive: Boolean(latestRun?.isQueued || latestRun?.isExecuting),
      }}
    >
      {children}
    </WorkflowRunsContext.Provider>
  )
}

export function useLatestRunSteps(): WorkflowRunsContextValue {
  const context = useContext(WorkflowRunsContext)
  if (!context) {
    throw new Error(
      "useLatestRunSteps must be used within a WorkflowRunsProvider"
    )
  }

  return context
}

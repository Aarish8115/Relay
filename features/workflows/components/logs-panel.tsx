"use client"

import prettyMs from "pretty-ms"
import { Check, X, MonitorPlay } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { NodeIcon } from "./right-sidebar"
import type { WorkflowRun } from "./workflow-runs-provider"
import type { RunStep } from "../tasks/run-workflow"
import type { StepNodeType } from "../nodes/node-registry"

export type ConsoleSelection =
  { runId: string; stepId: string } | { runId: string; replay: true }

function StepStatus({ status }: { status: RunStep["status"] }) {
  if (status === "running") return <Spinner className="size-3.5" />
  if (status === "failed") {
    return <X className="size-3.5 text-destructive" />
  }
  if (status === "done") return <Check className="size-3.5 text-emerald-500" />
  return <span className="size-1.5 rounded-full bg-muted-foreground/40" />
}

function formatDuration(durationMs: number | undefined) {
  return durationMs === undefined ? "-" : prettyMs(durationMs)
}

function formatRunDate(createdAt: Date) {
  return createdAt.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function LogsPanel({
  runs,
  nodes,
  selection,
  onSelect,
}: {
  runs: WorkflowRun[]
  nodes: StepNodeType[]
  selection: ConsoleSelection | undefined
  onSelect: (selection: ConsoleSelection) => void
}) {
  if (runs.length === 0) {
    return (
      <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
        No runs yet
      </div>
    )
  }

  const sortedRuns = [...runs].sort(
    (first, second) => second.createdAt.getTime() - first.createdAt.getTime()
  )

  return (
    <div className="size-full overflow-y-auto">
      {sortedRuns.map((run) => {
        const steps = (run.output?.steps ?? run.metadata?.steps) as
          RunStep[] | undefined

        return (
          <section
            key={run.id}
            className="border-b border-border last:border-b-0"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-semibold">Run</span>
                <span className="truncate text-muted-foreground">
                  {formatRunDate(run.createdAt)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                <span>{run.status}</span>
                <span>{formatDuration(run.durationMs)}</span>
              </div>
            </div>
            {steps?.map((step) => {
              const node = nodes.find((item) => item.id === step.id)
              const type = step.type ?? node?.data.type
              const isSelected =
                selection?.runId === run.id &&
                "stepId" in selection &&
                selection.stepId === step.id

              return (
                <button
                  key={step.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted/60",
                    step.status === "pending" && "opacity-45",
                    step.status === "failed" && "text-destructive",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => onSelect({ runId: run.id, stepId: step.id })}
                >
                  <NodeIcon type={type} />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {step.title ?? node?.data.title ?? "Unnamed step"}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDuration(step.durationMs)}
                  </span>
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <StepStatus status={step.status} />
                  </span>
                </button>
              )
            })}
            {run.sessionId && !run.isQueued && !run.isExecuting && (
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted/60",
                  selection?.runId === run.id &&
                    "replay" in selection &&
                    "bg-muted"
                )}
                onClick={() => onSelect({ runId: run.id, replay: true })}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <MonitorPlay className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium">
                  Replay
                </span>
              </button>
            )}
          </section>
        )
      })}
    </div>
  )
}

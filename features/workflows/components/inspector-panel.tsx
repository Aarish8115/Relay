"use client"

import type { RunStep } from "../tasks/run-workflow"

export function InspectorPanel({ step }: { step: RunStep }) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-1 flex-col border-l border-border bg-card">
      <div className="shrink-0 border-b border-border px-3 py-2 text-xs font-semibold">
        {step.title ?? "Step output"}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 text-xs">
        {step.error ? (
          <p className="whitespace-pre-wrap wrap-break-word text-destructive">
            {step.error}
          </p>
        ) : step.output !== undefined ? (
          <pre className="whitespace-pre-wrap wrap-break-word text-muted-foreground">
            {JSON.stringify(step.output, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground">No output</p>
        )}
      </div>
    </aside>
  )
}

"use client"

import { useState } from "react"
import { useStore } from "@xyflow/react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { LogsPanel, type ConsoleSelection } from "./logs-panel"
import { InspectorPanel } from "./inspector-panel"
import { useWorkflowRuns } from "./workflow-runs-provider"
import type { RunStep } from "../tasks/run-workflow"
import type { StepNodeType } from "../nodes/node-registry"

export function ConsolePanel() {
  const { runs } = useWorkflowRuns()
  const nodes = useStore((state) => state.nodes as StepNodeType[])
  const [selection, setSelection] = useState<ConsoleSelection | undefined>()

  const select = (nextSelection: ConsoleSelection) => {
    setSelection((current) => {
      const isSameSelection =
        current?.runId === nextSelection.runId &&
        ("stepId" in current
          ? "stepId" in nextSelection && current.stepId === nextSelection.stepId
          : "replay" in nextSelection)

      return isSameSelection ? undefined : nextSelection
    })
  }

  const selectedRun = runs.find((run) => run.id === selection?.runId)
  const selectedSteps = selectedRun
    ? ((selectedRun.output?.steps ?? selectedRun.metadata?.steps) as
        RunStep[] | undefined)
    : undefined
  const selectedStep =
    selection && "stepId" in selection
      ? selectedSteps?.find((step) => step.id === selection.stepId)
      : undefined
  const selectedSessionId =
    selection && "replay" in selection ? selectedRun?.sessionId : undefined

  const inspector = selectedSessionId
    ? { sessionId: selectedSessionId }
    : selectedStep
      ? { step: selectedStep }
      : undefined

  return (
    <ResizablePanelGroup orientation="horizontal" className="size-full min-h-0">
      <ResizablePanel minSize="12rem">
        <LogsPanel
          runs={runs}
          nodes={nodes}
          selection={selection}
          onSelect={select}
        />
      </ResizablePanel>
      {inspector && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="35%" minSize="12rem">
            <InspectorPanel {...inspector} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}

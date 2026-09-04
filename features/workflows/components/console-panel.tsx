"use client"

import { useState } from "react"
import { useStore } from "@xyflow/react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { LogsPanel } from "./logs-panel"
import { InspectorPanel } from "./inspector-panel"
import { useWorkflowRuns } from "./workflow-runs-provider"
import type { RunStep } from "../tasks/run-workflow"
import type { StepNodeType } from "../nodes/node-registry"

export function ConsolePanel() {
  const { runs } = useWorkflowRuns()
  const nodes = useStore((state) => state.nodes as StepNodeType[])
  const [selectedStep, setSelectedStep] = useState<
    { runId: string; stepId: string } | undefined
  >()

  const selectStep = (runId: string, stepId: string) => {
    setSelectedStep((current) =>
      current?.runId === runId && current.stepId === stepId
        ? undefined
        : { runId, stepId }
    )
  }

  const selectedRun = runs.find((run) => run.id === selectedStep?.runId)
  const selectedSteps = selectedRun
    ? ((selectedRun.output?.steps ?? selectedRun.metadata?.steps) as
        | RunStep[]
        | undefined)
    : undefined
  const selected = selectedSteps?.find(
    (step) => step.id === selectedStep?.stepId
  )

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="size-full min-h-0"
    >
      <ResizablePanel minSize="12rem">
        <LogsPanel
          runs={runs}
          nodes={nodes}
          selectedStep={selectedStep}
          onSelectStep={selectStep}
        />
      </ResizablePanel>
      {selected && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="35%" minSize="12rem">
            <InspectorPanel step={selected} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
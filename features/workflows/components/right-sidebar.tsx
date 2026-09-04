"use client"

import { useState, useTransition } from "react"
import { CircleHelp, MoreHorizontal, Play, Square, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResizablePanel } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  cancelWorkflowRunAction,
  deleteWorkflowAction,
  runWorkflowAction,
} from "@/features/workflows/actions"

import {
  nodeRegistry,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { useReactFlow, useStore, type Edge } from "@xyflow/react"
import { useUpstreamConnections } from "../hooks/use-upstream-connections"
import { validateGraph } from "../lib/validate-graph"
import { useWorkflowRuns } from "./workflow-runs-provider"

// This file builds up to the RightSidebar component exported at the bottom: a
// header with workflow actions (delete, run), then two tabs — a Toolbar for
// adding nodes and an Editor for tweaking the selected node. Each helper below is
// defined just above the block that uses it.

// ---------------------------------------------------------------------------
// Shared pieces — used by both the Toolbar and the Editor.
// ---------------------------------------------------------------------------

// The accent-colored icon chip, mirroring the node on the canvas.
export function NodeIcon({
  type,
  className,
}: {
  type: NodeType | undefined
  className?: string
}) {
  const def = type ? nodeRegistry[type] : undefined
  const Icon = def?.icon ?? CircleHelp
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        def?.accent ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3.5" />
    </span>
  )
}

// A titled, scrollable panel. Each tab renders its content inside one.
function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor tab — edits the fields of the selected node.
// ---------------------------------------------------------------------------

// A single editor field for a node property.
function Field({
  field,
  value,
  onChange,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
}) {
  const Control = field.multiline ? Textarea : Input

  return (
    <Control
      id={field.key}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// The Editor tab: one input per field on the selected node, or an empty state.
function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()
  const upstreamConnections = useUpstreamConnections(node)
  const [lastEditedField, setLastEditedField] = useState<{
    nodeId: string
    fieldKey: string
  }>()

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">No node selected</p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const def: NodeDefinition = nodeRegistry[type]
  const fieldKey =
    lastEditedField?.nodeId === node.id &&
    def.fields.some((field) => field.key === lastEditedField.fieldKey)
      ? lastEditedField.fieldKey
      : def.fields[0]?.key

  const insertConnection = (token: string) => {
    if (!fieldKey) return

    updateNodeData(node.id, {
      values: { ...values, [fieldKey]: `${values[fieldKey] ?? ""}${token}` },
    })
  }

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties</p>
        ) : (
          def.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Field
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => {
                  setLastEditedField({ nodeId: node.id, fieldKey: field.key })
                  updateNodeData(node.id, {
                    values: { ...values, [field.key]: value },
                  })
                }}
              />
            </div>
          ))
        )}
        {upstreamConnections.length > 0 && (
          <div className="-mx-3 border-t border-border px-3 pt-3">
            <div className="mb-2 text-xs font-semibold">Connections</div>
            <div className="flex flex-wrap gap-1.5">
              {upstreamConnections.map((connection) => (
                <Button
                  key={connection.token}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!fieldKey}
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={() => insertConnection(connection.token)}
                >
                  <NodeIcon type={connection.type} className="size-5 rounded" />
                  {connection.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Toolbar tab — adds nodes to the canvas, grouped by kind.
// ---------------------------------------------------------------------------

// The Toolbar's groups, one accordion section per node kind.
const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

// Every node type from the registry, filtered into the groups below.
const definitions = Object.values(nodeRegistry)

// The Toolbar tab: a button per node type that adds it to the canvas.
function Palette() {
  const { addNodes, screenToFlowPosition } = useReactFlow<StepNodeType, Edge>()
  const nodes = useStore((state) => state.nodes as StepNodeType[])
  const domNode = useStore((state) => state.domNode)

  const add = (type: NodeType) => {
    const definition = nodeRegistry[type]

    if (
      definition.kind === "trigger" &&
      nodes.some((node) => node.data.kind === "trigger")
    ) {
      toast.error("Only one trigger node is allowed")
      return
    }

    const usedTitles = new Set(
      nodes
        .filter((node) => node.data.type === type)
        .map((node) => node.data.title)
    )
    let nextIndex = 1
    while (usedTitles.has(`${definition.label} ${nextIndex}`)) {
      nextIndex += 1
    }
    const title = `${definition.label} ${nextIndex}`
    const bounds = domNode?.getBoundingClientRect()

    if (!bounds) {
      toast.error("The canvas is not ready yet")
      return
    }

    const center = screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    })

    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position: { x: center.x - 100, y: center.y - 30 },
      data: {
        type,
        kind: definition.kind,
        title,
        values: {},
      },
    })
  }

  return (
    <Section title="Toolbar">
      <Accordion
        type="multiple"
        defaultValue={sections.map((s) => s.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.kind}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                .filter((def) => def.kind === section.kind)
                .map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type as NodeType)}
                    className="justify-start gap-2.5 px-1.5 text-xs"
                  >
                    <NodeIcon type={def.type as NodeType} />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Header — workflow-level actions shown above the tabs.
// ---------------------------------------------------------------------------

// The "..." menu for workflow-level actions.
function ActionsMenu({ workflowId }: { workflowId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          className="text-xs [&_svg:not([class*='size-'])]:size-3.5"
          onSelect={() => {
            startTransition(async () => {
              await deleteWorkflowAction(workflowId)
            })
          }}
        >
          <Trash2 />
          Delete workflow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Kicks off a run of the current workflow.
function RunButton({ workflowId }: { workflowId: string }) {
  const { getEdges, getNodes } = useReactFlow<StepNodeType>()
  const { isLive, latestRun } = useWorkflowRuns()
  const [isPending, startTransition] = useTransition()
  const isRunning = isLive && latestRun !== undefined

  return (
    <Button
      size="sm"
      disabled={isPending}
      variant={isRunning?"destructive":"secondary"}
      onClick={() => {
        if (isRunning) {
          startTransition(async () => {
            await cancelWorkflowRunAction(latestRun.id)
          })
          return
        }

        const graph = { nodes: getNodes(), edges: getEdges() }
        const problems = validateGraph(graph)
        if (problems.length > 0) {
          toast.error(problems[0])
          return
        }

        startTransition(async () => {
          await runWorkflowAction({ id: workflowId, graph })
        })
      }}
    >
      {isRunning ? <Square fill="currentColor" /> : <Play fill="primary" />}
      {isRunning ? "Stop" : "Run"}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// The sidebar itself — header on top, then the Toolbar / Editor tabs.
// ---------------------------------------------------------------------------

export function RightSidebar({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("toolbar")

  // TODO: read the currently selected node from React Flow.
  const selected = useStore((s) => s.nodes.find((n) => n.selected)) as
    StepNodeType | undefined

  // TODO: auto-switch to the Editor tab when the selection changes.
  const [prevSelectedId, setPrevSelectedId] = useState(selected?.id)
  if (selected && selected.id !== prevSelectedId) {
    setPrevSelectedId(selected.id)
    setTab("editor")
  }
  return (
    <ResizablePanel
      className="bg-background"
      defaultSize="16rem"
      minSize="14rem"
      maxSize="36rem"
      groupResizeBehavior="preserve-pixel-size"
    >
      <Tabs value={tab} onValueChange={setTab} className="size-full gap-0">
        <div className="flex items-center justify-between border-b border-border p-2">
          <ActionsMenu workflowId={workflowId} />
          <RunButton workflowId={workflowId} />
        </div>
        <TabsList className="m-2 w-fit bg-background">
          <TabsTrigger
            value="toolbar"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Toolbar
          </TabsTrigger>
          <TabsTrigger
            value="editor"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="toolbar" className="flex min-h-0 flex-col">
          <Palette />
        </TabsContent>
        <TabsContent value="editor" className="flex min-h-0 flex-col">
          <Inspector node={selected} />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  )
}

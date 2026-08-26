"use client"

import * as React from "react"
import { Plus, Workflow } from "lucide-react"
import { toast } from "sonner"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

const workflows = [
  "dominant-wasp",
  "honest-reindeer",
  "expected-llama",
  "essential-ocelot",
  "creepy-echidna",
  "eastern-silkworm",
  "cultural-lion",
  "proud-weasel",
  "regional-bonobo",
]

function WorkflowNav() {
  const { state } = useSidebar()
  const [activeWorkflow, setActiveWorkflow] = React.useState(workflows[0])

  const workflowItems = workflows.map((workflow) => (
    <SidebarMenuItem key={workflow}>
      <SidebarMenuButton
        isActive={workflow === activeWorkflow}
        size="default"
        onClick={() => setActiveWorkflow(workflow)}
        className="h-9 rounded-lg px-3 text-sm"
      >
        <span>{workflow}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))

  if (state === "collapsed") {
    return (
      <SidebarGroup className="w-full gap-1 p-0">
        <SidebarGroupContent>
          <SidebarMenu className="items-center">
            <SidebarMenuItem className="flex w-full justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Workflows"
                    size="default"
                    className="size-9! flex justify-center items-center rounded-lg p-2! [&_svg]:size-4"
                  >
                    <Workflow />
                    {/* <span>Workflows</span> */}
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  className="w-64 max-w-[calc(100vw-3rem)] gap-0 rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground shadow-xl"
                >
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        size="default"
                        onClick={() => toast.success("New workflow")}
                        className="h-10 rounded-md px-2 text-base font-medium"
                      >
                        <Plus />
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarSeparator className="mx-0 my-2" />
                  <SidebarMenu className="gap-1">{workflowItems}</SidebarMenu>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="gap-1 p-0">
      <SidebarGroupLabel className="w-full text-sm text-sidebar-foreground/75">
        Workflows
      </SidebarGroupLabel>
      <SidebarGroupAction
        aria-label="Create workflow"
        title="Create workflow"
        onClick={() => toast.success("New workflow")}
        className="top-1.5 right-2"
      >
        <Plus />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">{workflowItems}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export { WorkflowNav }

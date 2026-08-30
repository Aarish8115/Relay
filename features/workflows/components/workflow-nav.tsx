"use client"

import * as React from "react"
import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Workflow as WorkflowIcon } from "lucide-react"

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
import { Workflow } from "@/db/schema"
import { generateSlug } from "@/features/workflows/lib/generate-slug"

type WorkflowNavProps = {
  workflows: Workflow[]
  onCreateWorkflow: (name: string) => Promise<void>
}

function WorkflowNav({ workflows, onCreateWorkflow }: WorkflowNavProps) {
  const { state } = useSidebar()
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  const handleCreateWorkflow = () => {
    startTransition(async () => {
      await onCreateWorkflow(generateSlug())
    })
  }

  const workflowItems = workflows.map((workflow) => {
    const isActive =
      pathname === `/workflows/${workflow.id}` ||
      pathname.startsWith(`/workflows/${workflow.id}/`)

    return (
      <SidebarMenuItem key={workflow.id}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          size="default"
          className="h-9 rounded-lg px-3 text-sm"
        >
          <Link href={`/workflows/${workflow.id}`}>
            <span>{workflow.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  })

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
                    className="flex size-9! items-center justify-center rounded-lg p-2! [&_svg]:size-4"
                  >
                    <WorkflowIcon />
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
                        onClick={handleCreateWorkflow}
                        disabled={isPending}
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
        onClick={handleCreateWorkflow}
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

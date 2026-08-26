"use client"

import * as React from "react"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { Plus, Workflow } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
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

const workflowList = [
  "Hiring Signals",
  "Vendor Comparison",
  "Account Research Brief",
  "Stock Market Brief",
  "Hacker News Digest",
  "Daily AI News Briefing",
  "Roadtrip Planner",
  "Solve Today's Wordle",
]

function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const [workflowListOpen, setWorkflowListOpen] = React.useState(false)
  const workflowListRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!workflowListOpen) {
      return
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        workflowListRef.current &&
        !workflowListRef.current.contains(event.target as Node)
      ) {
        setWorkflowListOpen(false)
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [workflowListOpen])

  return (
    <>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="p-1"
        {...props}
      >
        <SidebarHeader className="w-full flex-row items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          <OrganizationSwitcher
            hidePersonal
            appearance={{
              elements: {
                rootBox: "min-w-0 group-data-[collapsible=icon]:!hidden",
                organizationSwitcherTrigger: "w-full justify-between",
              },
            }}
          />
          <SidebarTrigger
            onClick={() => setWorkflowListOpen(false)}
            className="size-9! rounded-lg p-2! group-data-[collapsible=icon]:mx-auto [&_svg]:size-4"
          />
        </SidebarHeader>

        <SidebarContent className="w-full gap-2 px-1">
          <SidebarGroup className="gap-1 p-0">
            {state === "expanded" && (
              <>
                <SidebarGroupLabel className="text-sm text-sidebar-foreground/75">
                  Workflows
                </SidebarGroupLabel>
                <SidebarGroupAction
                  aria-label="Create workflow"
                  title="Create workflow"
                  onClick={() => toast.success("New workflow")}
                >
                  <Plus />
                </SidebarGroupAction>
              </>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 group-data-[collapsible=icon]:hidden">
                {workflows.map((workflow, index) => (
                  <SidebarMenuItem key={workflow}>
                    <SidebarMenuButton
                      isActive={index === 0}
                      size="default"
                      onClick={() => toast.info(`${workflow} selected`)}
                      className="h-9 rounded-lg px-3 text-sm"
                    >
                      <span>{workflow}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
                <SidebarMenuItem className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Workflows"
                    aria-expanded={workflowListOpen}
                    title="Workflows"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={() => setWorkflowListOpen((open) => !open)}
                    className="rounded-lg p-2! [&_svg]:size-4"
                  >
                    <Workflow />
                  </Button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="group-data-[collapsible=icon]:items-center">
          <UserButton
            appearance={{
              elements: {
                rootBox: "w-full",
                userButtonTrigger:
                  "w-full justify-start group-data-[collapsible=icon]:justify-center",
                userButtonOuterIdentifier:
                  "group-data-[collapsible=icon]:hidden",
              },
            }}
          />
        </SidebarFooter>
      </Sidebar>

      {state === "collapsed" && workflowListOpen && (
        <aside
          ref={workflowListRef}
          className="fixed top-20 left-12 z-20 w-64 max-w-[calc(100vw-3rem)] rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground shadow-xl"
        >
          <button
            type="button"
            onClick={() => toast.success("New workflow")}
            className="flex h-10 w-full items-center gap-2 rounded-md px-2 text-base font-medium hover:bg-sidebar-accent"
          >
            <Plus className="size-4" />
            <span>New workflow</span>
          </button>
          <div className="my-2 h-px bg-sidebar-border" />
          <ul className="space-y-0.5">
            {workflowList.map((workflow) => (
              <li key={workflow}>
                <button
                  type="button"
                  onClick={() => toast.info(`${workflow} selected`)}
                  className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-sidebar-accent"
                >
                  {workflow}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </>
  )
}

export { AppSidebar }

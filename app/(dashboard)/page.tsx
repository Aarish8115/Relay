import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { createWorkflowAction } from "@/features/workflows/actions"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import { Plus, Workflow } from "lucide-react"

export default function Page() {
  const createWorkflow = createWorkflowAction.bind(null, generateSlug())

  return (
    <Empty className="min-h-0 gap-4 p-4">
      <EmptyHeader className="max-w-none gap-2">
        <EmptyMedia
          variant="icon"
          className="mb-1 size-10 rounded-lg [&_svg:not([class*='size-'])]:size-4"
        >
          <Workflow />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-medium tracking-tight">
          No workflow selected
        </EmptyTitle>
        <EmptyDescription className="max-w-md text-sm/relaxed text-muted-foreground">
          Select a workflow from the sidebar
          <br />
          or create a new one to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none">
        <form action={createWorkflow}>
          <Button size="lg" className="h-9 rounded-lg px-3 text-sm font-medium">
            <Plus className="size-4" />
            New workflow
          </Button>
        </form>
      </EmptyContent>
    </Empty>
  )
}

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SearchX, Workflow } from "lucide-react"

export default function NotFound() {
  return (
    <Empty className="min-h-0 gap-4 p-4">
      <EmptyHeader className="max-w-none gap-2">
        <EmptyMedia
          variant="icon"
          className="mb-1 size-10 rounded-lg [&_svg:not([class*='size-'])]:size-4"
        >
          <SearchX />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-medium tracking-tight">
          Workflow not found
        </EmptyTitle>
        <EmptyDescription className="max-w-md text-sm/relaxed text-muted-foreground">
          The workflow you are looking for does not exist or may have been
          removed.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none">
        <Button
          asChild
          size="lg"
          className="h-9 rounded-lg px-3 text-sm font-medium"
        >
          <Link href="/">
            <Workflow className="size-4" />
            View workflows
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

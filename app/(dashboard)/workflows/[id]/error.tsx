"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Empty className="min-h-0 gap-4 p-4">
      <EmptyHeader className="max-w-none gap-2">
        <EmptyMedia
          variant="icon"
          className="mb-1 size-10 rounded-lg [&_svg:not([class*='size-'])]:size-4"
        >
          <AlertTriangle />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-medium tracking-tight">
          Something went wrong
        </EmptyTitle>
        <EmptyDescription className="max-w-md text-sm/relaxed text-muted-foreground">
          The workflow details could not be loaded.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none">
        <Button
          size="lg"
          className="h-9 rounded-lg px-3 text-sm font-medium"
          onClick={() => reset()}
        >
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  )
}

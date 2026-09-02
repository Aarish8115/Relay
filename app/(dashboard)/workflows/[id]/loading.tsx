import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex min-h-50 flex-1 items-center justify-center p-4">
      <Spinner className="size-5" />
    </div>
  )
}

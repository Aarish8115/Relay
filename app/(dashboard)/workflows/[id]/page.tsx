import { getWorkflow } from "@/features/data"
import { Room } from "@/features/workflows/components/room"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { liveblocks } from "@/lib/liveblocks"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { orgId } = await auth()
  if (!orgId) notFound()

  const workflow=await getWorkflow(orgId,id)
  if(!workflow) notFound()

  await liveblocks.getOrCreateRoom(id, {
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
  })

  return (
    <Room roomId={id}>
      <WorkflowShell workflowId={id} />
    </Room>
  )
}

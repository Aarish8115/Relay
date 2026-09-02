import { auth } from "@clerk/nextjs/server"
import { liveblocks } from "@/lib/liveblocks"

export async function POST() {
  const { userId, orgId } = await auth()

  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { status, body } = await liveblocks.identifyUser(
    {
      userId,
      groupIds: orgId ? [orgId] : [],
    },
    {
      userInfo: { name: userId },
    },
  )

  return new Response(body, { status })
}
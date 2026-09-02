import { auth, clerkClient } from "@clerk/nextjs/server"

type RequestBody = {
  userIds?: unknown
}

export async function POST(request: Request) {
  const { userId, orgId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!orgId) {
    return Response.json({ error: "Organization required" }, { status: 403 })
  }

  let body: RequestBody

  try {
    body = (await request.json()) as RequestBody
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (
    !Array.isArray(body.userIds) ||
    body.userIds.length > 100 ||
    !body.userIds.every((value): value is string => typeof value === "string")
  ) {
    return Response.json(
      { error: "userIds must be an array of at most 100 strings" },
      { status: 400 }
    )
  }

  const users = await (
    await clerkClient()
  ).users.getUserList({
    userId: body.userIds,
    organizationId: [orgId],
  })
  const usersById = new Map(users.data.map((user) => [user.id, user]))

  return Response.json(
    body.userIds.map((requestedUserId) => {
      const user = usersById.get(requestedUserId)

      if (!user) {
        return null
      }

      return {
        name:
          user.fullName ??
          user.username ??
          user.primaryEmailAddress?.emailAddress ??
          user.id,
        avatar: user.imageUrl,
      }
    })
  )
}

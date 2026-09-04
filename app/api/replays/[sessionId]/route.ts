import { auth } from "@clerk/nextjs/server"
import Browserbase from "@browserbasehq/sdk"

const REPLAY_NOT_READY_STATUS = 425

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status
  }

  return 500
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { userId, orgId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!orgId) {
    return Response.json({ error: "Organization required" }, { status: 403 })
  }

  const apiKey = process.env.BROWSERBASE_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: "BROWSERBASE_API_KEY is required" },
      { status: 500 }
    )
  }

  const { sessionId } = await params
  const browserbase = new Browserbase({ apiKey })

  try {
    const replay = await browserbase.sessions.replays.retrieve(sessionId)
    const page = replay.pages[0]

    if (!page) {
      return Response.json(
        { error: "Replay is not ready" },
        { status: REPLAY_NOT_READY_STATUS }
      )
    }

    const playlist = await browserbase.sessions.replays.retrievePage(
      sessionId,
      page.pageId
    )

    return new Response(await playlist.text(), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/vnd.apple.mpegurl",
      },
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Replay unavailable" },
      { status: getErrorStatus(error) }
    )
  }
}

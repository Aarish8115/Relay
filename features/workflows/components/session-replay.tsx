"use client"

import Hls from "hls.js"
import { useEffect, useRef, useState } from "react"

const POLL_INTERVAL_MS = 2000
const REPLAY_NOT_READY_STATUSES = new Set([202, 425])

type SessionReplayProps = {
  sessionId: string
  className?: string
}

export function SessionReplay({ sessionId, className }: SessionReplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let cancelled = false
    let pollTimeout: ReturnType<typeof setTimeout> | undefined
    let hls: Hls | undefined
    const source = `/api/replays/${encodeURIComponent(sessionId)}`

    const poll = async () => {
      try {
        const response = await fetch(source, { cache: "no-store" })

        if (REPLAY_NOT_READY_STATUSES.has(response.status)) {
          if (!cancelled) {
            pollTimeout = setTimeout(poll, POLL_INTERVAL_MS)
          }
          return
        }

        if (!response.ok) {
          throw new Error(`Replay request failed (${response.status})`)
        }

        if (cancelled) return

        if (Hls.isSupported()) {
          hls = new Hls()
          hls.loadSource(source)
          hls.attachMedia(video)
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source
          await video.play().catch(() => undefined)
        } else {
          throw new Error("This browser does not support HLS playback")
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load replay"
          )
        }
      }
    }

    void poll()

    return () => {
      cancelled = true
      if (pollTimeout) clearTimeout(pollTimeout)
      hls?.destroy()
      video.removeAttribute("src")
      video.load()
    }
  }, [sessionId])

  return (
    <div className={className}>
      <video
        ref={videoRef}
        className="size-full object-contain"
        controls
        muted
        playsInline
      />
      {error && <p className="p-3 text-sm text-destructive">{error}</p>}
    </div>
  )
}

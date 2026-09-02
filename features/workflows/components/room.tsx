"use client"

import { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import Loading from "@/app/(dashboard)/workflows/[id]/loading"

export function Room({
  roomId,
  children,
}: {
  roomId: string
  children: ReactNode
}) {
  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint="/api/liveblocks/auth"
    >
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<Loading/>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

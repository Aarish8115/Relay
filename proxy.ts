import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth/sign-in") ||
    pathname.startsWith("/auth/sign-up")

  if (isPublicRoute) {
    return
  }

  await auth.protect()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

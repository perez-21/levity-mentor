import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/accept-invite(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/invitations(.*)",
  "/api/auth/check-email(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (!userId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = profile?.role;

  if (!profile) {
    return NextResponse.redirect(new URL("/accept-invite", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    (pathname === "/" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/chat") ||
      pathname.startsWith("/finances")) &&
    role === "admin"
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/dashboard", request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

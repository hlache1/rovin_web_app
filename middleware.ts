import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  const PUBLIC_API_ROUTES = [
    "/api/checkout",
    "/api/subscriptions/confirm",
    "/api/products/bulk",
    "/api/products",
    "/api/whatsapp/session",
  ];

  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return res;
  }

  const PUBLIC_ROUTES = [
    "/signin",
    "/register",
    "/success", 
    "/privacy-policy",
    "/auth/callback",
  ];

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return res;
  }

  // --- Auth ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string) {
          res.cookies.delete(name);
        },
      }
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const isBillingRoute = pathname.startsWith("/billing");
  if (!isBillingRoute) {
    const { data: profile } = await supabase
      .from("users_mirror")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile?.plan) {
      return NextResponse.redirect(new URL("/billing", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

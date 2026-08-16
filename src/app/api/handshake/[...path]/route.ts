import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM = (
  process.env.NEXT_PUBLIC_READEON_API_URL ?? "https://www.readeon.com"
).replace(/\/$/, "");

async function proxy(request: NextRequest, path: string[]) {
  const search = request.nextUrl.search;
  const url = `${UPSTREAM}/api/handshake/${path.join("/")}${search}`;
  const headers = new Headers();
  headers.set("Content-Type", request.headers.get("content-type") || "application/json");
  headers.set("Accept", "application/json");
  headers.set("x-from-extension", "handshake-alerts");
  headers.set(
    "User-Agent",
    request.headers.get("user-agent") ||
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  );
  const auth = request.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const upstream = await fetch(url, init);
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Cache-Control": "no-store",
    },
  });
}

type Ctx = { params: { path: string[] } };

export async function GET(request: NextRequest, ctx: Ctx) {
  return proxy(request, ctx.params.path);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  return proxy(request, ctx.params.path);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return proxy(request, ctx.params.path);
}
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return proxy(request, ctx.params.path);
}

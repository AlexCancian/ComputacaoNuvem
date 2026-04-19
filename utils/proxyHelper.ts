import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function proxyRequest(
  request: Request,
  resource: string,
  path: string,
  method: string,
) {
  const cookieStore = await cookies();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3335";
  const url = new URL(request.url);
  const searchParams = url.search;

  let fullPath = resource;
  if (path) {
    fullPath = resource ? `${resource}/${path}` : path;
  }

  const targetUrl = `${apiUrl}/${fullPath}${searchParams}`;

  const headers = new Headers();

  // Forward original cookies
  const allCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  if (allCookies) {
    headers.set("Cookie", allCookies);
  }

  // Auth: Prefer Header
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let body: ArrayBuffer | string | undefined = undefined;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      // Para uploads multipart/form-data, precisamos preservar o body como binário
      // Não podemos usar request.text() pois isso corrompe dados binários
      body = await request.arrayBuffer();
    } catch (e) {
      console.error("Error reading request body", e);
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    // Se houve erro, logar o corpo da resposta para debug
    if (!response.ok) {
      const errorBody = await response.clone().text();
      console.error(`[Proxy] Error response body: ${errorBody}`);
    }

    // Auto-refresh removido daqui, pois o client-side (api.ts) gerencia isso agora.
    // Se o backend retornar 401, repassamos para o client renovar.

    // Criar a resposta do Next mantendo os headers originais (importante para Set-Cookie)
    const resHeaders = new Headers();
    const hopByHopHeaders = [
      "content-encoding",
      "content-length",
      "transfer-encoding",
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailers",
      "upgrade",
    ];

    response.headers.forEach((value, key) => {
      if (!hopByHopHeaders.includes(key.toLowerCase())) {
        resHeaders.append(key, value);
      }
    });

    // Prevent caching of proxy responses
    resHeaders.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );

    // Se o ambiente for Node.js (Vercel), podemos usar getSetCookie
    // No Next.js 15+ fetch costuma ter esse método
    // @ts-ignore
    if (typeof response.headers.getSetCookie === "function") {
      // @ts-ignore
      const setCookies = response.headers.getSetCookie();
      if (setCookies.length > 0) {
        resHeaders.delete("set-cookie");
        setCookies.forEach((cookie: string) =>
          resHeaders.append("set-cookie", cookie),
        );
      }
    }

    const data = await response.arrayBuffer();
    return new NextResponse(data, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error(`Proxy Error (${method} ${targetUrl}):`, error.message);
    return NextResponse.json(
      {
        message: "Proxy Error",
        error: error.message,
        target: targetUrl,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
      },
      { status: 500 },
    );
  }
}

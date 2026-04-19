import { NextRequest } from "next/server";
import { proxyRequest } from "@/utils/proxyHelper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join("/");
  // No proxy universal, o 'resource' já está incluso no pathStr (ex: 'agenda/relation')
  return proxyRequest(request, "", pathStr, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join("/");
  return proxyRequest(request, "", pathStr, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join("/");
  return proxyRequest(request, "", pathStr, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join("/");
  return proxyRequest(request, "", pathStr, "DELETE");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  const pathStr = (path || []).join("/");
  return proxyRequest(request, "", pathStr, "PATCH");
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  
  // Lista de possíveis nomes de cookies de token para limpar
  const names = ['token', 'acess_token', 'access_token', 'refreshToken', 'refresh_token'];
  
  names.forEach(name => {
    cookieStore.delete({
        name,
        path: '/',
    });
  });

  return NextResponse.json({ success: true });
}

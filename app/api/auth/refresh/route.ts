import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const refreshTokenValue = cookieStore.get('refresh_token')?.value || cookieStore.get('refreshToken')?.value;

  if (!refreshTokenValue) {
    return NextResponse.json({ message: "Refresh token missing" }, { status: 401 });
  }

  try {
    const response = await fetch(`${apiUrl}/admin/refresh-token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshTokenValue}` 
      },
      // Caso o backend espere no body:
      // body: JSON.stringify({ refreshToken: refreshTokenValue })
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Sessão expirada" }, { status: 401 });
    }

    const responseData = await response.json();
    const setCookieHeader = response.headers.get('set-cookie');

    const getCookieValue = (name: string) => {
      if (!setCookieHeader) return null;
      const match = setCookieHeader.match(new RegExp(`${name}=([^;]+)`));
      return match ? match[1] : null;
    };

    const token = responseData.token || responseData.accessToken || responseData.access_token || responseData.acess_token || getCookieValue('access_token') || getCookieValue('acess_token');
    const newRefresh = responseData.refreshToken || responseData.refresh_token || getCookieValue('refresh_token') || getCookieValue('refreshToken');

    const isLocal = process.env.NODE_ENV === 'development';
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      secure: !isLocal,
      sameSite: (isLocal ? 'lax' : 'none') as 'lax' | 'none',
    };

    if (token) {
      // access_token via JSON agora
      // cookieStore.set('access_token', token, {
      //   ...cookieOptions,
      //   maxAge: 60 * 15,
      // });
      
      if (newRefresh) {
        cookieStore.set('refresh_token', newRefresh, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      
      return NextResponse.json({ success: true, token });
    }
    
    return NextResponse.json({ message: "Token not found in response" }, { status: 401 });
  } catch (error: any) {
    console.error('Refresh Route Error:', error.message);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

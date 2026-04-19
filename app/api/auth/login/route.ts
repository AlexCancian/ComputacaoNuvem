import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const data = await request.json();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { message: errorData.message || 'Erro ao realizar login' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { message: 'Erro desconhecido do backend' },
          { status: response.status }
        );
      }
    }

    const responseData = await response.json();
    
    // Pegar tokens do JSON ou do Header set-cookie do backend
    const setCookieHeader = response.headers.get('set-cookie');
    const getCookieValue = (name: string) => {
      if (!setCookieHeader) return null;
      const match = setCookieHeader.match(new RegExp(`${name}=([^;]+)`));
      return match ? match[1] : null;
    };

    const token = responseData.token || responseData.accessToken || responseData.access_token || responseData.acess_token || getCookieValue('access_token') || getCookieValue('acess_token');
    const refreshToken = responseData.refreshToken || responseData.refresh_token || getCookieValue('refresh_token') || getCookieValue('refreshToken');

    const isLocal = process.env.NODE_ENV === 'development';
    const cookieOptions = {
      httpOnly: true,
      path: '/',
      secure: !isLocal,
      sameSite: (isLocal ? 'lax' : 'none') as 'lax' | 'none',
    };

    // Não setamos mais o access_token como cookie, ele vai via JSON
    // if (token) {
    //   cookieStore.set('access_token', token, {
    //     ...cookieOptions,
    //     maxAge: 60 * 15, // 15 min
    //   });
    // }

    if (refreshToken) {
      cookieStore.set('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 dias
      });
    }

    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    console.error('Login Route Error:', error.message);
    return NextResponse.json(
      { message: 'Falha na conexão com o servidor' },
      { status: 500 }
    );
  }
}

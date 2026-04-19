import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(`${apiUrl}/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseData = await response.json().catch(() => ({}));
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ message: 'Erro na conexão' }, { status: 500 });
  }
}

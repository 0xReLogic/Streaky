import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'Unauthorized - No session or username' }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV !== 'production' ? 'http://localhost:8787' : undefined);
    if (!apiUrl) {
      return NextResponse.json({ error: 'Server configuration error: NEXT_PUBLIC_API_URL is not set' }, { status: 500 });
    }
    
    // Send user info with server secret for authentication
    const serverSecret = process.env.SERVER_SECRET;
    if (!serverSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(`${apiUrl}/api/user/dashboard`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Server-Secret': serverSecret,
        'X-User-ID': session.user.id,
        'X-User-Username': session.user.username,
      },
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
      }
      return NextResponse.json(data);
    }

    const text = await response.text();
    const bodySnippet = text.slice(0, 500);
    return NextResponse.json(
      { error: 'Upstream returned non-JSON response', status: response.status, bodySnippet },
      { status: response.status }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

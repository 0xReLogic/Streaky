import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.username) {
    return NextResponse.json({ error: 'Unauthorized - No session or username' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    
    // Send user info with server secret for authentication
    const serverSecret = process.env.SERVER_SECRET;
    if (!serverSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(`${apiUrl}/api/user/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Server-Secret': serverSecret,
        'X-User-ID': session.user.id,
        'X-User-Username': session.user.username,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

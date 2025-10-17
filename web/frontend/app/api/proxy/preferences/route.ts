import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    
    // Get session token from cookies (server-side)
    const cookies = request.headers.get('cookie') || '';
    const sessionToken = cookies
      .split(';')
      .find(c => c.trim().startsWith('next-auth.session-token=') || c.trim().startsWith('__Secure-next-auth.session-token='))
      ?.split('=')[1];

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token not found' }, { status: 401 });
    }

    const response = await fetch(`${apiUrl}/api/user/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
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

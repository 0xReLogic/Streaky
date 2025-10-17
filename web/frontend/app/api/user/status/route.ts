import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.username) {
    return NextResponse.json({ hasSetup: false }, { status: 200 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    const serverSecret = process.env.SERVER_SECRET;

    if (!serverSecret) {
      return NextResponse.json({ hasSetup: false }, { status: 200 });
    }

    // Check if user has GitHub PAT configured
    const response = await fetch(`${apiUrl}/api/user/dashboard`, {
      method: 'GET',
      headers: {
        'X-Server-Secret': serverSecret,
        'X-User-ID': session.user.id,
        'X-User-Username': session.user.username,
      },
    });

    if (response.ok) {
      // User has data, setup is complete
      return NextResponse.json({ hasSetup: true }, { status: 200 });
    } else {
      // User not found or no PAT configured
      return NextResponse.json({ hasSetup: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json({ hasSetup: false }, { status: 200 });
  }
}

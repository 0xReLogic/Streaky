import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.username) {
    return NextResponse.json({ hasSetup: false, reminderUtcHour: 12 }, { status: 200 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    const serverSecret = process.env.SERVER_SECRET;

    if (!serverSecret) {
      return NextResponse.json({ hasSetup: false, reminderUtcHour: 12 }, { status: 200 });
    }

    // Lightweight check (no GitHub API calls)
    const response = await fetch(`${apiUrl}/api/user/preferences`, {
      method: 'GET',
      headers: {
        'X-Server-Secret': serverSecret,
        'X-User-ID': session.user.id,
        'X-User-Username': session.user.username,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { hasSetup: !!data?.hasPat, reminderUtcHour: typeof data?.reminderUtcHour === 'number' ? data.reminderUtcHour : 12 },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json({ hasSetup: false, reminderUtcHour: 12 }, { status: 200 });
  }
}

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardData {
  username: string;
  currentStreak: number;
  contributedToday: boolean;
  contributionsToday: number;
  notifications: Array<{
    id: string;
    channel: string;
    status: string;
    errorMessage?: string;
    sentAt: string;
  }>;
}

const fetcher = async (url: string) => {
  // Get session token for authentication
  const sessionToken = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('next-auth.session-token=') || c.trim().startsWith('__Secure-next-auth.session-token='))
    ?.split('=')[1];

  if (!sessionToken) {
    throw new Error('Session token not found. Please sign in again.');
  }

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
    },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch data");
  }
  return res.json();
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  const { data, error, isLoading } = useSWR<DashboardData>(
    status === "authenticated"
      ? `${apiUrl}/api/user/dashboard`
      : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
    }
  );

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#054980] via-[#043a66] to-[#032a4d]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleGoToSettings = () => {
    router.push("/setup");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#054980] via-[#043a66] to-[#032a4d] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/80">
              Welcome back, {session?.user?.name || session?.user?.username}!
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGoToSettings}
              variant="outline"
              className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
            >
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-red-500/20 text-white hover:bg-red-500/30 border border-red-500/30"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-8 animate-pulse"
              >
                <div className="h-8 bg-white/20 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-white/20 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-red-200 font-semibold mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-red-200/80 text-sm mb-4">{error.message}</p>
            {error.message.includes("not configured") && (
              <Button
                onClick={handleGoToSettings}
                className="bg-white text-[#054980] hover:bg-white/90"
              >
                Go to Settings
              </Button>
            )}
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Streak Card */}
              <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 backdrop-blur-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Current Streak</CardTitle>
                    <svg
                      className="w-10 h-10 text-orange-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-7xl font-bold text-white mb-2">
                    {data.currentStreak}
                  </div>
                  <p className="text-white/80 text-lg">
                    {data.currentStreak === 1 ? "day" : "days"} in a row 🔥
                  </p>
                </CardContent>
              </Card>

              {/* Today's Status Card */}
              <Card
                className={`${
                  data.contributedToday
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
                    : "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30"
                } backdrop-blur-lg`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Today&apos;s Status
                    </CardTitle>
                    {data.contributedToday ? (
                      <svg
                        className="w-10 h-10 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-10 h-10 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {data.contributedToday ? (
                    <div>
                      <div className="text-5xl font-bold text-green-400 mb-2">
                        {data.contributionsToday}
                      </div>
                      <p className="text-white/80 text-lg">
                        {data.contributionsToday === 1
                          ? "contribution today ✓"
                          : "contributions today ✓"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-yellow-400 mb-3">
                        No contributions yet
                      </div>
                      <p className="text-white/80 mb-3">
                        Make a commit to keep your streak!
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/20 text-yellow-200 border-yellow-500/50"
                      >
                        ⚠️ Action needed today
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notification History */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  Notification History
                </CardTitle>
                <CardDescription className="text-white/60">
                  Recent alerts sent to your configured channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <p className="text-white/60 text-lg font-medium">
                      No notifications sent yet
                    </p>
                    <p className="text-white/40 text-sm mt-2">
                      You&apos;ll see your notification history here once alerts
                      are sent
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-white/20">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20 hover:bg-white/5">
                          <TableHead className="text-white/80">
                            Date & Time
                          </TableHead>
                          <TableHead className="text-white/80">
                            Channel
                          </TableHead>
                          <TableHead className="text-white/80">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.notifications.map((notification) => (
                          <TableRow
                            key={notification.id}
                            className="border-white/10 hover:bg-white/5"
                          >
                            <TableCell className="text-white/90 font-medium">
                              {new Date(notification.sentAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  notification.channel === "discord"
                                    ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/30"
                                    : "bg-blue-500/20 text-blue-200 border-blue-500/30"
                                }
                              >
                                {notification.channel === "discord"
                                  ? "Discord"
                                  : "Telegram"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  notification.status === "sent"
                                    ? "bg-green-500/20 text-green-200 border-green-500/30"
                                    : "bg-red-500/20 text-red-200 border-red-500/30"
                                }
                              >
                                {notification.status === "sent"
                                  ? "✓ Sent"
                                  : "✗ Failed"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

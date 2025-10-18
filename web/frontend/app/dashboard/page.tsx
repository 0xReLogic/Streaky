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
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch data");
  }
  return res.json();
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, error, isLoading } = useSWR<DashboardData>(
    status === "authenticated"
      ? "/api/proxy/dashboard"
      : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: true, // Refetch when window gains focus
      revalidateOnReconnect: true, // Refetch on reconnect
    }
  );

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Loading...</div>
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
    <main className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome back, {session?.user?.name || session?.user?.username}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGoToSettings}
              variant="outline"
              className="bg-white text-black hover:bg-gray-200 border-0"
            >
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-black text-white hover:bg-gray-900 border border-white/20"
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
                className="bg-white/5 border border-white/10 rounded-xl p-8 animate-pulse"
              >
                <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white/5 border border-red-500/30 rounded-xl p-8">
            <h2 className="text-white font-semibold text-xl mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-400 mb-4">{error.message}</p>
            {error.message.includes("not configured") && (
              <Button
                onClick={handleGoToSettings}
                className="bg-white text-black hover:bg-gray-200"
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
              <Card className="bg-white border-0 hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-black text-xl">Current Streak</CardTitle>
                    <div className="text-5xl">🔥</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-7xl font-bold text-black mb-2 tracking-tighter">
                    {data.currentStreak}
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    {data.currentStreak === 1 ? "day" : "days"} in a row
                  </p>
                </CardContent>
              </Card>

              {/* Today's Status Card */}
              <Card className={`${
                  data.contributedToday
                    ? "bg-black border-0"
                    : "bg-white border-2 border-black"
                } hover:shadow-2xl transition-shadow duration-300`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={data.contributedToday ? "text-white text-xl" : "text-black text-xl"}>
                      Today&apos;s Status
                    </CardTitle>
                    <div className="text-5xl">
                      {data.contributedToday ? "✓" : "⚠️"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.contributedToday ? (
                    <div>
                      <div className="text-7xl font-bold text-white mb-2 tracking-tighter">
                        {data.contributionsToday}
                      </div>
                      <p className="text-gray-400 text-lg font-medium">
                        {data.contributionsToday === 1
                          ? "contribution today"
                          : "contributions today"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-black mb-3">
                        No contributions yet
                      </div>
                      <p className="text-gray-600 text-lg mb-4">
                        Make a commit to keep your streak!
                      </p>
                      <Badge className="bg-black text-white hover:bg-gray-800 border-0 px-4 py-2 text-sm">
                        Action needed today
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notification History */}
            <Card className="bg-white border-0 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-black text-2xl">
                  Notification History
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Recent alerts sent to your configured channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!data.notifications || data.notifications.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔔</div>
                    <p className="text-gray-800 text-lg font-semibold mb-2">
                      No notifications sent yet
                    </p>
                    <p className="text-gray-500 text-sm">
                      You&apos;ll see your notification history here once alerts are sent
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-gray-50">
                          <TableHead scope="col" className="text-gray-700 font-semibold">
                            Date & Time
                          </TableHead>
                          <TableHead scope="col" className="text-gray-700 font-semibold">
                            Channel
                          </TableHead>
                          <TableHead scope="col" className="text-gray-700 font-semibold">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.notifications.map((notification) => (
                          <TableRow
                            key={notification.id}
                            className="border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <TableCell className="text-gray-900 font-medium">
                              {new Date(notification.sentAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  notification.channel === "discord"
                                    ? "bg-black text-white hover:bg-gray-800 border-0"
                                    : "bg-white text-black hover:bg-gray-100 border-2 border-black"
                                }
                              >
                                {notification.channel === "discord"
                                  ? "Discord"
                                  : "Telegram"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  notification.status === "sent"
                                    ? "bg-black text-white hover:bg-gray-800 border-0"
                                    : "bg-white text-red-600 hover:bg-red-50 border-2 border-red-600"
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

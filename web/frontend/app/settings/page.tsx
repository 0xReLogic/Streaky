"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [githubPat, setGithubPat] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    async function checkUserStatus() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/status");
          const data = await response.json();
          
          if (!data.hasSetup) {
            router.push("/setup");
            return;
          }
        } catch (error) {
          console.error("Error checking user status:", error);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    }
    checkUserStatus();
  }, [status, router]);

  if (status === "loading" || isCheckingStatus) {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const validateForm = () => {
    if (githubPat && githubPat.trim().length > 0) {
      if (!githubPat.startsWith("ghp_") && !githubPat.startsWith("github_pat_")) {
        toast.error(
          "Invalid GitHub PAT format. Must start with 'ghp_' or 'github_pat_'"
        );
        return false;
      }
    }

    if (
      discordWebhook &&
      !discordWebhook.match(/^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/)
    ) {
      toast.error("Invalid Discord webhook URL format");
      return false;
    }

    if (
      (telegramToken && !telegramChatId) ||
      (!telegramToken && telegramChatId)
    ) {
      toast.error(
        "Both Telegram bot token and chat ID are required if using Telegram"
      );
      return false;
    }

    if (telegramToken && !telegramToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      toast.error("Invalid Telegram bot token format");
      return false;
    }

    if (telegramChatId && !telegramChatId.match(/^-?\d+$/)) {
      toast.error("Telegram chat ID must be numeric");
      return false;
    }

    if (!githubPat && !discordWebhook && !telegramToken) {
      toast.error("Please update at least one field");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/proxy/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubPat: githubPat || undefined,
          discordWebhook: discordWebhook || undefined,
          telegramToken: telegramToken || undefined,
          telegramChatId: telegramChatId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      toast.success("Settings updated successfully!");
      
      setGithubPat("");
      setDiscordWebhook("");
      setTelegramToken("");
      setTelegramChatId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <main className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Settings
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your account and notification preferences
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="bg-white text-black hover:bg-gray-200 border-0"
            >
              Back to Dashboard
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border-0">
              <CardHeader>
                <CardTitle className="text-black">Account Info</CardTitle>
                <CardDescription>Your current account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Username</p>
                  <p className="text-black font-semibold">
                    {session?.user?.username || session?.user?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-black font-semibold">
                    {session?.user?.email || "Not available"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0">
              <CardHeader>
                <CardTitle className="text-black">Security</CardTitle>
                <CardDescription>Your data is encrypted</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  All sensitive credentials are encrypted with AES-256-GCM before storage.
                  Your tokens are secure even if the database is compromised.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* GitHub PAT Section */}
                <div className="space-y-4 pb-8 border-b border-gray-200">
                  <div>
                    <Label
                      htmlFor="githubPat"
                      className="text-black text-lg font-bold"
                    >
                      Update GitHub Personal Access Token
                    </Label>
                    <p className="text-gray-600 text-sm mt-2 mb-3">
                      Leave empty to keep your existing token.{" "}
                      <a
                        href="https://github.com/settings/personal-access-tokens/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-semibold"
                      >
                        Generate a new token
                      </a>{" "}
                      with{" "}
                      <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">
                        read:user
                      </code>{" "}
                      scope if needed.
                    </p>
                    <Input
                      id="githubPat"
                      type="password"
                      value={githubPat}
                      onChange={(e) => setGithubPat(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="bg-gray-50 border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-0 h-12"
                    />
                  </div>
                </div>

                {/* Discord Section */}
                <div className="space-y-4 pb-8 border-b border-gray-200">
                  <div>
                    <Label
                      htmlFor="discordWebhook"
                      className="text-black text-lg font-bold"
                    >
                      Discord Webhook URL
                    </Label>
                    <p className="text-gray-600 text-sm mt-2 mb-3">
                      Update your Discord webhook or leave empty to keep existing.{" "}
                      <a
                        href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-semibold"
                      >
                        Learn how to create a webhook
                      </a>
                    </p>
                    <Input
                      id="discordWebhook"
                      type="url"
                      value={discordWebhook}
                      onChange={(e) => setDiscordWebhook(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="bg-gray-50 border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-0 h-12"
                    />
                  </div>
                </div>

                {/* Telegram Section */}
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="telegramToken"
                      className="text-black text-lg font-bold"
                    >
                      Telegram Bot Token
                    </Label>
                    <p className="text-gray-600 text-sm mt-2 mb-3">
                      Update your Telegram bot token or leave empty to keep existing.{" "}
                      <a
                        href="https://telegram.me/BotFather"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-semibold"
                      >
                        Open BotFather
                      </a>
                    </p>
                    <Input
                      id="telegramToken"
                      type="password"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      className="bg-gray-50 border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-0 h-12"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="telegramChatId"
                      className="text-black text-base font-semibold"
                    >
                      Telegram Chat ID
                    </Label>
                    <p className="text-gray-600 text-sm mt-2 mb-3">
                      Your Telegram chat ID.{" "}
                      <a
                        href="https://telegram.me/userinfobot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline hover:text-gray-700 font-semibold"
                      >
                        Open @userinfobot
                      </a>{" "}
                      and send /start to get your ID.
                    </p>
                    <Input
                      id="telegramChatId"
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="123456789"
                      className="bg-gray-50 border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-0 h-12"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-3">
                        <div className="relative w-5 h-5">
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                        Updating...
                      </span>
                    ) : (
                      "Update Settings"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

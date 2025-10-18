"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import React from "react";

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [githubPat, setGithubPat] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingPat, setHasExistingPat] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Check if user already has PAT configured
  React.useEffect(() => {
    async function checkUserStatus() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/status");
          const data = await response.json();
          setHasExistingPat(data.hasSetup);
        } catch (error) {
          console.error("Error checking user status:", error);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    }
    checkUserStatus();
  }, [status]);

  // Redirect if not authenticated
  if (status === "loading" || isCheckingStatus) {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const validateForm = () => {
    // GitHub PAT validation (optional if updating)
    if (githubPat && githubPat.trim().length > 0) {
      if (!githubPat.startsWith("ghp_") && !githubPat.startsWith("github_pat_")) {
        toast.error(
          "Invalid GitHub PAT format. Must start with 'ghp_' or 'github_pat_'"
        );
        return false;
      }
    }

    // Discord webhook validation (optional)
    if (
      discordWebhook &&
      !discordWebhook.match(/^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/)
    ) {
      toast.error("Invalid Discord webhook URL format");
      return false;
    }

    // Telegram validation (both or neither)
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

    // For new users, GitHub PAT is required
    if (!hasExistingPat && !githubPat) {
      toast.error("GitHub Personal Access Token is required for new users");
      return false;
    }

    // At least one field must be filled
    if (!githubPat && !discordWebhook && !telegramToken) {
      toast.error("Please fill at least one field to update");
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
      // Use proxy route to handle authentication
      const response = await fetch("/api/proxy/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubPat,
          discordWebhook: discordWebhook || undefined,
          telegramToken: telegramToken || undefined,
          telegramChatId: telegramChatId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save preferences");
      }

      toast.success("Preferences saved successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              Setup
            </h1>
            <p className="text-gray-400 text-lg">
              Configure your GitHub access and notification preferences
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-black text-white hover:bg-gray-900 border border-white/20"
          >
            Logout
          </Button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl">

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* GitHub PAT Section */}
            <div className="space-y-4 pb-8 border-b border-gray-200">
              <div>
                <Label
                  htmlFor="githubPat"
                  className="text-black text-lg font-bold flex items-center gap-2"
                >
                  <span>🔑</span>
                  GitHub Personal Access Token {hasExistingPat ? "(Optional - already configured)" : "(Required)"}
                </Label>
                <p className="text-gray-600 text-sm mt-2 mb-3">
                  Required to check your contribution streak.{" "}
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:text-gray-700 font-semibold"
                  >
                    Generate a token
                  </a>{" "}
                  with{" "}
                  <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">read:user</code>{" "}
                  scope.
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
                  className="text-black text-lg font-bold flex items-center gap-2"
                >
                  <span>💬</span>
                  Discord Webhook URL (Optional)
                </Label>
                <p className="text-gray-600 text-sm mt-2 mb-3">
                  Get notifications in your Discord server.{" "}
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
                  className="text-black text-lg font-bold flex items-center gap-2"
                >
                  <span>✈️</span>
                  Telegram Bot Token (Optional)
                </Label>
                <p className="text-gray-600 text-sm mt-2 mb-3">
                  Get notifications via Telegram.{" "}
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
                  Telegram Chat ID (Optional)
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
                    Saving...
                  </span>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

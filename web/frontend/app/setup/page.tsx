"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <main className="min-h-screen bg-gradient-to-br from-[#054980] via-[#043a66] to-[#032a4d] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Setup Your Notifications
                </h1>
                <p className="text-white/80">
                  Configure your GitHub access and notification preferences to get
                  started
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-red-500/20 text-white hover:bg-red-500/30 border border-red-500/30"
              >
                Logout
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GitHub PAT Section */}
            <div className="space-y-4 pb-6 border-b border-white/20">
              <div>
                <Label
                  htmlFor="githubPat"
                  className="text-white text-base font-semibold"
                >
                  GitHub Personal Access Token {hasExistingPat ? "(Optional - already configured)" : "(Required)"}
                </Label>
                <p className="text-white/60 text-sm mt-1 mb-3">
                  Required to check your contribution streak.{" "}
                  <a
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-white/80"
                  >
                    Generate a token
                  </a>{" "}
                  with{" "}
                  <code className="bg-white/20 px-1 rounded">read:user</code>{" "}
                  scope.
                </p>
                <Input
                  id="githubPat"
                  type="password"
                  value={githubPat}
                  onChange={(e) => setGithubPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Discord Section */}
            <div className="space-y-4 pb-6 border-b border-white/20">
              <div>
                <Label
                  htmlFor="discordWebhook"
                  className="text-white text-base font-semibold"
                >
                  Discord Webhook URL (Optional)
                </Label>
                <p className="text-white/60 text-sm mt-1 mb-3">
                  Get notifications in your Discord server.{" "}
                  <a
                    href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-white/80"
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
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Telegram Section */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="telegramToken"
                  className="text-white text-base font-semibold"
                >
                  Telegram Bot Token (Optional)
                </Label>
                <p className="text-white/60 text-sm mt-1 mb-3">
                  Get notifications via Telegram.{" "}
                  <a
                    href="https://telegram.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-white/80"
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
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <Label
                  htmlFor="telegramChatId"
                  className="text-white text-base font-semibold"
                >
                  Telegram Chat ID (Optional)
                </Label>
                <p className="text-white/60 text-sm mt-1 mb-3">
                  Your Telegram chat ID.{" "}
                  <a
                    href="https://telegram.me/userinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-white/80"
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
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg bg-white text-[#054980] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

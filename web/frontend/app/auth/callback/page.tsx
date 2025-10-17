"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    async function checkUserStatus() {
      if (status === "authenticated") {
        try {
          // Check if user has completed setup
          const response = await fetch("/api/user/status");
          const data = await response.json();

          if (data.hasSetup) {
            // User has PAT configured, go to dashboard
            router.push("/dashboard");
          } else {
            // User needs to complete setup
            router.push("/setup");
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          // Default to setup on error
          router.push("/setup");
        }
      }
    }

    checkUserStatus();
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#054980] via-[#043a66] to-[#032a4d]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">Setting up your account...</p>
      </div>
    </div>
  );
}

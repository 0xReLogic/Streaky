"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "@/components/loading-spinner";

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

  return <LoadingSpinner />;
}

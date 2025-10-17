"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignInPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);
    await signIn("github", { callbackUrl: "/setup" });
  };

  return (
    <main className="h-screen flex bg-gradient-to-br from-[#054980] via-[#043a66] to-[#032a4d]">
      {/* Left: Decorative Side - TODO: Replace with Spline 3D animation */}
      {/* 
        TODO: Integrate Spline 3D Scene
        - Use @splinetool/react-spline/next component
        - Scene URL: https://prod.spline.design/lB9GTOKCr7v4rBsr/scene.splinecode
        - Add proper error handling and loading states
        - Consider lazy loading with dynamic import
      */}
      <div className="w-1/2 relative hidden md:flex items-center justify-center overflow-hidden">
        {/* MOCK: Temporary placeholder - will be replaced with 3D scene */}
        <div className="text-center text-white/80">
          <svg
            className="w-32 h-32 mx-auto mb-6 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h2 className="text-3xl font-bold mb-2">Never Miss a Day</h2>
          <p className="text-white/60 text-lg">
            Keep your GitHub streak alive with automated reminders
          </p>
        </div>
      </div>

      {/* Right: Sign In Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome to Streaky
            </h1>
            <p className="text-white/80">
              Sign in to never lose your GitHub streak again
            </p>
          </div>

          {/* Sign In Button */}
          <div className="space-y-6">
            <Button
              onClick={handleSignIn}
              disabled={!agreedToTerms || isLoading}
              className="w-full h-12 text-lg bg-[#054980] text-white hover:bg-[#043a66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  Redirecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </span>
              )}
            </Button>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked: boolean) =>
                  setAgreedToTerms(checked === true)
                }
                className="mt-1 border-white/40 bg-white/10 data-[state=checked]:bg-white data-[state=checked]:border-white data-[state=checked]:text-[#054980]"
              />
              <label
                htmlFor="terms"
                className="text-sm text-white/90 leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-white font-semibold hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-white font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-white/20">
            <p className="text-center text-sm text-white/70">
              Secure authentication via GitHub OAuth
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

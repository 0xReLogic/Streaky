import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-white/60 mb-12">
          Last Updated: October 18, 2025
        </p>

        {/* Content */}
        <div className="space-y-8 text-white/90 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Streaky (&quot;the Service&quot;), you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              2. Description of Service
            </h2>
            <p className="mb-4">
              Streaky is a web application that monitors your GitHub
              contribution streak and sends notifications via Discord and
              Telegram when your streak is at risk.
            </p>
            <p>
              The Service requires you to provide a GitHub Personal Access
              Token (PAT) and optionally Discord webhook URLs and Telegram bot
              tokens.
            </p>
          </section>

          {/* Section 3 - IMPORTANT */}
          <section className="border-l-4 border-red-500 pl-6 bg-red-950/20 py-4">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              3. User Responsibilities - IMPORTANT
            </h2>
            <p className="mb-4 font-semibold text-red-400">
              YOU are solely responsible for the security and proper use of your
              credentials.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>GitHub Personal Access Token:</strong> You are
                responsible for creating a token with minimal required
                permissions (read:user scope only). Never use tokens with write
                access or admin permissions.
              </li>
              <li>
                <strong>Token Security:</strong> Do not share your GitHub PAT,
                Discord webhooks, or Telegram tokens with anyone. Store them
                securely.
              </li>
              <li>
                <strong>Token Misuse:</strong> We are NOT liable for any
                unauthorized use, misuse, or exposure of your tokens. If your
                token is compromised, revoke it immediately on GitHub.
              </li>
              <li>
                <strong>Proper Configuration:</strong> Ensure your Discord
                webhooks and Telegram tokens are configured correctly and point
                to channels you control.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              4. Data Encryption and Storage
            </h2>
            <p className="mb-4">
              We take security seriously. All sensitive credentials are
              encrypted using AES-256-GCM encryption before being stored in our
              database.
            </p>
            <p className="mb-4">
              <strong>What we encrypt:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>GitHub Personal Access Tokens</li>
              <li>Discord webhook URLs</li>
              <li>Telegram bot tokens</li>
            </ul>
            <p className="mt-4">
              Encryption keys are stored separately from the database in
              Cloudflare secrets. Even in the event of a database breach, your
              encrypted credentials remain secure and unusable.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              5. Limitation of Liability
            </h2>
            <p className="mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND.
            </p>
            <p className="mb-4">
              We are NOT liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Loss or corruption of your data</li>
              <li>Unauthorized access to your GitHub account</li>
              <li>Misuse of your GitHub PAT, Discord webhooks, or Telegram tokens</li>
              <li>Failed notifications or missed streak alerts</li>
              <li>Service downtime or interruptions</li>
              <li>Any damages resulting from use of the Service</li>
              <li>Third-party service failures (GitHub, Discord, Telegram, Cloudflare, Vercel)</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              6. Third-Party Services
            </h2>
            <p className="mb-4">
              The Service integrates with third-party platforms:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>GitHub:</strong> For OAuth authentication and streak
                monitoring
              </li>
              <li>
                <strong>Discord:</strong> For webhook notifications (optional)
              </li>
              <li>
                <strong>Telegram:</strong> For bot notifications (optional)
              </li>
              <li>
                <strong>Cloudflare Workers:</strong> For backend processing
              </li>
              <li>
                <strong>Vercel:</strong> For frontend hosting
              </li>
            </ul>
            <p className="mt-4">
              You agree to comply with the terms of service of these third-party
              platforms. We are not responsible for their policies or actions.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              7. User Conduct
            </h2>
            <p className="mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for illegal purposes</li>
              <li>Attempt to hack, reverse engineer, or exploit the Service</li>
              <li>Abuse the Service with excessive requests (rate limiting applies)</li>
              <li>Share your account credentials with others</li>
              <li>Use the Service to spam or harass others</li>
              <li>Violate GitHub, Discord, or Telegram terms of service</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              8. Account Termination
            </h2>
            <p className="mb-4">
              We reserve the right to suspend or terminate your account at any
              time for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Abuse of the Service</li>
              <li>Security concerns</li>
              <li>Request from law enforcement</li>
            </ul>
            <p className="mt-4">
              You may request account deletion at any time by contacting us on
              GitHub. All your data will be permanently deleted within 7 days.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              9. Changes to Terms
            </h2>
            <p>
              We may update these Terms of Service at any time. Continued use of
              the Service after changes constitutes acceptance of the new terms.
              We will notify users of significant changes via email or dashboard
              notification.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              10. Disclaimer
            </h2>
            <p className="mb-4 font-semibold">
              STREAKY IS A FREE SERVICE PROVIDED FOR CONVENIENCE. USE AT YOUR OWN RISK.
            </p>
            <p>
              We make no guarantees about service availability, accuracy of
              notifications, or security of your data. While we implement
              industry-standard security measures, no system is 100% secure.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              11. Contact
            </h2>
            <p>
              For questions about these Terms of Service, please contact us at:{" "}
              <a
                href="https://github.com/0xReLogic/Streaky/issues"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Issues
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60 text-center">
            By using Streaky, you acknowledge that you have read and understood
            these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}

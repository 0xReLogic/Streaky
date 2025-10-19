import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-black/60 hover:text-black transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-black/60 mb-12">
          Last Updated: October 19, 2025
        </p>

        {/* Content */}
        <div className="space-y-8 text-black/90 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              1. Introduction
            </h2>
            <p>
              Streaky (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, store,
              and protect your personal information when you use our service.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              2. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>GitHub Account Information:</strong> When you sign in
                with GitHub OAuth, we collect your GitHub username, email,
                avatar, and user ID.
              </li>
              <li>
                <strong>GitHub Personal Access Token:</strong> You provide a
                GitHub PAT with read:user scope to check your contribution
                streak. This token is encrypted using AES-256-GCM before
                storage.
              </li>
              <li>
                <strong>Discord Webhook URL (Optional):</strong> If you choose
                to receive Discord notifications, we store your webhook URL in
                encrypted form.
              </li>
              <li>
                <strong>Telegram Bot Token (Optional):</strong> If you choose
                to receive Telegram notifications, we store your bot token and
                chat ID in encrypted form.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Usage Data:</strong> We collect information about how
                you interact with the Service (page views, button clicks,
                features used).
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating
                system, IP address (anonymized), and timezone.
              </li>
              <li>
                <strong>Streak Data:</strong> Your current GitHub contribution
                streak, longest streak, and contribution history.
              </li>
              <li>
                <strong>Notification History:</strong> Timestamps and delivery
                status of notifications sent to you.
              </li>
            </ul>
          </section>

          {/* Section 3 - ENCRYPTION */}
          <section className="border-l-4 border-green-500 pl-6 bg-green-50 py-4">
            <h2 className="text-2xl font-semibold mb-4 text-black">
              3. How We Protect Your Data
            </h2>
            <p className="mb-4 font-semibold text-green-700">
              Your sensitive credentials are encrypted and secure.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">
              3.1 Encryption at Rest
            </h3>
            <p className="mb-4">
              All sensitive data is encrypted using AES-256-GCM encryption
              before being stored in our database:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>GitHub Personal Access Tokens (encrypted)</li>
              <li>Discord webhook URLs (encrypted)</li>
              <li>Telegram bot tokens (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">
              3.2 Encryption Key Storage
            </h3>
            <p>
              Encryption keys are stored separately from the database in
              Cloudflare Workers secrets. This means:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                Even if our database is compromised, your credentials remain
                encrypted and unusable
              </li>
              <li>We cannot decrypt your tokens without access to the encryption key</li>
              <li>Encryption keys are never logged or exposed</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">
              3.3 Encryption in Transit
            </h3>
            <p>
              All data transmitted between your browser and our servers is
              encrypted using HTTPS/TLS.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              4. How We Use Your Information
            </h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Check your GitHub contribution streak daily at 8 PM UTC</li>
              <li>Send notifications via Discord and/or Telegram when your streak is at risk</li>
              <li>Display your current streak and statistics on the dashboard</li>
              <li>Authenticate your account via GitHub OAuth</li>
              <li>Improve the Service and fix bugs</li>
              <li>Analyze usage patterns (anonymized data only)</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              5. Data Sharing and Third Parties
            </h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">
              5.1 We DO NOT sell your data
            </h3>
            <p className="mb-4">
              We will never sell, rent, or trade your personal information to
              third parties.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">
              5.2 Third-Party Services We Use
            </h3>
            <p className="mb-4">
              We use the following third-party services to operate Streaky:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>GitHub:</strong> For OAuth authentication and API access
                to check your contribution streak. Subject to{" "}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Privacy Statement
                </a>
                .
              </li>
              <li>
                <strong>Cloudflare Workers:</strong> For backend processing and
                data storage. Subject to{" "}
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cloudflare Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel:</strong> For frontend hosting. Subject to{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel Analytics:</strong> For anonymized page view
                tracking (no cookies, no tracking across sites).
              </li>
              <li>
                <strong>Discord (Optional):</strong> If you provide a webhook,
                we send notifications to your Discord channel.
              </li>
              <li>
                <strong>Telegram (Optional):</strong> If you provide a bot
                token, we send notifications via Telegram API.
              </li>
              <li>
                <strong>Koyeb:</strong> For encrypted notification relay
                (Rust VPS proxy). Credentials are encrypted end-to-end before
                being sent. Subject to{" "}
                <a
                  href="https://www.koyeb.com/privacy"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Koyeb Privacy Policy
                </a>
                .
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">
              5.3 When We May Share Your Data
            </h3>
            <p className="mb-4">
              We may share your information only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Legal Requirements:</strong> If required by law,
                subpoena, or court order.
              </li>
              <li>
                <strong>Security Threats:</strong> To prevent fraud, abuse, or
                security threats.
              </li>
              <li>
                <strong>Service Providers:</strong> With Cloudflare and Vercel
                as necessary to operate the Service.
              </li>
            </ul>
            <p className="mt-4">
              We will never share your GitHub PAT, Discord webhooks, or Telegram
              tokens with anyone except the services they are intended for.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              6. Data Retention
            </h2>
            <p className="mb-4">We retain your data as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Data:</strong> Retained until you delete your
                account.
              </li>
              <li>
                <strong>Encrypted Credentials:</strong> Deleted immediately when
                you remove them from your account or delete your account.
              </li>
              <li>
                <strong>Notification History:</strong> Retained until you delete
                your account. All notifications are automatically deleted when
                you delete your account.
              </li>
              <li>
                <strong>Analytics Data:</strong> Anonymized and retained
                indefinitely for service improvement.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              7. Your Rights
            </h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access Your Data:</strong> View all data we have about
                you from the dashboard.
              </li>
              <li>
                <strong>Update Your Data:</strong> Edit your notification
                settings and credentials anytime.
              </li>
              <li>
                <strong>Delete Your Data:</strong> Contact us on GitHub to
                delete your account and all associated data permanently.
              </li>
              <li>
                <strong>Export Your Data:</strong> Request a copy of your data
                (contact us on GitHub).
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              8. Cookies and Tracking
            </h2>
            <p className="mb-4">
              We use minimal cookies and tracking:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Authentication Cookie:</strong> NextAuth.js session
                cookie (required for login, expires after 30 days).
              </li>
              <li>
                <strong>Analytics:</strong> Vercel Analytics (no cookies, no
                cross-site tracking, privacy-friendly).
              </li>
            </ul>
            <p className="mt-4">
              We do NOT use third-party advertising cookies or tracking pixels.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Streaky is not intended for users under 13 years old. We do not
              knowingly collect information from children under 13. If you
              believe a child has provided us with personal information, please
              contact us and we will delete it.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              10. International Data Transfers
            </h2>
            <p>
              Your data is stored in Cloudflare&apos;s global network and may be
              transferred to countries outside your residence. Cloudflare
              complies with GDPR and other international privacy regulations.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              11. Security Measures
            </h2>
            <p className="mb-4">
              In addition to encryption, we implement these security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>JWT authentication with signature verification</li>
              <li>CORS protection with strict allowlist</li>
              <li>Rate limiting (60 requests per minute)</li>
              <li>Request size limits (1MB maximum)</li>
              <li>Security headers (HSTS, X-Frame-Options, X-Content-Type-Options)</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              12. Changes to Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes via email or dashboard
              notification. Continued use of the Service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              13. Contact Us
            </h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or how we handle
              your data, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>GitHub Issues:</strong>{" "}
                <a
                  href="https://github.com/0xReLogic/Streaky/issues"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create an issue
                </a>
              </li>
              <li>
                <strong>GitHub Discussions:</strong>{" "}
                <a
                  href="https://github.com/0xReLogic/Streaky/discussions"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start a discussion
                </a>
              </li>
            </ul>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black">
              14. GDPR Compliance (EU Users)
            </h2>
            <p className="mb-4">
              If you are in the European Union, you have additional rights under
              GDPR:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to access your personal data</li>
              <li>Right to rectification (correct inaccurate data)</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, delete your account from the dashboard
              or contact us on GitHub.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-black/10">
          <p className="text-black/60 text-center">
            By using Streaky, you acknowledge that you have read and understood
            this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

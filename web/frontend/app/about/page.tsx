import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubStarButton } from "@/components/github-star-button";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-white/10">
        <Link href="/">
          <div className="text-2xl font-bold cursor-pointer hover:text-white/80 transition-colors">
            Streaky
          </div>
        </Link>
        <div className="flex gap-4">
          <GitHubStarButton />
          <Link href="/auth/signin">
            <Button variant="outline" className="bg-white text-black hover:bg-gray-200 border-0">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            About Streaky
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            Your reliable companion for maintaining GitHub contribution streaks
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-white/70 leading-relaxed mb-6">
            GitHub streaks represent consistency and dedication in your coding journey. 
            We built Streaky to help developers maintain their momentum without the stress 
            of manually tracking contributions every day.
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            Whether you are building side projects, contributing to open source, or learning 
            new technologies, Streaky ensures you never miss a day due to a busy schedule.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">1. Connect Your GitHub</h3>
              <p className="text-white/70">
                Sign in securely with GitHub OAuth. We only request read access to your 
                public contribution data.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">2. Configure Notifications</h3>
              <p className="text-white/70">
                Set up your preferred notification channels - Discord webhook or Telegram bot. 
                All credentials are encrypted with AES-256-GCM.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">3. Automated Daily Checks</h3>
              <p className="text-white/70">
                Our system checks your contributions daily at 12:00 UTC. If you have not 
                contributed yet, you will receive a timely reminder.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">4. Track Your Progress</h3>
              <p className="text-white/70">
                Monitor your current streak, daily contributions, and notification history 
                through our clean dashboard interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="px-6 py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Technology Stack</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Frontend</h3>
              <p className="text-white/70">
                Built with Next.js 15, React 19, TypeScript, and Tailwind CSS. 
                Deployed on Vercel for optimal performance and reliability.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Backend</h3>
              <p className="text-white/70">
                Powered by Cloudflare Workers with D1 database for serverless scalability. 
                Service bindings enable distributed cron processing.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Security</h3>
              <p className="text-white/70">
                JWT authentication, AES-256-GCM encryption for sensitive data, and 
                zero-knowledge architecture ensure your credentials stay secure.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Notification Proxy</h3>
              <p className="text-white/70">
                Rust-based proxy server using Axum framework for fast and reliable 
                notification delivery to Discord and Telegram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="px-6 py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Open Source</h2>
          <p className="text-lg text-white/70 leading-relaxed mb-6">
            Streaky is open source and welcomes contributions from the community. 
            Whether you want to report bugs, suggest features, or contribute code, 
            we appreciate your involvement.
          </p>
          <a 
            href="https://github.com/0xReLogic/Streaky" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="bg-white text-black hover:bg-gray-200">
              View on GitHub
            </Button>
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Sign in with GitHub and start protecting your streak today
          </p>
          <Link href="/auth/signin">
            <Button className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4 h-auto">
              Sign In with GitHub
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">Streaky</div>
              <p className="text-white/60">
                GitHub Streak Guardian
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-white/60">
                <Link href="/privacy" className="block hover:text-white">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-white">Terms of Service</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2 text-white/60">
                <a href="https://github.com/0xReLogic/Streaky" target="_blank" rel="noopener noreferrer" className="block hover:text-white">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
	return (
		<main className="min-h-screen bg-black text-white">
			{/* Navigation */}
			<nav className="flex justify-between items-center p-6 border-b border-white/10">
				<div className="text-2xl font-bold">Streaky</div>
				<div className="flex gap-4">
					<Link href="/auth/signin">
						<Button variant="outline" className="bg-white text-black hover:bg-gray-200 border-0">
							Sign In
						</Button>
					</Link>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="flex flex-col items-center justify-center px-6 py-20 text-center">
				<div className="max-w-4xl mx-auto">
					{/* Badge */}
					<Badge className="mb-8 bg-white text-black hover:bg-gray-200 border-0 px-4 py-2 text-sm font-medium">
						Never lose your GitHub streak again
					</Badge>

					{/* Main Heading */}
					<h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
						GitHub Streak
						<br />
						<span className="text-white/80">Guardian</span>
					</h1>

					{/* Subtitle */}
					<p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
						Get instant notifications when your contribution streak is at risk. 
						Keep your coding consistency alive with timely reminders.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
						<Link href="/auth/signin">
							<Button className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4 h-auto">
								Get Started Free
							</Button>
						</Link>
						<Button 
							variant="outline" 
							className="bg-black text-white hover:bg-gray-900 border border-white/20 text-lg px-8 py-4 h-auto"
						>
							Learn More
						</Button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
						<div className="text-center">
							<div className="text-4xl font-bold mb-2">99.9%</div>
							<div className="text-white/60">Uptime</div>
						</div>
						<div className="text-center">
							<div className="text-4xl font-bold mb-2">24/7</div>
							<div className="text-white/60">Monitoring</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="px-6 py-20 border-t border-white/10">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
						Why Choose Streaky?
					</h2>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{/* Feature 1 */}
						<div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
							<div className="text-4xl mb-4">🔔</div>
							<h3 className="text-xl font-semibold mb-3">Smart Notifications</h3>
							<p className="text-white/70">
								Get timely alerts via Discord and Telegram when your streak is at risk.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
							<div className="text-4xl mb-4">🔒</div>
							<h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
							<p className="text-white/70">
								AES-256 encryption, JWT auth, and zero-knowledge architecture protect your data.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
							<div className="text-4xl mb-4">⚡</div>
							<h3 className="text-xl font-semibold mb-3">Always Running</h3>
							<p className="text-white/70">
								Cloud-based daily checks at 12:00 UTC. No setup required, just sign in and go.
							</p>
						</div>

						{/* Feature 4 */}
						<div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
							<div className="text-4xl mb-4">📊</div>
							<h3 className="text-xl font-semibold mb-3">Beautiful Dashboard</h3>
							<p className="text-white/70">
								Track your streaks, contributions, and notification history in one place.
							</p>
						</div>

						{/* Feature 5 */}
						<div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
							<div className="text-4xl mb-4">🌐</div>
							<h3 className="text-xl font-semibold mb-3">Multi-Platform</h3>
							<p className="text-white/70">
								Web app for convenience, CLI for developers who want full control.
							</p>
						</div>

						{/* Feature 6 */}
						<div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
							<div className="text-4xl mb-4">🚀</div>
							<h3 className="text-xl font-semibold mb-3">Scalable Architecture</h3>
							<p className="text-white/70">
								Built on Cloudflare Workers and Vercel, designed to scale to millions of users.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-6 py-20 border-t border-white/10">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-4xl md:text-5xl font-bold mb-6">
						Ready to Protect Your Streak?
					</h2>
					<p className="text-xl text-white/70 mb-8">
						Join thousands of developers who never miss a day
					</p>
					<Link href="/auth/signin">
						<Button className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4 h-auto">
							Start Free Today
						</Button>
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/10 px-6 py-12">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<div className="text-2xl font-bold mb-4">Streaky</div>
							<p className="text-white/60">
								Never lose your GitHub streak again
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-4">Product</h4>
							<div className="space-y-2 text-white/60">
								<div>Web App</div>
								<div>CLI Tool</div>
								<div>API</div>
							</div>
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
								<div>GitHub</div>
								<div>Discord</div>
								<div>Support</div>
							</div>
						</div>
					</div>
					<div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
						<p>Made with love by the Streaky contributors</p>
					</div>
				</div>
			</footer>
		</main>
	);
}

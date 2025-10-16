import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			username?: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [GitHub],
	callbacks: {
		async signIn() {
			// Note: User creation in backend will be handled in setup page
			// For now, just allow sign in
			return true;
		},
		async session({ session, token }) {
			// Attach user ID and GitHub username to session
			if (token.sub) {
				session.user.id = token.sub;
			}
			if (token.login) {
				session.user.username = token.login as string;
			}
			return session;
		},
		async jwt({ token, profile }) {
			// Store GitHub username in token
			if (profile) {
				token.login = (profile as { login?: string }).login;
			}
			return token;
		},
	},
});

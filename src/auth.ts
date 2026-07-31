import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Auth.js never persists a database Session row for the Credentials
  // provider (there's no way to re-verify a password on later requests),
  // it always issues a JWT cookie instead - even when session.strategy is
  // "database". With "database" configured, reading that cookie back tried
  // to look it up as a Session row in Postgres, found nothing, and silently
  // logged the user right back out. Google keeps working via its own OAuth
  // Account rows, which are unaffected by session strategy.
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  events: {
    // The Prisma adapter only writes OAuth tokens to the Account row the
    // first time it links (see auth.js's PrismaAdapter.linkAccount) - it
    // never touches that row again on later sign-ins. Since we ask for the
    // gmail.readonly scope with prompt:"consent", every sign-in gets a fresh
    // access/refresh token from Google that must be persisted, or scope
    // upgrades (like adding gmail.readonly after a user already linked with
    // just profile/email) silently never reach the stored Account.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return;
      await prisma.account.updateMany({
        where: { provider: "google", providerAccountId: account.providerAccountId },
        data: {
          access_token: account.access_token,
          refresh_token: account.refresh_token ?? undefined,
          expires_at: account.expires_at,
          scope: account.scope,
          id_token: account.id_token,
          token_type: account.token_type,
        },
      });
      // Google already verifies the email address, so a user who signs in
      // via Google should never be blocked by our own email-verification gate.
      if (user.id) {
        await prisma.user.updateMany({
          where: { id: user.id, emailVerified: null },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
});

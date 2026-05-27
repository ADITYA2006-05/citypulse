import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getCloudflareContext } from '@opennextjs/cloudflare';

function getAuthOptions() {
  let cfEnv: any = {};
  try {
    cfEnv = getCloudflareContext().env;
  } catch (e) {
    console.warn('[NextAuth] Failed to get Cloudflare Context, falling back to process.env:', e);
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || cfEnv.GOOGLE_CLIENT_ID || 'dummy-google-client-id').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || cfEnv.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret').trim();
  const secret = (process.env.NEXTAUTH_SECRET || cfEnv.NEXTAUTH_SECRET || 'citypulse-super-secret-crypt-key-32chars-long').trim();

  console.log(`[NextAuth Debug] Using Client ID: [${clientId}] (length: ${clientId.length})`);

  return {
    providers: [
      GoogleProvider({
        clientId,
        clientSecret,
      }),
    ],
    callbacks: {
      async jwt({ token, account, user }) {
        if (account && user) {
          token.accessToken = account.access_token;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          // All Google OAuth authenticated sign-ins are mapped as Citizens
          (session.user as any).role = 'CITIZEN';
        }
        return session;
      },
    },
    pages: {
      signIn: '/login',
    },
    secret,
  };
}

const handler = (req: any, res: any) => NextAuth(req, res, getAuthOptions());

export { handler as GET, handler as POST };

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

function getAuthOptions() {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
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
    secret: process.env.NEXTAUTH_SECRET || 'citypulse-super-secret-crypt-key-32chars-long',
  };
}

const handler = (req: any, res: any) => NextAuth(req, res, getAuthOptions());

export { handler as GET, handler as POST };

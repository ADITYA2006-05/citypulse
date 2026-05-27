import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let cfEnv: any = {};
  let contextError: string | null = null;
  
  try {
    const context = getCloudflareContext();
    cfEnv = context.env || {};
  } catch (e: any) {
    contextError = e.message || String(e);
  }

  return NextResponse.json({
    contextError,
    processEnv: {
      GOOGLE_CLIENT_ID: {
        exists: !!process.env.GOOGLE_CLIENT_ID,
        length: process.env.GOOGLE_CLIENT_ID?.length || 0,
      },
      GOOGLE_CLIENT_SECRET: {
        exists: !!process.env.GOOGLE_CLIENT_SECRET,
        length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      },
    },
    cloudflareEnv: {
      GOOGLE_CLIENT_ID: {
        exists: !!cfEnv.GOOGLE_CLIENT_ID,
        length: cfEnv.GOOGLE_CLIENT_ID?.length || 0,
        startsWith378: cfEnv.GOOGLE_CLIENT_ID?.startsWith('378') || false,
      },
      GOOGLE_CLIENT_SECRET: {
        exists: !!cfEnv.GOOGLE_CLIENT_SECRET,
        length: cfEnv.GOOGLE_CLIENT_SECRET?.length || 0,
        startsWithGOCSPX: cfEnv.GOOGLE_CLIENT_SECRET?.startsWith('GOCSPX') || false,
      },
      NEXTAUTH_SECRET: {
        exists: !!cfEnv.NEXTAUTH_SECRET,
        length: cfEnv.NEXTAUTH_SECRET?.length || 0,
      },
      NEXTAUTH_URL: {
        exists: !!cfEnv.NEXTAUTH_URL,
        value: cfEnv.NEXTAUTH_URL || null,
      },
      DATABASE_URL: {
        exists: !!cfEnv.DATABASE_URL,
        length: cfEnv.DATABASE_URL?.length || 0,
      },
    }
  });
}

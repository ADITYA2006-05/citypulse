import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    GOOGLE_CLIENT_ID: {
      exists: !!process.env.GOOGLE_CLIENT_ID,
      length: process.env.GOOGLE_CLIENT_ID?.length || 0,
      startsWith378: process.env.GOOGLE_CLIENT_ID?.startsWith('378') || false,
    },
    GOOGLE_CLIENT_SECRET: {
      exists: !!process.env.GOOGLE_CLIENT_SECRET,
      length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      startsWithGOCSPX: process.env.GOOGLE_CLIENT_SECRET?.startsWith('GOCSPX') || false,
    },
    NEXTAUTH_SECRET: {
      exists: !!process.env.NEXTAUTH_SECRET,
      length: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    NEXTAUTH_URL: {
      exists: !!process.env.NEXTAUTH_URL,
      value: process.env.NEXTAUTH_URL || null,
    },
    DATABASE_URL: {
      exists: !!process.env.DATABASE_URL,
      length: process.env.DATABASE_URL?.length || 0,
    },
  });
}

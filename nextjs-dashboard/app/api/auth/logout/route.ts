import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/app/lib/auth';

async function logout(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: Request) {
  return logout(request);
}

export async function GET(request: Request) {
  return logout(request);
}

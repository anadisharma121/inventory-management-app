import { NextResponse } from 'next/server';
import { setSessionCookie, validateLogin } from '@/app/lib/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get('username') ?? '');
  const password = String(formData.get('password') ?? '');

  const sessionUser = validateLogin(username, password);

  if (!sessionUser) {
    return NextResponse.redirect(new URL('/?error=Invalid%20username%20or%20password', request.url));
  }

  await setSessionCookie(sessionUser);
  return NextResponse.redirect(new URL('/dashboard/stocks', request.url));
}

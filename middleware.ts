import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const key = request.headers.get('api_key');
  if (key !== process.env.API_KEY) {
    console.log('invalid access');
    request.nextUrl.pathname = '/api/InvalidKey';

    return NextResponse.redirect(request.nextUrl);
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/api/auth/(.*)',
};

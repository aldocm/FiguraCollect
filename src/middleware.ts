import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const { pathname } = request.nextUrl

  // 1. Redirect logged-in users away from Auth pages
  const authRoutes = ['/login', '/register']
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 2. Protect Admin routes
  // Note: Strict role checking happens in the page/layout, 
  // this just prevents non-logged-in users from accessing the path.
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets if any
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

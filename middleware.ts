import { auth } from '@/lib/auth/index';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', req.url));
  }
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL('/', req.url));
  }
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)'],
};

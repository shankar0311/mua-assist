import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function proxy(req: NextRequest) {
  const tokenCookie = req.cookies.get('sb-access-token');
  const token = tokenCookie?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/verify');

  const isPublicApi = req.nextUrl.pathname.startsWith('/api/razorpay') || 
                      (req.nextUrl.pathname.startsWith('/api/booking') && req.method === 'POST') ||
                      (req.nextUrl.pathname.startsWith('/api/booking') && req.method === 'OPTIONS');

  let user = null;

  if (token) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user: supabaseUser } } = await supabase.auth.getUser(token);
      user = supabaseUser;
    } catch (err) {
      console.error("Middleware auth check error:", err);
    }
  }

  // Route Guarding Logic
  if (!user && !isAuthPage && !isPublicApi) {
    // Redirect to login if accessing protected pages
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage) {
    // Redirect to dashboard if logged-in user hits login page
    const dashboardUrl = new URL('/', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA file)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};

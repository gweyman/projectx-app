import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@/lib/supabase/config';

const REQUIRES_SESSION = ['/dashboard', '/session', '/report'];

export async function middleware(request) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseConfig();

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Not logged in, hitting something that requires a session -> /login
  if (!user && REQUIRES_SESSION.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in -> check program_ready for the routes that care about it
  if (user) {
    const touchesProgramGate =
      REQUIRES_SESSION.some((p) => path.startsWith(p)) || path.startsWith('/onboarding');

    if (touchesProgramGate) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('program_ready')
        .eq('id', user.id)
        .single();

      const ready = !!profile?.program_ready;

      // Logged in + not ready + trying dashboard/session/report -> onboarding
      if (!ready && REQUIRES_SESSION.some((p) => path.startsWith(p))) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // Logged in + already ready + revisiting onboarding -> dashboard
      if (ready && path.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Logged in and hitting /login -> send them where they belong
    if (path.startsWith('/login')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('program_ready')
        .eq('id', user.id)
        .single();

      return NextResponse.redirect(
        new URL(profile?.program_ready ? '/dashboard' : '/onboarding', request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: ['/onboarding/:path*', '/dashboard/:path*', '/session/:path*', '/report/:path*', '/login'],
};

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/**
 * Client-side auth guard for pages that require a logged-in athlete
 * (dashboard, session, report). Redirects to /login if there's no
 * active session. Also keeps `user` in sync if the session changes
 * or expires while the page is open.
 *
 * Usage in a page component:
 *
 *   const { user, loading } = useRequireAuth();
 *   if (loading) return null; // or a loading spinner
 *   // ...render the real page, using user.id to fetch profile/session data
 */
export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace('/login');
        return;
      }
      setUser(data.session.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return { user, loading };
}

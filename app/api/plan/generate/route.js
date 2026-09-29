import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInitialPlan } from '@/lib/planGenerator';

// Server-only. This is the boundary that keeps the algorithm engine
// (and the Jaeger chart specifically — "backend only, never expose to
// athletes") out of the browser bundle entirely. Nothing in this file
// or anything it imports may be reachable from a 'use client' component.
export async function POST() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // Pull the intake answers back from the profile row the client just
  // saved, rather than trusting a client-sent payload for anything that
  // feeds the algorithm.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('days_per_week, velocity, pulldown, program_ready')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  if (profile.program_ready) {
    // Plan already generated — don't double-insert a second 7-day window
    // (e.g. the athlete hit back/refresh after success).
    return NextResponse.json({ ok: true, alreadyGenerated: true });
  }

  try {
    await generateInitialPlan(supabase, user.id, profile);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Plan generation failed.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

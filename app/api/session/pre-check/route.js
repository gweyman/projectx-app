import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runPreSessionCheck, PreCheckError } from '@/lib/preSession';

// Server-only. Pre-session soreness check: runs BEFORE the athlete throws
// and adjusts today's session per the soreness ladder. Separate from the
// post-session report. Health decisions here are not athlete-overridable.
export async function POST(request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { sessionId, soreness } = body ?? {};
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
  }

  try {
    const result = await runPreSessionCheck(supabase, user.id, sessionId, soreness);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof PreCheckError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: err.message || 'Pre-session check failed.' }, { status: 500 });
  }
}

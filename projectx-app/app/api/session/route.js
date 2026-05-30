// POST /api/session
// Accepts a post-session report, runs it through the algorithm,
// and returns flags + messages + next session preview.

import { processSessionReport } from '@/lib/algorithm/index.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { athleteState, sessionReport } = body;

    if (!athleteState || !sessionReport) {
      return Response.json(
        { error: 'Missing athleteState or sessionReport in request body.' },
        { status: 400 }
      );
    }

    const result = processSessionReport(athleteState, sessionReport);

    return Response.json({ ok: true, result });
  } catch (err) {
    console.error('[POST /api/session]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

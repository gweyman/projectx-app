// POST /api/schedule
// Accepts athlete phase + available slots, returns the week's schedule.

import { generateWeekSchedule } from '@/lib/algorithm/index.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phase, availableSlots, availableDates, isDeloadWeek, isGameWeek, gameDayCount } = body;

    if (!phase || availableSlots == null) {
      return Response.json(
        { error: 'Missing phase or availableSlots.' },
        { status: 400 }
      );
    }

    const result = generateWeekSchedule({
      phase,
      availableSlots,
      availableDates: availableDates ?? [],
      isDeloadWeek: isDeloadWeek ?? false,
      isGameWeek: isGameWeek ?? false,
      gameDayCount: gameDayCount ?? null,
    });

    return Response.json({ ok: true, result });
  } catch (err) {
    console.error('[POST /api/schedule]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

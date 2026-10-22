import { getWeekSequence, PHASES, DAY_TYPES, getStartingWeek, getNormalDayTarget, parseIntakeVelocity, BETA_START_AT_WEEK_ONE } from './algorithm';

const SLOT_COUNT_MAP = {
  '3 days': 3, '4 days': 4, '5 days': 5, '6 days': 6, '7 days': 7,
  'It varies': 3,
};

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function generateInitialPlan(supabase, userId, profile) {
  // This function only ever runs when profile.program_ready is false (the
  // caller guards that). If session rows already exist for this profile at
  // this point, they're orphans from a previous attempt that failed after
  // the insert but before the profile update below -- clear them first so
  // retries are safe instead of duplicating the week on every resubmit.
  const { error: cleanupError } = await supabase.from('sessions').delete().eq('profile_id', userId);
  if (cleanupError) throw cleanupError;

  const slotCount = SLOT_COUNT_MAP[profile.days_per_week] ?? 3;
  const phase = PHASES.BUILDUP;
  const sequence = getWeekSequence(phase, slotCount);

  const baselineVelocity =
    parseIntakeVelocity(profile.velocity) ?? parseIntakeVelocity(profile.pulldown);

  const today = new Date();
  const sessions = [];

  for (let i = 0; i < 7; i++) {
    const dayType = sequence[i] ?? DAY_TYPES.OFF;
    const isConfirmed = i < 2 && sequence[i];
    // Opening targets come from the CEO's normal-day spec, scaled from the
    // athlete's own intake velocity (chart handoff). Athletes see both
    // velocity and distance targets regardless of radar access (locked).
    const target = isConfirmed && baselineVelocity
      ? getNormalDayTarget(dayType, baselineVelocity)
      : null;

    sessions.push({
      profile_id: userId,
      slot_number: i + 1,
      scheduled_date: addDays(today, i),
      day_type: dayType,
      status: isConfirmed ? 'confirmed' : 'projected',
      target_distance: target?.targetDistance ?? null,
      target_velocity: target?.targetVelocity ?? null,
      target_throw_count: target?.targetThrowCount ?? null,
      target_throw_count_min: target?.targetThrowCountMin ?? null,
      target_throw_count_max: target?.targetThrowCountMax ?? null,
    });
  }

  const { error: sessionsError } = await supabase.from('sessions').insert(sessions);
  if (sessionsError) throw sessionsError;

  // Beta: everyone starts at Build-up week 1, day 1 (CEO, 2026-10-21).
  // Intake-based tiering (getStartingWeek) is kept but switched off by
  // BETA_START_AT_WEEK_ONE. It never fast-tracks the real count of
  // completed Long Toss weeks required to exit Build-up.
  const startingWeek = BETA_START_AT_WEEK_ONE ? 1 : getStartingWeek(profile.shutdown);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ phase, week_in_phase: startingWeek, current_slot_number: 1, program_ready: true })
    .eq('id', userId);
  if (profileError) throw profileError;
}

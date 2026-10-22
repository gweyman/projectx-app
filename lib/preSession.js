import {
  DAY_TYPES,
  applySorenessResponse,
  applyTrimToTarget,
  detectSorenessSpike,
  getNormalDayTarget,
  getThrowCountBounds,
  parseIntakeVelocity,
} from './algorithm';

const MODERATE_TYPES = [DAY_TYPES.MODERATE, DAY_TYPES.MODERATE_PREP, DAY_TYPES.MODERATE_MIDSLOPE];

class PreCheckError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
export { PreCheckError };

function rowTarget(row) {
  return {
    goalThrowCount: row.target_throw_count ?? null,
    goalDistance: row.target_distance != null ? Number(row.target_distance) : null,
    goalVelocity: row.target_velocity != null ? Number(row.target_velocity) : null,
  };
}

// Convert an already-computed opening/own-history target into the
// goal-shaped object applyTrimToTarget expects.
function normalToGoal(t) {
  return t
    ? { goalThrowCount: t.targetThrowCount, goalDistance: t.targetDistance, goalVelocity: t.targetVelocity }
    : null;
}

/**
 * Pre-session soreness check. Runs BEFORE the athlete throws and adjusts
 * TODAY's session per the soreness ladder. Health rules are not athlete-
 * overridable: once a reading is stored, re-submitting returns the stored
 * result and never recomputes.
 */
export async function runPreSessionCheck(supabase, userId, sessionId, rawSoreness) {
  const soreness = Number(rawSoreness);
  if (!Number.isInteger(soreness) || soreness < 1 || soreness > 10) {
    throw new PreCheckError('Soreness must be a whole number from 1 to 10.', 400);
  }

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('profile_id', userId)
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) throw new PreCheckError('Session not found.', 404);

  // Already checked — final. Return what was stored.
  if (session.pre_soreness != null) {
    return {
      alreadyChecked: true,
      adjustedDayType: session.day_type,
      plannedDayType: session.planned_day_type ?? session.day_type,
      status: session.status,
      message: session.soreness_adjustment?.message ?? null,
      modified: !!session.soreness_adjustment,
      targets: {
        throwCount: session.target_throw_count,
        throwCountMin: session.target_throw_count_min,
        throwCountMax: session.target_throw_count_max,
        distance: session.target_distance != null ? Number(session.target_distance) : null,
        velocity: session.target_velocity != null ? Number(session.target_velocity) : null,
      },
    };
  }

  if (session.status !== 'confirmed') {
    throw new PreCheckError('Only today\'s confirmed session can be checked.', 409);
  }

  const [{ data: profile, error: profileError }, { data: history, error: historyError }] = await Promise.all([
    supabase.from('profiles').select('velocity, pulldown').eq('id', userId).single(),
    supabase
      .from('sessions')
      .select('slot_number, day_type, planned_day_type, status, soreness, pre_soreness, target_throw_count, target_distance, target_velocity')
      .eq('profile_id', userId)
      .lt('slot_number', session.slot_number)
      .in('status', ['completed', 'skipped_soreness'])
      .order('slot_number', { ascending: false })
      .limit(20),
  ]);
  if (profileError) throw profileError;
  if (historyError) throw historyError;
  const past = history ?? [];

  // Last soreness reading before this one (post of the previous session,
  // or its pre reading if it was an Off day and never got a post).
  const last = past[0];
  const previousScore = last ? (last.soreness ?? last.pre_soreness ?? null) : null;
  const spike = detectSorenessSpike(previousScore, soreness);

  const lastModerate = past.find(
    (s) => s.status === 'completed' && MODERATE_TYPES.includes(s.day_type)
  );

  const planned = session.day_type;
  const result = applySorenessResponse(soreness, planned, {
    lastModerateDayType: lastModerate?.day_type ?? DAY_TYPES.MODERATE,
    previousScore,
    spike,
  });

  const baselineVelocity =
    parseIntakeVelocity(profile?.velocity) ?? parseIntakeVelocity(profile?.pulldown);

  // Work out the new targets.
  const update = {
    pre_soreness: soreness,
    soreness_adjustment: null,
  };
  let finalTargets = {
    throwCount: session.target_throw_count,
    throwCountMin: session.target_throw_count_min,
    throwCountMax: session.target_throw_count_max,
    distance: session.target_distance != null ? Number(session.target_distance) : null,
    velocity: session.target_velocity != null ? Number(session.target_velocity) : null,
  };

  if (result.modified) {
    update.planned_day_type = session.planned_day_type ?? planned;
    update.day_type = result.adjustedDayType;
    update.soreness_adjustment = {
      reason: result.reason,
      message: result.message,
      trim: result.trim,
      repeatTarget: result.repeatTarget,
      previousScore,
      spike,
    };

    if (result.adjustedDayType === DAY_TYPES.OFF) {
      update.status = 'skipped_soreness';
    } else {
      // Same day type (or High Intent -> Long Toss at 4): trim the session's
      // own targets. A different day type (step-down / Recovery): start from
      // the athlete's own latest target of that type, else the normal-day spec.
      const keepsOwnTarget =
        result.adjustedDayType === planned || result.reason === 'soreness_trim';

      let base;
      if (keepsOwnTarget) {
        base = rowTarget(session);
      } else {
        const own = past.find(
          (s) =>
            s.status === 'completed' &&
            s.day_type === result.adjustedDayType &&
            (s.planned_day_type == null || s.planned_day_type === s.day_type) &&
            s.target_throw_count != null
        );
        base = own
          ? rowTarget(own)
          : normalToGoal(baselineVelocity ? getNormalDayTarget(result.adjustedDayType, baselineVelocity) : null);
      }

      if (base) {
        const trim = result.trim ?? { throwsPct: 0, distancePct: 0, mphCut: 0 };
        const t = applyTrimToTarget(base, trim, result.adjustedDayType);
        finalTargets = {
          throwCount: t.throwCount,
          throwCountMin: t.throwCountMin,
          throwCountMax: t.throwCountMax,
          distance: t.distance,
          velocity: t.velocity,
        };
        update.target_throw_count = t.throwCount;
        update.target_throw_count_min = t.throwCountMin;
        update.target_throw_count_max = t.throwCountMax;
        update.target_distance = t.distance;
        update.target_velocity = t.velocity;
      } else {
        // No baseline to rebuild from — keep the day-type change, clear the
        // numeric targets rather than show numbers for the wrong day type.
        finalTargets = { throwCount: null, throwCountMin: null, throwCountMax: null, distance: null, velocity: null };
        update.target_throw_count = null;
        update.target_throw_count_min = null;
        update.target_throw_count_max = null;
        update.target_distance = null;
        update.target_velocity = null;
      }
    }
  }

  // Only write if nobody stored a reading in the meantime (double-submit guard).
  const { data: written, error: updateError } = await supabase
    .from('sessions')
    .update(update)
    .eq('id', sessionId)
    .eq('profile_id', userId)
    .is('pre_soreness', null)
    .select('id');
  if (updateError) throw updateError;
  if (!written || written.length === 0) {
    throw new PreCheckError('This session was already checked. Refresh to see the result.', 409);
  }

  return {
    alreadyChecked: false,
    adjustedDayType: update.day_type ?? planned,
    plannedDayType: planned,
    status: update.status ?? session.status,
    message: result.message,
    modified: result.modified,
    repeatTarget: result.repeatTarget,
    targets: finalTargets,
  };
}

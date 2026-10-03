// ============================================================
// PROJECT X — BUILD-UP PROGRESSION ENGINE
// Implements the Long Toss / Moderate progression rules locked in
// algorithm-decisions.md (2026-10-01/02). This is the REAL week-over-
// week formula — separate from the v3 reference chart, which is only
// ever used as a silent Session 1–2 starting point per Section 2.2.
//
// STATUS: Long Toss side is fully locked and implemented below.
// Moderate's own active (non-frozen) progression formula is NOT yet
// locked — RPE-driven ceiling and effort-% definition are still open
// per algorithm-decisions.md. getModerateTarget() below only handles
// the freeze case correctly; the active case returns a flagged
// placeholder on purpose rather than inventing numbers.
// ============================================================

import {
  STARTUP_WEEK_BY_SHUTDOWN,
  DEFAULT_STARTUP_WEEK,
  LONG_TOSS_THROW_COUNT_LADDER,
  LONG_TOSS_FREEZE_THRESHOLD_FT,
  BUILDUP_PROGRESSION,
} from './constants.js';

/**
 * Determine an athlete's starting week_in_phase from their intake
 * shutdown-duration answer (profile.shutdown). Everyone still starts
 * in Build-up — this only sets which week's baseline they see first.
 * Unrecognized/missing answers fall back to the conservative default.
 */
export function getStartingWeek(shutdownAnswer) {
  return STARTUP_WEEK_BY_SHUTDOWN[shutdownAnswer] ?? DEFAULT_STARTUP_WEEK;
}

/**
 * Look up the throw-count range for a given Long Toss distance.
 * Returns { min, max } throws for that distance band.
 */
export function getLongTossThrowCountRange(distanceFt) {
  const band = LONG_TOSS_THROW_COUNT_LADDER.find(b => distanceFt <= b.maxDistanceFt);
  return band
    ? { min: band.min, max: band.max }
    : LONG_TOSS_THROW_COUNT_LADDER[LONG_TOSS_THROW_COUNT_LADDER.length - 1];
}

/**
 * Whether Moderate should be frozen given the athlete's current Long
 * Toss distance. Hard rule — once true for an athlete, stays true for
 * the rest of Build-up regardless of anything that happens afterward.
 */
export function isModerateFrozen(longTossDistanceFt) {
  return longTossDistanceFt != null && longTossDistanceFt >= LONG_TOSS_FREEZE_THRESHOLD_FT;
}

/**
 * Compute next week's Long Toss target from THIS week's cleanly-hit
 * target. Callers must not invoke this after a miss — missed Long Toss
 * targets repeat the following week per the locked missed-day rule;
 * this function only models the clean-pass advancement path.
 *
 * currentDistanceFt / currentVelocityMph: this week's target, already
 * confirmed hit.
 */
export function getNextLongTossTarget(currentDistanceFt, currentVelocityMph) {
  const nextDistance = currentDistanceFt + BUILDUP_PROGRESSION.WEEKLY_DISTANCE_INCREASE_FT;

  // Velocity bump is specified as a 2–3mph range, not a fixed number.
  // Using the midpoint (2.5) is a deliberate placeholder until there's
  // athlete-specific data to individualize within that range — flagged
  // here rather than silently picked.
  const velocityIncrease =
    (BUILDUP_PROGRESSION.WEEKLY_VELOCITY_INCREASE_MPH_MIN +
      BUILDUP_PROGRESSION.WEEKLY_VELOCITY_INCREASE_MPH_MAX) / 2;
  const nextVelocity =
    currentVelocityMph != null
      ? Math.round((currentVelocityMph + velocityIncrease) * 10) / 10
      : null;

  const throwCountRange = getLongTossThrowCountRange(nextDistance);

  return {
    targetDistance: nextDistance,
    targetVelocity: nextVelocity,
    targetThrowCountMin: throwCountRange.min,
    targetThrowCountMax: throwCountRange.max,
    moderateShouldFreeze: isModerateFrozen(nextDistance),
    usedVelocityMidpoint: true, // surfaced so callers/logs can see this was a placeholder choice
  };
}

/**
 * Moderate's target for the upcoming week.
 *
 * frozen case: fully locked — repeat the last clean target forever,
 * capped at MODERATE_DISTANCE_CAP_FT regardless of what's passed in.
 *
 * active (non-frozen) case: NOT YET LOCKED. Returns a flagged baseline
 * rather than a real formula — do not treat `needsDecision: true` output
 * as production-ready. See module header.
 */
export function getModerateTarget({ frozen, lastCleanTarget }) {
  if (frozen) {
    const capped = lastCleanTarget
      ? { ...lastCleanTarget, targetDistance: Math.min(lastCleanTarget.targetDistance ?? BUILDUP_PROGRESSION.MODERATE_DISTANCE_CAP_FT, BUILDUP_PROGRESSION.MODERATE_DISTANCE_CAP_FT) }
      : { targetDistance: BUILDUP_PROGRESSION.MODERATE_DISTANCE_CAP_FT, targetThrowCount: BUILDUP_PROGRESSION.MODERATE_BASELINE_THROW_COUNT };
    return { ...capped, frozen: true, needsDecision: false };
  }

  return {
    targetDistance: BUILDUP_PROGRESSION.MODERATE_DISTANCE_CAP_FT,
    targetThrowCount: BUILDUP_PROGRESSION.MODERATE_BASELINE_THROW_COUNT,
    frozen: false,
    needsDecision: true, // Moderate's active-phase RPE/effort-% formula is still open
  };
}

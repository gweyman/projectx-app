// ============================================================
// PROJECT X — SORENESS RESPONSE ENGINE
// Implements the CEO's ladder editor export (locked 2026-10-21).
// All numbers live in constants.js (SORENESS, SORENESS_TRIM_AT_4,
// SORENESS_STEP_DOWN). This file is logic only.
//
// Targets passed in are the athlete's OWN personalized targets
// (chart handoff -> own data). Trims are applied on top of them.
// ============================================================

import {
  SORENESS,
  DAY_TYPES,
  MESSAGES,
  SORENESS_TRIM_AT_4,
  SORENESS_STEP_DOWN,
  SORENESS_REPEAT_TARGET_DAY_TYPES,
} from './constants.js';
import { getThrowCountBounds } from './targets.js';

const MODERATE_TYPES = [
  DAY_TYPES.MODERATE,
  DAY_TYPES.MODERATE_PREP,
  DAY_TYPES.MODERATE_MIDSLOPE,
];

/**
 * Soreness band: 'green' | 'trim' | 'step_down' | 'recovery' | 'off'
 */
export function getSorenessLevel(score) {
  if (score <= SORENESS.GREEN_MAX) return 'green';
  if (score === SORENESS.TRIM) return 'trim';
  if (score <= SORENESS.STEP_DOWN_MAX) return 'step_down';
  if (score <= SORENESS.RECOVERY_MAX) return 'recovery';
  return 'off';
}

/**
 * Apply a trim ({ throwsPct, distancePct, mphCut }) to a personalized target.
 * target: { goalThrowCount, goalDistance, goalVelocity } (any may be null)
 * bufferDayType: the day type whose throw-count buffer surrounds the new count
 * Min-throws floor (5) applies to the target and the min bound, and never
 * raises a count above the original.
 */
export function applyTrimToTarget(target, trim, bufferDayType) {
  const { goalThrowCount, goalDistance, goalVelocity } = target ?? {};
  const floor = SORENESS.MIN_THROWS_FLOOR;

  let throwCount = goalThrowCount ?? null;
  if (throwCount != null) {
    const trimmed = Math.round(throwCount * (1 + trim.throwsPct / 100));
    throwCount = Math.min(throwCount, Math.max(trimmed, floor));
  }

  const distance = goalDistance != null
    ? Math.round(goalDistance * (1 + trim.distancePct / 100))
    : null;

  const velocity = goalVelocity != null
    ? Math.round((goalVelocity - trim.mphCut) * 10) / 10
    : null;

  const { min: throwCountMin, max: throwCountMax } = getThrowCountBounds(throwCount, bufferDayType);

  return { throwCount, distance, velocity, throwCountMin, throwCountMax };
}

function unchanged(plannedDayType, message = null) {
  return {
    adjustedDayType: plannedDayType,
    trim: null,
    message,
    modified: false,
    repeatTarget: false,
    countsAsMiss: null,
    reason: null,
  };
}

function replaced(plannedDayType, adjustedDayType, trim, reason, message) {
  return {
    adjustedDayType,
    trim,
    message: message ?? MESSAGES.SESSION_DOWNGRADED_SORENESS,
    modified: true,
    // Soreness-replaced Long Toss / High Intent repeats the same target next time
    repeatTarget:
      adjustedDayType !== plannedDayType &&
      SORENESS_REPEAT_TARGET_DAY_TYPES.includes(plannedDayType),
    // Soreness downgrade is not a miss (proposed rule — uses skipped_soreness)
    countsAsMiss: false,
    reason,
  };
}

function stepDown(plannedDayType, lastModerateDayType, reason) {
  const rule = SORENESS_STEP_DOWN[plannedDayType];
  if (!rule) return null;
  const to = rule.to ?? (MODERATE_TYPES.includes(lastModerateDayType) ? lastModerateDayType : DAY_TYPES.MODERATE);
  const hasMod = rule.mod.throwsPct !== 0 || rule.mod.distancePct !== 0 || rule.mod.mphCut !== 0;
  return replaced(plannedDayType, to, hasMod ? rule.mod : null, reason);
}

/**
 * Given a soreness score and the planned day type, return the adjusted
 * day type, the trim to apply to the athlete's target, and the message.
 *
 * options:
 *   lastModerateDayType — the last Moderate-type day the athlete had (Long Toss 5–6)
 *   previousScore       — the previous soreness reading (pre or post series)
 *                         used for the 2-consecutive 5–6 = Off hard rule
 *   spike               — true if this reading is +3 vs the last reading;
 *                         the session drops one step (5–6 ladder)
 *
 * Returns: { adjustedDayType, trim, message, modified, repeatTarget, countsAsMiss, reason }
 * The caller runs applyTrimToTarget(target, result.trim, result.adjustedDayType).
 */
export function applySorenessResponse(score, plannedDayType, options = {}) {
  const { lastModerateDayType = DAY_TYPES.MODERATE, previousScore = null, spike = false } = options;
  const level = getSorenessLevel(score);

  if (plannedDayType === DAY_TYPES.OFF) return unchanged(plannedDayType);

  // Game: engine never alters a game day — message only.
  // (9–10 under review: health rules can't be overridden.)
  if (plannedDayType === DAY_TYPES.GAME) {
    return unchanged(plannedDayType, level === 'green' ? null : MESSAGES.GAME_SORENESS_NOTICE);
  }

  // Deload: never dialed back. 7–10 = Off.
  if (plannedDayType === DAY_TYPES.DELOAD) {
    if (level === 'recovery' || level === 'off') {
      return replaced(plannedDayType, DAY_TYPES.OFF, null, 'deload_high_soreness');
    }
    return unchanged(plannedDayType);
  }

  // Hard rule: two consecutive 5–6 readings (pre and post both count) = Off
  if (
    level === 'step_down' &&
    previousScore != null &&
    previousScore >= SORENESS.STEP_DOWN_MIN &&
    previousScore <= SORENESS.STEP_DOWN_MAX
  ) {
    return replaced(plannedDayType, DAY_TYPES.OFF, null, 'consecutive_moderate_soreness', MESSAGES.FORCED_OFF_CONSECUTIVE_MODERATE);
  }

  // 9–10 = Off (hard rule)
  if (level === 'off') {
    return replaced(plannedDayType, DAY_TYPES.OFF, null, 'soreness_off');
  }

  // 7–8 = Recovery (Recovery itself goes to Off)
  if (level === 'recovery') {
    const to = plannedDayType === DAY_TYPES.RECOVERY ? DAY_TYPES.OFF : DAY_TYPES.RECOVERY;
    return replaced(plannedDayType, to, null, 'soreness_recovery');
  }

  // Spike (+3 vs last reading): next session drops one step on the 5–6 ladder
  if (spike && (level === 'green' || level === 'trim')) {
    return stepDown(plannedDayType, lastModerateDayType, 'soreness_spike') ?? unchanged(plannedDayType);
  }

  if (level === 'green') return unchanged(plannedDayType);

  // 5–6 = step down the ladder
  if (level === 'step_down') {
    return stepDown(plannedDayType, lastModerateDayType, 'soreness_step_down') ?? unchanged(plannedDayType);
  }

  // 4 = same day type, trimmed. High Intent+/++ converts to Long Toss
  // (intensity down, volume the same) using the High Intent trim row.
  if (level === 'trim') {
    const trim = SORENESS_TRIM_AT_4[plannedDayType];
    if (!trim) return unchanged(plannedDayType);
    const isHighIntent =
      plannedDayType === DAY_TYPES.HIGH_INTENT_PLUS ||
      plannedDayType === DAY_TYPES.HIGH_INTENT_PLUS_PLUS;
    const adjusted = isHighIntent ? DAY_TYPES.LONG_TOSS : plannedDayType;
    const hasTrim = trim.throwsPct !== 0 || trim.distancePct !== 0 || trim.mphCut !== 0;
    if (!hasTrim && !isHighIntent) return unchanged(plannedDayType);
    return replaced(plannedDayType, adjusted, hasTrim ? trim : null, 'soreness_trim');
  }

  return unchanged(plannedDayType);
}

/**
 * Check whether 5–6 soreness has occurred in 2 consecutive readings
 * (pre and post readings both count, in order). If so, next slot is OFF.
 */
export function checkConsecutiveModerate(recentSorenessScores) {
  if (recentSorenessScores.length < 2) return false;
  const last = recentSorenessScores.slice(-2);
  return last.every(s => s >= SORENESS.STEP_DOWN_MIN && s <= SORENESS.STEP_DOWN_MAX);
}

/**
 * Soreness SPIKE: +3 or more vs the last reading (pre and post series).
 */
export function detectSorenessSpike(previousScore, currentScore) {
  if (previousScore === null || previousScore === undefined) return false;
  return currentScore - previousScore >= SORENESS.SPIKE_DELTA;
}

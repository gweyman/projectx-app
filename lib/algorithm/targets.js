// ============================================================
// PROJECT X — NORMAL-DAY TARGETS (soreness 1–3)
// Opening targets for each day type, scaled from the athlete's OWN
// intake velocity via the chart handoff (sessions 1–2 of a day type,
// Section 2.2). After that, the athlete's own data drives targets.
// Nothing here is shown to athletes as a chart — only their targets.
// ============================================================

import {
  NORMAL_DAY_SPEC,
  NORMAL_DAY_REFERENCE,
  THROW_COUNT_BUFFER,
  BUILDUP_PROGRESSION,
  SORENESS,
  DAY_TYPES,
} from './constants.js';
import { getPeakDistanceForVelocity } from './jaeger.js';
import { getLongTossThrowCountRange } from './buildup.js';

/**
 * Parse an intake velocity answer ('85–89 mph', '90+ mph', 'Under 65 mph',
 * or a free-text pulldown like '95 mph') into a single mph number.
 */
export function parseIntakeVelocity(str) {
  if (!str) return null;
  const nums = (String(str).match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (nums.length === 0) return null;
  if (String(str).includes('+')) return nums[0] + 3;
  if (/under/i.test(str)) return nums[0] - 3;
  return nums.length === 1 ? nums[0] : Math.round((nums[0] + nums[1]) / 2);
}

/**
 * goal ± the locked per-day-type buffer. Min-throws floor applies to the
 * min bound and never raises it above the goal. Day types with no buffer
 * entry are not throw-count gated (null bounds).
 */
export function getThrowCountBounds(goal, dayType) {
  const buffer = THROW_COUNT_BUFFER[dayType];
  if (goal == null || buffer == null) return { min: null, max: null };
  return {
    min: Math.min(goal, Math.max(goal - buffer, SORENESS.MIN_THROWS_FLOOR)),
    max: goal + buffer,
  };
}

/**
 * Opening (normal-day) target for a day type, scaled from the athlete's
 * own intake velocity. Returns null for day types with no spec (Off, Game,
 * Deload) or when there is no usable baseline velocity.
 */
export function getNormalDayTarget(dayType, baselineVelocity) {
  const spec = NORMAL_DAY_SPEC[dayType];
  if (!spec || baselineVelocity == null) return null;

  const peak = getPeakDistanceForVelocity(baselineVelocity);

  let targetDistance = null;
  if (spec.distanceFt != null && peak != null) {
    targetDistance = Math.round(peak * (spec.distanceFt / NORMAL_DAY_REFERENCE.peakDistanceFt));
    // Moderate never throws past the cap (locked)
    if (dayType === DAY_TYPES.MODERATE) {
      targetDistance = Math.min(targetDistance, BUILDUP_PROGRESSION.MODERATE_DISTANCE_CAP_FT);
    }
  }

  const targetVelocity = spec.velocityMph != null
    ? Math.round(baselineVelocity * (spec.velocityMph / NORMAL_DAY_REFERENCE.velocityMph) * 10) / 10
    : null;

  let goal = spec.throwCount;
  if (dayType === DAY_TYPES.LONG_TOSS && targetDistance != null) {
    goal = getLongTossThrowCountRange(targetDistance).min;
  }

  const { min, max } = getThrowCountBounds(goal, dayType);
  return {
    targetThrowCount: goal,
    targetThrowCountMin: min,
    targetThrowCountMax: max,
    targetDistance,
    targetVelocity,
  };
}

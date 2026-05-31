// ============================================================
// PROJECT X — SORENESS RESPONSE ENGINE
// Implements Section 8 rules exactly.
// ============================================================

import { SORENESS, DAY_TYPES, MESSAGES } from './constants.js';

/**
 * Soreness "color" classification.
 * GREEN  → continue as scheduled
 * YELLOW → dial back or monitor
 * RED    → hard override (recovery or off)
 */
export function getSorenessLevel(score) {
  if (score <= SORENESS.GREEN_MAX) return 'green';
  if (score === SORENESS.DIAL_BACK) return 'yellow_dial_back';
  if (score <= SORENESS.MODERATE_HIGH) return 'yellow_moderate';
  if (score >= SORENESS.HIGH_MIN) return 'red';
  return 'green';
}

/**
 * Dial back a day type one step down the intent ladder.
 * Long Toss → Moderate → Light Catch → Recovery → Off
 */
export function dialBackDayType(dayType) {
  const ladder = {
    [DAY_TYPES.HIGH_INTENT_PLUS_PLUS]: DAY_TYPES.HIGH_INTENT_PLUS,
    [DAY_TYPES.HIGH_INTENT_PLUS]: DAY_TYPES.MODERATE_PREP,
    [DAY_TYPES.LONG_TOSS]: DAY_TYPES.MODERATE,
    [DAY_TYPES.MODERATE]: DAY_TYPES.LIGHT_CATCH,
    [DAY_TYPES.MODERATE_PREP]: DAY_TYPES.LIGHT_CATCH,
    [DAY_TYPES.MODERATE_MIDSLOPE]: DAY_TYPES.LIGHT_CATCH,
    [DAY_TYPES.LIGHT_CATCH]: DAY_TYPES.RECOVERY,
    [DAY_TYPES.RECOVERY]: DAY_TYPES.OFF,
    [DAY_TYPES.BULLPEN]: DAY_TYPES.RECOVERY,
  };

  return ladder[dayType] ?? DAY_TYPES.OFF;
}

/**
 * Given a soreness score and the planned day type,
 * return the adjusted day type and a message to show the athlete.
 *
 * Also accepts `nextSlotIsLowIntent` for the 5–6 edge case.
 */
export function applySorenessResponse(score, plannedDayType, nextSlotIsLowIntent = false) {
  const level = getSorenessLevel(score);

  // ≤3 — green, proceed as planned
  if (level === 'green') {
    return { adjustedDayType: plannedDayType, message: null, modified: false };
  }

  // =4 — dial back one step
  if (level === 'yellow_dial_back') {
    const adjusted = dialBackDayType(plannedDayType);
    return {
      adjustedDayType: adjusted,
      message: MESSAGES.SESSION_DOWNGRADED_SORENESS,
      modified: true,
    };
  }

  // 5–6 — continue only if next slot is low intent, otherwise downgrade
  if (level === 'yellow_moderate') {
    if (nextSlotIsLowIntent) {
      return { adjustedDayType: plannedDayType, message: null, modified: false };
    } else {
      const adjusted = dialBackDayType(plannedDayType);
      return {
        adjustedDayType: adjusted,
        message: MESSAGES.SESSION_DOWNGRADED_SORENESS,
        modified: true,
      };
    }
  }

  // ≥7 — hard recovery rule
  if (level === 'red') {
    const adjusted = score >= SORENESS.CANNOT_THROW ? DAY_TYPES.OFF : DAY_TYPES.RECOVERY;
    return {
      adjustedDayType: adjusted,
      message: MESSAGES.SESSION_DOWNGRADED_SORENESS,
      modified: true,
    };
  }

  return { adjustedDayType: plannedDayType, message: null, modified: false };
}

/**
 * Check whether 5–6 soreness has occurred in 2 consecutive slots.
 * If so, the next slot must be OFF. Hard rule.
 *
 * recentSorenessScores: array of the last N soreness scores in slot order.
 */
export function checkConsecutiveModerate(recentSorenessScores) {
  if (recentSorenessScores.length < 2) return false;
  const last = recentSorenessScores.slice(-2);
  return last.every(s => s >= 5 && s <= 6);
}

/**
 * Detect a soreness SPIKE — a sudden jump, not a gradual creep.
 * Defined as an increase of 3+ points in a single session-to-session step.
 */
export function detectSorenessSpike(previousScore, currentScore) {
  if (previousScore === null || previousScore === undefined) return false;
  return currentScore - previousScore >= 3;
}

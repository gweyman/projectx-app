// ============================================================
// PROJECT X — SESSION EVALUATION ENGINE
// Implements Sections 3.3, 3.4, 3.5, 3.6, 4.1, 4.2
// ============================================================

import {
  BAD_DAY_THRESHOLD,
  PR_RULES,
  PHASES,
  MESSAGES,
  DAY_TYPES,
} from './constants.js';

/**
 * Determine whether a session was successfully completed.
 * Rule (Section 3.3): Either velocity OR distance landing within
 * the target range counts as a successful session. Both are not required.
 *
 * Returns: { success: boolean, metric: 'velocity' | 'distance' | 'neither' }
 */
export function evaluateSessionCompletion({ goalVelocity, goalDistance, actualVelocity, actualDistance, phase }) {
  const threshold = BAD_DAY_THRESHOLD[phase] ?? BAD_DAY_THRESHOLD[PHASES.BUILDUP];

  const velocityMet = actualVelocity != null && goalVelocity != null
    ? actualVelocity >= goalVelocity * threshold
    : false;

  const distanceMet = actualDistance != null && goalDistance != null
    ? actualDistance >= goalDistance * threshold
    : false;

  if (velocityMet) return { success: true, metric: 'velocity' };
  if (distanceMet) return { success: true, metric: 'distance' };
  return { success: false, metric: 'neither' };
}

/**
 * Determine whether a session counts as a "miss" (countable failure).
 * A miss is when NEITHER metric clears the phase threshold.
 *
 * A "bad day" is within tolerance — NOT a countable miss.
 */
export function isMiss(sessionResult) {
  return !sessionResult.success;
}

/**
 * Check whether a new PR was achieved.
 * A PR = actual velocity or distance exceeds the session goal.
 *
 * Returns: { isPR: boolean, velocity: boolean, distance: boolean }
 */
export function checkForPR({ goalVelocity, goalDistance, actualVelocity, actualDistance }) {
  const velocityPR = actualVelocity != null && goalVelocity != null && actualVelocity > goalVelocity;
  const distancePR = actualDistance != null && goalDistance != null && actualDistance > goalDistance;

  return {
    isPR: velocityPR || distancePR,
    velocity: velocityPR,
    distance: distancePR,
    prVelocity: velocityPR ? actualVelocity : null,
    prDistance: distancePR ? actualDistance : null,
  };
}

/**
 * Evaluate consecutive PR logic and determine whether a drop-back is needed.
 * Rule (Section 4.2):
 *   - 2 consecutive PRs at sub-90 mph → no drop-back
 *   - 2 consecutive PRs at 90+ mph → mandatory ~3% drop-back for 2 weeks
 *
 * consecutivePRs: array of the last N PR sessions with their velocity values
 * Returns: { dropBackRequired: boolean, reason: string | null }
 */
export function evaluateConsecutivePRs(consecutivePRVelocities) {
  if (consecutivePRVelocities.length < PR_RULES.CONSECUTIVE_PRS_FOR_DROPBACK) {
    return { dropBackRequired: false, reason: null };
  }

  const lastTwo = consecutivePRVelocities.slice(-2);
  const bothAtGate = lastTwo.every(v => v >= PR_RULES.VELOCITY_GATE_MPH);

  if (bothAtGate) {
    return {
      dropBackRequired: true,
      message: MESSAGES.DROP_BACK_AFTER_PR,
      dropBackPercent: PR_RULES.DROP_BACK_PERCENT,
      dropBackWeeks: PR_RULES.DROP_BACK_WEEKS,
    };
  }

  return { dropBackRequired: false, reason: null };
}

/**
 * Calculate the drop-back target after consecutive PRs.
 * Reduces the current baseline by ~3%.
 */
export function calculateDropBackTarget(currentBaselineVelocity) {
  return Math.round(currentBaselineVelocity * (1 - PR_RULES.DROP_BACK_PERCENT) * 10) / 10;
}

/**
 * Detect consecutive miss pattern.
 * Rule (Section 3.5 / 3.6):
 *   - 2+ consecutive misses = real problem
 *   - Soreness decides the response (recovery week vs. deload week)
 *
 * recentResults: array of { success: boolean, soreness: number }
 * Returns: { consecutiveMisses: number, responseNeeded: string | null }
 */
export function evaluateConsecutiveMisses(recentResults) {
  let streak = 0;

  for (let i = recentResults.length - 1; i >= 0; i--) {
    if (!recentResults[i].success) {
      streak++;
    } else {
      break;
    }
  }

  if (streak < 2) {
    return { consecutiveMisses: streak, responseNeeded: null };
  }

  // Use the soreness from the most recent miss to decide response
  const latestSoreness = recentResults[recentResults.length - 1].soreness ?? 0;

  if (latestSoreness >= 4) {
    return {
      consecutiveMisses: streak,
      responseNeeded: 'deload',
      message: MESSAGES.DELOAD_TRIGGERED,
    };
  } else {
    return {
      consecutiveMisses: streak,
      responseNeeded: 'recovery_week',
      message: MESSAGES.DELOAD_TRIGGERED,
    };
  }
}

/**
 * Detect a velocity stall in the Output phase.
 * Rule (Section 5.3): same velocity for 2+ consecutive peak effort sessions.
 *
 * peakSessionVelocities: array of velocity numbers from peak sessions, in order
 */
export function detectVelocityStall(peakSessionVelocities) {
  if (peakSessionVelocities.length < 2) return false;

  const last = peakSessionVelocities.slice(-2);
  return last[0] === last[1];
}

/**
 * Detect a velocity DROP that should trigger a deload.
 * Build-up: >5% drop over 2 sessions
 * Output:   >3.5% drop over 2 sessions
 */
export function detectVelocityDrop(velocities, phase) {
  if (velocities.length < 2) return false;

  const [prev, curr] = velocities.slice(-2);
  if (prev === 0 || prev == null) return false;

  const dropPercent = (prev - curr) / prev;

  const threshold = phase === PHASES.OUTPUT ? 0.035 : 0.05;
  return dropPercent > threshold;
}

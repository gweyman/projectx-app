// ============================================================
// PROJECT X — PHASE ENGINE
// Implements Sections 5, 6, 7
// ============================================================

import {
  PHASES,
  PHASE_TRANSITIONS,
  DELOAD_TRIGGERS,
  DELOAD_SESSION_SPEC,
  MESSAGES,
  DAY_TYPES,
} from './constants.js';

import {
  detectVelocityDrop,
  detectVelocityStall,
} from './session.js';

// ----------------------------------------------------------
// DELOAD ENTRY CHECK
// ----------------------------------------------------------

/**
 * Evaluate all deload triggers for the current athlete state.
 * Returns { deloadRequired: boolean, reason: string | null }
 *
 * athleteState shape:
 * {
 *   phase: PHASES.*,
 *   recentPeakVelocities: number[],   // last N high-intent velocities
 *   stallWeeks: number,               // weeks at same velocity
 *   consecutiveMisses: number,
 *   currentSoreness: number,
 *   sorenessStreak: boolean,
 * }
 */
export function checkDeloadTriggers(athleteState) {
  const {
    phase,
    recentPeakVelocities,
    stallWeeks,
    consecutiveMisses,
    currentSoreness,
    sorenessStreak,
  } = athleteState;

  // Velocity DROP trigger
  if (recentPeakVelocities && recentPeakVelocities.length >= 2) {
    if (detectVelocityDrop(recentPeakVelocities, phase)) {
      return {
        deloadRequired: true,
        reason: 'velocity_drop',
        message: MESSAGES.DELOAD_TRIGGERED,
      };
    }
  }

  // Velocity STALL trigger (3 weeks)
  if (stallWeeks >= DELOAD_TRIGGERS.STALL_WEEKS) {
    return {
      deloadRequired: true,
      reason: 'velocity_stall',
      message: MESSAGES.DELOAD_TRIGGERED,
    };
  }

  // 2 consecutive misses + soreness 4+
  if (consecutiveMisses >= 2 && currentSoreness >= 4) {
    return {
      deloadRequired: true,
      reason: 'consecutive_misses_with_soreness',
      message: MESSAGES.DELOAD_TRIGGERED,
    };
  }

  // Soreness streak or health flags
  if (sorenessStreak) {
    return {
      deloadRequired: true,
      reason: 'soreness_streak',
      message: MESSAGES.DELOAD_TRIGGERED,
    };
  }

  return { deloadRequired: false, reason: null, message: null };
}

// ----------------------------------------------------------
// DELOAD EXIT & RE-ENTRY
// ----------------------------------------------------------

/**
 * Calculate re-entry point after a deload week.
 * Rule (Section 6.3):
 *   - Step back 2 weeks in the program
 *   - Phase boundary is a HARD FLOOR — never step into a prior phase
 *   - If 2-week step-back would cross phase start, re-enter at Week 1 of same phase
 */
export function calculateDeloadReEntry(currentWeekInPhase) {
  const stepBack = 2;
  const reEntryWeek = currentWeekInPhase - stepBack;

  if (reEntryWeek < 1) {
    return { reEntryWeek: 1, crossedPhaseBoundary: true };
  }

  return { reEntryWeek, crossedPhaseBoundary: false };
}

/**
 * Get the deload week session spec.
 * All deload weeks are identical regardless of phase.
 */
export function getDeloadSessionSpec() {
  return { ...DELOAD_SESSION_SPEC };
}

// ----------------------------------------------------------
// PHASE TRANSITION CHECKS
// ----------------------------------------------------------

/**
 * Check whether the athlete should transition from Build-up → Output.
 * Rule (Section 5.3): 3+ completed weeks of Long Toss.
 */
export function checkBuildupToOutputTransition(completedLongTossWeeks) {
  return completedLongTossWeeks >= PHASE_TRANSITIONS.BUILDUP_TO_OUTPUT_MIN_WEEKS;
}

/**
 * Check whether Output phase should end (exit conditions).
 * Rule (Section 5.4 / 7.3):
 *   - Velocity stalls (same number 2+ consecutive peak sessions) → Mound Blend or Bullpen
 *   - 4-week Output cap reached → Mound Blend or Bullpen
 *   - Timeline pressure → skip to Bullpen
 *
 * Returns: { shouldExit: boolean, exitReason: string | null, destination: PHASES.* | null }
 */
export function checkOutputPhaseExit({ weeksInOutput, peakSessionVelocities, moundBlendFitsTimeline }) {
  // 4-week cap
  if (weeksInOutput >= PHASE_TRANSITIONS.OUTPUT_MAX_WEEKS) {
    const destination = moundBlendFitsTimeline ? PHASES.MOUND_BLEND : PHASES.BULLPEN;
    return {
      shouldExit: true,
      exitReason: 'max_weeks_reached',
      destination,
      message: moundBlendFitsTimeline
        ? MESSAGES.OUTPUT_STALL_TO_MOUND_BLEND
        : MESSAGES.PHASE_TRANSITION_TO_OUTPUT,
    };
  }

  // Velocity stall
  if (peakSessionVelocities && detectVelocityStall(peakSessionVelocities)) {
    const destination = moundBlendFitsTimeline ? PHASES.MOUND_BLEND : PHASES.BULLPEN;
    return {
      shouldExit: true,
      exitReason: 'velocity_stall',
      destination,
      message: MESSAGES.OUTPUT_STALL_TO_MOUND_BLEND,
    };
  }

  return { shouldExit: false, exitReason: null, destination: null, message: null };
}

/**
 * Check whether Output phase should exit early to Bullpen
 * due to timeline pressure, fatigue, or plateau. (Section 5.3)
 *
 * Any ONE of these triggers is enough:
 *   - Velocity plateau (stall 2+ consecutive peak sessions)
 *   - Fatigue signals (soreness spike or repetitive bad days)
 *   - Timeline pressure (not enough slots left)
 */
export function checkEarlyOutputExit({ peakSessionVelocities, sorenessSpike, repetitiveBadDays, slotsRemainingForBullpen, bullpenMinSlots }) {
  if (peakSessionVelocities && detectVelocityStall(peakSessionVelocities)) {
    return { earlyExit: true, reason: 'velocity_plateau' };
  }

  if (sorenessSpike || repetitiveBadDays) {
    return { earlyExit: true, reason: 'fatigue_signals' };
  }

  if (slotsRemainingForBullpen != null && bullpenMinSlots != null && slotsRemainingForBullpen < bullpenMinSlots) {
    return { earlyExit: true, reason: 'timeline_pressure' };
  }

  return { earlyExit: false, reason: null };
}

// ----------------------------------------------------------
// OUTPUT PHASE BASELINE
// ----------------------------------------------------------

/**
 * Calculate the Output phase opening anchor velocity.
 * Rule (Section 7.1): Week 1 anchor = last Build-up Long Toss velocity.
 *
 * Returns the fixed anchor for High Intent+ (Slot 1) and the
 * starting point for High Intent++ (Slot 5) progression.
 */
export function calculateOutputAnchor(lastBuildupLongTossVelocity) {
  return {
    slot1AnchorVelocity: lastBuildupLongTossVelocity, // Fixed for entire Output phase
    slot5StartVelocity: lastBuildupLongTossVelocity,  // Attempts +2mph each week
  };
}

/**
 * Calculate the target velocity for the next Output peak session.
 * Rule (Section 7.1): attempt to add 2+ mph to previous peak session.
 * Flat week = acceptable. Not a miss, not a flag.
 */
export function calculateNextOutputTarget(previousPeakVelocity) {
  return previousPeakVelocity + 2;
}

// ----------------------------------------------------------
// ROLLING AVERAGE (Output Phase)
// ----------------------------------------------------------

/**
 * Calculate the 2-week rolling average of peak (Slot 5) sessions.
 * Rule (Section 2.1): Slot 1 excluded. Only Slot 5 (High Intent++) counts.
 */
export function calculateOutputRollingAverage(slot5Velocities) {
  if (!slot5Velocities || slot5Velocities.length === 0) return null;

  const last2 = slot5Velocities.slice(-2);
  const sum = last2.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / last2.length) * 10) / 10;
}

/**
 * Reset the rolling average after a deload.
 * Returns null — baseline starts fresh from re-entry point.
 */
export function resetRollingAverage() {
  return null;
}

// ----------------------------------------------------------
// BASELINE HANDOFF (Section 2.2)
// ----------------------------------------------------------

/**
 * Determine whether to use the Jaeger chart or the athlete's
 * personal baseline for a given session number within a day type.
 *
 * Sessions 1–2 of any NEW day type: use Jaeger chart internally.
 * Session 3+: athlete's own data drives targets.
 */
export function getBaselineSource(sessionNumberForDayType) {
  return sessionNumberForDayType <= 2 ? 'jaeger_chart' : 'personal_baseline';
}

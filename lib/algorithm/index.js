// ============================================================
// PROJECT X — ALGORITHM ENGINE
// Main entry point. Import this to interact with the algorithm.
// ============================================================

export * from './constants.js';
export * from './jaeger.js';
export * from './soreness.js';
export * from './session.js';
export * from './scheduling.js';
export * from './phase.js';

// ----------------------------------------------------------
// TOP-LEVEL ORCHESTRATION
// ----------------------------------------------------------
// These functions combine multiple sub-modules to answer the
// two most common questions the app will ask the algorithm:
//   1. "What should the athlete do next?"
//   2. "What do we do with what the athlete just reported?"
// ----------------------------------------------------------

import { checkDeloadTriggers, checkOutputPhaseExit } from './phase.js';
import { applySorenessResponse, checkConsecutiveModerate } from './soreness.js';
import { evaluateSessionCompletion, evaluateConsecutiveMisses, checkForPR, evaluateConsecutivePRs } from './session.js';
import { getWeekSequence, validateSlotCount, checkNeverDos } from './scheduling.js';
import { PHASES, DAY_TYPES, MESSAGES } from './constants.js';

/**
 * Process a post-session report submitted by the athlete.
 * This is the intelligence loop — fed after every session.
 *
 * Input: athleteState + sessionReport
 * Output: updated flags, messages to show, and next session preview
 *
 * athleteState shape:
 * {
 *   phase: PHASES.*,
 *   currentWeekInPhase: number,
 *   recentPeakVelocities: number[],
 *   recentResults: Array<{ success: boolean, soreness: number }>,
 *   consecutivePRVelocities: number[],
 *   slot5Velocities: number[],
 *   stallWeeks: number,
 *   sorenessStreak: boolean,
 *   slot1AnchorVelocity: number | null,  // Output phase only
 * }
 *
 * sessionReport shape:
 * {
 *   goalVelocity: number | null,
 *   goalDistance: number | null,
 *   actualVelocity: number | null,
 *   actualDistance: number | null,
 *   rpe: number,        // 1–10
 *   soreness: number,   // 1–10
 *   fatigue: number,    // 1–10
 *   throwCount: number,
 *   dayType: DAY_TYPES.*,
 * }
 */
export function processSessionReport(athleteState, sessionReport) {
  const flags = [];
  const messages = [];

  // 1. Evaluate session completion
  const sessionResult = evaluateSessionCompletion({
    goalVelocity: sessionReport.goalVelocity,
    goalDistance: sessionReport.goalDistance,
    actualVelocity: sessionReport.actualVelocity,
    actualDistance: sessionReport.actualDistance,
    phase: athleteState.phase,
  });

  // 2. Check for PR
  const prCheck = checkForPR({
    goalVelocity: sessionReport.goalVelocity,
    goalDistance: sessionReport.goalDistance,
    actualVelocity: sessionReport.actualVelocity,
    actualDistance: sessionReport.actualDistance,
  });

  let dropBackRequired = false;
  if (prCheck.isPR && sessionReport.actualVelocity) {
    const updatedPRVelocities = [...(athleteState.consecutivePRVelocities ?? []), sessionReport.actualVelocity];
    const prEval = evaluateConsecutivePRs(updatedPRVelocities);
    if (prEval.dropBackRequired) {
      dropBackRequired = true;
      messages.push(prEval.message);
      flags.push({ type: 'drop_back', ...prEval });
    }
  }

  // 3. Evaluate consecutive misses
  const updatedResults = [
    ...(athleteState.recentResults ?? []),
    { success: sessionResult.success, soreness: sessionReport.soreness },
  ];
  const missEval = evaluateConsecutiveMisses(updatedResults);
  if (missEval.responseNeeded) {
    messages.push(missEval.message);
    flags.push({ type: missEval.responseNeeded, ...missEval });
  }

  // 4. Check deload triggers
  const deloadCheck = checkDeloadTriggers({
    phase: athleteState.phase,
    recentPeakVelocities: athleteState.recentPeakVelocities,
    stallWeeks: athleteState.stallWeeks,
    consecutiveMisses: missEval.consecutiveMisses,
    currentSoreness: sessionReport.soreness,
    sorenessStreak: athleteState.sorenessStreak,
  });
  if (deloadCheck.deloadRequired) {
    messages.push(deloadCheck.message);
    flags.push({ type: 'deload', reason: deloadCheck.reason });
  }

  // 5. Output phase — check exit conditions
  let phaseTransition = null;
  if (athleteState.phase === PHASES.OUTPUT) {
    const exitCheck = checkOutputPhaseExit({
      weeksInOutput: athleteState.currentWeekInPhase,
      peakSessionVelocities: athleteState.recentPeakVelocities,
      moundBlendFitsTimeline: athleteState.moundBlendFitsTimeline ?? true,
    });
    if (exitCheck.shouldExit) {
      phaseTransition = exitCheck;
      messages.push(exitCheck.message);
      flags.push({ type: 'phase_transition', ...exitCheck });
    }
  }

  return {
    sessionResult,
    prCheck,
    dropBackRequired,
    missEval,
    deloadCheck,
    phaseTransition,
    flags,
    messages,
  };
}

/**
 * Generate the upcoming week schedule for an athlete.
 *
 * Input:
 * {
 *   phase: PHASES.*,
 *   availableSlots: number,
 *   availableDates: Date[],
 *   isDeloadWeek: boolean,
 *   isGameWeek: boolean,
 *   gameDayCount: number | null,
 * }
 *
 * Output: array of { date, dayType } with any warnings/messages
 */
export function generateWeekSchedule({
  phase,
  availableSlots,
  availableDates,
  isDeloadWeek = false,
  isGameWeek = false,
  gameDayCount = null,
}) {
  const slotValidation = validateSlotCount(availableSlots);

  if (!slotValidation.valid) {
    return {
      schedule: [],
      valid: false,
      message: slotValidation.message,
    };
  }

  const sequence = getWeekSequence(phase, availableSlots, isDeloadWeek, isGameWeek, gameDayCount);
  const violations = checkNeverDos(sequence);

  const schedule = availableDates.slice(0, sequence.length).map((date, i) => ({
    date,
    dayType: sequence[i],
  }));

  return {
    schedule,
    valid: true,
    warning: slotValidation.warning ?? false,
    message: slotValidation.message,
    neverDoViolations: violations,
  };
}

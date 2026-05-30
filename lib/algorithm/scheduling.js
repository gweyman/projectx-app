// ============================================================
// PROJECT X — SCHEDULING ENGINE
// Implements Sections 1, 9, 11
// ============================================================

import {
  PHASES,
  DAY_TYPES,
  DAY_TYPE_INTENT,
  BUILDUP_SEQUENCES,
  OUTPUT_SEQUENCE,
  BULLPEN_WEEK_SEQUENCE,
  DELOAD_WEEK_SEQUENCE,
  GAME_WEEK_7DAY_SEQUENCE,
  GAME_WEEK_5DAY_SEQUENCE,
  SCHEDULING,
  MESSAGES,
} from './constants.js';

// ----------------------------------------------------------
// NEVER-DO RULE ENFORCEMENT (Section 11)
// ----------------------------------------------------------

/**
 * Check all never-do rules for a proposed slot sequence.
 * Returns an array of violations (empty = safe to proceed).
 */
export function checkNeverDos(slots, gameSlotIndexes = []) {
  const violations = [];

  for (let i = 0; i < slots.length; i++) {
    const current = slots[i];
    const next = slots[i + 1];
    const prev = slots[i - 1];

    // No High Intent 2 slots in a row
    if (
      current &&
      next &&
      DAY_TYPE_INTENT[current] === 'high' &&
      DAY_TYPE_INTENT[next] === 'high'
    ) {
      violations.push({
        rule: 'NO_CONSECUTIVE_HIGH_INTENT',
        slots: [i, i + 1],
        message: 'High Intent sessions cannot occur back-to-back.',
      });
    }

    // No Long Toss or High Intent after a Bullpen
    if (
      prev === DAY_TYPES.BULLPEN &&
      (current === DAY_TYPES.LONG_TOSS ||
        DAY_TYPE_INTENT[current] === 'high')
    ) {
      violations.push({
        rule: 'NO_HIGH_AFTER_BULLPEN',
        slots: [i - 1, i],
        message: 'No Long Toss or High Intent session is allowed after a Bullpen.',
      });
    }

    // No Bullpen after a Bullpen
    if (prev === DAY_TYPES.BULLPEN && current === DAY_TYPES.BULLPEN) {
      violations.push({
        rule: 'NO_CONSECUTIVE_BULLPEN',
        slots: [i - 1, i],
        message: 'Bullpen sessions cannot occur back-to-back.',
      });
    }
  }

  return violations;
}

/**
 * Check whether a bullpen is within 48 hours of a game.
 * slotTimestamps: array of Date objects corresponding to each slot.
 * gameTimestamps: array of Date objects for each game.
 */
export function isBullpenTooCloseToGame(bullpenTimestamp, gameTimestamps) {
  const buffer = SCHEDULING.BULLPEN_GAME_BUFFER_HOURS * 60 * 60 * 1000;

  return gameTimestamps.some(gameTime => {
    const diff = gameTime - bullpenTimestamp;
    return diff >= 0 && diff < buffer;
  });
}

/**
 * Check whether a game was entered with sufficient advance notice.
 * Returns an object with whether notice is sufficient and the athlete message if not.
 */
export function checkGameAdvanceNotice(gameDateTimestamp, enteredOnTimestamp) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const noticeDays = (gameDateTimestamp - enteredOnTimestamp) / msPerDay;

  if (noticeDays < SCHEDULING.GAME_ADVANCE_NOTICE_DAYS) {
    return {
      sufficient: false,
      noticeDays: Math.floor(noticeDays),
      message: MESSAGES.GAME_SHORT_NOTICE,
    };
  }

  return { sufficient: true, noticeDays: Math.floor(noticeDays), message: null };
}

// ----------------------------------------------------------
// SEQUENCE SELECTION
// ----------------------------------------------------------

/**
 * Get the base day-type sequence for a given phase and slot count.
 * The sequence defines ORDER only — the scheduler maps it onto
 * the athlete's actual available slots.
 */
export function getWeekSequence(phase, availableSlots, isDeloadWeek = false, isGameWeek = false, gameDayCount = null) {
  if (isDeloadWeek) return DELOAD_WEEK_SEQUENCE.slice(0, availableSlots);

  if (isGameWeek) {
    const seq = gameDayCount >= 7 ? GAME_WEEK_7DAY_SEQUENCE : GAME_WEEK_5DAY_SEQUENCE;
    return seq.slice(0, availableSlots);
  }

  switch (phase) {
    case PHASES.BUILDUP: {
      const clampedSlots = Math.min(Math.max(availableSlots, 2), 7);
      const seq = BUILDUP_SEQUENCES[clampedSlots];
      return seq ?? BUILDUP_SEQUENCES[2];
    }

    case PHASES.OUTPUT:
      return OUTPUT_SEQUENCE.slice(0, availableSlots);

    case PHASES.BULLPEN:
      return BULLPEN_WEEK_SEQUENCE.slice(0, availableSlots);

    default:
      return [];
  }
}

/**
 * Compress the sequence when slot count drops below 3.
 * Picks the highest-priority day types from the sequence,
 * dropping lower-priority ones. Never-dos always override.
 *
 * Priority for compression: Long Toss / High Intent++ > Moderate > Light Catch > Recovery > Off
 */
export function compressSequence(sequence, targetSlots) {
  const priority = [
    DAY_TYPES.HIGH_INTENT_PLUS_PLUS,
    DAY_TYPES.LONG_TOSS,
    DAY_TYPES.HIGH_INTENT_PLUS,
    DAY_TYPES.MODERATE,
    DAY_TYPES.MODERATE_PREP,
    DAY_TYPES.MODERATE_MIDSLOPE,
    DAY_TYPES.LIGHT_CATCH,
    DAY_TYPES.RECOVERY,
    DAY_TYPES.OFF,
  ];

  // Sort by priority index (lower = higher priority)
  const sorted = [...sequence].sort(
    (a, b) => priority.indexOf(a) - priority.indexOf(b)
  );

  const compressed = sorted.slice(0, targetSlots);

  // Validate no never-dos introduced by compression
  const violations = checkNeverDos(compressed);

  // If compression caused violations, move the offending slot back one step
  if (violations.length > 0) {
    // Simple fix: if two high-intent slots ended up adjacent, insert a recovery between them
    const safe = [];
    for (let i = 0; i < compressed.length; i++) {
      safe.push(compressed[i]);
      if (
        compressed[i + 1] &&
        DAY_TYPE_INTENT[compressed[i]] === 'high' &&
        DAY_TYPE_INTENT[compressed[i + 1]] === 'high'
      ) {
        // Drop the second high-intent and keep only the first
        // (We can't add a slot we don't have)
        break;
      }
    }
    return safe.slice(0, targetSlots);
  }

  return compressed;
}

// ----------------------------------------------------------
// SLOT ASSIGNMENT
// ----------------------------------------------------------

/**
 * Map a sequence of day types onto the athlete's available slot dates.
 * availableDates: array of Date objects (slots the athlete can throw)
 * sequence: array of DAY_TYPE strings in order
 *
 * Returns: array of { date, dayType } objects
 */
export function assignSlotsToSequence(availableDates, sequence) {
  const result = [];
  const slotCount = Math.min(availableDates.length, sequence.length);

  for (let i = 0; i < slotCount; i++) {
    result.push({
      date: availableDates[i],
      dayType: sequence[i],
    });
  }

  return result;
}

/**
 * Validate that an athlete has enough slots to run the program.
 * Returns a warning message if slots are below optimal, or null if fine.
 */
export function validateSlotCount(slotCount) {
  if (slotCount < SCHEDULING.MIN_SLOTS_PER_WEEK) {
    return {
      valid: false,
      message: 'Athlete has fewer than 2 available slots this week. The algorithm cannot program for this week.',
    };
  }

  if (slotCount < SCHEDULING.OPTIMAL_SLOTS_PER_WEEK) {
    return {
      valid: true,
      warning: true,
      message: MESSAGES.SLOT_COUNT_LOW,
    };
  }

  return { valid: true, warning: false, message: null };
}

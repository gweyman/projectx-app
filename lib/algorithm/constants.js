// ============================================================
// PROJECT X — CONSTANTS & REFERENCE DATA
// Source: Algorithm Rules & Design Decisions v3
// ============================================================

// ----------------------------------------------------------
// PHASES
// ----------------------------------------------------------
export const PHASES = {
  BUILDUP: 'buildup',
  OUTPUT: 'output',
  MOUND_BLEND: 'mound_blend',
  BULLPEN: 'bullpen',
  IN_SEASON: 'in_season',
};

// Phase priority hierarchy — most protected (1) to most expendable (4)
export const PHASE_PRIORITY = {
  [PHASES.BUILDUP]: 1,
  [PHASES.IN_SEASON]: 2,
  [PHASES.BULLPEN]: 3,
  [PHASES.OUTPUT]: 4,
};

// ----------------------------------------------------------
// DAY TYPES
// ----------------------------------------------------------
export const DAY_TYPES = {
  HIGH_INTENT_PLUS: 'high_intent_plus',       // Output Slot 1 — fixed anchor
  HIGH_INTENT_PLUS_PLUS: 'high_intent_plus_plus', // Output Slot 5 — peak progression
  LONG_TOSS: 'long_toss',
  MODERATE: 'moderate',
  MODERATE_PREP: 'moderate_prep',
  MODERATE_MIDSLOPE: 'moderate_midslope',
  LIGHT_CATCH: 'light_catch',
  RECOVERY: 'recovery',
  BULLPEN: 'bullpen',
  DELOAD: 'deload',
  OFF: 'off',
  GAME: 'game',
};

// Intent level of each day type — used for never-do checks
export const DAY_TYPE_INTENT = {
  [DAY_TYPES.HIGH_INTENT_PLUS_PLUS]: 'high',
  [DAY_TYPES.HIGH_INTENT_PLUS]: 'high',
  [DAY_TYPES.LONG_TOSS]: 'high',
  [DAY_TYPES.BULLPEN]: 'high',
  [DAY_TYPES.MODERATE]: 'moderate',
  [DAY_TYPES.MODERATE_PREP]: 'moderate',
  [DAY_TYPES.MODERATE_MIDSLOPE]: 'moderate',
  [DAY_TYPES.LIGHT_CATCH]: 'low',
  [DAY_TYPES.RECOVERY]: 'low',
  [DAY_TYPES.DELOAD]: 'low',
  [DAY_TYPES.OFF]: 'off',
  [DAY_TYPES.GAME]: 'game',
};

// ----------------------------------------------------------
// WEEKLY SEQUENCES — BUILD-UP PHASE (Section 9.1)
// ----------------------------------------------------------
export const BUILDUP_SEQUENCES = {
  2: [DAY_TYPES.MODERATE, DAY_TYPES.LONG_TOSS],
  3: [DAY_TYPES.LIGHT_CATCH, DAY_TYPES.MODERATE, DAY_TYPES.LONG_TOSS],
  4: [DAY_TYPES.MODERATE, DAY_TYPES.LIGHT_CATCH, DAY_TYPES.MODERATE, DAY_TYPES.LONG_TOSS],
  5: [DAY_TYPES.MODERATE, DAY_TYPES.LIGHT_CATCH, DAY_TYPES.MODERATE, DAY_TYPES.RECOVERY, DAY_TYPES.LONG_TOSS],
  6: [DAY_TYPES.MODERATE, DAY_TYPES.LIGHT_CATCH, DAY_TYPES.MODERATE, DAY_TYPES.RECOVERY, DAY_TYPES.LONG_TOSS, DAY_TYPES.RECOVERY],
  7: [DAY_TYPES.MODERATE, DAY_TYPES.LIGHT_CATCH, DAY_TYPES.MODERATE, DAY_TYPES.RECOVERY, DAY_TYPES.LONG_TOSS, DAY_TYPES.RECOVERY, DAY_TYPES.OFF],
};

// ----------------------------------------------------------
// OUTPUT PHASE SEQUENCE (Section 9.2) — always 5 slots
// ----------------------------------------------------------
export const OUTPUT_SEQUENCE = [
  DAY_TYPES.HIGH_INTENT_PLUS,   // Slot 1 — fixed anchor
  DAY_TYPES.LIGHT_CATCH,        // Slot 2
  DAY_TYPES.MODERATE_PREP,      // Slot 3
  DAY_TYPES.RECOVERY,           // Slot 4
  DAY_TYPES.HIGH_INTENT_PLUS_PLUS, // Slot 5 — peak progression
];

// ----------------------------------------------------------
// OTHER CONFIRMED SEQUENCES (Section 9.3)
// ----------------------------------------------------------
export const BULLPEN_WEEK_SEQUENCE = [
  DAY_TYPES.BULLPEN,
  DAY_TYPES.RECOVERY,
  DAY_TYPES.OFF,
  DAY_TYPES.MODERATE_MIDSLOPE,
  DAY_TYPES.LONG_TOSS,
  DAY_TYPES.RECOVERY,
  DAY_TYPES.MODERATE_PREP,
];

export const DELOAD_WEEK_SEQUENCE = [
  DAY_TYPES.DELOAD,
  DAY_TYPES.OFF,
  DAY_TYPES.DELOAD,
  DAY_TYPES.OFF,
  DAY_TYPES.DELOAD,
  DAY_TYPES.OFF,
  DAY_TYPES.OFF,
];

export const GAME_WEEK_7DAY_SEQUENCE = [
  DAY_TYPES.GAME,
  DAY_TYPES.RECOVERY,
  DAY_TYPES.OFF,
  DAY_TYPES.MODERATE_PREP,
  DAY_TYPES.BULLPEN,
  DAY_TYPES.RECOVERY,
  DAY_TYPES.OFF,
];

export const GAME_WEEK_5DAY_SEQUENCE = [
  DAY_TYPES.GAME,
  DAY_TYPES.OFF,
  DAY_TYPES.MODERATE_PREP,
  DAY_TYPES.BULLPEN,
  DAY_TYPES.MODERATE_PREP,
];

// ----------------------------------------------------------
// DELOAD WEEK STRUCTURE (Section 6.2)
// ----------------------------------------------------------
export const DELOAD_SESSION_SPEC = {
  distance_ft: 60,
  throw_count: 25,
  intent_percent: 50,
};

// ----------------------------------------------------------
// SORENESS THRESHOLDS (Section 8.2)
// ----------------------------------------------------------
export const SORENESS = {
  GREEN_MAX: 3,           // ≤3 = green, continue as scheduled
  DIAL_BACK: 4,           // =4 = dial back one step
  MODERATE_LOW: 5,
  MODERATE_HIGH: 6,       // 5–6 = continue only if next slot is low intent
  HIGH_MIN: 7,            // ≥7 = recovery slot (hard rule)
  CANNOT_THROW: 10,       // =10 = off slot (hard rule)
};

// ----------------------------------------------------------
// SORENESS SCALE DESCRIPTIONS (Section 8.1)
// ----------------------------------------------------------
export const SORENESS_DESCRIPTIONS = {
  1: 'No soreness. Arm feels fresh, no awareness of previous session.',
  2: 'No soreness. Arm feels fresh, no awareness of previous session.',
  3: 'Mild awareness. Slight fatigue but loosens up immediately when throwing.',
  4: 'Noticeable soreness. Aware of it at rest, but arm responds normally once warmed up.',
  5: 'Moderate soreness. Affects warmup, arm feels heavy or stiff through first few throws.',
  6: 'Moderate soreness. Affects warmup, arm feels heavy or stiff through first few throws.',
  7: 'Significant soreness. Affects mechanics and effort level during session.',
  8: 'Significant soreness. Affects mechanics and effort level during session.',
  9: 'Severe. Would alter throwing motion to compensate.',
  10: 'Cannot throw.',
};

// ----------------------------------------------------------
// BAD DAY THRESHOLDS (Section 3.4)
// ----------------------------------------------------------
export const BAD_DAY_THRESHOLD = {
  [PHASES.BUILDUP]: 0.95,   // at or above 95% = within tolerance
  [PHASES.OUTPUT]: 0.965,   // at or above 96.5% = within tolerance
};

// ----------------------------------------------------------
// DELOAD TRIGGERS (Section 6.1)
// ----------------------------------------------------------
export const DELOAD_TRIGGERS = {
  BUILDUP_VELOCITY_DROP_PERCENT: 0.05,   // >5% drop over 2 sessions
  OUTPUT_VELOCITY_DROP_PERCENT: 0.035,   // >3.5% drop over 2 sessions
  STALL_WEEKS: 3,                        // velocity stalls for 3 weeks
  CONSECUTIVE_MISSES_WITH_SORENESS: 2,   // 2 consecutive misses + soreness 4+
};

// ----------------------------------------------------------
// PR RULES (Section 4)
// ----------------------------------------------------------
export const PR_RULES = {
  VELOCITY_GATE_MPH: 90,          // velocity gate for mandatory drop-back
  DISTANCE_GATE_FT: 315,          // distance equivalent at 95% intent
  DROP_BACK_PERCENT: 0.03,        // ~3% drop-back
  DROP_BACK_WEEKS: 2,             // drop-back lasts 2 weeks
  CONSECUTIVE_PRS_FOR_DROPBACK: 2,
};

// ----------------------------------------------------------
// PHASE TRANSITION RULES (Section 5.3)
// ----------------------------------------------------------
export const PHASE_TRANSITIONS = {
  BUILDUP_TO_OUTPUT_MIN_WEEKS: 3,     // 3+ completed Long Toss weeks
  OUTPUT_MAX_WEEKS: 4,                // 4-week Output cap
  OUTPUT_STALL_SESSIONS: 2,           // stall for 2+ consecutive peak sessions
};

// ----------------------------------------------------------
// SCHEDULING RULES
// ----------------------------------------------------------
export const SCHEDULING = {
  MIN_SLOTS_PER_WEEK: 2,              // never turns athlete away below this
  OPTIMAL_SLOTS_PER_WEEK: 3,
  GAME_ADVANCE_NOTICE_DAYS: 3,        // min days notice for full protection
  BULLPEN_GAME_BUFFER_HOURS: 48,      // no bullpen within 48h of game
};

// ----------------------------------------------------------
// JAEGER CHART — VELOCITY TO DISTANCE REFERENCE (Section 2.3)
// Backend only. Never displayed to athletes.
// ----------------------------------------------------------
export const JAEGER_CHART = [
  { peak_velo_mph: 67,  peak_dist_ft: 210 },
  { peak_velo_mph: 72,  peak_dist_ft: 240 },
  { peak_velo_mph: 77,  peak_dist_ft: 260 },
  { peak_velo_mph: 82,  peak_dist_ft: 280 },
  { peak_velo_mph: 87,  peak_dist_ft: 300 },
  { peak_velo_mph: 92,  peak_dist_ft: 330 },
  { peak_velo_mph: 97,  peak_dist_ft: 360 },
  { peak_velo_mph: 100, peak_dist_ft: 410 },
];

export const INTENT_PERCENTAGES = [0.75, 0.80, 0.85, 0.90, 0.95, 1.00];

// ----------------------------------------------------------
// APP COMMUNICATION MESSAGES (Section 12.2)
// ----------------------------------------------------------
export const MESSAGES = {
  DROP_BACK_AFTER_PR:
    "Your arm just hit a new level. We're giving it 2 weeks to adapt before pushing further.",
  DELOAD_TRIGGERED:
    "Your arm has missed its target two sessions in a row and is showing some soreness. We're giving you a full recovery week before getting back after it.",
  SESSION_DOWNGRADED_SORENESS:
    "Your soreness is elevated today so we've dialed back the session. Take care of your arm and we'll push next time.",
  PHASE_TRANSITION_TO_OUTPUT:
    "You've completed your build-up phase. Time to shift gears — we're moving into your Output phase where we'll start pushing your ceiling.",
  LONG_TOSS_REPEATED:
    "Last week's Long Toss session was replaced due to soreness. We're hitting the same target this week before moving forward.",
  ROLLING_AVERAGE_RESET:
    "Your baseline has been recalibrated after your recovery week. We're building back from a clean slate.",
  OUTPUT_STALL_TO_MOUND_BLEND:
    "Your velocity has found its current ceiling. That's a good thing — time to take that output to the mound.",
  SLOT_COUNT_LOW:
    "This is a lighter week than ideal — we'll make the most of what you have.",
  GAME_SHORT_NOTICE:
    "This game was entered with less than 3 days notice — we may not be able to fully protect your arm going into this game.",
};

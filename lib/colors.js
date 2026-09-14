// ===== COLOR PALETTE BY PAGE =====
// Edit colors below for each page
// Base palette: Dark Gray #3C3C3C, Red #c1292e, Blue #1b98e0

// ===== SESSION PAGE =====
export const SESSION_COLORS = {
  primary: '#3C3C3C',      // Dark gray
  secondary: '#c1292e',    // Red
  accent: '#1b98e0',       // Blue
  dark: '#3C3C3C',         // Gunmetal (text)
  light: '#3C3C3C',        // Dark gray (background)
};

// ===== DASHBOARD PAGE =====
export const DASHBOARD_COLORS = {
  primary: '#3C3C3C',
  secondary: '#c1292e',
  accent: '#1b98e0',
  dark: '#3C3C3C',
  light: '#3C3C3C',
};

export const TYPE_COLORS = {
  moderate: '#1b98e0',
  light_catch: '#c1292e',
  long_toss: '#3C3C3C',
  high_intent_plus: '#1b98e0',
  high_intent_plus_plus: '#c1292e',
  recovery: '#3C3C3C',
  off: '#666',
  bullpen: '#1b98e0',
  deload: '#3C3C3C',
};

export const PHASE_COLORS = {
  buildup: { accent: '#1b98e0', bg: '#1a2838', label: 'Buildup' },
  output: { accent: '#c1292e', bg: '#381a1a', label: 'Output' },
  mound_blend: { accent: '#3C3C3C', bg: '#2a2a2a', label: 'Mound Blend' },
};

// ===== ONBOARDING PAGE =====
export const ONBOARDING_COLORS = {
  background: '#3C3C3C',
  accent: '#1b98e0',
  text: 'white',
  textSecondary: '#666',
};

// ===== REPORT PAGE =====
export const REPORT_COLORS = {
  sorenessGood: '#1b98e0',
  sorenessElevated: '#c1292e',
  sorenessHigh: '#3C3C3C',
  rpeGood: '#1b98e0',
  rpeElevated: '#c1292e',
  rpeHigh: '#3C3C3C',
};

// ===== HELPER FUNCTIONS =====
export function sorenessColor(n) {
  if (!n) return '#333';
  if (n <= 3) return REPORT_COLORS.sorenessGood;
  if (n <= 6) return REPORT_COLORS.sorenessElevated;
  return REPORT_COLORS.sorenessHigh;
}

export function rpeColor(n) {
  if (!n) return '#333';
  if (n <= 4) return REPORT_COLORS.rpeGood;
  if (n <= 7) return REPORT_COLORS.rpeElevated;
  return REPORT_COLORS.rpeHigh;
}

export function getPhaseColor(phase) {
  return PHASE_COLORS[phase] || PHASE_COLORS.buildup;
}

export function getSessionTypeColor(type) {
  return TYPE_COLORS[type] || '#444';
}

export function getHealthColor(value) {
  if (value <= 3) return REPORT_COLORS.sorenessGood;
  if (value <= 6) return REPORT_COLORS.sorenessElevated;
  return REPORT_COLORS.sorenessHigh;
}

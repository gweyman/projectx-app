import { getWeekSequence, PHASES, DAY_TYPES, getTargetDistance } from './algorithm';

const SLOT_COUNT_MAP = {
  '3 days': 3, '4 days': 4, '5 days': 5, '6 days': 6, '7 days': 7,
  'It varies': 3,
};

// FLAG FOR CONFIRMATION — inferred from mock UI, not confirmed in the rules
// doc. Confirm with coaching before this drives real athlete-facing numbers.
const PROVISIONAL_INTENT_PERCENT = {
  [DAY_TYPES.LIGHT_CATCH]: 0.60,
  [DAY_TYPES.MODERATE]: 0.75,
  [DAY_TYPES.MODERATE_PREP]: 0.75,
  [DAY_TYPES.MODERATE_MIDSLOPE]: 0.75,
  [DAY_TYPES.RECOVERY]: 0.50,
  [DAY_TYPES.LONG_TOSS]: 0.95,
  [DAY_TYPES.HIGH_INTENT_PLUS]: 0.90,
  [DAY_TYPES.HIGH_INTENT_PLUS_PLUS]: 1.00,
};

function parseVelocityRange(str) {
  if (!str) return null;
  const nums = (str.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return null;
  if (str.includes('+')) return nums[0] + 3;
  if (/under/i.test(str)) return nums[0] - 3;
  return nums.length === 1 ? nums[0] : Math.round((nums[0] + nums[1]) / 2);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function generateInitialPlan(supabase, userId, profile) {
  const slotCount = SLOT_COUNT_MAP[profile.days_per_week] ?? 3;
  const phase = PHASES.BUILDUP;
  const sequence = getWeekSequence(phase, slotCount);

  const baselineVelocity =
    parseVelocityRange(profile.velocity) ?? parseVelocityRange(profile.pulldown);

  const today = new Date();
  const sessions = [];

  for (let i = 0; i < 7; i++) {
    const dayType = sequence[i] ?? DAY_TYPES.OFF;
    const isConfirmed = i < 2 && sequence[i];
    let targetDistance = null;

    if (isConfirmed && baselineVelocity) {
      const intentPct = PROVISIONAL_INTENT_PERCENT[dayType];
      if (intentPct) targetDistance = getTargetDistance(baselineVelocity, intentPct);
    }

    sessions.push({
      profile_id: userId,
      slot_number: i + 1,
      scheduled_date: addDays(today, i),
      day_type: dayType,
      status: isConfirmed ? 'confirmed' : 'projected',
      target_distance: targetDistance,
    });
  }

  const { error: sessionsError } = await supabase.from('sessions').insert(sessions);
  if (sessionsError) throw sessionsError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ phase, week_in_phase: 1, current_slot_number: 1, program_ready: true })
    .eq('id', userId);
  if (profileError) throw profileError;
}

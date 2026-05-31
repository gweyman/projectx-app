// ============================================================
// PROJECT X — JAEGER CHART UTILITIES
// Backend only. Never expose to athletes.
// ============================================================

import { JAEGER_CHART, INTENT_PERCENTAGES } from './constants.js';

/**
 * Find the closest Jaeger chart row for a given mound velocity.
 * Interpolates linearly between chart rows when the velocity
 * falls between two entries.
 */
export function getPeakDistanceForVelocity(velocityMph) {
  const chart = JAEGER_CHART;

  // Below the lowest entry — clamp to first row
  if (velocityMph <= chart[0].peak_velo_mph) {
    return chart[0].peak_dist_ft;
  }

  // Above the highest entry — clamp to last row
  if (velocityMph >= chart[chart.length - 1].peak_velo_mph) {
    return chart[chart.length - 1].peak_dist_ft;
  }

  // Find the two rows that bracket this velocity and interpolate
  for (let i = 0; i < chart.length - 1; i++) {
    const low = chart[i];
    const high = chart[i + 1];

    if (velocityMph >= low.peak_velo_mph && velocityMph <= high.peak_velo_mph) {
      const ratio = (velocityMph - low.peak_velo_mph) / (high.peak_velo_mph - low.peak_velo_mph);
      return Math.round(low.peak_dist_ft + ratio * (high.peak_dist_ft - low.peak_dist_ft));
    }
  }

  return null;
}

/**
 * Get the target distance for a given velocity and intent percentage.
 * Intent percentage: 0.75, 0.80, 0.85, 0.90, 0.95, or 1.00
 */
export function getTargetDistance(velocityMph, intentPercent) {
  const peakDist = getPeakDistanceForVelocity(velocityMph);
  if (peakDist === null) return null;
  return Math.round(peakDist * intentPercent);
}

/**
 * Get the full intent breakdown for a given velocity.
 * Returns an object with distances at each intent level.
 * For internal use only.
 */
export function getIntentBreakdown(velocityMph) {
  const peakDist = getPeakDistanceForVelocity(velocityMph);
  if (peakDist === null) return null;

  const breakdown = {};
  for (const pct of INTENT_PERCENTAGES) {
    const label = `${Math.round(pct * 100)}%`;
    breakdown[label] = Math.round(peakDist * pct);
  }
  return breakdown;
}

/**
 * Estimate a mound velocity from a known pulldown distance.
 * Used when mound velocity is unavailable at onboarding.
 * Approximates by reversing the chart interpolation.
 */
export function estimateVelocityFromDistance(distanceFt) {
  const chart = JAEGER_CHART;

  if (distanceFt <= chart[0].peak_dist_ft) return chart[0].peak_velo_mph;
  if (distanceFt >= chart[chart.length - 1].peak_dist_ft) return chart[chart.length - 1].peak_velo_mph;

  for (let i = 0; i < chart.length - 1; i++) {
    const low = chart[i];
    const high = chart[i + 1];

    if (distanceFt >= low.peak_dist_ft && distanceFt <= high.peak_dist_ft) {
      const ratio = (distanceFt - low.peak_dist_ft) / (high.peak_dist_ft - low.peak_dist_ft);
      return Math.round(low.peak_velo_mph + ratio * (high.peak_velo_mph - low.peak_velo_mph));
    }
  }

  return null;
}

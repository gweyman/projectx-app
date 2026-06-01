'use client';

import { useState } from 'react';
import Link from 'next/link';

const ATHLETE = {
  name: 'Gavin',
  phase: 'buildup',
  weekInPhase: 2,
  velocity: 84,
  lastSoreness: 2,
};

const WEEK = [
  { day: 'MON', date: 'Jun 2',  type: 'moderate',    label: 'Moderate',    status: 'done' },
  { day: 'TUE', date: 'Jun 3',  type: 'off',         label: 'Off',         status: 'done' },
  { day: 'WED', date: 'Jun 4',  type: 'light_catch', label: 'Light Catch', status: 'today' },
  { day: 'THU', date: 'Jun 5',  type: 'off',         label: 'Off',         status: 'upcoming' },
  { day: 'FRI', date: 'Jun 6',  type: 'moderate',    label: 'Moderate',    status: 'upcoming' },
  { day: 'SAT', date: 'Jun 7',  type: 'off',         label: 'Off',         status: 'upcoming' },
  { day: 'SUN', date: 'Jun 8',  type: 'long_toss',   label: 'Long Toss',   status: 'upcoming' },
];

const TODAY = WEEK.find(d => d.status === 'today');

const PHASE_COLORS = {
  buildup:     { bg: '#0d2b1a', accent: '#22c55e', label: 'Build-Up' },
  output:      { bg: '#2b0d0d', accent: '#ef4444', label: 'Output' },
  mound_blend: { bg: '#0d1a2b', accent: '#3b82f6', label: 'Mound Blend' },
  bullpen:     { bg: '#1a0d2b', accent: '#a855f7', label: 'Bullpen' },
  in_season:   { bg: '#2b1f0d', accent: '#f59e0b', label: 'In-Season' },
};

const TYPE_COLORS = {
  moderate:              '#3b82f6',
  light_catch:           '#22c55e',
  long_toss:             '#f59e0b',
  high_intent_plus:      '#ef4444',
  high_intent_plus_plus: '#ec4899',
  recovery:              '#6366f1',
  off:                   '#2a2a2a',
  bullpen:               '#a855f7',
  deload:                '#6b7280',
};

function sorenessColor(n) {
  if (n <= 3) return '#22c55e';
  if (n <= 6) return '#f59e0b';
  return '#ef4444';
}

export default function DashboardPage() {
  const phase = PHASE_COLORS[ATHLETE.phase] || PHASE_COLORS.buildup;
  const todayColor = TODAY ? (TYPE_COLORS[TODAY.type] || '#444') : '#444';
  const isThrowingDay = TODAY && TODAY.type !== 'off';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', fontFamily: 'system-ui, sans-serif', color: '#f0f0ec' }}>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #151515' }}>
        <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.08em', color: '#e03d2d' }}>PX</span>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#444', letterSpacing: '0.05em' }}>DASHBOARD</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#666' }}>
            {ATHLETE.name[0]}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: 0 }}>
              What's up, {ATHLETE.name}.
            </h1>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: phase.bg, color: phase.accent, border: `1px solid ${phase.accent}22` }}>
              {phase.label} · Week {ATHLETE.weekInPhase}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
            Wednesday, June 4 · Last soreness: <span style={{ color: sorenessColor(ATHLETE.lastSoreness), fontWeight: 600 }}>{ATHLETE.lastSoreness}/10</span>
          </p>
        </div>

        {isThrowingDay ? (
          <div style={{ backgroundColor: '#0f0f0f', border: `1px solid ${todayColor}33`, borderLeft: `3px solid ${todayColor}`, borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: '8px' }}>Today's Session</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'white' }}>{TODAY.label}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>INTENT</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: todayColor }}>60%</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
              "Keep it loose. This is a feel day — prioritize arm health and easy mechanics over distance."
            </div>
            <Link
              href="/session"
              style={{ display: 'block', width: '100%', padding: '14px', textAlign: 'center', backgroundColor: todayColor, color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', boxSizing: 'border-box' }}
            >
              Start Session →
            </Link>
          </div>
        ) : (
          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>🌀</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ddd', marginBottom: '4px' }}>Rest Day</div>
            <div style={{ fontSize: '13px', color: '#444' }}>No throwing today. Recovery is part of the program.</div>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', marginBottom: '14px' }}>This Week</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {WEEK.map(d => {
              const isToday = d.status === 'today';
              const isDone = d.status === 'done';
              const isOff = d.type === 'off';
              const color = TYPE_COLORS[d.type] || '#444';
              return (
                <div key={d.day} style={{ borderRadius: '8px', padding: '10px 6px', textAlign: 'center', backgroundColor: isToday ? '#111' : '#0d0d0d', border: isToday ? `1px solid ${color}55` : '1px solid #151515', opacity: isDone ? 0.45 : 1, position: 'relative' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: isToday ? color : '#444', marginBottom: '6px' }}>{d.day}</div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOff ? 'transparent' : color, border: isOff ? '1px solid #2a2a2a' : 'none', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '9px', color: isOff ? '#2a2a2a' : isToday ? '#aaa' : '#444', lineHeight: 1.3 }}>
                    {isOff ? '—' : d.label.split(' ')[0]}
                  </div>
                  {isDone && !isOff && <div style={{ position: 'absolute', top: '4px', right: '5px', fontSize: '8px', color: '#22c55e' }}>✓</div>}
                  {isToday && <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '2px', backgroundColor: color, borderRadius: '1px' }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            ['Velocity', `${ATHLETE.velocity} mph`, '#3b82f6'],
            ['Phase', phase.label, phase.accent],
            ['Last Soreness', `${ATHLETE.lastSoreness}/10`, sorenessColor(ATHLETE.lastSoreness)],
          ].map(([label, val, color]) => (
            <div key={label} style={{ backgroundColor: '#0d0d0d', border: '1px solid #151515', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color }}>{val}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
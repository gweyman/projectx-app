'use client';

import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useState } from 'react';
import Link from 'next/link';

const customColors = {
  primary: '#060606',      // Dark gray
  secondary: '#c1292e',    // Red
  accent: '#1b98e0',       // Blue
  dark: '#ffffff',         // White (text)
  light: '#3C3C3C',        // Dark gray (background)
};

const ATHLETE = {
  name: 'Gavin',
  phase: 'buildup',
  weekInPhase: 2,
  velocity: 84,
  lastSoreness: 2,
};

const TYPE_COLORS = {
  moderate: '#1b98e0',
  light_catch: '#c1292e',
  long_toss: '#404040',
  high_intent_plus: '#1b98e0',
  high_intent_plus_plus: '#c1292e',
  recovery: '#404040',
  off: '#666',
  bullpen: '#1b98e0',
  deload: '#404040',
};

function sorenessColor(n) {
  if (!n) return '#333';
  if (n <= 3) return '#1b98e0';
  if (n <= 6) return '#c1292e';
  return '#404040';
}

function getPhaseColor(phase) {
  const phaseColors = {
    buildup: { accent: '#1b98e0', bg: '#1a2838', label: 'Buildup' },
    output: { accent: '#c1292e', bg: '#381a1a', label: 'Output' },
    mound_blend: { accent: '#404040', bg: '#2a2a2a', label: 'Mound Blend' },
  };
  return phaseColors[phase] || phaseColors.buildup;
}

function getSessionTypeColor(type) {
  return TYPE_COLORS[type] || '#444';
}

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

export default function DashboardPage() {
  const { loading } = useRequireAuth();
  if (loading) return null;

  const [showSession, setShowSession] = useState(false);
  const [sorenessLogged, setSorenessLogged] = useState(false);
  const [sorenessVal, setSorenessVal] = useState(null);

  const phase = getPhaseColor(ATHLETE.phase);
  const todayColor = TODAY ? getSessionTypeColor(TODAY.type) : '#444';
  const isThrowingDay = TODAY && TODAY.type !== 'off';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#3C3C3C', fontFamily: 'system-ui, sans-serif', color: '#f0f0ec' }}>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #151515' }}>
        <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.08em', color: '#e03d2d' }}>PX</span>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#444', letterSpacing: '0.05em' }}>DASHBOARD</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3C3C3C', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#666' }}>
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
          <div style={{ backgroundColor: '#3C3C3C', border: `1px solid ${todayColor}33`, borderLeft: `3px solid ${todayColor}`, borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
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
          <div style={{ backgroundColor: '#3C3C3C', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
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
                <div key={d.day} style={{ borderRadius: '8px', padding: '10px 6px', textAlign: 'center', backgroundColor: isToday ? '#3C3C3C' : '#3C3C3C', border: isToday ? `1px solid ${color}55` : '1px solid #151515', opacity: isDone ? 0.45 : 1, position: 'relative' }}>
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
            <div key={label} style={{ backgroundColor: '#3C3C3C', border: '1px solid #151515', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color }}>{val}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
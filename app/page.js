'use client';
 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client.js';
 
// ── Mock data — will be replaced by real DB data later ──
const ATHLETE = {
  name: 'Gavin',
  phase: 'buildup',
  weekInPhase: 2,
  velocity: 84,
  lastSoreness: 2,
};
 
const WEEK = [
  { day: 'MON', date: 'Jun 2',  type: 'moderate',    label: 'Moderate',     intent: 75,  status: 'done' },
  { day: 'TUE', date: 'Jun 3',  type: 'off',         label: 'Off',          intent: null, status: 'done' },
  { day: 'WED', date: 'Jun 4',  type: 'light_catch', label: 'Light Catch',  intent: 60,  status: 'today' },
  { day: 'THU', date: 'Jun 5',  type: 'off',         label: 'Off',          intent: null, status: 'upcoming' },
  { day: 'FRI', date: 'Jun 6',  type: 'moderate',    label: 'Moderate',     intent: 75,  status: 'upcoming' },
  { day: 'SAT', date: 'Jun 7',  type: 'off',         label: 'Off',          intent: null, status: 'upcoming' },
  { day: 'SUN', date: 'Jun 8',  type: 'long_toss',   label: 'Long Toss',    intent: 95,  status: 'upcoming' },
];
 
const TODAY = WEEK.find(d => d.status === 'today');
 
const SESSION_DETAIL = {
  warmup: ['Arm circles — 10 each direction', 'Band pull-aparts — 2×15', 'Wrist flicks at 30 ft — 20 throws'],
  targets: { distance: '90–120 ft', intent: '60%', throwCount: '30–40 throws' },
  focus: 'Keep it loose. This is a feel day — prioritize arm health and easy mechanics over distance.',
  cooldown: ['Band external rotation — 2×15', 'Sleeper stretch — 2×30 sec', 'Ice if any soreness above 3'],
};
 
// ── Color map ──
const PHASE_COLORS = {
  buildup:   { bg: '#0d2b1a', accent: '#22c55e', label: 'Build-Up' },
  output:    { bg: '#2b0d0d', accent: '#ef4444', label: 'Output' },
  mound_blend: { bg: '#0d1a2b', accent: '#3b82f6', label: 'Mound Blend' },
  bullpen:   { bg: '#1a0d2b', accent: '#a855f7', label: 'Bullpen' },
  in_season: { bg: '#2b1f0d', accent: '#f59e0b', label: 'In-Season' },
};
 
const TYPE_COLORS = {
  moderate:    '#3b82f6',
  light_catch: '#22c55e',
  long_toss:   '#f59e0b',
  high_intent_plus: '#ef4444',
  high_intent_plus_plus: '#ec4899',
  recovery:    '#6366f1',
  off:         '#333',
  bullpen:     '#a855f7',
  deload:      '#6b7280',
};
 
const SORENESS_COLOR = (n) => n <= 3 ? '#22c55e' : n <= 6 ? '#f59e0b' : '#ef4444';
 
export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSession, setShowSession] = useState(false);
  const [sorenessLogged, setSorenessLogged] = useState(false);
  const [sorenessVal, setSorenessVal] = useState(null);

  // Auth guard: bounce to /login if there's no signed-in user.
  // NOTE: this only checks that *someone* is logged in — it still shows
  // mock ATHLETE/WEEK data below. Pulling the real profile + program from
  // Supabase/the algorithm is the next phase of work, not part of this pass.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
        return;
      }
      setCheckingAuth(false);
    });
  }, [router]);

  const phase = PHASE_COLORS[ATHLETE.phase] || PHASE_COLORS.buildup;

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#f0f0ec' }}>
 
      {/* Top nav */}
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
 
        {/* Greeting + phase badge */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: 0 }}>
              What's up, {ATHLETE.name}.
            </h1>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: phase.bg, color: phase.accent, border: `1px solid ${phase.accent}22` }}>
              {phase.label} · Week {ATHLETE.weekInPhase}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
            Wednesday, June 4 · Arm soreness last session: <span style={{ color: SORENESS_COLOR(ATHLETE.lastSoreness), fontWeight: 600 }}>{ATHLETE.lastSoreness}/10</span>
          </p>
        </div>
 
        {/* Today's session card */}
        {TODAY && TODAY.type !== 'off' && (
          <div style={{ backgroundColor: '#0f0f0f', border: `1px solid ${TYPE_COLORS[TODAY.type]}33`, borderLeft: `3px solid ${TYPE_COLORS[TODAY.type]}`, borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>Today's Session</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '0.02em' }}>{TODAY.label}</div>
              </div>
              {TODAY.intent && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#555', marginBottom: '4px' }}>INTENT</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: TYPE_COLORS[TODAY.type] }}>{TODAY.intent}%</div>
                </div>
              )}
            </div>
 
            {/* Session targets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                ['Distance', SESSION_DETAIL.targets.distance],
                ['Intent', SESSION_DETAIL.targets.intent],
                ['Throws', SESSION_DETAIL.targets.throwCount],
              ].map(([label, val]) => (
                <div key={label} style={{ backgroundColor: '#151515', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#ddd' }}>{val}</div>
                </div>
              ))}
            </div>
 
            {/* Focus note */}
            <div style={{ backgroundColor: '#151515', borderRadius: '8px', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#888', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{SESSION_DETAIL.focus}"
            </div>
 
            {/* Expand session detail */}
            <button
              onClick={() => setShowSession(!showSession)}
              style={{ background: 'none', border: '1px solid #2a2a2a', color: '#666', padding: '10px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', letterSpacing: '0.05em', marginBottom: showSession ? '16px' : '0', width: '100%' }}
            >
              {showSession ? '▲ Hide session detail' : '▼ View full session detail'}
            </button>
 
            {showSession && (
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#555', textTransform: 'uppercase', marginBottom: '10px' }}>Warmup</div>
                  {SESSION_DETAIL.warmup.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ color: TYPE_COLORS[TODAY.type], fontSize: '12px', marginTop: '1px' }}>→</span>
                      <span style={{ fontSize: '13px', color: '#888' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#555', textTransform: 'uppercase', marginBottom: '10px' }}>Cooldown</div>
                  {SESSION_DETAIL.cooldown.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ color: '#6366f1', fontSize: '12px', marginTop: '1px' }}>→</span>
                      <span style={{ fontSize: '13px', color: '#888' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
 
        {/* Pre-session soreness check */}
        {!sorenessLogged && TODAY && TODAY.type !== 'off' && (
          <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#ddd', marginBottom: '6px' }}>Before you throw — how's the arm?</div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '16px' }}>Rate your soreness right now, 1–10.</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setSorenessVal(n)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.12s',
                    backgroundColor: sorenessVal === n ? SORENESS_COLOR(n) : '#1a1a1a',
                    color: sorenessVal === n ? 'white' : '#555',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            {sorenessVal && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: SORENESS_COLOR(sorenessVal) }}>
                  {sorenessVal <= 3 ? '✓ Good to go — proceed as planned.' : sorenessVal <= 6 ? '⚠ Elevated — session may be adjusted.' : '✗ Too sore — switching to recovery.'}
                </span>
                <button
                  onClick={() => setSorenessLogged(true)}
                  style={{ padding: '8px 20px', backgroundColor: '#e03d2d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
                >
                  LOG & START →
                </button>
              </div>
            )}
          </div>
        )}
 
        {sorenessLogged && (
          <div style={{ backgroundColor: '#0d2b1a', border: '1px solid #22c55e33', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#22c55e' }}>✓ Soreness logged — you're cleared. Get after it.</span>
            <Link href="/session" style={{ padding: '8px 20px', backgroundColor: '#22c55e', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
              LOG SESSION →
            </Link>
          </div>
        )}
 
        {/* Weekly schedule */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', marginBottom: '14px' }}>This Week</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {WEEK.map((d) => {
              const isToday = d.status === 'today';
              const isDone = d.status === 'done';
              const isOff = d.type === 'off';
              const color = TYPE_COLORS[d.type] || '#444';
 
              return (
                <div key={d.day} style={{
                  borderRadius: '8px', padding: '10px 6px', textAlign: 'center',
                  backgroundColor: isToday ? '#111' : '#0d0d0d',
                  border: isToday ? `1px solid ${color}66` : '1px solid #151515',
                  opacity: isDone ? 0.5 : 1,
                  position: 'relative',
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: isToday ? color : '#444', marginBottom: '6px' }}>{d.day}</div>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: isOff ? '#1a1a1a' : color,
                    margin: '0 auto 6px',
                    border: isOff ? '1px solid #2a2a2a' : 'none',
                  }} />
                  <div style={{ fontSize: '9px', color: isOff ? '#2a2a2a' : isToday ? '#aaa' : '#444', lineHeight: 1.3 }}>
                    {isOff ? '—' : d.label.split(' ')[0]}
                  </div>
                  {isDone && !isOff && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '8px', color: '#22c55e' }}>✓</div>
                  )}
                  {isToday && (
                    <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '2px', backgroundColor: color, borderRadius: '1px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
 
        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {[
            ['Current Velocity', `${ATHLETE.velocity} mph`, '#3b82f6'],
            ['Phase', phase.label, phase.accent],
            ['Last Soreness', `${ATHLETE.lastSoreness}/10`, SORENESS_COLOR(ATHLETE.lastSoreness)],
          ].map(([label, val, color]) => (
            <div key={label} style={{ backgroundColor: '#0d0d0d', border: '1px solid #151515', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color }}>{val}</div>
            </div>
          ))}
        </div>
 
        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Link href="/session" style={{ display: 'block', padding: '16px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>📋</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#ddd' }}>Log Session</div>
            <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>Post-throw report</div>
          </Link>
          <button style={{ padding: '16px', backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>📅</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#ddd' }}>View Schedule</div>
            <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>Full program view</div>
          </button>
        </div>
 
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import NavBar from '../components/NavBar';

const SESSION = {
  type: 'light_catch',
  label: 'Light Catch',
  date: 'Wednesday, June 4',
  intent: 60,
  targets: { distance: '90–120 ft', throwCount: '30–40 throws', intent: '60%' },
  focus: "Keep it loose. This is a feel day — prioritize arm health and easy mechanics over distance.",
  warmup: [
    'Arm circles — 10 each direction',
    'Band pull-aparts — 2x15',
    'Wrist flicks at 30 ft — 20 throws',
    'Easy toss at 45 ft — 10 throws to loosen up',
  ],
  work: [
    'Start at 45 ft — 5 throws to feel',
    'Move to 60 ft — 10 throws at easy effort',
    'Move to 90 ft — 10-15 throws at 60% intent',
    'Stay at 90-120 ft range — finish remaining throws',
    'No max effort. If it feels easy, that is the point.',
  ],
  cooldown: [
    'Band external rotation — 2x15',
    'Sleeper stretch — 2x30 sec each side',
    'Cross-body stretch — 2x30 sec each side',
    'Ice if soreness is above 3/10',
  ],
};

const color = '#22c55e';

export default function SessionPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', fontFamily: 'system-ui, sans-serif', color: '#f0f0ec', paddingBottom: '60px' }}>
      <NavBar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{SESSION.date}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', margin: 0 }}>{SESSION.label}</h1>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#444', marginBottom: '2px' }}>INTENT</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color }}>{SESSION.intent}%</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {[['Distance', SESSION.targets.distance],['Throws', SESSION.targets.throwCount],['Intent', SESSION.targets.intent]].map(([label, val]) => (
            <div key={label} style={{ backgroundColor: '#0d0d0d', border: '1px solid #1e3a2a', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#ddd' }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderLeft: '3px solid #22c55e', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', fontSize: '13px', color: '#888', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{SESSION.focus}"
        </div>

        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', marginBottom: '16px' }}>Warmup</div>
          {SESSION.warmup.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
              <span style={{ color: '#333', fontSize: '12px', marginTop: '2px' }}>→</span>
              <span style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1e3a2a', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#22c55e', marginBottom: '16px' }}>The Work</div>
          {SESSION.work.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#22c55e', fontSize: '12px', marginTop: '2px', fontWeight: 700, minWidth: '16px' }}>{i + 1}.</span>
              <span style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', marginBottom: '16px' }}>Cooldown</div>
          {SESSION.cooldown.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
              <span style={{ color: '#6366f1', fontSize: '12px', marginTop: '2px' }}>→</span>
              <span style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        <Link href="/report" style={{ display: 'block', width: '100%', padding: '16px', textAlign: 'center', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', boxSizing: 'border-box' }}>
          Log Session →
        </Link>
      </div>
    </div>
  );
}

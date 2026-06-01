'use client';

import { useState } from 'react';
import Link from 'next/link';

function sorenessColor(n) {
  if (!n) return '#333';
  if (n <= 3) return '#22c55e';
  if (n <= 6) return '#f59e0b';
  return '#ef4444';
}

function rpeColor(n) {
  if (!n) return '#333';
  if (n <= 4) return '#3b82f6';
  if (n <= 7) return '#f59e0b';
  return '#ef4444';
}

function ScaleBtn({ n, selected, color, onClick }) {
  return (
    <button type="button" onClick={() => onClick(n)} style={{ flex: 1, padding: '10px 0', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.12s', backgroundColor: selected ? color : '#151515', color: selected ? 'white' : '#555', outline: selected ? `1px solid ${color}` : '1px solid #1e1e1e' }}>
      {n}
    </button>
  );
}

function RadioOpt({ label, value, selected, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', textAlign: 'left', border: 'none', transition: 'all 0.12s', backgroundColor: selected ? '#1e3a5f' : '#111', color: selected ? 'white' : '#888', outline: selected ? '1px solid #3b82f6' : '1px solid #1e1e1e', width: '100%' }}>
      <span style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, border: selected ? '1px solid #3b82f6' : '1px solid #444', backgroundColor: selected ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'white', display: 'block' }} />}
      </span>
      {label}
    </button>
  );
}

function Card({ children }) {
  return <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '24px', marginBottom: '16px' }}>{children}</div>;
}

function SecTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', whiteSpace: 'nowrap' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#1a1a1a' }} />
    </div>
  );
}

export default function ReportPage() {
  const [form, setForm] = useState({ velocity: '', distance: '', throwCount: '', soreness: null, rpe: null, fatigue: null, hitTarget: '', feelRating: '', painFlag: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.soreness && form.rpe && form.fatigue && form.hitTarget;
  const flagged = form.soreness >= 7 || form.painFlag === 'yes';

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: flagged ? '#7c2020' : '#14532d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>{flagged ? '⚠' : '✓'}</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '0.04em', marginBottom: '12px' }}>SESSION LOGGED.</div>
          <p style={{ fontSize: '14px', color: flagged ? '#f59e0b' : '#555', lineHeight: 1.6, marginBottom: '24px' }}>
            {flagged ? "Your soreness or pain levels are elevated. Tomorrow's session has been adjusted. Rest up." : "Good work. Your data has been recorded and your next session has been updated."}
          </p>
          <Link href="/dashboard" style={{ display: 'inline-block', padding: '12px 32px', backgroundColor: '#e03d2d', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
            BACK TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', fontFamily: 'system-ui, sans-serif', color: '#f0f0ec', paddingBottom: '60px' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #151515' }}>
        <Link href="/session" style={{ fontSize: '12px', color: '#444', textDecoration: 'none' }}>← Back</Link>
        <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.08em', color: '#e03d2d' }}>PX</span>
        <span style={{ fontSize: '11px', color: '#333', letterSpacing: '0.1em' }}>SESSION REPORT</span>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '4px' }}>Session Report</h1>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '32px' }}>Wednesday, June 4 · Light Catch · 60% intent</p>

        <Card>
          <SecTitle>01 — What You Threw</SecTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[['velocity','Peak velocity (mph)','e.g. 86'],['distance','Max distance (ft)','e.g. 120']].map(([k,l,p]) => (
              <div key={k}>
                <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '4px' }}>{l}</div>
                <input type="number" placeholder={p} value={form[k]} onChange={e => set(k, e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '6px', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '4px' }}>Total throws</div>
            <input type="number" placeholder="e.g. 35" value={form.throwCount} onChange={e => set('throwCount', e.target.value)} style={{ width: '140px', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '6px', fontSize: '14px', color: 'white', outline: 'none' }} />
          </div>
        </Card>

        <Card>
          <SecTitle>02 — How the Arm Felt</SecTitle>
          {[
            { key: 'soreness', label: 'Arm soreness right now', low: 'No soreness', high: 'Cannot throw', colorFn: sorenessColor },
            { key: 'rpe', label: 'RPE — effort level', low: 'Easy', high: 'Max effort', colorFn: rpeColor },
            { key: 'fatigue', label: 'Overall fatigue', low: 'Fresh', high: 'Completely drained', colorFn: rpeColor },
          ].map(({ key, label, low, high, colorFn }) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '4px' }}>{label} <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <ScaleBtn key={n} n={n} selected={form[key] === n} color={colorFn(n)} onClick={v => set(key, v)} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span style={{ fontSize: '10px', color: '#444' }}>{low}</span>
                <span style={{ fontSize: '10px', color: '#444' }}>{high}</span>
              </div>
              {key === 'soreness' && form.soreness && (
                <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: `${sorenessColor(form.soreness)}15`, border: `1px solid ${sorenessColor(form.soreness)}33`, borderRadius: '6px', fontSize: '12px', color: sorenessColor(form.soreness) }}>
                  {form.soreness <= 2 && 'No soreness. Arm feels fresh.'}
                  {form.soreness === 3 && 'Mild awareness — slight fatigue, loosens up right away.'}
                  {form.soreness === 4 && 'Noticeable soreness. Aware at rest but arm responds once warmed up.'}
                  {(form.soreness === 5 || form.soreness === 6) && 'Moderate soreness. Affected warmup — felt heavy or stiff early.'}
                  {(form.soreness === 7 || form.soreness === 8) && 'Significant soreness. Affected mechanics and effort level.'}
                  {form.soreness === 9 && 'Severe — you may have altered your motion to compensate.'}
                  {form.soreness === 10 && 'Cannot throw. Full rest required.'}
                </div>
              )}
            </div>
          ))}
        </Card>

        <Card>
          <SecTitle>03 — Did You Hit the Target?</SecTitle>
          <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '8px' }}>Target: 90–120 ft at 60% intent <span style={{ color: '#e03d2d' }}>*</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {[['yes','Yes — hit the target'],['close','Close — within range but not quite'],['no','No — fell short'],['over','Went over — felt too easy, pushed further']].map(([v,l]) => (
              <RadioOpt key={v} label={l} value={v} selected={form.hitTarget === v} onSelect={v => set('hitTarget', v)} />
            ))}
          </div>
          <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '8px' }}>How did the arm feel overall?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[['great',"🔥 Great — best it's felt"],['good','✓ Good — normal day'],['ok','~ OK — got through it'],['off','↓ Off — not my day']].map(([v,l]) => (
              <RadioOpt key={v} label={l} value={v} selected={form.feelRating === v} onSelect={v => set('feelRating', v)} />
            ))}
          </div>
        </Card>

        <Card>
          <SecTitle>04 — Any Pain?</SecTitle>
          <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '4px' }}>Any sharp pain, popping, or discomfort?</div>
          <div style={{ fontSize: '11px', color: '#444', marginBottom: '10px' }}>Soreness is normal. Pain is different. Be honest.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[['no','No — just normal soreness'],['yes','Yes — something felt off']].map(([v,l]) => (
              <RadioOpt key={v} label={l} value={v} selected={form.painFlag === v} onSelect={v => set('painFlag', v)} />
            ))}
          </div>
          {form.painFlag === 'yes' && (
            <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#2b0d0d', border: '1px solid #5a1a1a', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, marginBottom: '8px' }}>⚠ Describe what you felt</div>
              <textarea placeholder="Where was it? Sharp, dull, burning? When during the session?" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #333', borderRadius: '6px', fontSize: '13px', color: 'white', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }} />
            </div>
          )}
        </Card>

        <Card>
          <SecTitle>05 — Anything Else?</SecTitle>
          <textarea placeholder="Mechanics felt off, weather, cut it short, equipment issues..." value={form.painFlag !== 'yes' ? form.notes : ''} onChange={e => set('notes', e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '6px', fontSize: '13px', color: 'white', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }} />
        </Card>

        {!canSubmit && <div style={{ fontSize: '12px', color: '#444', textAlign: 'center', marginBottom: '12px' }}>Fill in the required fields above to submit.</div>}
        <button type="button" onClick={() => canSubmit && setSubmitted(true)} style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: '#e03d2d', color: 'white', border: 'none', borderRadius: '8px', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.3 }}>
          Submit Session Report
        </button>
      </div>
    </div>
  );
}
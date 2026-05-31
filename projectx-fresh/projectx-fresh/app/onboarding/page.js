'use client';

import { useState } from 'react';

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0a0a0a', padding: '40px 16px', fontFamily: 'system-ui, sans-serif' },
  wrap: { maxWidth: '680px', margin: '0 auto' },
  header: { backgroundColor: '#111', border: '1px solid #222', borderBottom: 'none', borderRadius: '12px 12px 0 0', padding: '28px 32px' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '8px' },
  title: { fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '0.04em', marginBottom: '8px' },
  subtitle: { fontSize: '13px', color: '#666', lineHeight: 1.6 },
  progressBar: { height: '2px', backgroundColor: '#222', borderRadius: '2px', overflow: 'hidden', marginTop: '20px' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: '2px', transition: 'width 0.4s ease' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginTop: '8px' },
  progressText: { fontSize: '11px', color: '#444', fontFamily: 'monospace' },
  body: { backgroundColor: '#0d0d0d', border: '1px solid #222', borderTop: 'none' },
  section: { padding: '28px 32px', borderBottom: '1px solid #1a1a1a' },
  secLabel: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  secLabelText: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3b82f6', whiteSpace: 'nowrap' },
  secLabelLine: { flex: 1, height: '1px', backgroundColor: '#1a1a1a' },
  fieldLabel: { fontSize: '13px', fontWeight: 500, color: '#ddd', marginBottom: '4px' },
  hint: { fontSize: '12px', color: '#555', lineHeight: 1.5, marginBottom: '10px' },
  input: { width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', fontSize: '13px', color: 'white', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' },
  grid7: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' },
  qitem: { marginBottom: '20px' },
  submitArea: { backgroundColor: '#111', border: '1px solid #222', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px 32px' },
  submitBtn: { width: '100%', padding: '16px', fontSize: '16px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  submitNote: { fontSize: '11px', color: '#444', textAlign: 'center', marginTop: '10px' },
  flagNote: { marginTop: '10px', padding: '10px 14px', backgroundColor: '#2a1a00', border: '1px solid #5a3a00', borderRadius: '6px', fontSize: '12px', color: '#f0a020', lineHeight: 1.5 },
  success: { minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  successInner: { textAlign: 'center', maxWidth: '400px' },
  successIcon: { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', color: 'white' },
  successTitle: { fontSize: '36px', fontWeight: 900, color: 'white', letterSpacing: '0.04em', marginBottom: '12px' },
  successSub: { fontSize: '14px', color: '#666', lineHeight: 1.6 },
};

function optBtn(selected) {
  return {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
    fontSize: '13px', textAlign: 'left', border: 'none', transition: 'all 0.12s',
    backgroundColor: selected ? '#1e3a5f' : '#111',
    color: selected ? 'white' : '#aaa',
    outline: selected ? '1px solid #3b82f6' : '1px solid #222',
  };
}

function dot(selected) {
  return {
    width: '13px', height: '13px', borderRadius: '50%', flexShrink: 0,
    border: selected ? '1px solid #3b82f6' : '1px solid #444',
    backgroundColor: selected ? '#3b82f6' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

function sq(selected) {
  return {
    width: '13px', height: '13px', borderRadius: '3px', flexShrink: 0,
    border: selected ? '1px solid #3b82f6' : '1px solid #444',
    backgroundColor: selected ? '#3b82f6' : 'transparent',
  };
}

function Radio({ name, value, label, selected, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(name, value)} style={optBtn(selected)}>
      <span style={dot(selected)}>{selected && <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'white', display: 'block' }} />}</span>
      {label}
    </button>
  );
}

function Check({ value, label, checked, onToggle }) {
  return (
    <button type="button" onClick={() => onToggle(value)} style={optBtn(checked)}>
      <span style={sq(checked)} />
      {label}
    </button>
  );
}

function SL({ num, title }) {
  return (
    <div style={s.secLabel}>
      <span style={s.secLabelText}>{num} — {title}</span>
      <div style={s.secLabelLine} />
    </div>
  );
}

export default function OnboardingPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', height: '', weight: '', gradYear: '',
    arm: '', position: '', level: '',
    velocity: '', pulldown: '', innings: '', shutdown: '', longTossDist: '',
    veloProg: '', weightAge: '', squat: '', bench: '', deadlift: '', pullups: '',
    armHealth: '', injuryHistory: '', otherLimitations: '',
    equipment: [], daysPerWeek: '', availableDays: [],
    goal: '', gameDate: '', gamesPerWeek: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function setR(name, value) { setForm(f => ({ ...f, [name]: value })); }
  function togArr(field, value) {
    setForm(f => {
      const arr = f[field] || [];
      return { ...f, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  }

  const required = ['arm', 'position', 'level', 'velocity', 'innings', 'shutdown', 'armHealth', 'daysPerWeek', 'goal', 'gameDate'];
  const filled = required.filter(k => form[k]).length;
  const pct = Math.round((filled / required.length) * 100);

  const injured = form.armHealth === 'Dealing with something — managed' || form.armHealth === 'Coming back from injury';

  if (submitted) {
    return (
      <div style={s.success}>
        <div style={s.successInner}>
          <div style={s.successIcon}>✓</div>
          <div style={s.successTitle}>YOU'RE LOCKED IN.</div>
          <p style={s.successSub}>Your profile is set. Your first week of training will be ready shortly — check the Today screen to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.eyebrow}>Project X — Athlete Setup</div>
          <div style={s.title}>ONBOARDING QUESTIONNAIRE</div>
          <p style={s.subtitle}>Answer every section so we can build a program that actually fits you — not a generic template.</p>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${pct}%` }} />
          </div>
          <div style={s.progressLabels}>
            <span style={s.progressText}>{filled} of {required.length} required</span>
            <span style={s.progressText}>{pct}% complete</span>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>

          {/* Section 1 */}
          <div style={s.section}>
            <SL num="01" title="Who You Are" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[['firstName','First name','text','First'],['lastName','Last name','text','Last'],['age','Age','number','e.g. 17']].map(([k,l,t,p]) => (
                <div key={k}>
                  <div style={s.fieldLabel}>{l} {['firstName','lastName','age'].includes(k) && <span style={{ color: '#e03d2d' }}>*</span>}</div>
                  <input type={t} placeholder={p} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={s.input} />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[['height','Height','text',"e.g. 6'1\""],['weight','Weight (lbs)','number','e.g. 185'],['gradYear','Grad year / level','text','e.g. 2026 / HS Jr']].map(([k,l,t,p]) => (
                <div key={k}>
                  <div style={s.fieldLabel}>{l}</div>
                  <input type={t} placeholder={p} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={s.input} />
                </div>
              ))}
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Throwing arm <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.grid2}>
                {['Right','Left'].map(v => <Radio key={v} name="arm" value={v} label={v} selected={form.arm===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Primary position <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.grid3}>
                {['Pitcher','Catcher','Infield','Outfield','Two-way','Not sure yet'].map(v => <Radio key={v} name="position" value={v} label={v} selected={form.position===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Highest level played <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.grid2}>
                {['Little League / rec','Travel / club ball','High school JV','High school varsity','JUCO / D3 / NAIA','D1 / D2 college'].map(v => <Radio key={v} name="level" value={v} label={v} selected={form.level===v} onSelect={setR} />)}
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div style={s.section}>
            <SL num="02" title="Throwing Background" />

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Current pitching velocity (mound) <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.hint}>Best guess is fine. If you don't pitch, use your best throw from your position.</div>
              <div style={s.grid3}>
                {['Under 65 mph','65–74 mph','75–79 mph','80–84 mph','85–89 mph','90+ mph'].map(v => <Radio key={v} name="velocity" value={v} label={v} selected={form.velocity===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Pulldown / max-effort velocity (if known)</div>
              <div style={s.hint}>Max-effort throws from a run-up, not off a mound. Leave blank if you've never done them.</div>
              <input type="text" placeholder="e.g. 95 mph, or leave blank" value={form.pulldown} onChange={e => setForm(f => ({ ...f, pulldown: e.target.value }))} style={s.input} />
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Innings / games thrown this past spring + summer? <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.grid2}>
                {["I didn't play / was shut down","Light — a few games","Moderate — half a season","Full season (spring + summer)","Heavy — multiple teams"].map(v => <Radio key={v} name="innings" value={v} label={v} selected={form.innings===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>How long have you been shut down / not throwing? <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.hint}>This sets your build-up length. Be honest — it directly affects how your program starts.</div>
              <div style={s.grid2}>
                {['Still throwing / not shut down','1–2 weeks','3–4 weeks','5–8 weeks','2–3 months','4+ months'].map(v => <Radio key={v} name="shutdown" value={v} label={v} selected={form.shutdown===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Current max long toss distance</div>
              <div style={s.hint}>How far can you air it out right now? Best estimate is fine.</div>
              <div style={s.grid3}>
                {['Under 90 ft','90–120 ft','120–150 ft','150–180 ft','180–220 ft','220 ft+'].map(v => <Radio key={v} name="longTossDist" value={v} label={v} selected={form.longTossDist===v} onSelect={setR} />)}
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div style={s.section}>
            <SL num="03" title="Training History" />

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Have you done a structured velocity program before? <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.grid2}>
                {['No — this is my first','Yes — online/PDF program','Yes — with a facility / coach','Yes — multiple programs'].map(v => <Radio key={v} name="veloProg" value={v} label={v} selected={form.veloProg===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Weight room training age <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.hint}>How long have you been seriously lifting — not gym class, but real structured training?</div>
              <div style={s.grid2}>
                {['Never / just started','Less than 1 year','1–2 years','3+ years'].map(v => <Radio key={v} name="weightAge" value={v} label={v} selected={form.weightAge===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Weight room numbers (best lift or recent working set)</div>
              <div style={s.hint}>Fill in what you know. Leave blank if you don't track these.</div>
              <div style={s.grid2}>
                {[['squat','Back squat (lbs)','e.g. 225'],['bench','Bench press (lbs)','e.g. 185'],['deadlift','Deadlift (lbs)','e.g. 275'],['pullups','Max pullups (reps)','e.g. 12']].map(([k,l,p]) => (
                  <div key={k}>
                    <div style={{ ...s.fieldLabel, fontSize: '12px', color: '#555' }}>{l}</div>
                    <input type="number" placeholder={p} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={s.input} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div style={s.section}>
            <SL num="04" title="Health & Injuries" />

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Any current arm or shoulder issues? <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.grid2}>
                {['Feeling 100% — no issues','Minor soreness, nothing structural','Dealing with something — managed','Coming back from injury'].map(v => <Radio key={v} name="armHealth" value={v} label={v} selected={form.armHealth===v} onSelect={setR} />)}
              </div>
              {injured && <div style={s.flagNote}>Please describe your injury or current issue below. Your program will be adjusted accordingly.</div>}
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Previous arm, shoulder, or elbow injuries</div>
              <div style={s.hint}>Include surgeries, UCL issues, labrum, rotator cuff. Write "none" if you're clean.</div>
              <textarea placeholder='e.g. UCL sprain right elbow 2022, 6 weeks rest. Or: none.' value={form.injuryHistory} onChange={e => setForm(f => ({ ...f, injuryHistory: e.target.value }))} style={s.textarea} />
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Any other physical limitations?</div>
              <textarea placeholder="e.g. lower back tightness, hip issue. Write 'none' if nothing." value={form.otherLimitations} onChange={e => setForm(f => ({ ...f, otherLimitations: e.target.value }))} style={s.textarea} />
            </div>
          </div>

          {/* Section 5 */}
          <div style={s.section}>
            <SL num="05" title="Equipment & Availability" />

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Equipment you have regular access to <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.hint}>Select all that apply.</div>
              <div style={s.grid2}>
                {['Radar gun','Pitching mound','200+ ft of open space','Throwing net / wall','Plyo balls','Weighted balls','Resistance bands','Foam roller / lacrosse ball','Weight room access','Catching partner'].map(v => (
                  <Check key={v} value={v} label={v} checked={form.equipment.includes(v)} onToggle={v => togArr('equipment', v)} />
                ))}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Days per week you can throw <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.hint}>Be realistic — this is what your weekly template is built around.</div>
              <div style={s.grid3}>
                {['3 days','4 days','5 days','6 days','7 days','It varies'].map(v => <Radio key={v} name="daysPerWeek" value={v} label={v} selected={form.daysPerWeek===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Which days are you typically available?</div>
              <div style={s.grid7}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
                  const checked = form.availableDays.includes(day);
                  return (
                    <button key={day} type="button" onClick={() => togArr('availableDays', day)} style={{ ...optBtn(checked), flexDirection: 'column', gap: '6px', padding: '10px 4px', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={sq(checked)} />
                      <span style={{ fontSize: '11px' }}>{day}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div style={{ ...s.section, borderBottom: 'none' }}>
            <SL num="06" title="Program Goal & Timeline" />

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Main goal right now <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.grid2}>
                {['Build up arm — ramp-up from time off','Velocity development — add mph','In-season maintenance — stay healthy','Bullpen development — improve on mound'].map(v => <Radio key={v} name="goal" value={v} label={v} selected={form.goal===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>When is your first game / season start? <span style={{ color: '#e03d2d' }}>*</span></div>
              <div style={s.hint}>This drives how many weeks you have for each phase.</div>
              <div style={s.grid2}>
                {['Less than 3 weeks away','3–5 weeks away','6–8 weeks away','9–12 weeks away','3–4 months away','No season / training only'].map(v => <Radio key={v} name="gameDate" value={v} label={v} selected={form.gameDate===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Games per week during your season?</div>
              <div style={s.grid3}>
                {['1 game/week','2 games/week','3+ games/week','Tournament weekends','Varies / no season'].map(v => <Radio key={v} name="gamesPerWeek" value={v} label={v} selected={form.gamesPerWeek===v} onSelect={setR} />)}
              </div>
            </div>

            <div style={s.qitem}>
              <div style={s.fieldLabel}>Anything else we should know?</div>
              <textarea placeholder="Personal goals, concerns, previous program frustrations..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...s.textarea, minHeight: '100px' }} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={s.submitArea}>
          <button type="button" onClick={() => setSubmitted(true)} style={s.submitBtn}>
            Submit &amp; Build My Program
          </button>
          <p style={s.submitNote}>Your answers are saved to your profile and used to generate your first week.</p>
        </div>

      </div>
    </div>
  );
}

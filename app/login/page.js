'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const s = {
  page: { minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' },
  card: { width: '100%', maxWidth: '380px', backgroundColor: '#0d0d0d', border: '1px solid #222', borderRadius: '12px', padding: '32px' },
  logo: { fontSize: '20px', fontWeight: 900, letterSpacing: '0.08em', color: '#e03d2d', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '6px' },
  subtitle: { fontSize: '13px', color: '#666', marginBottom: '24px' },
  label: { fontSize: '13px', fontWeight: 500, color: '#ddd', marginBottom: '6px', display: 'block' },
  input: { width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' },
  button: { width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  toggle: { fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '18px' },
  toggleLink: { color: '#3b82f6', cursor: 'pointer', fontWeight: 600 },
  error: { fontSize: '12px', color: '#ef4444', backgroundColor: '#2b0d0d', border: '1px solid #ef444433', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px' },
  info: { fontSize: '12px', color: '#22c55e', backgroundColor: '#0d2b1a', border: '1px solid #22c55e33', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px' },
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      // If email confirmation is on, there's no session yet — tell the user to check inbox.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/onboarding');
      } else {
        setInfo('Account created — check your email to confirm, then sign in.');
        setMode('signin');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push('/');
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>PX</div>
        <div style={s.title}>{mode === 'signin' ? 'Sign in' : 'Create your account'}</div>
        <div style={s.subtitle}>
          {mode === 'signin' ? 'Welcome back — log in to see your program.' : 'Set up your login, then we\'ll build your athlete profile.'}
        </div>

        {error && <div style={s.error}>{error}</div>}
        {info && <div style={s.info}>{info}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={s.input}
            placeholder="you@example.com"
          />

          <label style={s.label}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={s.input}
            placeholder="At least 6 characters"
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.button, ...(loading ? s.buttonDisabled : {}) }}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={s.toggle}>
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <span style={s.toggleLink} onClick={() => { setMode('signup'); setError(''); setInfo(''); }}>Sign up</span>
            </>
          ) : (
            <>Already have an account?{' '}
              <span style={s.toggleLink} onClick={() => { setMode('signin'); setError(''); setInfo(''); }}>Sign in</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
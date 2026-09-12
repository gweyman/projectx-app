'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : signInError.message
      );
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '0.08em', color: '#e03d2d', marginBottom: '8px' }}>PX</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Log in to your program</div>
        </div>

        <form onSubmit={handleSubmit} style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '28px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '6px' }}>Email</div>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '6px' }}>Password</div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: '#2b0d0d', border: '1px solid #5a1a1a', borderRadius: '6px', fontSize: '12px', color: '#ef4444' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', backgroundColor: '#e03d2d', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#444', marginTop: '20px' }}>
          Don&apos;t have an account? <Link href="/login" style={{ color: '#e03d2d' }}>Get started</Link>
        </p>
      </div>
    </div>
  );
}

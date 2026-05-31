import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', backgroundColor: '#0a0a0a' }}>
      <h1 style={{ fontSize: '96px', lineHeight: 1, letterSpacing: '0.08em', color: '#e03d2d', fontWeight: 900, marginBottom: '8px' }}>
        PROJECT X
      </h1>
      <p style={{ color: '#666', fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '64px' }}>
        Arm Development · Intelligently Programmed
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
        <Link href="/onboarding" style={{ display: 'block', padding: '16px', textAlign: 'center', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, backgroundColor: '#e03d2d', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
          Get Started
        </Link>
        <Link href="/onboarding" style={{ display: 'block', padding: '16px', textAlign: 'center', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, border: '1px solid #333', color: '#666', borderRadius: '6px', textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>
    </main>
  );
}

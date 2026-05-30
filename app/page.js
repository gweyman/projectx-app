import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Logo / wordmark */}
      <h1
        className="text-[96px] leading-none tracking-widest mb-2"
        style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#D94F3D' }}
      >
        PROJECT X
      </h1>
      <p className="text-brand-muted text-sm tracking-[0.3em] uppercase mb-16">
        Arm Development · Intelligently Programmed
      </p>

      {/* CTA */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/onboarding"
          className="block w-full py-4 text-center text-sm tracking-widest uppercase font-semibold bg-brand-red hover:bg-brand-red_dim transition-colors rounded"
        >
          Get Started
        </Link>
        <Link
          href="/auth"
          className="block w-full py-4 text-center text-sm tracking-widest uppercase font-semibold border border-brand-border hover:border-brand-muted transition-colors rounded text-brand-muted"
        >
          Sign In
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-16 text-xs text-brand-muted">
        Built for athletes. Driven by data.
      </p>
    </main>
  );
}

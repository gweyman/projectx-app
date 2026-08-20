'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/session', label: 'Session' },
  { href: '/report', label: 'Report' },
  { href: '/calendar', label: 'Calendar' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1f1f1f', backgroundColor: '#1e1e1e' }}>
      <Link href="/dashboard" style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.08em', color: '#2563eb', textDecoration: 'none' }}>PX</Link>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {LINKS.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '12px',
                letterSpacing: '0.05em',
                textDecoration: 'none',
                color: active ? '#2563eb' : '#6b6b6b',
                fontWeight: active ? 700 : 400,
              }}
            >
              {link.label.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
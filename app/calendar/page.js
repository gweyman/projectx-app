import NavBar from '../components/NavBar';

export default function CalendarPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', fontFamily: 'system-ui, sans-serif', color: '#f2f2f2' }}>
      <NavBar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '12px' }}>Coming Soon</div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#f2f2f2', marginBottom: '12px' }}>Calendar</h1>
        <p style={{ fontSize: '14px', color: '#a3a3a3', lineHeight: 1.6 }}>
          Your full program calendar — game dates, blocked days, weekly sequences — will live here once the scheduling engine is wired to real data.
        </p>
      </div>
    </div>
  );
}
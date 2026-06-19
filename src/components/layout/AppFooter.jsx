/**
 * AppFooter — site-wide footer strip.
 */
export default function AppFooter() {
  return (
    <footer style={{
      background: '#070c08',
      borderTop: '1px solid var(--border-light)',
      padding: '1.5rem 0',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: 'var(--text-muted)'
    }}>
      <div className="container" style={{ padding: 0 }}>
        <p>© 2026 EcoTrack. Designed for Nature-Conscious Lifestyles. All data strictly saved client-side.</p>
      </div>
    </footer>
  );
}

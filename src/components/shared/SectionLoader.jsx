/**
 * SectionLoader — Suspense fallback for lazy-loaded route sections.
 * Displays an animated spinner with an accessible label.
 */
export default function SectionLoader() {
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <div
        role="status"
        aria-label="Loading section"
        style={{
          width: '28px',
          height: '28px',
          border: '2px solid rgba(74,222,128,0.1)',
          borderTopColor: 'var(--accent-leaf)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <span style={{ fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-title)' }}>
        Loading Eco-Metrics...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

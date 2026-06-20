import { Bell } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Toast — premium notification banner.
 * Rendered at fixed position bottom-right.
 * Reads type: 'success' | 'info' | 'error'
 */
export default function Toast({ toast }) {
  if (!toast) return null;

  const iconColor =
    toast.type === 'error' ? 'var(--danger)'
    : toast.type === 'info' ? 'var(--info)'
    : 'var(--accent-leaf)';

  const iconBg =
    toast.type === 'error' ? 'rgba(248,113,113,0.1)'
    : toast.type === 'info' ? 'rgba(56,189,248,0.1)'
    : 'rgba(16,185,129,0.1)';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`toast-premium toast-${toast.type}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        color: 'var(--text-primary)',
        padding: '1rem 1.5rem',
        fontFamily: 'var(--font-title)',
        fontWeight: 500,
        fontSize: '0.9rem',
        animation: 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards'
      }}
    >
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Bell size={13} style={{ fill: 'currentColor' }} />
      </div>
      <span>{toast.message}</span>
    </div>
  );
}

Toast.propTypes = {
  toast: PropTypes.shape({
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'info', 'error']).isRequired
  })
};

import { Leaf, LayoutDashboard, Compass, TrendingUp, Trophy, CloudLightning, RefreshCw, Flame, Award } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAppStore } from '../../store/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { id: 'actions',     label: 'Actions',      Icon: Compass },
  { id: 'analytics',   label: 'Analytics',    Icon: TrendingUp },
  { id: 'leaderboard', label: 'Leaderboard',  Icon: Trophy },
  { id: 'sync',        label: 'Integrations', Icon: CloudLightning },
];

/**
 * AppHeader — sticky navigation bar with logo, nav links, and profile stats.
 * Reads from AppContext — no prop drilling required.
 *
 * @param {{ activeTab: string, onTabChange: Function }} props
 */
export default function AppHeader({ activeTab, onTabChange }) {
  const { streakDays, userLevel, handleReset } = useAppStore();

  return (
    <header style={{
      background: 'rgba(9,15,11,0.85)',
      borderBottom: '1px solid var(--border-light)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'border-color var(--transition-normal)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>

        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          onClick={() => onTabChange('dashboard')}
          role="link"
          aria-label="EcoTrack — go to Dashboard"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onTabChange('dashboard')}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-leaf))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 0 12px var(--primary-glow)'
          }}>
            <Leaf size={20} />
          </div>
          <span style={{
            fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-title)',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg,#fff,var(--accent-leaf))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            EcoTrack
          </span>
        </div>

        {/* Navigation */}
        <nav aria-label="Main Navigation" style={{ display: 'flex', gap: '0.5rem' }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`btn ${activeTab === id ? 'btn-secondary' : ''}`}
              style={{
                padding: '0.5rem 0.75rem',
                background: activeTab === id ? 'rgba(74, 222, 128, 0.06)' : 'transparent',
                border: '1px solid ' + (activeTab === id ? 'rgba(74, 222, 128, 0.2)' : 'transparent'),
                color: activeTab === id ? 'var(--accent-leaf)' : 'var(--text-muted)',
                borderRadius: '12px',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                boxShadow: activeTab === id ? '0 0 15px rgba(74, 222, 128, 0.08)' : 'none'
              }}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-label={label}
            >
              <Icon size={16} />
              <span className="nav-text">{label}</span>
            </button>
          ))}
        </nav>

        {/* Profile Quick Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.4rem 0.8rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-light)',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-leaf)' }}>
              <Flame size={14} style={{ fill: 'var(--accent-leaf)' }} />
              <span>{streakDays}d</span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'var(--border-light)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-earth)' }}>
              <Award size={14} />
              <span>Lvl {userLevel}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Reset data"
            aria-label="Reset Onboarding Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>

      </div>

      {/* Responsive nav collapse */}
      <style>{`
        @media (max-width: 768px) {
          .nav-text { display: none; }
          header .container { flex-direction: column; gap: 1rem; }
          nav { width: 100%; justify-content: space-around; }
        }
      `}</style>
    </header>
  );
}

AppHeader.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired
};

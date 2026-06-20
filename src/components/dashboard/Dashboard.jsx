import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Car, GraduationCap, Sprout } from 'lucide-react';
import { handleTiltMove, handleTiltLeave } from '../../utils/tiltHandlers';
import CarbonGauge from './CarbonGauge';
import CategoryBreakdown from './CategoryBreakdown';
import QuickLogger from './QuickLogger';
import QuickWins from './QuickWins';
import ActivityHistory from './ActivityHistory';

const getPersonaIcon = (p) => {
  if (p === 'student') return <GraduationCap size={16} />;
  if (p === 'citizen') return <Car size={16} />;
  return <Sprout size={16} />;
};

/**
 * Dashboard — slim orchestrator.
 * Computes derived values, then delegates every visual section to a focused sub-component.
 */
export default function Dashboard({
  userProfile,
  activities,
  onAddActivity,
  onRemoveActivity,
  actions,
  onCompleteAction,
  co2Saved,
  points
}) {
  // Tilt handlers shared across all tilt-card children
  const handleMouseMove = (e) => handleTiltMove(e, 6);
  const handleMouseLeave = handleTiltLeave;

  // Derived daily metrics
  const todayStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const loggedEmissionsToday = useMemo(() => {
    return activities
      .filter(act => act.date === todayStr && act.category !== 'saving')
      .reduce((sum, act) => sum + act.co2e, 0);
  }, [activities, todayStr]);

  const loggedSavingsToday = useMemo(() => {
    return activities
      .filter(act => act.date === todayStr && act.category === 'saving')
      .reduce((sum, act) => sum + act.co2e, 0);
  }, [activities, todayStr]);

  const currentNetDaily = useMemo(() => {
    const net = userProfile.baseline + loggedEmissionsToday - loggedSavingsToday;
    return parseFloat(Math.max(0, net).toFixed(1));
  }, [userProfile.baseline, loggedEmissionsToday, loggedSavingsToday]);

  const percentOfBaseline = useMemo(() => {
    if (userProfile.baseline === 0) return 0;
    return Math.min(100, Math.round((currentNetDaily / userProfile.baseline) * 100));
  }, [currentNetDaily, userProfile.baseline]);

  const featuredQuickWins = useMemo(() =>
    actions.filter(act => !act.completed && act.type === 'quick').slice(0, 2),
  [actions]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <section className="hero-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }} aria-labelledby="welcome-heading">
        <div style={{ flex: '1 1 350px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.8rem', background: 'rgba(223,173,108,0.15)',
            border: '1px solid rgba(223,173,108,0.3)', color: 'var(--accent-earth)',
            padding: '0.25rem 0.6rem', borderRadius: '12px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {getPersonaIcon(userProfile.persona)}
            <span>{userProfile.persona} Mode</span>
          </span>
          <h1 id="welcome-heading" style={{ fontSize: '2.2rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Welcome back, {userProfile.userName}!
          </h1>
          <p style={{ color: 'var(--text-primary)', opacity: 0.85, lineHeight: '1.5', maxWidth: '480px', fontSize: '0.9rem' }}>
            Your baseline footprint is <strong style={{ color: 'var(--text-primary)' }}>{userProfile.baseline} kg CO2e / day</strong>. Let's record your daily efforts and unlock new badges!
          </p>
        </div>

        {/* Summary Metric Cards */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', textAlign: 'center', minWidth: '120px' }}>
            <div style={{ color: 'var(--text-primary)', opacity: 0.7, fontSize: '0.75rem', textTransform: 'uppercase' }}>Saved This Month</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-leaf)', marginTop: '0.25rem' }}>
              {co2Saved} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kg CO₂</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-earth)', marginTop: '0.25rem' }}>
              ≈ {(co2Saved / 21).toFixed(1)} trees / yr offset
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', textAlign: 'center', minWidth: '120px' }}>
            <div style={{ color: 'var(--text-primary)', opacity: 0.7, fontSize: '0.75rem', textTransform: 'uppercase' }}>Eco Points</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-earth)', marginTop: '0.25rem' }}>
              {points} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>pts</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', opacity: 0.75, marginTop: '0.25rem' }}>
              Level {Math.floor(points / 100) + 1}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid-cols-2 stagger-grid">

        {/* Left column: Gauge + Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CarbonGauge
            baseline={userProfile.baseline}
            currentNetDaily={currentNetDaily}
            percentOfBaseline={percentOfBaseline}
            loggedEmissionsToday={loggedEmissionsToday}
            loggedSavingsToday={loggedSavingsToday}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
          />
          <CategoryBreakdown
            baseline={userProfile.baseline}
            breakdown={userProfile.breakdown}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
          />
        </div>

        {/* Right column: Logger + Quick Wins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <QuickLogger
            onAddActivity={onAddActivity}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
          />
          <QuickWins
            featuredQuickWins={featuredQuickWins}
            onCompleteAction={onCompleteAction}
          />
        </div>
      </div>

      {/* ── Activity History ──────────────────────────────────────────────── */}
      <ActivityHistory activities={activities} onRemoveActivity={onRemoveActivity} />
    </div>
  );
}

Dashboard.propTypes = {
  userProfile: PropTypes.shape({
    userName: PropTypes.string.isRequired,
    persona: PropTypes.string.isRequired,
    baseline: PropTypes.number.isRequired,
    breakdown: PropTypes.object.isRequired
  }).isRequired,
  activities: PropTypes.array.isRequired,
  onAddActivity: PropTypes.func.isRequired,
  onRemoveActivity: PropTypes.func.isRequired,
  actions: PropTypes.array.isRequired,
  onCompleteAction: PropTypes.func.isRequired,
  co2Saved: PropTypes.number.isRequired,
  points: PropTypes.number.isRequired
};

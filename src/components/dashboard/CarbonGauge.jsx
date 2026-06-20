import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * CarbonGauge — SVG circular ring gauge showing today's net CO2 index.
 *
 * @param {{ baseline: number, currentNetDaily: number, percentOfBaseline: number,
 *            loggedEmissionsToday: number, loggedSavingsToday: number,
 *            handleMouseMove: Function, handleMouseLeave: Function }} props
 */
function CarbonGauge({
  baseline,
  currentNetDaily,
  percentOfBaseline,
  loggedEmissionsToday,
  loggedSavingsToday,
  handleMouseMove,
  handleMouseLeave
}) {
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentOfBaseline / 100) * circumference;
  const strokeColor = percentOfBaseline > 90 ? 'var(--danger)'
    : percentOfBaseline > 50 ? 'var(--accent-earth)'
    : 'var(--primary)';

  return (
    <div className="tilt-card">
      <div
        className="tilt-card-inner glass-panel"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
      >
        {/* SVG Ring */}
        <div
          className="parallax-gauge"
          style={{ position: 'relative', width: '150px', height: '150px', zIndex: 20 }}
          role="meter"
          aria-valuenow={currentNetDaily}
          aria-valuemin={0}
          aria-valuemax={Math.max(100, baseline * 2)}
          aria-label="Today's Carbon Index Gauge"
          aria-valuetext={`${currentNetDaily} kg CO2e per day, which is ${percentOfBaseline}% of your onboarding baseline`}
        >
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
            <circle cx="75" cy="75" r={radius} stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} fill="transparent" />
            <circle
              cx="75" cy="75" r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="animate-draw-circle"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          {/* Accessible live readout in the centre of the ring */}
          <div
            aria-live="polite"
            aria-atomic="true"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
          >
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>
              {currentNetDaily}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-primary)', opacity: 0.65, textTransform: 'uppercase' }}>
              kg / day
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="parallax-text" style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 20 }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Today's Carbon Index</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', opacity: 0.75, lineHeight: '1.4' }}>
            Currently at <strong style={{ color: strokeColor }}>{percentOfBaseline}%</strong> of your onboarding baseline.
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { label: 'Onboarding Baseline:', val: `${baseline} kg`, color: 'var(--text-primary)' },
              { label: 'Logged Today:', val: `+${loggedEmissionsToday} kg`, color: 'var(--danger)' },
              { label: 'Mitigated Today:', val: `-${loggedSavingsToday} kg`, color: 'var(--accent-leaf)' }
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-primary)', opacity: 0.7 }}>{label}</span>
                <span style={{ fontWeight: 600, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

CarbonGauge.propTypes = {
  baseline: PropTypes.number.isRequired,
  currentNetDaily: PropTypes.number.isRequired,
  percentOfBaseline: PropTypes.number.isRequired,
  loggedEmissionsToday: PropTypes.number.isRequired,
  loggedSavingsToday: PropTypes.number.isRequired,
  handleMouseMove: PropTypes.func.isRequired,
  handleMouseLeave: PropTypes.func.isRequired
};

export default memo(CarbonGauge);

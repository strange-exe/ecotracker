import { memo } from 'react';
import { Car, Leaf, Home, Trash2, TrendingDown } from 'lucide-react';

const CATEGORIES = [
  { key: 'transport', label: 'Transport & Travel',  Icon: Car,    color: '#38bdf8' },
  { key: 'diet',      label: 'Diet & Food',         Icon: Leaf,   color: '#fbbf24' },
  { key: 'energy',    label: 'Home Energy',         Icon: Home,   color: '#10b981' },
  { key: 'waste',     label: 'Waste & Landfill',    Icon: Trash2, color: '#dfad6c' },
];

/**
 * CategoryBreakdown — horizontal bar chart showing baseline CO2 share per category.
 *
 * @param {{ baseline: number, breakdown: { transport, diet, energy, waste },
 *            handleMouseMove: Function, handleMouseLeave: Function }} props
 */
function CategoryBreakdown({ baseline, breakdown, handleMouseMove, handleMouseLeave }) {
  return (
    <div className="tilt-card">
      <div
        className="tilt-card-inner glass-panel"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
      >
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 20, position: 'relative' }}>
          <TrendingDown size={18} style={{ color: 'var(--accent-leaf)' }} /> Category Baseline Shares
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 20, position: 'relative' }}>
          {CATEGORIES.map(({ key, label, Icon, color }) => {
            const value = breakdown?.[key] ?? 0;
            const pct = baseline > 0 ? Math.min(100, (value / baseline) * 100) : 0;
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', opacity: 0.85 }}>
                    <Icon size={14} style={{ color }} /> {label}
                  </span>
                  <span style={{ fontWeight: 600 }}>{value} kg CO2</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', height: '6px', borderRadius: '3px' }}>
                  <div className="animate-grow-width" style={{ background: color, height: '100%', borderRadius: '3px', width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(CategoryBreakdown);

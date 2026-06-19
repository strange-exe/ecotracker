import { Trash2, ArrowLeft, Activity } from 'lucide-react';
import { handleTiltMove, handleTiltLeave } from '../../../utils/tiltHandlers';

const HABITS = [
  {
    value: 'none',
    title: 'Throw Everything Away (No Sorting)',
    desc: 'All waste, food, and containers end up in one standard garbage bin.',
    activeBg: 'rgba(239,68,68,0.05)',
    activeBorder: 'var(--danger)'
  },
  {
    value: 'partial_recycling',
    title: 'Moderate Recycling',
    desc: 'Sort cardboards, plastic bottles, and glass. Food wastes go to trash.',
    activeBg: 'rgba(74,222,128,0.05)',
    activeBorder: 'var(--accent-leaf)'
  },
  {
    value: 'full_recycling',
    title: 'Zero-Waste Conscious / Composting',
    desc: 'Separate organic kitchen scraps for composting. Minimise plastic packaging.',
    activeBg: 'rgba(16,185,129,0.08)',
    activeBorder: 'var(--primary)'
  }
];

/**
 * StepWaste — Step 5 of onboarding (final data-collection step).
 * Collects recycling/waste habits. Triggers calculation on submit.
 */
export default function StepWaste({ recyclingHabit, setRecyclingHabit, onCalculate, onBack, calculating }) {
  const handleMouseMove = (e) => handleTiltMove(e, 5);
  const handleMouseLeave = handleTiltLeave;

  return (
    <section className="animate-fade-in" aria-labelledby="step5-title">
      <h2 id="step5-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Trash2 style={{ color: 'var(--accent-leaf)' }} /> Waste &amp; Recycling
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        How much trash is diverted from local landfills through your sorting routines?
      </p>

      <div className="form-group">
        <span className="form-label">Select your typical waste habits</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {HABITS.map(({ value, title, desc, activeBg, activeBorder }) => (
            <div key={value} className="tilt-card" style={{ display: 'flex' }}>
              <button
                type="button"
                onClick={() => setRecyclingHabit(value)}
                className="tilt-card-inner"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  padding: '1rem',
                  textAlign: 'left',
                  width: '100%',
                  background: recyclingHabit === value ? activeBg : 'rgba(255,255,255,0.02)',
                  border: recyclingHabit === value ? `2px solid ${activeBorder}` : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <h4 className="parallax-text" style={{ fontSize: '0.95rem' }}>{title}</h4>
                <p className="parallax-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{desc}</p>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button onClick={onBack} className="btn btn-secondary btn-premium-bounce">
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={onCalculate}
          className="btn btn-primary btn-premium-bounce"
          disabled={calculating}
        >
          {calculating ? 'Analysing data...' : 'Calculate Footprint'} <Activity size={18} />
        </button>
      </div>
    </section>
  );
}


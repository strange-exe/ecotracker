import { Leaf, ArrowLeft, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';
import { handleTiltMove, handleTiltLeave } from '../../../utils/tiltHandlers';

const DIET_OPTIONS = [
  {
    value: 'meat_heavy',
    title: 'Meat-Centric (High Impact)',
    desc: 'Red meat, pork, or poultry at most meals. High protein, high carbon.',
    borderStyle: 'border-bad',
    selectedBg: 'rgba(239,68,68,0.05)'
  },
  {
    value: 'balanced',
    title: 'Balanced Diet (Average)',
    desc: 'Mix of meat, fish, dairy, vegetables, and plant-based meals.',
    borderStyle: '',
    selectedBg: 'rgba(255,255,255,0.04)'
  },
  {
    value: 'vegetarian',
    title: 'Vegetarian (Low Impact)',
    desc: 'No meat but includes eggs, dairy, and plant protein.',
    borderStyle: '',
    selectedBg: 'rgba(74,222,128,0.05)'
  },
  {
    value: 'vegan',
    title: 'Vegan / Plant-Based (Lowest)',
    desc: 'Strictly plant-based. Legumes, nuts, grains, and vegetables only.',
    borderStyle: '',
    selectedBg: 'rgba(16,185,129,0.08)'
  }
];

/**
 * StepDiet — Step 3 of onboarding.
 * Collects the user's dietary pattern via card selection.
 *
 * @param {Object} props
 * @param {string} props.dietType - Active diet category code.
 * @param {Function} props.setDietType - Callback to change diet category.
 * @param {Function} props.onNext - Transition to next wizard card.
 * @param {Function} props.onBack - Transition to previous wizard card.
 */
export default function StepDiet({ dietType, setDietType, onNext, onBack }) {
  const handleMouseMove = (e) => handleTiltMove(e, 5);
  const handleMouseLeave = handleTiltLeave;

  return (
    <section className="animate-fade-in" aria-labelledby="step3-title">
      <h2 id="step3-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Leaf style={{ color: 'var(--accent-leaf)' }} /> Diet &amp; Food Habits
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Diet accounts for 20–30% of the average consumer footprint. What you eat matters enormously.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {DIET_OPTIONS.map(({ value, title, desc, selectedBg }) => (
          <div key={value} className="tilt-card" style={{ display: 'flex' }}>
            <button
              type="button"
              onClick={() => setDietType(value)}
              className="tilt-card-inner"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                padding: '1.25rem',
                textAlign: 'left',
                width: '100%',
                background: dietType === value ? selectedBg : 'rgba(255,255,255,0.02)',
                border: dietType === value ? '2px solid var(--accent-leaf)' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <h4 className="parallax-text" style={{ fontSize: '0.95rem' }}>{title}</h4>
              <p className="parallax-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{desc}</p>
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button onClick={onBack} className="btn btn-secondary btn-premium-bounce">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={onNext} className="btn btn-primary btn-premium-bounce">
          Next <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

StepDiet.propTypes = {
  dietType: PropTypes.string.isRequired,
  setDietType: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};


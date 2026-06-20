import { ArrowRight, GraduationCap, User, Sprout } from 'lucide-react';
import PropTypes from 'prop-types';
import { handleTiltMove, handleTiltLeave } from '../../../utils/tiltHandlers';

/**
 * StepPersona — Step 1 of onboarding.
 * Collects user name and selects a lifestyle preset.
 *
 * @param {Object} props
 * @param {string} props.name - User's name state.
 * @param {Function} props.setName - Callback to update name.
 * @param {string} props.persona - Selected preset lifestyle ID.
 * @param {Function} props.onApplyPersona - Callback to apply a lifestyle baseline preset.
 * @param {Function} props.onNext - Callback to transition to the next step.
 */
export default function StepPersona({ name, setName, persona, onApplyPersona, onNext }) {
  const PRESETS = [
    {
      id: 'student',
      label: 'Student',
      desc: 'Uses public transit, lives in shared apartment, vegetarian diet.',
      Icon: GraduationCap,
      iconStyle: { background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }
    },
    {
      id: 'citizen',
      label: 'Average Citizen',
      desc: 'Commutes by car, lives in a medium house, balanced meat diet.',
      Icon: User,
      iconStyle: { background: 'rgba(223,173,108,0.1)', color: 'var(--accent-earth)' }
    },
    {
      id: 'champion',
      label: 'Eco Champion',
      desc: 'Electric car / cyclist, solar panels, strict plant-based vegan diet.',
      Icon: Sprout,
      iconStyle: { background: 'rgba(16,185,129,0.15)', color: 'var(--primary)' }
    }
  ];

  const handleMouseMove = (e) => handleTiltMove(e, 6);
  const handleMouseLeave = handleTiltLeave;

  const handleNext = () => {
    if (!name.trim()) {
      alert('Please enter your name to begin your journey.');
      return;
    }
    onNext();
  };


  return (
    <section className="animate-fade-in" aria-labelledby="step1-title">
      <h1 id="step1-title" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Welcome to <span style={{ color: 'var(--accent-leaf)' }}>EcoTrack</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
        Let's build your personalized carbon profile. Tell us your name and pick a preset lifestyle that best mirrors your habits.
      </p>

      <div className="form-group">
        <label htmlFor="user-name" className="form-label">What should we call you?</label>
        <input
          id="user-name" type="text" className="form-input"
          placeholder="e.g. Abhinesh"
          value={name}
          onChange={(e) => setName(e.target.value.substring(0, 30))}
          required
        />
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <span className="form-label">Choose a starting baseline profile</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {PRESETS.map(({ id, label, desc, Icon, iconStyle }) => (
            <div key={id} className="tilt-card">
              <button
                type="button"
                onClick={() => onApplyPersona(id)}
                className="tilt-card-inner"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem',
                  textAlign: 'left', width: '100%', cursor: 'pointer',
                  background: persona === id ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)',
                  border: persona === id ? '2px solid var(--accent-leaf)' : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                <div className="parallax-badge" style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...iconStyle }}>
                  <Icon size={24} />
                </div>
                <div className="parallax-text" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', color: persona === id ? 'var(--accent-leaf)' : 'var(--text-primary)' }}>{label}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{desc}</p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
        <button onClick={handleNext} className="btn btn-primary btn-premium-bounce">
          Let's Go <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

StepPersona.propTypes = {
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  persona: PropTypes.string.isRequired,
  onApplyPersona: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

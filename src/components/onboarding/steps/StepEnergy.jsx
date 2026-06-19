import { Home, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * StepEnergy — Step 4 of onboarding.
 * Collects home size, monthly energy bill, and green energy status.
 */
export default function StepEnergy({
  homeSize, setHomeSize,
  monthlyEnergyBill, setMonthlyEnergyBill,
  isGreenEnergy, setIsGreenEnergy,
  onNext, onBack
}) {
  const handleSwitchKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsGreenEnergy(prev => !prev);
    }
  };

  return (
    <section className="animate-fade-in" aria-labelledby="step4-title">
      <h2 id="step4-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Home style={{ color: 'var(--accent-leaf)' }} /> Home Energy
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Home heating, cooling, and electricity usage generates a significant portion of personal emissions.
      </p>

      <div className="form-group">
        <label htmlFor="home-size" className="form-label">Home or living situation</label>
        <select id="home-size" className="form-select" value={homeSize} onChange={(e) => setHomeSize(e.target.value)}>
          <option value="small">Small Apartment / Shared Room</option>
          <option value="medium">Medium Townhouse / Small House</option>
          <option value="large">Large Single-Family Home</option>
        </select>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label htmlFor="energy-bill" className="form-label">
          <span>Average monthly electricity/heating bill</span>
          <span style={{ color: 'var(--accent-leaf)', fontWeight: 600 }}>${monthlyEnergyBill} / month</span>
        </label>
        <div className="slider-container">
          <input
            id="energy-bill" type="range" min="20" max="300" step="10"
            className="form-slider" value={monthlyEnergyBill}
            onChange={(e) => setMonthlyEnergyBill(parseInt(e.target.value))}
            aria-valuemin="20" aria-valuemax="300"
            aria-valuenow={monthlyEnergyBill}
            aria-valuetext={`Average energy bill ${monthlyEnergyBill} dollars monthly`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>$20</span><span>$150 (Avg)</span><span>$300+</span>
          </div>
        </div>
      </div>

      {/* Toggle Switch */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)', marginTop: '2rem'
      }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Green Electricity Plan</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Are your utilities backed by verified solar, wind, or hydro credits?
          </p>
        </div>
        {/* WCAG 4.1.2: role=checkbox with keyboard support */}
        <button
          type="button"
          onClick={() => setIsGreenEnergy(prev => !prev)}
          onKeyDown={handleSwitchKeyDown}
          role="checkbox"
          aria-checked={isGreenEnergy}
          tabIndex={0}
          aria-label="Green Electricity Plan Toggle"
          style={{
            width: '50px', height: '26px', borderRadius: '13px',
            background: isGreenEnergy ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
            position: 'relative', border: 'none', cursor: 'pointer',
            transition: 'background-color 0.2s', padding: 0
          }}
        >
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
            position: 'absolute', top: '3px',
            left: isGreenEnergy ? '27px' : '3px',
            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', pointerEvents: 'none'
          }} />
        </button>
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

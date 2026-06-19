import { CheckCircle, Smile } from 'lucide-react';
import { handleTiltMove, handleTiltLeave } from '../../../utils/tiltHandlers';
import { dailyKgToAnnualTons } from '../../../domain/carbonCalculator';

/**
 * Determines which breakdown category has the largest emission share.
 * @param {{ transport: number, diet: number, energy: number, waste: number }} breakdown
 * @returns {string}
 */
const getPrimaryDriver = (breakdown) => {
  return Object.entries(breakdown).reduce(
    (max, [key, val]) => (val > breakdown[max] ? key : max),
    'transport'
  );
};

const DRIVER_INFO = {
  transport: {
    title: 'Transportation',
    color: '#38bdf8',
    tip: 'Consider switching one weekly car trip to public transit or cycling. Short trips under 5km have a disproportionately large per-km footprint.'
  },
  diet: {
    title: 'Diet & Eating Habits',
    color: '#fbbf24',
    tip: 'Even replacing one or two meat-heavy meals per week with vegetarian options reduces your footprint significantly.'
  },
  energy: {
    title: 'Home Energy Use',
    color: '#10b981',
    tip: 'Lowering your thermostat by 1–2°C and switching to LED lighting are the two quickest home wins.'
  },
  waste: {
    title: 'Waste & Landfill',
    color: '#dfad6c',
    tip: 'Starting a small compost bin for food scraps and consistently separating recyclables can halve your waste emissions.'
  }
};

/**
 * StepResult — Step 6 of onboarding (final result screen).
 * Shows the calculated baseline footprint and personalised recommendation.
 */
export default function StepResult({ result, onFinish }) {
  if (!result) return null;

  const primaryDriver = getPrimaryDriver(result.breakdown);
  const driverInfo = DRIVER_INFO[primaryDriver];

  return (
    <section className="animate-fade-in" style={{ textAlign: 'center' }} aria-labelledby="result-title">

      {/* Success Icon */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(74,222,128,0.1)', color: 'var(--accent-leaf)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem auto',
        border: '2px solid var(--accent-leaf)',
        boxShadow: '0 0 20px rgba(74,222,128,0.2)'
      }}>
        <CheckCircle size={40} />
      </div>

      <h1 id="result-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        Carbon Analysis Prepared!
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Hey {result.name}, based on your onboarding answers, here is your daily baseline:
      </p>

      {/* 3D Tilt Result Card */}
      <div
        className="tilt-card"
        style={{ marginBottom: '2rem' }}
      >
        <div
          className="tilt-card-inner animate-pulse-glow"
          onMouseMove={(e) => handleTiltMove(e, 8)}
          onMouseLeave={handleTiltLeave}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
            position: 'relative', overflow: 'hidden'
          }}
        >
          <div
            aria-live="polite"
            style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-leaf)', fontFamily: 'var(--font-title)', position: 'relative', zIndex: 20 }}
          >
            {result.totalDailyKg} <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-primary)' }}>kg CO2e / day</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--accent-earth)', marginTop: '0.5rem', fontWeight: 600, position: 'relative', zIndex: 20 }}>
            Equivalent to {dailyKgToAnnualTons(result.totalDailyKg)} tons of CO2 per year
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '0.5rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', position: 'relative', zIndex: 20 }}>
            {[
              { label: 'Transport', val: result.breakdown.transport, color: '#38bdf8' },
              { label: 'Diet', val: result.breakdown.diet, color: '#fbbf24' },
              { label: 'Home Energy', val: result.breakdown.energy, color: '#10b981' },
              { label: 'Waste', val: result.breakdown.waste, color: '#dfad6c' }
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</div>
                <div style={{ fontWeight: 600, color, marginTop: '0.25rem' }}>{val} kg</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Driver Recommendation */}
      <div style={{
        textAlign: 'left', padding: '1.25rem',
        background: 'rgba(255,255,255,0.01)',
        borderLeft: `4px solid ${driverInfo.color}`,
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        marginBottom: '2.5rem'
      }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: driverInfo.color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Smile size={16} /> Largest Driver: {driverInfo.title}
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>
          {driverInfo.tip}
        </p>
      </div>

      <button onClick={onFinish} className="btn btn-earth btn-premium-bounce" style={{ width: '100%', padding: '1rem' }}>
        Activate Dashboard <Smile size={18} />
      </button>
    </section>
  );
}

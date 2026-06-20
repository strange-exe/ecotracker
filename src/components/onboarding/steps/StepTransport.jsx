import { Car, ArrowLeft, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * StepTransport — Step 2 of onboarding.
 * Collects commute mode, weekly distance, and annual flights.
 *
 * @param {Object} props
 * @param {string} props.commuteMode - Selected commute travel type.
 * @param {Function} props.setCommuteMode - Callback to update commute type.
 * @param {number} props.commuteDistance - Weekly commute distance in km.
 * @param {Function} props.setCommuteDistance - Callback to update commute distance.
 * @param {number} props.flightsPerYear - Number of flights taken annually.
 * @param {Function} props.setFlightsPerYear - Callback to update annual flights.
 * @param {Function} props.onNext - Transition to next wizard card.
 * @param {Function} props.onBack - Transition to previous wizard card.
 */
export default function StepTransport({
  commuteMode, setCommuteMode,
  commuteDistance, setCommuteDistance,
  flightsPerYear, setFlightsPerYear,
  onNext, onBack
}) {
  return (
    <section className="animate-fade-in" aria-labelledby="step2-title">
      <h2 id="step2-title" style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Car style={{ color: 'var(--accent-leaf)' }} /> Transport &amp; Travel
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Transportation is often the single biggest contributor to a personal footprint.
      </p>

      <div className="form-group">
        <label htmlFor="commute-mode" className="form-label">How do you primarily travel?</label>
        <select id="commute-mode" className="form-select" value={commuteMode} onChange={(e) => setCommuteMode(e.target.value)}>
          <option value="petrol_car">Gasoline / Petrol Car</option>
          <option value="diesel_car">Diesel Car</option>
          <option value="hybrid_car">Hybrid Car</option>
          <option value="electric_car">Electric Vehicle (EV)</option>
          <option value="bus">Public Bus</option>
          <option value="train">Train / Metro Transit</option>
          <option value="active">Walking or Bicycling (Zero Emission)</option>
        </select>
      </div>

      {commuteMode !== 'active' && (
        <div className="form-group">
          <label htmlFor="commute-dist" className="form-label">
            <span>Weekly commute distance</span>
            <span style={{ color: 'var(--accent-leaf)', fontWeight: 600 }}>{commuteDistance} km / week</span>
          </label>
          <div className="slider-container">
            <input
              id="commute-dist" type="range" min="0" max="500" step="10"
              className="form-slider" value={commuteDistance}
              onChange={(e) => setCommuteDistance(parseInt(e.target.value))}
              aria-valuemin="0" aria-valuemax="500"
              aria-valuenow={commuteDistance}
              aria-valuetext={`${commuteDistance} kilometers per week`}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>0 km</span><span>250 km (Avg)</span><span>500 km</span>
            </div>
          </div>
        </div>
      )}

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label htmlFor="flights-year" className="form-label">
          <span>Flights taken per year</span>
          <span style={{ color: 'var(--accent-leaf)', fontWeight: 600 }}>{flightsPerYear} flights</span>
        </label>
        <div className="slider-container">
          <input
            id="flights-year" type="range" min="0" max="15" step="1"
            className="form-slider" value={flightsPerYear}
            onChange={(e) => setFlightsPerYear(parseInt(e.target.value))}
            aria-valuemin="0" aria-valuemax="15"
            aria-valuenow={flightsPerYear}
            aria-valuetext={`${flightsPerYear} flights per year`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>0 (None)</span><span>5 flights</span><span>15 (Frequent)</span>
          </div>
        </div>
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

StepTransport.propTypes = {
  commuteMode: PropTypes.string.isRequired,
  setCommuteMode: PropTypes.func.isRequired,
  commuteDistance: PropTypes.number.isRequired,
  setCommuteDistance: PropTypes.func.isRequired,
  flightsPerYear: PropTypes.number.isRequired,
  setFlightsPerYear: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

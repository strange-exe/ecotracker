import { useState } from 'react';
import PropTypes from 'prop-types';
import { Plus, Leaf, Egg, Utensils, Beef, Info } from 'lucide-react';
import { calculateLoggedActivity } from '../../domain/carbonCalculator';

/**
 * QuickLogger — tabbed panel for logging transport, diet, and energy activities.
 *
 * @param {{ onAddActivity: Function, handleMouseMove: Function, handleMouseLeave: Function }} props
 */
export default function QuickLogger({ onAddActivity, handleMouseMove, handleMouseLeave }) {
  const [logTab, setLogTab] = useState('transport');
  const [transitMode, setTransitMode] = useState('bus');
  const [transitKm, setTransitKm] = useState('10');
  const [isReplacingCar, setIsReplacingCar] = useState(true);
  const [kwhSaved, setKwhSaved] = useState('5');

  const handleLogCommute = (e) => {
    e.preventDefault();
    const km = parseFloat(transitKm);
    if (isNaN(km) || km <= 0) return;

    if (isReplacingCar && transitMode !== 'petrol_car') {
      const carEmissions = km * 0.21;
      const transitEmissions = calculateLoggedActivity('transport', transitMode, km);
      const savings = parseFloat(Math.max(0, carEmissions - transitEmissions).toFixed(2));
      onAddActivity({
        category: 'saving', type: transitMode, amount: km, co2e: savings,
        label: `Bypassed driving: took ${transitMode === 'active' ? 'bike/walk' : transitMode} for ${km}km`
      });
    } else {
      const emissions = calculateLoggedActivity('transport', transitMode, km);
      onAddActivity({
        category: 'transport', type: transitMode, amount: km, co2e: emissions,
        label: `Commuted via ${transitMode} (${km}km)`
      });
    }
    setTransitKm('10');
  };

  const handleLogDiet = (type, labelName) => {
    if (type === 'vegan') {
      onAddActivity({ category: 'saving', type: 'diet_vegan', amount: 1, co2e: 1.0, label: 'Ate a green vegan meal' });
    } else if (type === 'vegetarian') {
      onAddActivity({ category: 'saving', type: 'diet_vegetarian', amount: 1, co2e: 0.6, label: 'Ate a vegetarian meal' });
    } else {
      const emissions = calculateLoggedActivity('diet', type, 1);
      onAddActivity({ category: 'diet', type, amount: 1, co2e: emissions, label: `Logged a ${labelName} meal` });
    }
  };

  const handleLogEnergy = (e) => {
    e.preventDefault();
    const kwh = parseFloat(kwhSaved);
    if (isNaN(kwh) || kwh <= 0) return;
    const savedCarbon = parseFloat((kwh * 0.38).toFixed(2));
    onAddActivity({
      category: 'saving', type: 'energy_saving', amount: kwh, co2e: savedCarbon,
      label: `Conserved ${kwh} kWh of electricity`
    });
    setKwhSaved('5');
  };

  const tabStyle = (id) => ({
    flex: 1, padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: '8px',
    border: 'none',
    background: logTab === id ? 'var(--primary)' : 'transparent',
    color: logTab === id ? '#fff' : 'var(--text-primary)',
    opacity: logTab === id ? 1 : 0.65,
    cursor: 'pointer', transition: 'all 0.2s'
  });

  return (
    <div className="tilt-card">
      <div
        className="tilt-card-inner glass-panel"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
      >
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', zIndex: 20, position: 'relative' }}>
          Daily Quick-Logger
        </h3>

        {/* Tabs */}
        <div role="tablist" aria-label="Activity log categories" style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'rgba(10,18,14,0.8)', borderRadius: '10px', marginBottom: '1.5rem', zIndex: 20, position: 'relative' }}>
          {[['transport','Transport'],['diet','Food / Diet'],['energy','Energy Save']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={logTab === id} aria-controls={`log-panel-${id}`} onClick={() => setLogTab(id)} style={tabStyle(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* Transport Panel */}
        {logTab === 'transport' && (
          <form id="log-panel-transport" role="tabpanel" aria-label="Log transport activity" onSubmit={handleLogCommute} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 20, position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="log-transit-mode" className="form-label">Mode</label>
                <select id="log-transit-mode" className="form-select" value={transitMode} onChange={(e) => setTransitMode(e.target.value)}>
                  <option value="petrol_car">Petrol Car</option>
                  <option value="electric_car">Electric Car</option>
                  <option value="bus">Public Bus</option>
                  <option value="train">Train / Metro</option>
                  <option value="active">Bicycle / Walk</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="log-transit-km" className="form-label">Distance (km)</label>
                <input id="log-transit-km" type="number" className="form-input" value={transitKm} onChange={(e) => setTransitKm(e.target.value)} min="1" max="300" />
              </div>
            </div>
            {transitMode !== 'petrol_car' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                <input id="replace-car-chk" type="checkbox" checked={isReplacingCar} onChange={(e) => setIsReplacingCar(e.target.checked)} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                <label htmlFor="replace-car-chk" style={{ fontSize: '0.8rem', color: 'var(--accent-leaf)', cursor: 'pointer' }}>
                  This replaced a standard car drive! (Log savings)
                </label>
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-premium-bounce" style={{ width: '100%' }}>
              <Plus size={16} /> Log Commute
            </button>
          </form>
        )}

        {/* Diet Panel */}
        {logTab === 'diet' && (
          <div id="log-panel-diet" role="tabpanel" aria-label="Log diet and food" style={{ zIndex: 20, position: 'relative' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', opacity: 0.75, marginBottom: '1.25rem' }}>
              Log your latest meal. Vegan/Veg meals generate carbon credits compared to standard meat baseline!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button onClick={() => handleLogDiet('vegan','Vegan')} className="btn btn-secondary btn-premium-bounce" style={{ background: 'rgba(16,185,129,0.08)', gap: '0.4rem', fontSize: '0.85rem' }}>
                <Leaf size={14} style={{ color: 'var(--primary)' }} /> Vegan Meal
              </button>
              <button onClick={() => handleLogDiet('vegetarian','Vegetarian')} className="btn btn-secondary btn-premium-bounce" style={{ background: 'rgba(74,222,128,0.04)', gap: '0.4rem', fontSize: '0.85rem' }}>
                <Egg size={14} style={{ color: 'var(--accent-leaf)' }} /> Vegetarian Meal
              </button>
              <button onClick={() => handleLogDiet('balanced','Balanced')} className="btn btn-secondary btn-premium-bounce" style={{ border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)', opacity: 0.8, gap: '0.4rem', fontSize: '0.85rem' }}>
                <Utensils size={14} /> Balanced Meal
              </button>
              <button onClick={() => handleLogDiet('meat_heavy','Meat Heavy')} className="btn btn-secondary btn-premium-bounce" style={{ border: '1px solid rgba(239,68,68,0.1)', color: 'var(--danger)', gap: '0.4rem', fontSize: '0.85rem' }}>
                <Beef size={14} style={{ color: 'var(--danger)' }} /> Beef / Lamb
              </button>
            </div>
          </div>
        )}

        {/* Energy Panel */}
        {logTab === 'energy' && (
          <form id="log-panel-energy" role="tabpanel" aria-label="Log energy savings" onSubmit={handleLogEnergy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 20, position: 'relative' }}>
            <div className="form-group">
              <label htmlFor="log-energy-kwh" className="form-label">
                <span>Electricity Conserved</span>
                <span style={{ color: 'var(--accent-leaf)', fontWeight: 600 }}>{kwhSaved} kWh</span>
              </label>
              <input
                id="log-energy-kwh" type="range" min="1" max="30" step="1"
                className="form-slider" value={kwhSaved}
                onChange={(e) => setKwhSaved(e.target.value)}
                aria-valuemin="1" aria-valuemax="30"
                aria-valuenow={kwhSaved}
                aria-valuetext={`${kwhSaved} kilowatt-hours conserved`}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-primary)', opacity: 0.7 }}>
                <span>1 kWh (Lightbulbs)</span><span>15 kWh (AC/Dryer)</span><span>30 kWh</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,222,128,0.03)', border: '1px solid rgba(74,222,128,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <Info size={16} style={{ color: 'var(--accent-leaf)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', opacity: 0.75 }}>
                Conserving 5 kWh offsets about 1.9 kg of coal-based utility emissions.
              </span>
            </div>
            <button type="submit" className="btn btn-earth btn-premium-bounce" style={{ width: '100%' }}>
              <Plus size={16} /> Log Electricity Saved
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

QuickLogger.propTypes = {
  onAddActivity: PropTypes.func.isRequired,
  handleMouseMove: PropTypes.func.isRequired,
  handleMouseLeave: PropTypes.func.isRequired
};

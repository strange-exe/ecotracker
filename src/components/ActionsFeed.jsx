import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { handleTiltMove, handleTiltLeave } from '../utils/tiltHandlers';
import { 
  Car, 
  Leaf, 
  Home, 
  Trash2, 
  Check, 
  Sparkles,
  ShieldCheck,
  Search,
  Info
} from 'lucide-react';

/**
 * ActionsFeed — list of all recommended eco-actions with search and category filtering.
 *
 * @param {Object} props
 * @param {Array} props.actions - Full list of climate actions with completion and carbon details.
 * @param {Function} props.onCompleteAction - Callback triggered when completing an action.
 */
export default function ActionsFeed({ actions, onCompleteAction }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3D Tilt handlers
  // 3D Tilt mouse handlers - delegates to shared utility (respects prefers-reduced-motion)
  const handleMouseMove = (e) => handleTiltMove(e, 6);
  const handleMouseLeave = handleTiltLeave;

  // Category Icon Resolver
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'transport':
        return <Car size={18} style={{ color: '#38bdf8' }} />;
      case 'diet':
        return <Leaf size={18} style={{ color: '#fbbf24' }} />;
      case 'energy':
        return <Home size={18} style={{ color: '#10b981' }} />;
      case 'waste':
        return <Trash2 size={18} style={{ color: '#dfad6c' }} />;
      default:
        return <Sparkles size={18} style={{ color: 'var(--accent-leaf)' }} />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'transport': return 'Transport';
      case 'diet': return 'Food & Diet';
      case 'energy': return 'Home Energy';
      case 'waste': return 'Waste & Recycle';
      default: return 'General';
    }
  };

  const filteredActions = useMemo(() => {
    return actions.filter(act => {
      const matchesCategory = categoryFilter === 'all' || act.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || act.difficulty.toLowerCase() === difficultyFilter;
      const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            act.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [actions, categoryFilter, difficultyFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = actions.length;
    const completed = actions.filter(act => act.completed).length;
    const co2SavedTotal = actions.filter(act => act.completed).reduce((sum, act) => sum + act.co2Saved, 0);
    return { total, completed, co2SavedTotal };
  }, [actions]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Personalized Climate Actions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Commit to these simple, daily actions to reduce your ecological footprint. Small habits make a massive combined difference.
        </p>
      </div>

      {/* Progress banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem 2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          borderLeft: '4px solid var(--accent-earth)',
          background: 'rgba(223, 173, 108, 0.03)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Progress</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            Completed {stats.completed} of {stats.total} Recommended Actions
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Offset from Actions</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-leaf)', marginTop: '0.25rem' }}>
            -{stats.co2SavedTotal.toFixed(1)} kg CO2e / day
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search actions..."
            style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search actions"
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button 
            onClick={() => setCategoryFilter('all')} 
            className={`btn ${categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            All Sectors
          </button>
          <button 
            onClick={() => setCategoryFilter('transport')} 
            className={`btn ${categoryFilter === 'transport' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Transport
          </button>
          <button 
            onClick={() => setCategoryFilter('diet')} 
            className={`btn ${categoryFilter === 'diet' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Diet
          </button>
          <button 
            onClick={() => setCategoryFilter('energy')} 
            className={`btn ${categoryFilter === 'energy' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Energy
          </button>
          <button 
            onClick={() => setCategoryFilter('waste')} 
            className={`btn ${categoryFilter === 'waste' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Waste
          </button>
        </div>

        {/* Difficulty Filter */}
        <div>
          <select 
            aria-label="Filter by difficulty"
            className="form-select" 
            style={{ padding: '0.5rem 2.25rem 0.5rem 1rem', fontSize: '0.85rem', width: 'auto' }}
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy wins</option>
            <option value="medium">Medium challenges</option>
          </select>
        </div>

      </div>

      {/* Cards Grid with 3D Tilt Wrapper */}
      {filteredActions.length > 0 ? (
        <div className="grid-cols-3">
          {filteredActions.map(act => (
            <div key={act.id} className="tilt-card" style={{ display: 'flex' }}>
              <article 
                className={`tilt-card-inner glass-panel ${act.completed ? 'completed-card' : ''}`} 
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  border: act.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-light)',
                  background: act.completed ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-card)',
                  boxShadow: act.completed ? '0 4px 12px rgba(16, 185, 129, 0.05)' : 'var(--shadow-md)',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  flex: 1,
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                
                {/* Completed Banner */}
                {act.completed && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    color: 'var(--accent-leaf)',
                    background: 'rgba(74, 222, 128, 0.08)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    zIndex: 20
                  }}>
                    <ShieldCheck size={12} />
                    <span>COMPLETED</span>
                  </div>
                )}

                {/* Icon & Sector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 20, transformStyle: 'preserve-3d' }}>
                  <div className="parallax-badge" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getCategoryIcon(act.category)}
                  </div>
                  <div className="parallax-text">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {getCategoryLabel(act.category)}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="parallax-text" style={{ flex: 1, zIndex: 20 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {act.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {act.description}
                  </p>
                </div>

                {/* Metrics */}
                <div style={{
                  background: 'rgba(0,0,0,0.15)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  alignItems: 'center',
                  zIndex: 20
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>CO2 Offset</span>
                    <span style={{ color: 'var(--accent-leaf)', fontWeight: 700 }}>-{act.co2Saved} kg / day</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Difficulty</span>
                    <span style={{ 
                      fontWeight: 600, 
                      color: act.difficulty === 'Easy' ? 'var(--accent-leaf)' : 'var(--accent-earth)'
                    }}>
                      {act.difficulty}
                    </span>
                  </div>
                </div>

                {/* Health details */}
                <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem', zIndex: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Twin Health Benefit:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{act.healthBenefit.kcal > 0 ? `Burns ${act.healthBenefit.kcal} kcal` : 'Eco Utility'}</span>
                  </div>
                  <p style={{ color: 'var(--accent-earth)', fontSize: '0.7rem', fontStyle: 'italic', marginTop: '0.1rem' }}>
                    "{act.healthBenefit.text}"
                  </p>
                </div>

                {/* Button */}
                <button
                  type="button"
                  onClick={() => onCompleteAction(act.id)}
                  disabled={act.completed}
                  className={`btn ${act.completed ? 'btn-secondary' : 'btn-earth'}`}
                  style={{ width: '100%', padding: '0.6rem', zIndex: 20 }}
                >
                  {act.completed ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Check size={16} /> Completed (+{act.healthBenefit.points} pts)
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      Complete Action (+{act.healthBenefit.points} pts)
                    </span>
                  )}
                </button>

              </article>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Info size={36} style={{ color: 'var(--accent-earth)' }} />
          <span>No action items matching your search or filters. Try clearing your queries!</span>
        </div>
      )}

    </div>
  );
}

ActionsFeed.propTypes = {
  actions: PropTypes.array.isRequired,
  onCompleteAction: PropTypes.func.isRequired
};

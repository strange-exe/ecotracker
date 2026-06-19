import { Check, Zap, Flame } from 'lucide-react';

/**
 * QuickWins — shows up to 2 incomplete "quick" actions the user can complete.
 *
 * @param {{ featuredQuickWins: Array, onCompleteAction: Function }} props
 */
export default function QuickWins({ featuredQuickWins, onCompleteAction }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem' }}>Featured Quick Wins</h3>
      </div>

      {featuredQuickWins.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {featuredQuickWins.map(action => (
            <div
              key={action.id}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(74,222,128,0.1)', color: 'var(--accent-leaf)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                    -{action.co2Saved} kg
                  </span>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{action.title}</h4>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', opacity: 0.75, marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {action.description}
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-earth)', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Zap size={11} style={{ fill: 'currentColor' }} />
                    +{action.healthBenefit.points} pts
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Flame size={11} style={{ fill: 'currentColor' }} />
                    {action.healthBenefit.kcal} kcal
                  </span>
                </div>
              </div>
              <button
                onClick={() => onCompleteAction(action.id)}
                className="btn btn-primary btn-premium-bounce"
                style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', minWidth: 'auto' }}
                aria-label={`Mark completed: ${action.title}`}
              >
                <Check size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', opacity: 0.8, fontSize: '0.85rem', gap: '0.5rem' }}>
          <Check size={24} style={{ color: 'var(--accent-leaf)', background: 'rgba(74,222,128,0.1)', borderRadius: '50%', padding: '4px' }} />
          <span>You&apos;ve completed all featured quick actions! Check the Actions tab for more goals.</span>
        </div>
      )}
    </div>
  );
}

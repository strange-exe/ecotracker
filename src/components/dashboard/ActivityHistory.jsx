import { Calendar, Sprout } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ActivityHistory — table of the 5 most recent logged activities.
 *
 * @param {{ activities: Array, onRemoveActivity: Function }} props
 */
export default function ActivityHistory({ activities, onRemoveActivity }) {
  return (
    <section className="glass-panel" style={{ padding: '1.5rem' }} aria-labelledby="activity-history-title">
      <h3 id="activity-history-title" style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={18} style={{ color: 'var(--accent-leaf)' }} /> Today's Active Efforts
      </h3>

      {activities.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Activity</th>
                <th scope="col">Impact Type</th>
                <th scope="col">CO2 Metric</th>
                <th scope="col" style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activities.slice(0, 5).map(act => (
                <tr key={act.id}>
                  <td>{act.date}</td>
                  <td style={{ fontWeight: 500 }}>{act.label}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
                      background: act.category === 'saving' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.08)',
                      color: act.category === 'saving' ? 'var(--accent-leaf)' : 'var(--danger)',
                      fontWeight: 600
                    }}>
                      {act.category === 'saving' ? 'OFFSET / SAVINGS' : 'EMISSION'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: act.category === 'saving' ? 'var(--accent-leaf)' : 'var(--danger)' }}>
                    {act.category === 'saving' ? '-' : '+'}{act.co2e} kg CO2e
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onRemoveActivity(act.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                      aria-label={`Delete log entry ${act.label}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activities.length > 5 && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-primary)', opacity: 0.7, marginTop: '1rem' }}>
              Showing 5 most recent logs. View full history in the Analytics tab.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', gap: '0.75rem' }}>
          <Sprout size={32} style={{ color: 'var(--accent-leaf)', opacity: 0.8 }} />
          <span>No activities logged yet. Commute green or eat a vegetarian lunch above to start offsetting!</span>
        </div>
      )}
    </section>
  );
}

ActivityHistory.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    co2e: PropTypes.number.isRequired
  })).isRequired,
  onRemoveActivity: PropTypes.func.isRequired
};

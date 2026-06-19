import { useMemo, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { generateHistoricalData, REGIONAL_BENCHMARKS } from '../domain/mockData';
import { Calendar, Trash2 } from 'lucide-react';

// Custom Chart Tooltip - must be defined outside component to prevent re-creation on render
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(9, 15, 11, 0.95)',
        border: '1px solid var(--border-light)',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-md)',
        fontSize: '0.8rem'
      }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{payload[0].payload.date}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color || '#fff', margin: '0.2rem 0' }}>
            {item.name}: <strong>{item.value} kg</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics({ userProfile, activities, onRemoveActivity }) {
  const [historyLimit, setHistoryLimit] = useState(7); // 7 days or 28 days filter

  // Generate and merge historical data with real-time logs
  const mergedChartData = useMemo(() => {
    // Generate base 28 days of history
    const baseHistory = generateHistoricalData(userProfile.baseline);
    
    // Group current logged activities by date
    const logGroups = {};
    activities.forEach(act => {
      if (!logGroups[act.date]) {
        logGroups[act.date] = { emissions: 0, savings: 0 };
      }
      if (act.category === 'saving') {
        logGroups[act.date].savings += act.co2e;
      } else {
        logGroups[act.date].emissions += act.co2e;
      }
    });

    // Merge logs into the historical chart data
    const merged = baseHistory.map(day => {
      const logs = logGroups[day.date];
      if (logs) {
        // Today or historical date with logs
        const netEmissions = parseFloat(Math.max(0, day.emissions + logs.emissions - logs.savings).toFixed(1));
        const netSavings = parseFloat((day.saved + logs.savings).toFixed(1));
        return {
          ...day,
          emissions: netEmissions,
          saved: netSavings,
          // Re-estimate breakdown proportional scaling for visual completeness
          transport: parseFloat(Math.max(0, day.transport - (logs.savings * 0.4)).toFixed(1)),
          diet: parseFloat(Math.max(0, day.diet - (logs.savings * 0.3)).toFixed(1)),
          energy: parseFloat(Math.max(0, day.energy - (logs.savings * 0.2)).toFixed(1)),
          waste: parseFloat(Math.max(0, day.waste - (logs.savings * 0.1)).toFixed(1)),
        };
      }
      return day;
    });

    // Return sliced data based on history limit selection (7 days or 28 days)
    return merged.slice(-historyLimit);
  }, [userProfile.baseline, activities, historyLimit]);

  // Peer Benchmarking Chart Data
  const currentNetDaily = useMemo(() => {
    const base = userProfile.baseline;
    
    // Find logs for today
    const todayStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const todayLogs = activities.filter(act => act.date === todayStr);
    
    let emissions = 0;
    let savings = 0;
    todayLogs.forEach(act => {
      if (act.category === 'saving') savings += act.co2e;
      else emissions += act.co2e;
    });

    return parseFloat(Math.max(0, base + emissions - savings).toFixed(1));
  }, [userProfile.baseline, activities]);

  const benchmarkData = useMemo(() => {
    return [
      { name: 'National Average', value: REGIONAL_BENCHMARKS.national_average, fill: '#4b5563' },
      { name: 'Peer Average', value: REGIONAL_BENCHMARKS.peer_average, fill: '#9ca3af' },
      { name: 'You (Current)', value: currentNetDaily, fill: '#10b981' },
      { name: 'Champion Target', value: REGIONAL_BENCHMARKS.champion_average, fill: '#dfad6c' }
    ];
  }, [currentNetDaily]);


  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Carbon Analytics & Trends</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Evaluate your progress, analyze daily emission fluctuations, and see how your footprint compares to national and peer averages.
        </p>
      </div>

      {/* Main Charts Row */}
      <div className="grid-cols-2">
        
        {/* Trend Area Chart Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Historical Emissions Curve</h3>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
              <button 
                onClick={() => setHistoryLimit(7)}
                className="btn"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  background: historyLimit === 7 ? 'var(--primary)' : 'transparent',
                  color: historyLimit === 7 ? '#fff' : 'var(--text-muted)'
                }}
              >
                7 Days
              </button>
              <button 
                onClick={() => setHistoryLimit(28)}
                className="btn"
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  background: historyLimit === 28 ? 'var(--primary)' : 'transparent',
                  color: historyLimit === 28 ? '#fff' : 'var(--text-muted)'
                }}
              >
                4 Weeks
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Daily carbon outputs (kg CO2e) showing the relative breakdown across sectors.
          </p>

          <div style={{ width: '100%', height: '280px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mergedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorDiet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area name="Transport" type="monotone" dataKey="transport" stroke="#38bdf8" fillOpacity={1} fill="url(#colorTransport)" stackId="1" />
                <Area name="Diet" type="monotone" dataKey="diet" stroke="#fbbf24" fillOpacity={1} fill="url(#colorDiet)" stackId="1" />
                <Area name="Energy" type="monotone" dataKey="energy" stroke="#10b981" fillOpacity={1} fill="url(#colorEnergy)" stackId="1" />
                <Area name="Waste" type="monotone" dataKey="waste" stroke="#dfad6c" fill="transparent" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Benchmarking Bar Chart Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Peer & Target Benchmarks</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Comparing your daily footprint (kg CO2e) against different reference cohorts.
          </p>

          <div style={{ width: '100%', height: '280px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} kg`, 'Daily Footprint']} contentStyle={{ background: '#090f0b', borderColor: 'var(--border-light)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {benchmarkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* COMPLETE HISTORY LOGBOOK */}
      <section className="glass-panel" style={{ padding: '1.5rem' }} aria-labelledby="history-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 id="history-heading" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--accent-leaf)' }} /> Carbon Logbook & Entries
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              A complete list of your manually logged activities and fitness imports.
            </p>
          </div>
        </div>

        {activities.length > 0 ? (
          <div className="table-container">
            <table className="custom-table" style={{ minWidth: '500px' }}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Logged Action / Commute</th>
                  <th scope="col">Type</th>
                  <th scope="col">CO2 Impact</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(act => (
                  <tr key={act.id}>
                    <td>{act.date}</td>
                    <td style={{ fontWeight: 500 }}>{act.label}</td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        background: act.category === 'saving' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                        color: act.category === 'saving' ? 'var(--accent-leaf)' : 'var(--danger)',
                        fontWeight: 600
                      }}>
                        {act.category === 'saving' ? 'OFFSET SAVINGS' : 'EMISSION'}
                      </span>
                    </td>
                    <td style={{ 
                      fontWeight: 600,
                      color: act.category === 'saving' ? 'var(--accent-leaf)' : 'var(--danger)'
                    }}>
                      {act.category === 'saving' ? '-' : '+'}{act.co2e} kg
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => onRemoveActivity(act.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                        aria-label={`Delete entry: ${act.label}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', gap: '0.75rem' }}>
            <Calendar size={32} style={{ color: 'var(--accent-leaf)', opacity: 0.8 }} />
            <span>No entries logged in the logbook yet. Log commuting or meals on the Dashboard tab to see historical entries.</span>
          </div>
        )}
      </section>

    </div>
  );
}

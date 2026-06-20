import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Activity, 
  Calendar, 
  CreditCard, 
  Upload, 
  Download, 
  Link, 
  Link2Off,
  FileText,
  AlertCircle
} from 'lucide-react';

/**
 * Integrations — component for device auto-sync simulators and bulk data actions.
 * Allows importing/exporting CSV data and simulating external API sync triggers.
 *
 * @param {Object} props
 * @param {Object} props.userProfile - Active user's configuration and baseline details.
 * @param {Function} props.onImportCSV - Callback to append parsed CSV log entries to parent state.
 * @param {Function} props.onAddActivity - Callback to log a single simulated offsets record.
 */
export default function Integrations({ userProfile, onImportCSV, onAddActivity }) {
  // Sync simulation states
  const [fitnessConnected, setFitnessConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);
  
  // CSV Import States
  const [csvText, setCsvText] = useState('');
  const [importError, setImportError] = useState('');

  // 1. Google Fit / Apple Health Simulator Actions
  const handleSimulateFitness = () => {
    if (!fitnessConnected) return;
    
    // Simulate detecting a 6km bicycle ride replacing driving
    const distance = 6;
    const carEmissions = distance * 0.21; // 1.26 kg
    const bicycleEmissions = 0;
    const savings = parseFloat((carEmissions - bicycleEmissions).toFixed(2));

    onAddActivity({
      category: 'saving',
      type: 'electric_car', // using EV factor or similar
      amount: distance,
      co2e: savings,
      label: `Auto-sync (Fitness API): Completed a ${distance}km bicycle commute`
    });
  };

  // 2. Calendar Sync Simulator Actions
  const handleSimulateCalendar = () => {
    if (!calendarConnected) return;

    // Simulate detecting a local webinar instead of traveling to a regional conference
    const virtualMeetingSavings = 4.5; // kg CO2e saved from avoiding local taxi/train

    onAddActivity({
      category: 'saving',
      type: 'transit',
      amount: 1,
      co2e: virtualMeetingSavings,
      label: `Auto-sync (Calendar): Attended virtual conference instead of commuting`
    });
  };

  // 3. E-Bank Statement Sync Simulator Actions
  const handleSimulateBank = () => {
    if (!bankConnected) return;

    // Simulate analyzing utility statements and finding that they cut electricity by 15 kWh
    const savedKwh = 15;
    const savings = parseFloat((savedKwh * 0.38).toFixed(2));

    onAddActivity({
      category: 'saving',
      type: 'energy_saving',
      amount: savedKwh,
      co2e: savings,
      label: `Auto-sync (E-Bank): Utility audit detected 15 kWh electricity reduction`
    });
  };

  // 4. CSV Exporter Utility
  const handleExportCSV = () => {
    const savedActivities = localStorage.getItem('ecotrack_activities');
    const logs = savedActivities ? JSON.parse(savedActivities) : [];
    
    if (logs.length === 0) {
      alert("No logged activities found to export.");
      return;
    }

    // CSV Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Activity Description,Impact Type,CO2 Value (kg)\r\n";

    // Row parsing
    logs.forEach(log => {
      // Sanitize description to prevent CSV injection (comma/quote escaping)
      const sanitizedLabel = `"${log.label.replace(/"/g, '""')}"`;
      const type = log.category === 'saving' ? 'SAVINGS' : 'EMISSION';
      csvContent += `${log.date},${sanitizedLabel},${type},${log.co2e}\r\n`;
    });

    // Create Download Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecotrack_carbon_history_${userProfile.userName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load a preset demo CSV to showcase how parsing works immediately
  const handleLoadDemoCSV = () => {
    const demo = `Date,Activity Description,Impact Type,CO2 Value (kg)
Jun 17,"Biked to lecture instead of driving",SAVINGS,1.8
Jun 17,"Ate organic vegan sandwich",SAVINGS,1.0
Jun 16,"Washed laundry on cold tap cycle",SAVINGS,0.9
Jun 15,"Commuted by subway metro line",SAVINGS,2.4`;
    setCsvText(demo);
    setImportError('');
  };

  // 5. CSV Importer Utility with strict input parsing (Security requirement)
  const handleImportCSV = (e) => {
    e.preventDefault();
    setImportError('');

    if (!csvText.trim()) {
      setImportError('Please paste some CSV text or click "Load Demo CSV" to parse.');
      return;
    }

    try {
      const lines = csvText.split('\n');
      const parsedLogs = [];
      const headerLine = lines[0].toLowerCase();

      // Basic column validation
      if (!headerLine.includes('date') || !headerLine.includes('description') || !headerLine.includes('co2')) {
        throw new Error('CSV headers must include "Date", "Description", and "CO2" columns.');
      }

      // Loop through lines (skipping header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // skip blank lines

        // Split by comma, respecting quotes
        const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (columns.length < 4) {
          throw new Error(`Row ${i + 1} has insufficient columns. Required format: Date, Description, Type, CO2`);
        }

        const date = columns[0].replace(/"/g, "").trim().substring(0, 15);
        const label = columns[1].replace(/"/g, "").trim().substring(0, 100);
        const typeStr = columns[2].replace(/"/g, "").trim().toUpperCase();
        const co2Val = parseFloat(columns[3]);

        // Security check: validate parsed boundaries to prevent garbage values
        if (isNaN(co2Val) || co2Val < 0 || co2Val > 1000) {
          throw new Error(`Row ${i + 1} contains an invalid CO2 number (must be between 0 and 1000).`);
        }

        // Map column details to internal log shape
        parsedLogs.push({
          id: `csv-${Date.now()}-${i}`,
          date,
          label: label || 'Imported Log',
          category: typeStr === 'SAVINGS' || typeStr === 'SAVING' ? 'saving' : 'transport',
          co2e: parseFloat(co2Val.toFixed(2))
        });
      }

      if (parsedLogs.length === 0) {
        throw new Error('No valid records found in pasted CSV.');
      }

      // Bubble up to parent state
      onImportCSV(parsedLogs);
      setCsvText('');
      setImportError('');
    } catch (err) {
      setImportError(err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Device Sync & Integrations</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Enable passive tracking by linking fitness devices and utility accounts, or export and import logs in bulk using CSV.
        </p>
      </div>

      <div className="grid-cols-2">
        
        {/* LEFT COLUMN: SIMULATORS */}
        <section aria-labelledby="simulators-heading" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 id="simulators-heading" style={{ display: 'none' }}>Simulators</h2>
          
          {/* Fitness Sync Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Activity size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem' }}>Fitness API Sync</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Apple Health / Google Fit</span>
                </div>
              </div>

              {/* Connect button */}
              <button 
                onClick={() => setFitnessConnected(!fitnessConnected)}
                className={`btn ${fitnessConnected ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px' }}
              >
                {fitnessConnected ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Link2Off size={12} /> Disconnect</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Link size={12} /> Connect</span>
                )}
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Allows passive detection of active commutes (walking/cycling) instead of motor travel to auto-log green offsets.
            </p>

            {fitnessConnected && (
              <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '8px', border: '1px dashed rgba(74, 222, 128, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-leaf)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="signal-dot"></span>
                  <span>Connection Active</span>
                </span>
                <button onClick={handleSimulateFitness} className="btn btn-earth btn-premium-bounce" style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderRadius: '6px' }}>
                  Simulate Biking Detected
                </button>
              </div>
            )}
          </div>

          {/* Calendar Sync Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem' }}>Smart Calendar Sync</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Google Calendar / Outlook</span>
                </div>
              </div>

              <button 
                onClick={() => setCalendarConnected(!calendarConnected)}
                className={`btn ${calendarConnected ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px' }}
              >
                {calendarConnected ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Link2Off size={12} /> Disconnect</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Link size={12} /> Connect</span>
                )}
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Analyzes event locations and commutes. Detects virtual meetings replacing business trips.
            </p>

            {calendarConnected && (
              <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '8px', border: '1px dashed rgba(74, 222, 128, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-leaf)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="signal-dot"></span>
                  <span>Connection Active</span>
                </span>
                <button onClick={handleSimulateCalendar} className="btn btn-earth btn-premium-bounce" style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderRadius: '6px' }}>
                  Simulate Virtual Meeting Detected
                </button>
              </div>
            )}
          </div>

          {/* E-Bank Statements Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem' }}>E-Bank Statement Sync</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Utility & Billing Integrations</span>
                </div>
              </div>

              <button 
                onClick={() => setBankConnected(!bankConnected)}
                className={`btn ${bankConnected ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px' }}
              >
                {bankConnected ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Link2Off size={12} /> Disconnect</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Link size={12} /> Connect</span>
                )}
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Scans utility bill details to track household electric/gas consumption.
            </p>

            {bankConnected && (
              <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '8px', border: '1px dashed rgba(74, 222, 128, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-leaf)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="signal-dot"></span>
                  <span>Connection Active</span>
                </span>
                <button onClick={handleSimulateBank} className="btn btn-earth btn-premium-bounce" style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem', borderRadius: '6px' }}>
                  Simulate Electric Savings Audited
                </button>
              </div>
            )}
          </div>

        </section>

        {/* RIGHT COLUMN: BULK IMPORT/EXPORT */}
        <section aria-labelledby="bulk-heading" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 id="bulk-heading" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: 'var(--accent-earth)' }} /> Bulk CSV Management
          </h2>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Export your complete carbon tracking history to local storage sheets, or import bulk activity rows using CSV templates.
          </p>

          {/* Export Button */}
          <button 
            onClick={handleExportCSV} 
            className="btn btn-secondary" 
            style={{ display: 'flex', gap: '0.5rem', width: '100%', padding: '0.8rem', justifyContent: 'center' }}
          >
            <Download size={16} /> Export Logs History to CSV
          </button>

          <div style={{ borderTop: '1px solid var(--border-light)', margin: '0.5rem 0' }} />

          {/* Import Form */}
          <form onSubmit={handleImportCSV} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="csv-input" className="form-label" style={{ marginBottom: 0 }}>Import logs from CSV text</label>
              <button 
                type="button" 
                onClick={handleLoadDemoCSV}
                className="btn"
                style={{ padding: 0, border: 'none', background: 'transparent', color: 'var(--accent-leaf)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Load Demo CSV Template
              </button>
            </div>

            <textarea 
              id="csv-input"
              className="form-input"
              rows="6"
              placeholder="Date,Activity Description,Impact Type,CO2 Value (kg)..."
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', resize: 'vertical' }}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />

            {importError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.75rem', background: 'rgba(248, 113, 113, 0.05)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.15)' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{importError}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', width: '100%', padding: '0.8rem', justifyContent: 'center' }}>
              <Upload size={16} /> Parse & Import CSV Rows
            </button>
          </form>

        </section>

      </div>
    </div>
  );
}

Integrations.propTypes = {
  userProfile: PropTypes.shape({
    userName: PropTypes.string.isRequired
  }).isRequired,
  onImportCSV: PropTypes.func.isRequired,
  onAddActivity: PropTypes.func.isRequired
};

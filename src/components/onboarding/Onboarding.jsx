import { useState, useCallback } from 'react';
import { Leaf } from 'lucide-react';
import { calculateOnboardingBaseline } from '../../domain/carbonCalculator';
import {
  sanitiseText, clampNumber, validateEnum,
  ALLOWED_COMMUTE_MODES, ALLOWED_DIET_TYPES,
  ALLOWED_HOME_SIZES, ALLOWED_RECYCLING_HABITS, ALLOWED_PERSONAS
} from '../../domain/validation';
import StepPersona from './steps/StepPersona';
import StepTransport from './steps/StepTransport';
import StepDiet from './steps/StepDiet';
import StepEnergy from './steps/StepEnergy';
import StepWaste from './steps/StepWaste';
import StepResult from './steps/StepResult';

const TOTAL_STEPS = 6;

/**
 * Persona presets — hydrate form fields to sensible defaults for each archetype.
 */
const PERSONA_PRESETS = {
  student: {
    commuteMode: 'bus', commuteDistance: 80, flightsPerYear: 1,
    dietType: 'vegetarian', homeSize: 'small', monthlyEnergyBill: 40,
    isGreenEnergy: false, recyclingHabit: 'partial_recycling'
  },
  citizen: {
    commuteMode: 'petrol_car', commuteDistance: 200, flightsPerYear: 3,
    dietType: 'balanced', homeSize: 'medium', monthlyEnergyBill: 120,
    isGreenEnergy: false, recyclingHabit: 'none'
  },
  champion: {
    commuteMode: 'electric_car', commuteDistance: 120, flightsPerYear: 0,
    dietType: 'vegan', homeSize: 'small', monthlyEnergyBill: 60,
    isGreenEnergy: true, recyclingHabit: 'full_recycling'
  }
};

/**
 * Onboarding — slim wizard orchestrator.
 * Owns form state; delegates every step's UI to its dedicated step component.
 *
 * @param {{ onComplete: Function }} props
 */
export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  // ── Form fields ──────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('citizen');
  const [commuteMode, setCommuteMode] = useState('petrol_car');
  const [commuteDistance, setCommuteDistance] = useState(200);
  const [flightsPerYear, setFlightsPerYear] = useState(3);
  const [dietType, setDietType] = useState('balanced');
  const [homeSize, setHomeSize] = useState('medium');
  const [monthlyEnergyBill, setMonthlyEnergyBill] = useState(120);
  const [isGreenEnergy, setIsGreenEnergy] = useState(false);
  const [recyclingHabit, setRecyclingHabit] = useState('none');

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => setStep(s => Math.min(s + 1, TOTAL_STEPS)), []);
  const handleBack = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  const handleApplyPersona = useCallback((id) => {
    setPersona(id);
    const preset = PERSONA_PRESETS[id];
    setCommuteMode(preset.commuteMode);
    setCommuteDistance(preset.commuteDistance);
    setFlightsPerYear(preset.flightsPerYear);
    setDietType(preset.dietType);
    setHomeSize(preset.homeSize);
    setMonthlyEnergyBill(preset.monthlyEnergyBill);
    setIsGreenEnergy(preset.isGreenEnergy);
    setRecyclingHabit(preset.recyclingHabit);
  }, []);

  const handleCalculate = useCallback(() => {
    setCalculating(true);
    setTimeout(() => {
      // Security: validate + sanitise all inputs before passing to domain
      const safeAnswers = {
        commuteMode:      validateEnum(commuteMode, ALLOWED_COMMUTE_MODES, 'petrol_car'),
        commuteDistance:  clampNumber(commuteDistance, 0, 500, 100),
        flightsPerYear:   clampNumber(flightsPerYear, 0, 15, 2),
        dietType:         validateEnum(dietType, ALLOWED_DIET_TYPES, 'balanced'),
        homeSize:         validateEnum(homeSize, ALLOWED_HOME_SIZES, 'medium'),
        monthlyEnergyBill: clampNumber(monthlyEnergyBill, 20, 300, 100),
        isGreenEnergy,
        recyclingHabit:   validateEnum(recyclingHabit, ALLOWED_RECYCLING_HABITS, 'partial_recycling')
      };
      const calcResult = calculateOnboardingBaseline(safeAnswers);
      setResult({ ...calcResult, name: sanitiseText(name) });
      setStep(6);
      setCalculating(false);
    }, 800);
  }, [commuteMode, commuteDistance, flightsPerYear, dietType, homeSize, monthlyEnergyBill, isGreenEnergy, recyclingHabit, name]);

  const handleFinish = useCallback(() => {
    if (!result) return;
    onComplete({
      userName: sanitiseText(name),
      persona: validateEnum(persona, ALLOWED_PERSONAS, 'citizen'),
      baseline: result.totalDailyKg,
      breakdown: result.breakdown
    });
  }, [result, name, persona, onComplete]);

  // ── Progress bar percentage ───────────────────────────────────────────────
  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <main
      className="onboarding-container animate-fade-in"
      aria-label={`Onboarding Step ${step} of ${TOTAL_STEPS}`}
    >
      {/* Branded Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(74,222,128,0.2)', borderRadius: '20px', marginBottom: '0.75rem'
        }}>
          <Leaf size={16} style={{ color: 'var(--accent-leaf)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-leaf)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Nature-First Carbon Tracker
          </span>
        </div>
      </div>

      {/* Progress Tracker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Step {step} of {TOTAL_STEPS}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-leaf)', fontWeight: 600 }}>{Math.round(progressPct)}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Onboarding progress: step ${step} of ${TOTAL_STEPS}`}
        style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '2.5rem', overflow: 'hidden' }}
      >
        <div style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: '2px', width: `${progressPct}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Step Components */}
      {step === 1 && (
        <StepPersona
          name={name} setName={setName}
          persona={persona}
          onApplyPersona={handleApplyPersona}
          onNext={handleNext}
        />
      )}
      {step === 2 && (
        <StepTransport
          commuteMode={commuteMode} setCommuteMode={setCommuteMode}
          commuteDistance={commuteDistance} setCommuteDistance={setCommuteDistance}
          flightsPerYear={flightsPerYear} setFlightsPerYear={setFlightsPerYear}
          onNext={handleNext} onBack={handleBack}
        />
      )}
      {step === 3 && (
        <StepDiet
          dietType={dietType} setDietType={setDietType}
          onNext={handleNext} onBack={handleBack}
        />
      )}
      {step === 4 && (
        <StepEnergy
          homeSize={homeSize} setHomeSize={setHomeSize}
          monthlyEnergyBill={monthlyEnergyBill} setMonthlyEnergyBill={setMonthlyEnergyBill}
          isGreenEnergy={isGreenEnergy} setIsGreenEnergy={setIsGreenEnergy}
          onNext={handleNext} onBack={handleBack}
        />
      )}
      {step === 5 && (
        <StepWaste
          recyclingHabit={recyclingHabit} setRecyclingHabit={setRecyclingHabit}
          onCalculate={handleCalculate} onBack={handleBack}
          calculating={calculating}
        />
      )}
      {step === 6 && (
        <StepResult result={result} onFinish={handleFinish} />
      )}
    </main>
  );
}

import { describe, it, expect } from 'vitest';
import {
  EMISSION_FACTORS,
  dailyKgToAnnualTons,
  annualTonsToDailyKg,
  calculateCommuteFootprint,
  calculateEnergyFootprint,
  calculateOnboardingBaseline,
  calculateLoggedActivity
} from '../domain/carbonCalculator';

// ─── Unit Tests: carbonCalculator.js ─────────────────────────────────────────

describe('dailyKgToAnnualTons', () => {
  it('converts daily kilograms to annual metric tons correctly', () => {
    // 1 kg/day × 365.25 / 1000 = 0.37 tons
    expect(dailyKgToAnnualTons(1)).toBe(0.37);
  });

  it('returns 0 for zero input', () => {
    expect(dailyKgToAnnualTons(0)).toBe(0);
  });

  it('handles large values without overflow', () => {
    // 100 kg/day × 365.25 / 1000 = 36.525 → rounds to 36.52 in parseFloat.toFixed(2)
    expect(dailyKgToAnnualTons(100)).toBe(36.52);
  });
});

describe('annualTonsToDailyKg', () => {
  it('round-trips with dailyKgToAnnualTons within floating-point tolerance', () => {
    const original = 15.5;
    const tons = dailyKgToAnnualTons(original);
    const backToKg = annualTonsToDailyKg(tons);
    expect(Math.abs(backToKg - original)).toBeLessThan(0.01);
  });
});

describe('calculateCommuteFootprint', () => {
  it('calculates electric car emissions correctly', () => {
    // 70 km/week / 7 days × 0.05 kg/km = 0.5 kg/day
    const result = calculateCommuteFootprint('electric_car', 70);
    expect(result).toBeCloseTo(0.5, 1);
  });

  it('returns 0 for active (walking/biking) commute', () => {
    expect(calculateCommuteFootprint('active', 50)).toBe(0);
  });

  it('defaults to petrol_car factor for unknown modes', () => {
    const petrol = calculateCommuteFootprint('petrol_car', 100);
    const unknown = calculateCommuteFootprint('unknown_vehicle', 100);
    expect(unknown).toBe(petrol);
  });

  it('returns 0 for 0 km distance', () => {
    expect(calculateCommuteFootprint('bus', 0)).toBe(0);
  });
});

describe('calculateEnergyFootprint', () => {
  it('returns higher emissions for standard vs green energy', () => {
    const standard = calculateEnergyFootprint('medium', 120, false);
    const green = calculateEnergyFootprint('medium', 120, true);
    expect(standard).toBeGreaterThan(green);
  });

  it('returns non-negative values for zero energy bill', () => {
    const result = calculateEnergyFootprint('small', 0, false);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('adds higher heating baseline for large homes', () => {
    const small = calculateEnergyFootprint('small', 100, false);
    const large = calculateEnergyFootprint('large', 100, false);
    expect(large).toBeGreaterThan(small);
  });
});

describe('calculateOnboardingBaseline', () => {
  it('returns a positive total daily kg for typical user profile', () => {
    const result = calculateOnboardingBaseline({
      commuteMode: 'petrol_car',
      commuteDistance: 80,
      dietType: 'balanced',
      homeSize: 'medium',
      monthlyEnergyBill: 100,
      isGreenEnergy: false,
      recyclingHabit: 'partial_recycling',
      flightsPerYear: 2
    });
    expect(result.totalDailyKg).toBeGreaterThan(0);
    expect(result.breakdown).toHaveProperty('transport');
    expect(result.breakdown).toHaveProperty('diet');
    expect(result.breakdown).toHaveProperty('energy');
    expect(result.breakdown).toHaveProperty('waste');
  });

  it('gives lower footprint for eco-friendly user profile', () => {
    const eco = calculateOnboardingBaseline({
      commuteMode: 'active',
      commuteDistance: 0,
      dietType: 'vegan',
      homeSize: 'small',
      monthlyEnergyBill: 40,
      isGreenEnergy: true,
      recyclingHabit: 'full_recycling',
      flightsPerYear: 0
    });
    const heavy = calculateOnboardingBaseline({
      commuteMode: 'petrol_car',
      commuteDistance: 200,
      dietType: 'meat_heavy',
      homeSize: 'large',
      monthlyEnergyBill: 300,
      isGreenEnergy: false,
      recyclingHabit: 'no_recycling',
      flightsPerYear: 12
    });
    expect(eco.totalDailyKg).toBeLessThan(heavy.totalDailyKg);
  });

  it('uses defaults when answers are empty', () => {
    const result = calculateOnboardingBaseline({});
    expect(result.totalDailyKg).toBeGreaterThan(0);
  });
});

describe('calculateLoggedActivity', () => {
  it('calculates transport emissions (bus, per km)', () => {
    const result = calculateLoggedActivity('transport', 'bus', 20);
    // 20 km × 0.08 = 1.6 kg
    expect(result).toBeCloseTo(1.6, 1);
  });

  it('returns 0 for non-positive amounts', () => {
    expect(calculateLoggedActivity('transport', 'bus', 0)).toBe(0);
    expect(calculateLoggedActivity('transport', 'bus', -5)).toBe(0);
    expect(calculateLoggedActivity('transport', 'bus', NaN)).toBe(0);
  });

  it('calculates diet emissions correctly for each type', () => {
    expect(calculateLoggedActivity('diet', 'meat_heavy', 1)).toBe(2.6);
    expect(calculateLoggedActivity('diet', 'vegan', 1)).toBe(0.6);
    expect(calculateLoggedActivity('diet', 'vegetarian', 1)).toBe(1.0);
  });

  it('calculates energy emissions (kWh, standard grid)', () => {
    // 10 kWh × 0.38 = 3.8 kg
    const result = calculateLoggedActivity('energy', 'standard', 10);
    expect(result).toBeCloseTo(3.8, 1);
  });

  it('calculates energy emissions (kWh, green grid)', () => {
    // 10 kWh × 0.05 = 0.5 kg
    const result = calculateLoggedActivity('energy', 'green', 10);
    expect(result).toBeCloseTo(0.5, 1);
  });

  it('returns 0 for unknown categories', () => {
    expect(calculateLoggedActivity('shopping', 'clothes', 100)).toBe(0);
  });
});

describe('EMISSION_FACTORS constant integrity', () => {
  it('has non-negative values for all transport modes', () => {
    Object.values(EMISSION_FACTORS.transport).forEach(factor => {
      expect(factor).toBeGreaterThanOrEqual(0);
    });
  });

  it('has positive values for all diet types', () => {
    Object.values(EMISSION_FACTORS.diet).forEach(factor => {
      expect(factor).toBeGreaterThan(0);
    });
  });

  it('orders diet types with vegan lowest and meat_heavy highest', () => {
    const { vegan, vegetarian, balanced, meat_heavy } = EMISSION_FACTORS.diet;
    expect(vegan).toBeLessThan(vegetarian);
    expect(vegetarian).toBeLessThan(balanced);
    expect(balanced).toBeLessThan(meat_heavy);
  });
});

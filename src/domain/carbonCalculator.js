/**
 * Carbon Footprint Calculation Utilities
 * Based on EPA (Environmental Protection Agency) and IPCC guidelines.
 * All base calculations yield kilograms of CO2-equivalent (kg CO2e).
 *
 * PURE DOMAIN MODULE — no React imports, no DOM, no localStorage.
 * All functions are deterministic and independently testable.
 */

export const EMISSION_FACTORS = {
  // Transport (per km)
  transport: {
    petrol_car: 0.21,      // Average petrol car
    diesel_car: 0.19,      // Average diesel car
    electric_car: 0.05,    // Electric car (average grid intensity)
    hybrid_car: 0.11,      // Hybrid vehicle
    bus: 0.08,             // Bus transit per passenger-km
    train: 0.04,           // Train transit per passenger-km
    flight_short: 0.25,    // Short haul flight (<1500 km)
    flight_long: 0.17,     // Long haul flight (>1500 km)
    active: 0.0            // Walking / Biking
  },

  // Diet (per day baseline)
  diet: {
    meat_heavy: 7.8,       // Daily beef/lamb consumption
    balanced: 4.8,         // Moderate meat/fish, dairy
    vegetarian: 3.2,       // Eggs/dairy, no meat
    vegan: 1.8             // Plant-based diet
  },

  // Home Energy (per kWh and general utilities)
  energy: {
    electricity_standard: 0.38, // kg CO2 per kWh
    electricity_green: 0.05,    // kg CO2 per kWh (renewable generation overhead)
    natural_gas: 0.18,          // kg CO2 per kWh of heating energy
    heating_oil: 0.26           // kg CO2 per kWh of heating energy
  },

  // Waste & Shopping (per day baseline)
  waste: {
    no_recycling: 1.6,      // High trash volume, no sorting
    partial_recycling: 0.9, // Recycles paper/plastic/glass sometimes
    full_recycling: 0.3     // Heavy composting, active zero-waste sorting
  }
};

/**
 * Daily kg CO2 heating baseline by home size (kg CO2e/day).
 * Stored as a lookup object to avoid repetitive if-chains.
 */
const HEATING_BASELINE_BY_SIZE = {
  small: 0.5,
  medium: 1.5,
  large: 3.0
};

/**
 * Convert daily kg CO2 to annual tons
 * @param {number} dailyKg
 * @returns {number}
 */
export const dailyKgToAnnualTons = (dailyKg) => {
  return parseFloat(((dailyKg * 365.25) / 1000).toFixed(2));
};

/**
 * Convert annual tons to daily kg
 * @param {number} annualTons
 * @returns {number}
 */
export const annualTonsToDailyKg = (annualTons) => {
  return parseFloat(((annualTons * 1000) / 365.25).toFixed(2));
};

/**
 * Calculates commute footprint in kg CO2 per day
 * @param {string} mode
 * @param {number} weeklyKm
 * @returns {number}
 */
export const calculateCommuteFootprint = (mode, weeklyKm) => {
  const factor = EMISSION_FACTORS.transport[mode] ?? EMISSION_FACTORS.transport.petrol_car;
  const dailyKm = weeklyKm / 7;
  return parseFloat((dailyKm * factor).toFixed(2));
};

/**
 * Calculates energy footprint in kg CO2 per day based on monthly utility cost
 * @param {string} homeSize - small, medium, large
 * @param {number} monthlyBill - estimate in USD
 * @param {boolean} isGreenEnergy
 * @returns {number}
 */
export const calculateEnergyFootprint = (homeSize, monthlyBill, isGreenEnergy) => {
  // Estimate kWh based on monthly bill (assuming avg $0.16 per kWh)
  const ratePerKwh = 0.16;
  const estimatedMonthlyKwh = Math.max(0, monthlyBill / ratePerKwh);
  const dailyKwh = estimatedMonthlyKwh / 30.4; // avg days in month

  const factor = isGreenEnergy
    ? EMISSION_FACTORS.energy.electricity_green
    : EMISSION_FACTORS.energy.electricity_standard;

  // Structural heating overhead — falls back to 'small' for unrecognised sizes
  const heatingBaseline = HEATING_BASELINE_BY_SIZE[homeSize] ?? HEATING_BASELINE_BY_SIZE.small;

  return parseFloat((dailyKwh * factor + heatingBaseline).toFixed(2));
};

/**
 * Calculates daily baseline footprint from onboarding questionnaire
 * @param {Object} answers
 * @returns {{ totalDailyKg: number, breakdown: { transport, diet, energy, waste } }}
 */
export const calculateOnboardingBaseline = (answers) => {
  const {
    commuteMode = 'petrol_car',
    commuteDistance = 100, // km/week
    dietType = 'balanced',
    homeSize = 'medium',
    monthlyEnergyBill = 100, // $/month
    isGreenEnergy = false,
    recyclingHabit = 'partial_recycling',
    flightsPerYear = 2
  } = answers;

  // 1. Commute
  const transportDaily = calculateCommuteFootprint(commuteMode, parseFloat(commuteDistance));

  // 2. Flights (short haul assumption, divided into daily allocation)
  const flightDaily = (flightsPerYear * 1200 * EMISSION_FACTORS.transport.flight_short) / 365.25;

  // Total Transport
  const transportTotal = parseFloat((transportDaily + flightDaily).toFixed(2));

  // 3. Diet
  const dietTotal = EMISSION_FACTORS.diet[dietType] ?? EMISSION_FACTORS.diet.balanced;

  // 4. Energy
  const energyTotal = calculateEnergyFootprint(homeSize, parseFloat(monthlyEnergyBill), isGreenEnergy);

  // 5. Waste
  const wasteTotal = EMISSION_FACTORS.waste[recyclingHabit] ?? EMISSION_FACTORS.waste.partial_recycling;

  const totalDailyKg = parseFloat((transportTotal + dietTotal + energyTotal + wasteTotal).toFixed(2));

  return {
    totalDailyKg,
    breakdown: {
      transport: transportTotal,
      diet: dietTotal,
      energy: energyTotal,
      waste: wasteTotal
    }
  };
};

/**
 * Calculates the carbon footprint of a custom logged activity
 * @param {string} category
 * @param {string} type
 * @param {number} amount
 * @returns {number} kg CO2e
 */
export const calculateLoggedActivity = (category, type, amount) => {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) return 0;

  if (category === 'transport') {
    const factor = EMISSION_FACTORS.transport[type] ?? EMISSION_FACTORS.transport.petrol_car;
    return parseFloat((numericAmount * factor).toFixed(2));
  }

  if (category === 'diet') {
    // Meal direct logging (carbon relative to baseline daily)
    if (type === 'meat_heavy') return 2.6;
    if (type === 'balanced') return 1.6;
    if (type === 'vegetarian') return 1.0;
    if (type === 'vegan') return 0.6;
  }

  if (category === 'energy') {
    // Amount in kWh logged
    const factor = type === 'green'
      ? EMISSION_FACTORS.energy.electricity_green
      : EMISSION_FACTORS.energy.electricity_standard;
    return parseFloat((numericAmount * factor).toFixed(2));
  }

  return 0;
};

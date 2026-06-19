/**
 * Static mock data and deterministic data generation for EcoTrack.
 *
 * PURE DOMAIN MODULE — no React imports, no DOM, no localStorage.
 */

export const MOCK_ACTIONS = [
  {
    id: 'action-1',
    title: 'Meatless Day',
    description: 'Swap all meat meals for nutritious plant-based alternatives today.',
    category: 'diet',
    co2Saved: 4.2,
    difficulty: 'Easy',
    type: 'quick',
    healthBenefit: { text: 'Improves cardiovascular health, burns less saturated fat', kcal: 180, points: 15 }
  },
  {
    id: 'action-2',
    title: 'Commute by Bicycle',
    description: 'Pedal to work, class, or groceries instead of taking a gasoline car.',
    category: 'transport',
    co2Saved: 3.8,
    difficulty: 'Medium',
    type: 'habit',
    healthBenefit: { text: 'Excellent aerobic exercise, builds leg muscles', kcal: 350, points: 30 }
  },
  {
    id: 'action-3',
    title: 'Wash Laundry at 30°C',
    description: 'Run your washing machine on cold cycle instead of hot water.',
    category: 'energy',
    co2Saved: 0.9,
    difficulty: 'Easy',
    type: 'quick',
    healthBenefit: { text: 'Protects fabric fiber quality, saves heating cost', kcal: 20, points: 10 }
  },
  {
    id: 'action-4',
    title: 'Compost Organic Waste',
    description: 'Separate food scraps into compost bins to prevent methane formation in landfills.',
    category: 'waste',
    co2Saved: 0.8,
    difficulty: 'Easy',
    type: 'habit',
    healthBenefit: { text: 'Zero-waste cycle, creates natural soil fertilizer', kcal: 40, points: 12 }
  },
  {
    id: 'action-5',
    title: 'Take Public Transit',
    description: 'Choose the subway, light rail, or bus instead of driving a personal vehicle.',
    category: 'transport',
    co2Saved: 2.6,
    difficulty: 'Easy',
    type: 'quick',
    healthBenefit: { text: 'Reduces commute stress, provides time to read or listen to podcasts', kcal: 60, points: 18 }
  },
  {
    id: 'action-6',
    title: 'Hang-Dry Clothes',
    description: 'Use a drying rack instead of running the energy-intensive electric clothes dryer.',
    category: 'energy',
    co2Saved: 1.6,
    difficulty: 'Easy',
    type: 'quick',
    healthBenefit: { text: 'Gentle on clothes, eliminates indoor humidity', kcal: 50, points: 12 }
  },
  {
    id: 'action-7',
    title: 'Unplug Standby Devices',
    description: 'Turn off power strips or unplug chargers, TV systems, and microwave standbys.',
    category: 'energy',
    co2Saved: 0.5,
    difficulty: 'Easy',
    type: 'quick',
    healthBenefit: { text: 'Reduces passive "vampire load" costs on electricity bill', kcal: 0, points: 8 }
  },
  {
    id: 'action-8',
    title: 'Buy Local Produce',
    description: 'Purchase organic food from farmer markets to eliminate food mile transit emissions.',
    category: 'diet',
    co2Saved: 1.5,
    difficulty: 'Medium',
    type: 'habit',
    healthBenefit: { text: 'Fresher food with higher nutrient density, supports local farmers', kcal: 0, points: 15 }
  },
  {
    id: 'action-9',
    title: 'Set Thermostat down 1°C',
    description: 'Lower heating setting slightly and wear a comfortable sweater indoors.',
    category: 'energy',
    co2Saved: 2.0,
    difficulty: 'Easy',
    type: 'habit',
    healthBenefit: { text: 'Saves 8-10% on monthly heating gas expenses', kcal: 30, points: 20 }
  }
];

export const MOCK_PEERS = [
  { name: 'Chloe (Eco Leader)', savingsThisMonth: 124.5, streakDays: 28, level: 8, isUser: false, avatar: 'CL' },
  { name: 'Noah (Cyclist)', savingsThisMonth: 95.8, streakDays: 14, level: 6, isUser: false, avatar: 'NH' },
  { name: 'Liam (Zero Waste)', savingsThisMonth: 78.2, streakDays: 21, level: 5, isUser: false, avatar: 'LM' },
  { name: 'You', savingsThisMonth: 0.0, streakDays: 0, level: 1, isUser: true, avatar: 'YO' },
  { name: 'Olivia (Student)', savingsThisMonth: 42.1, streakDays: 5, level: 3, isUser: false, avatar: 'OL' },
  { name: 'Ethan (Beginner)', savingsThisMonth: 18.5, streakDays: 2, level: 2, isUser: false, avatar: 'ET' }
];

export const REGIONAL_BENCHMARKS = {
  national_average: 44.5,  // kg CO2 per day per capita
  peer_average: 28.2,      // Similar demographic/student cohort average
  champion_average: 11.8   // Highly eco-active user average
};

// ---------------------------------------------------------------------------
// Deterministic historical data generator
// Uses a seeded Linear Congruential Generator (LCG) so the same baseline
// always produces the same chart — prevents flickering on re-renders.
// ---------------------------------------------------------------------------
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
};

/**
 * Generates 28 days of deterministic historical emission data.
 * @param {number} userBaselineKg - daily baseline in kg CO2e
 * @returns {Array<Object>}
 */
export const generateHistoricalData = (userBaselineKg) => {
  const data = [];
  const base = userBaselineKg || 25.0;
  const rand = seededRandom(Math.round(base * 1000));

  for (let i = 28; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const progressFactor = 1 - (28 - i) * 0.005;
    const fluctuation = (rand() - 0.5) * 3;
    const dailyEmission = parseFloat((base * progressFactor + fluctuation).toFixed(2));

    data.push({
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      emissions: dailyEmission,
      transport: parseFloat((dailyEmission * 0.45).toFixed(1)),
      diet: parseFloat((dailyEmission * 0.25).toFixed(1)),
      energy: parseFloat((dailyEmission * 0.20).toFixed(1)),
      waste: parseFloat((dailyEmission * 0.10).toFixed(1)),
      saved: parseFloat(((base - dailyEmission) > 0 ? (base - dailyEmission) : 0).toFixed(1))
    });
  }
  return data;
};

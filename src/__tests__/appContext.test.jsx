import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useAppStore } from '../store/AppContext';
import { WELCOME_BONUS_POINTS, CSV_IMPORT_BONUS } from '../domain/scoring';

// ─── AppContext Integration Tests ──────────────────────────────────────────────
//
// These tests verify complete state transitions through the public store API —
// from initial state, through user actions, to expected derived values.
// They do NOT test rendering details; they test the game-loop contract.

// ── Test Harness ──────────────────────────────────────────────────────────────

/**
 * A minimal React component that reads from the store and exposes its state
 * via data-testid attributes so assertions are DOM-driven (no internal refs).
 */
function StoreHarness({ onMount }) {
  const store = useAppStore();

  // Call the callback on first render so tests can invoke actions
  if (onMount) onMount(store);

  return (
    <div>
      <span data-testid="profile">{store.userProfile ? store.userProfile.userName : 'none'}</span>
      <span data-testid="points">{store.points}</span>
      <span data-testid="streak">{store.streakDays}</span>
      <span data-testid="level">{store.userLevel}</span>
      <span data-testid="activities">{store.activities.length}</span>
      <span data-testid="co2saved">{store.co2SavedThisMonth}</span>
    </div>
  );
}

/** Renders the harness inside AppProvider and returns the live store reference. */
function renderStore(onMount) {
  let storeRef;
  const capture = (s) => { if (!storeRef) storeRef = s; };
  render(
    <AppProvider>
      <StoreHarness onMount={onMount ?? capture} />
    </AppProvider>
  );
  return { storeRef: () => storeRef };
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_PROFILE = {
  userName: 'Abhinesh',
  persona: 'citizen',
  baseline: 12.5,
  breakdown: { transport: 3.0, diet: 4.8, energy: 3.2, waste: 1.5 }
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AppContext — initial state', () => {
  beforeEach(() => { localStorage.clear(); });

  it('starts with no user profile', () => {
    renderStore();
    expect(screen.getByTestId('profile').textContent).toBe('none');
  });

  it('starts with zero points, streak, and activities', () => {
    renderStore();
    expect(screen.getByTestId('points').textContent).toBe('0');
    expect(screen.getByTestId('streak').textContent).toBe('0');
    expect(screen.getByTestId('activities').textContent).toBe('0');
  });

  it('starts at Level 1', () => {
    renderStore();
    expect(screen.getByTestId('level').textContent).toBe('1');
  });
});

describe('AppContext — handleOnboardingComplete', () => {
  beforeEach(() => { localStorage.clear(); });

  it('sets the user profile userName after onboarding', () => {
    let store;
    renderStore((s) => { store = s; });

    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    expect(screen.getByTestId('profile').textContent).toBe('Abhinesh');
  });

  it(`awards ${WELCOME_BONUS_POINTS} points as a welcome bonus`, () => {
    let store;
    renderStore((s) => { store = s; });

    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    expect(screen.getByTestId('points').textContent).toBe(String(WELCOME_BONUS_POINTS));
  });

  it('sets streak to 1 on onboarding completion', () => {
    let store;
    renderStore((s) => { store = s; });

    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    expect(screen.getByTestId('streak').textContent).toBe('1');
  });
});

describe('AppContext — addActivity', () => {
  beforeEach(() => { localStorage.clear(); });

  it('increments activity count by 1 per logged entry', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    act(() => {
      store.addActivity({ category: 'transport', type: 'bus', amount: 10, co2e: 0.8, label: 'Bus ride' });
    });

    expect(screen.getByTestId('activities').textContent).toBe('1');
  });

  it('awards at least the base 10 points per logged activity', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    const pointsBefore = parseInt(screen.getByTestId('points').textContent, 10);
    act(() => {
      store.addActivity({ category: 'transport', type: 'bus', amount: 5, co2e: 0.4, label: 'Short bus' });
    });

    const pointsAfter = parseInt(screen.getByTestId('points').textContent, 10);
    expect(pointsAfter - pointsBefore).toBeGreaterThanOrEqual(10);
  });

  it('awards extra CO2 points for saving category activities', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    const pointsBefore = parseInt(screen.getByTestId('points').textContent, 10);
    act(() => {
      // saving category with 2.0 kg co2e → 2 × 15 + 10 = 40 extra points
      store.addActivity({ category: 'saving', co2e: 2.0, label: 'Vegan day' });
    });

    const pointsAfter = parseInt(screen.getByTestId('points').textContent, 10);
    expect(pointsAfter - pointsBefore).toBe(40);
  });

  it('accumulates co2SavedThisMonth from saving-category activities', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    act(() => {
      store.addActivity({ category: 'saving', co2e: 3.5, label: 'Bike commute' });
    });

    expect(parseFloat(screen.getByTestId('co2saved').textContent)).toBeCloseTo(3.5, 1);
  });
});

describe('AppContext — removeActivity', () => {
  beforeEach(() => { localStorage.clear(); });

  it('decrements activity count by 1 after removal', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });
    act(() => {
      store.addActivity({ category: 'transport', type: 'bus', co2e: 0.8, label: 'Bus' });
    });

    // Grab the id of the entry that was just added
    const activityId = store.activities[0].id;
    act(() => { store.removeActivity(activityId); });

    expect(screen.getByTestId('activities').textContent).toBe('0');
  });
});

describe('AppContext — handleCSVImport', () => {
  beforeEach(() => { localStorage.clear(); });

  it('rejects an empty CSV payload and leaves activity count unchanged', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    act(() => { store.handleCSVImport([]); });

    expect(screen.getByTestId('activities').textContent).toBe('0');
  });

  it(`awards ${CSV_IMPORT_BONUS} points on a valid import`, () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    const pointsBefore = parseInt(screen.getByTestId('points').textContent, 10);
    act(() => {
      store.handleCSVImport([
        { category: 'saving', co2e: 1.2, label: 'CSV Row A' },
        { category: 'transport', co2e: 0.4, label: 'CSV Row B' }
      ]);
    });

    const pointsAfter = parseInt(screen.getByTestId('points').textContent, 10);
    expect(pointsAfter - pointsBefore).toBe(CSV_IMPORT_BONUS);
  });

  it('appends all valid CSV rows to the activities list', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });

    act(() => {
      store.handleCSVImport([
        { category: 'saving', co2e: 1.2, label: 'Row A' },
        { category: 'saving', co2e: 0.8, label: 'Row B' },
        { category: 'transport', co2e: 0.4, label: 'Row C' }
      ]);
    });

    expect(screen.getByTestId('activities').textContent).toBe('3');
  });
});

describe('AppContext — level progression', () => {
  beforeEach(() => { localStorage.clear(); });

  it('advances from Level 1 to Level 2 after crossing 100 points', () => {
    let store;
    renderStore((s) => { store = s; });

    // Welcome bonus is 50 points (Level 1). Add a high-CO2 saving to cross 100.
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });
    // saving 5 kg CO2 = 5 × 15 + 10 = 85 points → total 135 → Level 2
    act(() => {
      store.addActivity({ category: 'saving', co2e: 5.0, label: 'Big eco day' });
    });

    expect(screen.getByTestId('level').textContent).toBe('2');
  });
});

describe('AppContext — window.confirm mock for handleReset', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('clears all state when user confirms reset', () => {
    let store;
    renderStore((s) => { store = s; });
    act(() => { store.handleOnboardingComplete(MOCK_PROFILE); });
    act(() => {
      store.addActivity({ category: 'saving', co2e: 1.0, label: 'Activity' });
    });

    act(() => { store.handleReset(); });

    expect(screen.getByTestId('profile').textContent).toBe('none');
    expect(screen.getByTestId('points').textContent).toBe('0');
    expect(screen.getByTestId('activities').textContent).toBe('0');
  });
});

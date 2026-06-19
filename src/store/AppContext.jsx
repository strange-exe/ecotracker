import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { safeReadStorage, writeStorage, removeStorage, KEYS } from '../services/storage';
import { buildActivity, sanitiseCSVImport } from '../services/activityService';
import { MOCK_ACTIONS } from '../domain/mockData';
import {
  computeLevel,
  computeActivityPoints,
  computeActionPoints,
  checkLevelUp,
  WELCOME_BONUS_POINTS,
  CSV_IMPORT_BONUS
} from '../domain/scoring';
import { useToast } from '../hooks/useToast';

const AppContext = createContext(null);

/**
 * AppProvider — wraps the entire app with global state.
 * All business state (profile, activities, actions, points, streak) lives here.
 * Components consume it via useAppStore().
 */
export function AppProvider({ children }) {
  const { toast, showToast } = useToast();

  // ── Persisted State ────────────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState(() =>
    safeReadStorage(KEYS.PROFILE, null)
  );
  const [activities, setActivities] = useState(() =>
    safeReadStorage(KEYS.ACTIVITIES, [])
  );
  const [actions, setActions] = useState(() => {
    const saved = safeReadStorage(KEYS.ACTIONS, null);
    return saved ?? MOCK_ACTIONS.map(act => ({ ...act, completed: false, accepted: false }));
  });
  const [streakDays, setStreakDays] = useState(() =>
    safeReadStorage(KEYS.STREAK, 0)
  );
  const [points, setPoints] = useState(() =>
    safeReadStorage(KEYS.POINTS, 0)
  );

  // ── localStorage Sync ──────────────────────────────────────────────────────
  useEffect(() => {
    if (userProfile) writeStorage(KEYS.PROFILE, userProfile);
    else removeStorage(KEYS.PROFILE);
  }, [userProfile]);

  useEffect(() => { writeStorage(KEYS.ACTIVITIES, activities); }, [activities]);
  useEffect(() => { writeStorage(KEYS.ACTIONS, actions); }, [actions]);
  useEffect(() => { writeStorage(KEYS.STREAK, streakDays); }, [streakDays]);
  useEffect(() => { writeStorage(KEYS.POINTS, points); }, [points]);

  // ── Derived State ──────────────────────────────────────────────────────────
  const co2SavedThisMonth = useMemo(() => {
    const actionSavings = actions
      .filter(act => act.completed)
      .reduce((sum, act) => sum + act.co2Saved, 0);
    const logSavings = activities
      .filter(act => act.category === 'saving')
      .reduce((sum, act) => sum + act.co2e, 0);
    return parseFloat((actionSavings + logSavings).toFixed(2));
  }, [actions, activities]);

  const userLevel = useMemo(() => computeLevel(points), [points]);

  // ── Internal Helpers ───────────────────────────────────────────────────────
  const _addPoints = useCallback((reward) => {
    setPoints(prev => {
      const next = prev + reward;
      const { leveledUp, newLevel } = checkLevelUp(prev, next);
      if (leveledUp) {
        setTimeout(() => showToast(`Level Up! You are now Level ${newLevel} Eco Guardian!`, 'success'), 500);
      }
      return next;
    });
  }, [showToast]);

  const _incrementStreak = useCallback((milestoneMsg) => {
    setStreakDays(prev => {
      const next = (prev || 0) + 1;
      if (next > 0 && next % 5 === 0) {
        setTimeout(() => showToast(`Streak Milestone! ${next} days active!`, 'success'), 800);
      }
      return next;
    });
    if (milestoneMsg) showToast(milestoneMsg, 'success');
  }, [showToast]);

  // ── Public Actions ─────────────────────────────────────────────────────────
  const handleOnboardingComplete = useCallback((profileData) => {
    setUserProfile(profileData);
    setStreakDays(1);
    setPoints(WELCOME_BONUS_POINTS);
    showToast(`Profile created! Welcome bonus +${WELCOME_BONUS_POINTS} points earned.`, 'success');
  }, [showToast]);

  const addActivity = useCallback((activityData) => {
    const activity = buildActivity(activityData);
    setActivities(prev => [activity, ...prev]);
    const reward = computeActivityPoints(activity);
    _addPoints(reward);
    _incrementStreak();
    showToast(`Logged: ${activity.label}. +${reward} points!`, 'success');
  }, [_addPoints, _incrementStreak, showToast]);

  const removeActivity = useCallback((id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
    showToast('Logged entry deleted.', 'info');
  }, [showToast]);

  const completeAction = useCallback((id) => {
    setActions(prev => prev.map(act => {
      if (act.id !== id || act.completed) return act;
      const reward = computeActionPoints(act);
      _addPoints(reward);
      setStreakDays(s => s + 1);
      setTimeout(() => {
        showToast(`Completed "${act.title}"! Saved ${act.co2Saved}kg CO2 & earned ${reward} points!`, 'success');
      }, 100);
      return { ...act, completed: true, accepted: true };
    }));
  }, [_addPoints, showToast]);

  const handleCSVImport = useCallback((importedLogs) => {
    const { ok, logs, error } = sanitiseCSVImport(importedLogs);
    if (!ok) {
      showToast(error, 'error');
      return;
    }
    setActivities(prev => [...logs, ...prev]);
    _addPoints(CSV_IMPORT_BONUS);
    showToast(`Imported ${logs.length} logs from CSV! +${CSV_IMPORT_BONUS} pts`, 'success');
  }, [_addPoints, showToast]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all tracking data and start onboarding again?')) {
      setUserProfile(null);
      setActivities([]);
      setActions(MOCK_ACTIONS.map(act => ({ ...act, completed: false, accepted: false })));
      setStreakDays(0);
      setPoints(0);
      showToast('Data reset complete.', 'info');
    }
  }, [showToast]);

  const value = {
    // State
    userProfile,
    activities,
    actions,
    streakDays,
    points,
    userLevel,
    co2SavedThisMonth,
    toast,
    // Actions
    handleOnboardingComplete,
    addActivity,
    removeActivity,
    completeAction,
    handleCSVImport,
    handleReset
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useAppStore — consume global application state and actions.
 * Must be used inside <AppProvider>.
 */
export const useAppStore = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within <AppProvider>');
  return ctx;
};

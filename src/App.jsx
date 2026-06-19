import { useState, Suspense, lazy } from 'react';
import { AppProvider, useAppStore } from './store/AppContext';
import Onboarding from './components/onboarding/Onboarding';
import Dashboard from './components/dashboard/Dashboard';
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import AmbientParticles from './components/shared/AmbientParticles';
import SectionLoader from './components/shared/SectionLoader';
import Toast from './components/shared/Toast';

// Code-split lazy imports — keep initial bundle lean
const ActionsFeed   = lazy(() => import('./components/ActionsFeed'));
const Analytics     = lazy(() => import('./components/Analytics'));
const Leaderboard   = lazy(() => import('./components/Leaderboard'));
const Integrations  = lazy(() => import('./components/Integrations'));

/**
 * AppShell — renders either the onboarding wizard or the full logged-in experience.
 * Consumes global state exclusively from AppContext; no prop-drilling.
 */
function AppShell() {
  const {
    userProfile,
    activities,
    actions,
    points,
    streakDays,
    userLevel,
    co2SavedThisMonth,
    toast,
    handleOnboardingComplete,
    addActivity,
    removeActivity,
    completeAction,
    handleCSVImport
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Onboarding ────────────────────────────────────────────────────────────
  if (!userProfile) {
    return (
      <>
        <AmbientParticles />
        <Onboarding onComplete={handleOnboardingComplete} />
      </>
    );
  }

  // ── Logged-in Shell ───────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
      {/* WCAG 2.4.1 — Skip Navigation */}
      <a href="#main-content" className="skip-nav">Skip to main content</a>

      <AmbientParticles />
      <Toast toast={toast} />
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main id="main-content" className="container" style={{ flex: 1, paddingBottom: '4rem' }}>

        {activeTab === 'dashboard' && (
          <Dashboard
            userProfile={userProfile}
            activities={activities}
            onAddActivity={addActivity}
            onRemoveActivity={removeActivity}
            actions={actions}
            onCompleteAction={completeAction}
            co2Saved={co2SavedThisMonth}
            points={points}
          />
        )}

        <Suspense fallback={<SectionLoader />}>
          {activeTab === 'actions' && (
            <ActionsFeed actions={actions} onCompleteAction={completeAction} />
          )}
          {activeTab === 'analytics' && (
            <Analytics
              userProfile={userProfile}
              activities={activities}
              onRemoveActivity={removeActivity}
              co2Saved={co2SavedThisMonth}
            />
          )}
          {activeTab === 'leaderboard' && (
            <Leaderboard
              userProfile={userProfile}
              co2Saved={co2SavedThisMonth}
              streakDays={streakDays}
              userLevel={userLevel}
            />
          )}
          {activeTab === 'sync' && (
            <Integrations
              userProfile={userProfile}
              onImportCSV={handleCSVImport}
              onAddActivity={addActivity}
            />
          )}
        </Suspense>

      </main>

      <AppFooter />
    </div>
  );
}

/**
 * App — root component. Wraps everything with the global AppProvider.
 */
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

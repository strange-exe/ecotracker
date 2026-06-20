import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppFooter from '../components/layout/AppFooter';
import SectionLoader from '../components/shared/SectionLoader';
import Toast from '../components/shared/Toast';
import AppHeader from '../components/layout/AppHeader';

// Mock the state hook to prevent requiring full context wrapping
vi.mock('../store/AppContext', () => ({
  useAppStore: () => ({
    streakDays: 5,
    userLevel: 2,
    handleReset: vi.fn()
  })
}));

describe('UI Component Unit Tests', () => {
  test('AppFooter renders copyright and privacy statement', () => {
    render(<AppFooter />);
    expect(screen.getByText(/EcoTrack/i)).toBeInTheDocument();
    expect(screen.getByText(/All data strictly saved client-side/i)).toBeInTheDocument();
  });

  test('SectionLoader renders loading message and role status', () => {
    render(<SectionLoader />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Loading Eco-Metrics/i)).toBeInTheDocument();
  });

  test('Toast renders notification message correctly', () => {
    const toastData = { message: 'Action Completed successfully!', type: 'success' };
    render(<Toast toast={toastData} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Action Completed successfully!')).toBeInTheDocument();
  });

  test('AppHeader renders application title and navigation links', () => {
    const onTabChange = vi.fn();
    render(<AppHeader activeTab="dashboard" onTabChange={onTabChange} />);
    expect(screen.getByText('EcoTrack')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByText('Lvl 2')).toBeInTheDocument();
  });
});

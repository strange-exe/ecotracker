import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTiltMove, handleTiltLeave } from '../utils/tiltHandlers';

// ─── Unit Tests: tiltHandlers.js ──────────────────────────────────────────────

describe('handleTiltMove', () => {
  let mockEl;

  beforeEach(() => {
    // Mock a DOM element with CSS variable support
    const styles = {};
    mockEl = {
      style: {
        setProperty: vi.fn((key, value) => { styles[key] = value; }),
        getPropertyValue: (key) => styles[key] || '',
      },
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 200,
        height: 150,
      })),
    };
  });

  it('does not tilt when prefers-reduced-motion is active', () => {
    // Mock matchMedia to return prefers-reduced-motion: reduce
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const mockEvent = {
      currentTarget: mockEl,
      clientX: 100,
      clientY: 75,
    };
    handleTiltMove(mockEvent);
    expect(mockEl.style.setProperty).not.toHaveBeenCalled();
  });

  it('applies CSS variables when motion is allowed', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const mockEvent = {
      currentTarget: mockEl,
      clientX: 200, // far right → positive ry
      clientY: 0,   // top → positive rx
    };
    handleTiltMove(mockEvent, 6);
    expect(mockEl.style.setProperty).toHaveBeenCalledWith('--rx', expect.any(String));
    expect(mockEl.style.setProperty).toHaveBeenCalledWith('--ry', expect.any(String));
  });
});

describe('handleTiltLeave', () => {
  it('resets tilt CSS variables to zero on mouse leave', () => {
    const mockEl = {
      style: { setProperty: vi.fn() }
    };
    handleTiltLeave({ currentTarget: mockEl });
    expect(mockEl.style.setProperty).toHaveBeenCalledWith('--rx', '0deg');
    expect(mockEl.style.setProperty).toHaveBeenCalledWith('--ry', '0deg');
  });
});

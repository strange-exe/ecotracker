import { useState, useCallback, useRef } from 'react';

/**
 * useToast — manages a single toast notification with auto-dismiss.
 * Uses a ref to cancel any in-flight timer before starting a new one,
 * preventing a rapid second call from clearing the newer toast early.
 *
 * @param {number} [duration=4000] - Auto-dismiss delay in ms
 * @returns {{ toast: Object|null, showToast: Function }}
 */
export const useToast = (duration = 4000) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, [duration]);

  return { toast, showToast };
};

import { useState, useCallback } from 'react';

/**
 * useToast — manages a single toast notification with auto-dismiss.
 *
 * @param {number} [duration=4000] - Auto-dismiss delay in ms
 * @returns {{ toast: Object|null, showToast: Function }}
 */
export const useToast = (duration = 4000) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, [duration]);

  return { toast, showToast };
};

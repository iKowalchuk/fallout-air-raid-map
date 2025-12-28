import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a throttled version of the callback that only executes
 * at most once per specified delay (in milliseconds).
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): T {
  const lastCall = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall.current;

      if (timeSinceLastCall >= delay) {
        lastCall.current = now;
        callback(...args);
      } else if (!timeoutRef.current) {
        // Schedule a trailing call
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeoutRef.current = null;
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay],
  ) as T;
}

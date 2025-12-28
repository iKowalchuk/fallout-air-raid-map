import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a throttled version of the callback that only executes
 * at most once per specified delay (in milliseconds).
 *
 * The trailing call uses the most recent arguments, not stale ones.
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): T {
  const lastCall = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

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

      // Always store the latest args for trailing call
      lastArgsRef.current = args;

      if (timeSinceLastCall >= delay) {
        lastCall.current = now;
        callback(...args);
      } else if (!timeoutRef.current) {
        // Schedule a trailing call with the most recent args
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeoutRef.current = null;
          // Use the most recent args, not the stale ones from closure
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
          }
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay],
  ) as T;
}

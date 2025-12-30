/**
 * Creates a throttled version of an async function.
 * Ensures the function is called at most once per specified delay.
 *
 * Features:
 * - Queues the latest call if invoked during throttle period
 * - Provides flush() to execute immediately bypassing throttle
 * - Provides cancel() to clear pending execution
 */

export interface ThrottledAsyncFunction<T> {
  (): Promise<T | undefined>;
  flush: () => Promise<T | undefined>;
  cancel: () => void;
}

export function throttlePromise<T>(
  fn: () => Promise<T>,
  delayMs: number,
): ThrottledAsyncFunction<T> {
  let lastExecutionTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isExecuting = false;
  let pendingResolvers: Array<(value: T | undefined) => void> = [];

  const execute = async (): Promise<T | undefined> => {
    if (isExecuting) {
      // Already executing, return a promise that will be resolved when done
      return new Promise<T | undefined>((resolve) => {
        pendingResolvers.push(resolve);
      });
    }

    isExecuting = true;
    lastExecutionTime = Date.now();
    timeoutId = null;

    try {
      const result = await fn();

      // Resolve all pending callers with the same result
      for (const resolve of pendingResolvers) {
        resolve(result);
      }
      pendingResolvers = [];

      return result;
    } catch (error) {
      console.error("[throttlePromise] Execution failed:", error);

      // Resolve all pending callers with undefined on error
      for (const resolve of pendingResolvers) {
        resolve(undefined);
      }
      pendingResolvers = [];

      return undefined;
    } finally {
      isExecuting = false;
    }
  };

  const throttled = async (): Promise<T | undefined> => {
    const now = Date.now();
    const elapsed = now - lastExecutionTime;

    // If enough time has passed, execute immediately
    if (elapsed >= delayMs && !isExecuting) {
      return execute();
    }

    // If already have a pending timeout or execution, return a promise
    if (timeoutId !== null || isExecuting) {
      return new Promise<T | undefined>((resolve) => {
        pendingResolvers.push(resolve);
      });
    }

    // Schedule execution after remaining delay
    const remainingDelay = delayMs - elapsed;

    return new Promise<T | undefined>((resolve) => {
      pendingResolvers.push(resolve);
      timeoutId = setTimeout(() => {
        void execute();
      }, remainingDelay);
    });
  };

  throttled.flush = async (): Promise<T | undefined> => {
    // Cancel any pending timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Execute immediately (will resolve all pending callers)
    return execute();
  };

  throttled.cancel = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Resolve all pending callers with undefined
    for (const resolve of pendingResolvers) {
      resolve(undefined);
    }
    pendingResolvers = [];
  };

  return throttled;
}

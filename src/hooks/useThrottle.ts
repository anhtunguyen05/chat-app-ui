import { useCallback, useRef } from "react";

/**
 * Hook throttle — giới hạn tần suất thực thi của một callback
 * @param callback - Hàm cần throttle
 * @param delay - Khoảng thời gian delay (ms)
 */
export function useThrottle<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;
}

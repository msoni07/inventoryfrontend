// Utility methods

// Generic debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null; // Reset timeoutId after cancelling
    }
  };

  return debounced as ((...args: Parameters<T>) => void) & { cancel: () => void };
} 
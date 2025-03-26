
import { prefetchCommonData } from '@/services/bookServiceFixed';

/**
 * Utility to prefetch data when the app loads
 * This helps improve perceived performance by loading common data early
 */
export const setupPrefetching = () => {
  // Initial prefetch on app load
  prefetchCommonData().catch(console.error);
  
  // Set up periodic prefetching for fresh data
  const prefetchInterval = setInterval(() => {
    prefetchCommonData().catch(console.error);
  }, 60 * 60 * 1000); // Refresh data every hour
  
  // Clean up interval on app unmount
  return () => clearInterval(prefetchInterval);
};

export default setupPrefetching;

// performances.js
import React from 'react';

export default function PerformancesPage() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const LazyComponent = React.useMemo(() => {
    return React.lazy(() =>
      isMobile
        ? import('./performances_mobile')
        : import('./performances_desktop')
    );
  }, [isMobile]);

  return (
    <React.Suspense fallback={<div>Loading performances...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
}

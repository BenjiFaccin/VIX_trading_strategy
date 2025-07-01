import React from 'react';

export default function OverviewPage() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const LazyComponent = React.useMemo(() => {
    return React.lazy(() =>
      isMobile
        ? import('./overview_mobile') // version mobile
        : import('./overview_desktop') // ta version actuelle
    );
  }, [isMobile]);

  return (
    <React.Suspense fallback={<div>Loading overview...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
}

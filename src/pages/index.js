import React, { useEffect, useState } from 'react';
import MobilePage from './index_mobile';
import DesktopPage from './index_desktop';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function Home() {
  const isMobile = useIsMobile();
  return isMobile ? <MobilePage /> : <DesktopPage />;
}

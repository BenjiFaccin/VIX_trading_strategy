import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  // Helper functions to check trading hours and compute countdown
  function isUsTradingHours() {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const hour = now.getUTCHours(); // using UTC
    const minute = now.getUTCMinutes();
    // US market (EST) open: Mon-Fri, 9:30am to 4:00pm EST = 14:30 to 21:00 UTC
    const isBusinessDay = day >= 1 && day <= 5;
    const isTradingHour =
      (hour > 14 || (hour === 14 && minute >= 30)) &&
      hour < 21;
    return isBusinessDay && isTradingHour;
  }

  function getNextTradingCountdown() {
    const now = new Date();
    let next = new Date(now);
    // Set to next open at 14:30 UTC
    next.setUTCHours(14, 30, 0, 0);
    // If that time is in the past (or today isn’t a business day), move ahead until it's valid.
    while (next <= now || next.getDay() === 0 || next.getDay() === 6) {
      next.setUTCDate(next.getUTCDate() + 1);
      next.setUTCHours(14, 30, 0, 0); // reset hours for each new day
    }
    const diff = next - now;
    const seconds = Math.floor(diff / 1000);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}:${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Set up React state and update loop
  const [isLive, setIsLive] = React.useState(false);
  const [countdown, setCountdown] = React.useState('');

  React.useEffect(() => {
    const updateStatus = () => {
      const live = isUsTradingHours();
      setIsLive(live);
      if (!live) {
        setCountdown(getNextTradingCountdown());
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={clsx('hero hero--primary', styles.heroBanner)}
      style={{ position: 'relative' }} // important for absolute positioning of live status
    >
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/performances">
            Performances ➡️
          </Link>
        </div>
        {/* Live Status box, placed in the bottom-right corner of the hero section */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '30px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            fontWeight: 'bold',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          <span>Live Status: {isLive ? '🟢' : '🔴'}</span>
          {!isLive && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Bot live in {countdown}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A bull intraday put-spread automated trading algo strategy on VIX."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

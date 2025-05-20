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

  // Convert current time to New York time
  const nyTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );

  const day = nyTime.getDay(); // Sunday = 0, Saturday = 6
  const hour = nyTime.getHours();
  const minute = nyTime.getMinutes();

  const isBusinessDay = day >= 1 && day <= 5;
  const isTradingHour =
    (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

  return isBusinessDay && isTradingHour;
}


  function getNextTradingCountdown() {
  const now = new Date();

  // Get current time in New York
  const nyNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/New_York' })
  );

  let nextOpen = new Date(nyNow);
  nextOpen.setHours(9, 30, 0, 0); // Next open at 9:30 AM

  // If it's after today's open time, or not a business day, move to next weekday
  while (
    nextOpen <= nyNow || // time has passed
    nextOpen.getDay() === 0 || // Sunday
    nextOpen.getDay() === 6 // Saturday
  ) {
    nextOpen.setDate(nextOpen.getDate() + 1);
    nextOpen.setHours(9, 30, 0, 0);
  }

  // Convert both times back to UTC timestamps
  const utcNext = new Date(nextOpen.toLocaleString('en-US', { timeZone: 'UTC' }));
  const diff = utcNext - now;
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

import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  // 🕒 Get NY time reliably
  function getNewYorkTime() {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parts = formatter.formatToParts(new Date());
    const obj = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    return new Date(`${obj.year}-${obj.month}-${obj.day}T${obj.hour}:${obj.minute}:${obj.second}`);
  }

  // 🕒 Detect if it's a US trading day + hours (based on NY time)
  function isUsTradingHours() {
    const nyTime = getNewYorkTime();

    const day = nyTime.getDay(); // Sunday = 0, Saturday = 6
    const hour = nyTime.getHours();
    const minute = nyTime.getMinutes();

    const isBusinessDay = day >= 1 && day <= 5;
    const isTradingHour =
      (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

    return isBusinessDay && isTradingHour;
  }

  // ⏳ Countdown to next market OPEN (9:30 AM NY time)
  function getNextTradingCountdown() {
    const nyNow = getNewYorkTime();

    let nextOpen = new Date(nyNow);
    nextOpen.setHours(9, 30, 0, 0);

    while (
      nextOpen <= nyNow ||
      nextOpen.getDay() === 0 || // Sunday
      nextOpen.getDay() === 6    // Saturday
    ) {
      nextOpen.setDate(nextOpen.getDate() + 1);
      nextOpen.setHours(9, 30, 0, 0);
    }

    const diff = nextOpen.getTime() - nyNow.getTime();
    return formatCountdown(diff);
  }

  // ⏳ Countdown to market CLOSE (4:00 PM NY time)
  function getMarketCloseCountdown() {
    const nyNow = getNewYorkTime();

    const nyClose = new Date(nyNow);
    nyClose.setHours(16, 0, 0, 0);

    const diff = nyClose.getTime() - nyNow.getTime();

    if (diff <= 0) return '0:00:00:00';

    return formatCountdown(diff);
  }

  // 🔢 Format ms diff to d:hh:mm:ss
  function formatCountdown(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${d}:${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // 🔁 State management
  const [isLive, setIsLive] = React.useState(false);
  const [countdown, setCountdown] = React.useState('');
  const [liveEndCountdown, setLiveEndCountdown] = React.useState('');

  React.useEffect(() => {
    const updateStatus = () => {
      const live = isUsTradingHours();
      setIsLive(live);

      if (live) {
        setLiveEndCountdown(getMarketCloseCountdown());
      } else {
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
      style={{ position: 'relative' }}
    >
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/performances"
          >
            Performances ➡️
          </Link>
        </div>

        {/* ✅ LIVE STATUS BOX */}
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
          {isLive ? (
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Bot live ends in {liveEndCountdown}
            </div>
          ) : (
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
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A bear intraday put-spread automated trading algo strategy on VIX."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

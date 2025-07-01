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
    const day = nyTime.getDay();
    const hour = nyTime.getHours();
    const minute = nyTime.getMinutes();
    return day >= 1 && day <= 5 && ((hour > 9 || (hour === 9 && minute >= 30)) && hour < 16);
  }

  // ⏳ Countdown to next market OPEN (9:30 AM NY time)
  function getNextTradingCountdown() {
    const nyNow = getNewYorkTime();
    let nextOpen = new Date(nyNow);
    nextOpen.setHours(9, 30, 0, 0);
    while (nextOpen <= nyNow || nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1);
      nextOpen.setHours(9, 30, 0, 0);
    }
    return formatCountdown(nextOpen.getTime() - nyNow.getTime());
  }

  // ⏳ Countdown to market CLOSE (4:00 PM NY time)
  function getMarketCloseCountdown() {
    const nyNow = getNewYorkTime();
    const nyClose = new Date(nyNow);
    nyClose.setHours(16, 0, 0, 0);
    const diff = nyClose.getTime() - nyNow.getTime();
    return diff <= 0 ? '0:00:00:00' : formatCountdown(diff);
  }

  // 🔢 Format ms diff to d:hh:mm:ss
  function formatCountdown(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${d}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // 🔁 State
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
      style={{ position: 'relative', paddingBottom: '4.5rem' }}
    >
      <div className="container" style={{ position: 'relative' }}>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary"
            style={{
              fontSize: '0.8rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
            }}
            to="/performances"
          >
            Performances ➡️
          </Link>
        </div>

        {/* ✅ LIVE STATUS for MOBILE – adjusted */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '15px',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: 'white',
            fontWeight: 500,
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.65rem',
            maxWidth: '140px',
            lineHeight: 1.2,
            textAlign: 'right',
            zIndex: 10,
          }}
        >
          <span>Live Status: {isLive ? '🟢' : '🔴'}</span>
          <div style={{ fontSize: '0.6rem', marginTop: '0.2rem' }}>
            {isLive ? `Ends in ${liveEndCountdown}` : `Bot live in ${countdown}`}
          </div>
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

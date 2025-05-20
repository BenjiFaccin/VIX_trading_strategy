import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// Helper functions
function isUsTradingHours() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const isBusinessDay = day >= 1 && day <= 5;
  const isTradingHour = (hour > 14 || (hour === 14 && minute >= 30)) && hour < 21;
  return isBusinessDay && isTradingHour;
}

function getNextTradingCountdown() {
  const now = new Date();
  let next = new Date(now);
  next.setUTCHours(14, 30, 0, 0);
  while (next <= now || next.getDay() === 0 || next.getDay() === 6) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  const diff = Math.max(0, next - now);
  const seconds = Math.floor(diff / 1000);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Feature list
const FeatureList = [
  {
    title: '3300+ EoD files',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        3315 historical daily End of Day data for VIX option chain (from 2010 to 2023).
      </>
    ),
  },
  {
    title: '2500+ backtested profiles',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Backtesting put-spreads from 50 different VIX prices (50^2 = 2500 profiles generated).
      </>
    ),
  },
  {
    title: 'Automated Algorithmic Trading',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        With 20+ codes and 5000+ lines of code, this trading strategy is fully automated and managed by AI agents through a 24/7 operating virtual machine.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
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
    <section className={styles.features}>
      <div className="container" style={{ position: 'relative' }}>
        {/* TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="hero__title">VIX Trading</h1>
          <p className="hero__subtitle">A Bull Put-spread Strategy</p>
        </div>

        {/* STATUS INDICATOR */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          color: 'white',
          fontWeight: 'bold',
          background: 'rgba(0,0,0,0.5)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
        }}>
          <span>Live Status: {isLive ? '🟢' : '🔴'}</span>
          {!isLive && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
              Bot live in {countdown}
            </div>
          )}
        </div>

        {/* FEATURES */}
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

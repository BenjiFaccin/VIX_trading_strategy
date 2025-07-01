import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import React from 'react';

// Hook pour détecter le format mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

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
        With 20+ codes and 5000+ lines of code, this trading strategy
        is fully automated and managed by AI agents through a 24/7 operating virtual machine.    
      </>
    ),
  },
];

function Feature({Svg, title, description, isMobile}) {
  return (
    <div className={clsx('col', isMobile ? 'col--12' : 'col--4', styles.featureItem)}>
      <div className="text--center">
        <Svg className={clsx(styles.featureSvg, isMobile && styles.featureSvgMobile)} role="img" />
      </div>
      <div className={clsx('text--center padding-horiz--md', isMobile && styles.mobileText)}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HeroBannerMobile() {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroText}>
        <h1 className={styles.heroTitle}>VIX Trading</h1>
        <p className={styles.heroSubtitle}>A Bear Put-spread Strategy</p>
        <button className={styles.performanceButton}>Performances ➡️</button>
      </div>

      <div className={styles.liveStatusMobile}>
        <strong>Live Status :</strong> 🔴<br />
        <small>Bot live in 0:04:04:10</small>
      </div>
    </div>
  );
}


export default function HomepageFeatures() {
  const isMobile = useIsMobile();

  return (
    <section className={styles.features}>
      <div className="container">
        {isMobile && <HeroBannerMobile />}
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  );
}

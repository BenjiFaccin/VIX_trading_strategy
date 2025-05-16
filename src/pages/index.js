import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

<header className={clsx('hero hero--primary', styles.heroBanner)}>
  <div className={styles.overlayWrapper}>
    <img
      src="/img/BackgroundHomepage.png"
      alt="VIX Trading background"
      className={styles.heroImageOverlay}
    />
    <div className={styles.textOverlay}>
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
    </div>
  </div>
</header>




export default function Home() {
  const { siteConfig } = useDocusaurusContext();
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


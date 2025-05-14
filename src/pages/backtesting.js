import React from 'react';
import Layout from '@theme/Layout';

export default function GeneralMetricsBacktesting() {
  const totalBacktestedTx = 21485;
  const percentageSelected = 1.52;

  const formatTxCount = (num) => {
    if (num >= 100_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 10_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 100_000) return (num / 1_000).toFixed(2) + 'k';
    if (num >= 10_000) return (num / 1_000).toFixed(2) + 'k';
    return num.toString();
  };

  return (
    <Layout title="General Metrics Backtesting">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <div style={{
          background: '#002244',
          color: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          General Metrics Backtesting
        </div>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '2rem',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          {/* Box 1: Total Transactions */}
          <div style={metricBoxStyle}>
            <span style={metricValueStyle}>
              {formatTxCount(totalBacktestedTx)}
            </span>
            <span style={metricLabelStyle}>
              Number of total transactions backtested
            </span>
          </div>

          {/* Box 2: VIX Interval */}
          <div style={metricBoxStyle}>
            <span style={{ fontSize: '2.5rem', fontWeight: '600' }}>
              [10.00 : 60.00]
            </span>
            <span style={metricLabelStyle}>
              VIX Interval Backtested
            </span>
          </div>

          {/* Box 3: % of Profiles Selected */}
          <div style={metricBoxStyle}>
            <span style={metricValueStyle}>
              {percentageSelected.toFixed(2)}%
            </span>
            <span style={metricLabelStyle}>
              % of best profiles selected (38 out of 2500)
            </span>
          </div>
        </div>
      </main>
    </Layout>
  );
}

// 💅 Shared styles
const metricBoxStyle = {
  flex: '1 1 30%',
  background: '#fff',
  padding: '1rem 1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  textAlign: 'center',
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const metricValueStyle = {
  fontSize: '3rem',
  fontWeight: '600'
};

const metricLabelStyle = {
  fontSize: '0.9rem',
  color: '#444'
};

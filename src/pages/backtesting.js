import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function GeneralMetricsBacktesting() {
  const [totalBacktestedTx, setTotalBacktestedTx] = useState(0);

  const summaryCsvUrl = useBaseUrl('/data/Selected_Strategies_Summary.csv');

  useEffect(() => {
    fetch(summaryCsvUrl)
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const total = results.data.reduce((acc, row) => {
              const trades = parseInt(row['Number of Trades']) || 0;
              return acc + trades;
            }, 0);
            setTotalBacktestedTx(total);
          }
        });
      });
  }, []);

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
          background: '#002244', // dark blue
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
          justifyContent: 'space-between'
        }}>
          {/* Box 1 */}
          <div style={{
            flex: 1,
            background: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            textAlign: 'center',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '3rem', fontWeight: '600' }}>
              {formatTxCount(totalBacktestedTx)}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#444' }}>
              Number of total transactions backtested (selected profiles)
            </span>
          </div>

          {/* Box 2 */}
          <div style={{
            flex: 1,
            background: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            textAlign: 'center',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '600' }}>
              [10.00 : 60.00]
            </span>
            <span style={{ fontSize: '0.9rem', color: '#444' }}>
              VIX Interval Backtested
            </span>
          </div>
        </div>
      </main>
    </Layout>
  );
}

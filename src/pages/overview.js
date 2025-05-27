import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function OverviewPage() {
  const [trades, setTrades] = useState([]),
        [exitData, setExitData] = useState([]),
        [longLegTrades, setLongLegTrades] = useState([]),
        [shortLegTrades, setShortLegTrades] = useState([]),
        [sortConfig, setSortConfig] = useState({ key: 'Date', direction: 'desc' });

  const urls = {
    entry: useBaseUrl('/data/entry_trades.csv'),
    exit: useBaseUrl('/data/exit_trades.csv'),
    long: useBaseUrl('/data/longleg_trades.csv'),
    short: useBaseUrl('/data/shortleg_trades.csv')
  };

  const columns = {
    active: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','Current Expiry Value','AVG Expiry Value'],
    exited: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','AVG Backtested Return','Return'],
    exercised: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','AVG Backtested Return','Return'],
    shortExercised: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','AVG Backtested Return','Payoff']
  };

  const handleSort = key => setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
  }));

  const formatCell = (value, col) => {
    if (!value) return '—';
    const date = new Date(value);
    if (col === 'Date' && !isNaN(date)) return `${date.getMonth()+1}`.padStart(2, '0') + '/' + `${date.getDate()}`.padStart(2, '0') + '/' + date.getFullYear() + ' ' + `${date.getHours()}`.padStart(2, '0') + ':' + `${date.getMinutes()}`.padStart(2, '0');
    if (col === 'Option expiration date' && !isNaN(date)) return `${date.getMonth()+1}`.padStart(2, '0') + '/' + `${date.getDate()}`.padStart(2, '0') + '/' + date.getFullYear();
    const numCols = ['Current Expiry Value','AVG Expiry Value','AVG Backtested Return','Return','Payoff'];
    const num = parseFloat(value);
    return numCols.includes(col) && !isNaN(num) ? num.toFixed(2) : value;
  };

  const calculateBacktestedReturn = trade => {
    const avg = parseFloat(trade['AVG Expiry Value']),
          cost = parseFloat(trade['Total Costs']);
    return !isNaN(avg) && !isNaN(cost) ? avg - Math.abs(cost) : null;
  };

  const renderTable = (data, cols, filterFn, extraCols = {}) => (
    <table style={{ borderCollapse: 'collapse', width: '80%', maxWidth: '1000px' }}>
      <thead>
        <tr>
          {cols.map(col => (
            <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '8px', backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-color)', textAlign: 'center' }}>
              {col} {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.filter(filterFn).sort((a, b) => new Date(b['Date']) - new Date(a['Date'])).map((row, i) => (
          <tr key={i}>
            {cols.map(col => {
              let value = extraCols[col]?.(row) ?? formatCell(row[col], col);
              let className = '';
              if (['Return', 'Payoff'].includes(col)) {
                const num = parseFloat(value);
                if (!isNaN(num)) className = num > 0 ? 'return-positive' : (num < 0 ? 'return-negative' : '');
              }
              return <td key={col} style={{ border: '1px solid #eee', padding: '8px', textAlign: 'center' }} className={className}>{value}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  useEffect(() => {
    Promise.all(Object.values(urls).map(url => fetch(url).then(r => r.text())))
      .then(([entry, exit, long, short]) => {
        setTrades(Papa.parse(entry, { header: true, skipEmptyLines: true }).data);
        setExitData(Papa.parse(exit, { header: true, skipEmptyLines: true }).data);
        setLongLegTrades(Papa.parse(long, { header: true, skipEmptyLines: true }).data);
        setShortLegTrades(Papa.parse(short, { header: true, skipEmptyLines: true }).data);
      });
  }, []);

  return (
    <Layout title="Overview">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', scrollBehavior: 'smooth' }}>
        {/* Sticky Nav */}
        <nav style={{
          position: 'sticky',
          top: 0,
          background: '#fff',
          padding: '1rem',
          zIndex: 100,
          borderBottom: '1px solid #ddd',
          textAlign: 'center'
        }}>
          {[
            { id: 'active-trades', label: 'Active Trades' },
            { id: 'exited-trades', label: 'Exited Trades' },
            { id: 'long-leg', label: 'Exercised Long Leg Trades' },
            { id: 'short-leg', label: 'Exercised Short Leg Trades' }
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                margin: '0 1rem',
                color: '#0070f3',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Active Trades */}
        <h1 id="active-trades" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          Active trades: Put-Spreads
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          {renderTable(trades, columns.active, row => row['Status'] !== 'Exited')}
        </div>

        {/* Exited Trades */}
        <h1 id="exited-trades" style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          Exited trades
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderTable(trades, columns.exited, row => row['Status'] === 'Exited', {
            'Return': row => {
              const val = parseFloat(row["Current Expiry Value"]) + parseFloat(row["Total Costs"]) - 1.311;
              return !isNaN(val) ? val.toFixed(2) : '—';
            },
            'AVG Backtested Return': row => {
              const val = calculateBacktestedReturn(row);
              return !isNaN(val) ? val.toFixed(2) : '—';
            }
          })}
        </div>

        {/* Long Leg */}
        <h1 id="long-leg" style={{ textAlign: 'center', margin: '3rem 0 1.5rem', fontSize: '1.8rem' }}>
          Exercised Long leg Trades
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderTable(longLegTrades, columns.exercised, row => row['Status'] === 'Exercised', {
            'Return': row => parseFloat(row['Return'])?.toFixed(2),
            'AVG Backtested Return': row => calculateBacktestedReturn(row)?.toFixed(2)
          })}
        </div>

        {/* Short Leg */}
        <h1 id="short-leg" style={{ textAlign: 'center', margin: '3rem 0 1.5rem', fontSize: '1.8rem' }}>
          Exercised Short leg Trades
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderTable(shortLegTrades, columns.shortExercised, row => row['Status'] === 'Exercised', {
            'Payoff': row => parseFloat(row['Payoff'])?.toFixed(2),
            'AVG Backtested Return': row => calculateBacktestedReturn(row)?.toFixed(2)
          })}
        </div>
      </main>
    </Layout>
  );
}

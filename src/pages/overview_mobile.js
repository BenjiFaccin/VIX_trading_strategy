import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function OverviewPage() {
  const [trades, setTrades] = useState([]),
        [exitData, setExitData] = useState([]),
        [longLegTrades, setLongLegTrades] = useState([]),
        [shortLegTrades, setShortLegTrades] = useState([]),
        [checkTrades, setCheckTrades] = useState([]);

  const urls = {
    entry: useBaseUrl('/data/entry_trades.csv'),
    check: useBaseUrl('/data/checkexpvalue.csv'),
    exit: useBaseUrl('/data/exit_trades.csv'),
    long: useBaseUrl('/data/longleg_trades.csv'),
    short: useBaseUrl('/data/shortleg_trades.csv'),
  };

  const columns = {
    active: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','Current Expiry Value','AVG Expiry Value'],
    exited: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','AVG Backtested Return','Return'],
    exercised: ['Option expiration date','Strike long put','Status','Qty Buy','Total Costs','AVG Backtested Return','Return'],
    shortExercised: ['Option expiration date','Strike short put','Status','Qty Sell','Total Costs','AVG Backtested Return','Return']
  };

  const formatCell = (value, col) => {
    if (!value) return '—';
    const date = new Date(value);
    if (col === 'Date' && !isNaN(date)) return `${date.getMonth()+1}`.padStart(2, '0') + '/' + `${date.getDate()}`.padStart(2, '0') + '/' + date.getFullYear() + ' ' + `${date.getHours()}`.padStart(2, '0') + ':' + `${date.getMinutes()}`.padStart(2, '0');
    if (col === 'Option expiration date' && !isNaN(date)) return `${date.getMonth()+1}`.padStart(2, '0') + '/' + `${date.getDate()}`.padStart(2, '0') + '/' + date.getFullYear();
    const roundCols = ['Strike short put','Strike long put','Qty Buy','Qty Sell'];
    const floatCols = ['Current Expiry Value','AVG Expiry Value','AVG Backtested Return','Return','Payoff'];
    const num = parseFloat(value);
    if (roundCols.includes(col) && !isNaN(num)) return Math.ceil(num);
    if (floatCols.includes(col) && !isNaN(num)) return num.toFixed(2);
    return value;
  };

  const calculateBacktestedReturn = trade => {
    const avg = parseFloat(trade['AVG Expiry Value']);
    const cost = parseFloat(trade['Total Costs']);
    return !isNaN(avg) && !isNaN(cost) ? avg - Math.abs(cost) : null;
  };

  const renderTable = (data, cols, filterFn, extraCols = {}) => {
    const filtered = data.filter(filterFn);
    return (
      <table style={{ width: '100%', fontSize: '0.8rem', marginBottom: '2rem' }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col} style={{ border: '1px solid #ccc', padding: '6px', background: '#eee', textAlign: 'center' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={i}>
              {cols.map(col => {
                const val = extraCols[col]?.(row) ?? formatCell(row[col], col);
                const num = parseFloat(val);
                const style = (col === 'Return' || col === 'Payoff') && !isNaN(num)
                  ? { color: num > 0 ? 'green' : num < 0 ? 'red' : 'black' }
                  : {};
                return <td key={col} style={{ border: '1px solid #eee', padding: '6px', textAlign: 'center', ...style }}>{val}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    Promise.all(Object.values(urls).map(url => fetch(url).then(r => r.text())))
      .then(([entry, check, exit, long, short]) => {
        setTrades(Papa.parse(entry, { header: true, skipEmptyLines: true }).data);
        setCheckTrades(Papa.parse(check, { header: true, skipEmptyLines: true }).data);
        setExitData(Papa.parse(exit, { header: true, skipEmptyLines: true }).data);
        setLongLegTrades(Papa.parse(long, { header: true, skipEmptyLines: true }).data);
        setShortLegTrades(Papa.parse(short, { header: true, skipEmptyLines: true }).data);
      });
  }, []);

  return (
    <Layout title="Overview">
      <main style={{ padding: '1rem' }}>
        <h1 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '1rem' }}>
          Active trades: Put-Spreads
        </h1>
        {renderTable(checkTrades, columns.active, row => ['Filled', 'Partial/Cancelled'].includes(row['Status']))}

        <h1 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '1rem' }}>
          Exited trades
        </h1>
        {renderTable(exitData, columns.exited, row => row['Status'] === 'Exited', {
          'Return': row => {
            const exitPrice = parseFloat(row["Exit Price"]);
            const totalCosts = parseFloat(row["Total Costs"]);
            if (isNaN(exitPrice) || isNaN(totalCosts)) return '—';
            return (exitPrice * 100 + (totalCosts - 1.47)).toFixed(2);
          },
          'AVG Backtested Return': row => {
            const val = calculateBacktestedReturn(row);
            return !isNaN(val) ? val.toFixed(2) : '—';
          }
        })}

        <h1 style={{ textAlign: 'center', fontSize: '1.4rem', margin: '2rem 0 1rem' }}>
          Exercised Trades (Long & Short Legs)
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ textAlign: 'center', fontSize: '1.2rem' }}>Long leg Trades</h2>
            {renderTable(longLegTrades, columns.exercised, row => row['Status'] === 'Exercised', {
              'Return': row => parseFloat(row['Return'])?.toFixed(2),
              'AVG Backtested Return': row => calculateBacktestedReturn(row)?.toFixed(2)
            })}
          </div>

          <div>
            <h2 style={{ textAlign: 'center', fontSize: '1.2rem' }}>Short leg Trades</h2>
            {renderTable(shortLegTrades, columns.shortExercised, row => row['Status'] === 'Exercised', {
              'Return': row => parseFloat(row['Return'])?.toFixed(2),
              'AVG Backtested Return': row => calculateBacktestedReturn(row)?.toFixed(2)
            })}
          </div>
        </div>
      </main>
    </Layout>
  );
}

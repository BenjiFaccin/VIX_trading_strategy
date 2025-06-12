import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function OverviewPage() {
  const [trades, setTrades] = useState([]),
        [exitData, setExitData] = useState([]),
        [longLegTrades, setLongLegTrades] = useState([]),
        [shortLegTrades, setShortLegTrades] = useState([]),
        [sortConfigs, setSortConfigs] = useState({});

  const [checkTrades, setCheckTrades] = useState([]); 

  const urls = {
    entry: useBaseUrl('/data/entry_trades.csv'),
    check: useBaseUrl('/data/checkexpvalue.csv'), 
    exit: useBaseUrl('/data/exit_trades.csv'),
    long: useBaseUrl('/data/longleg_trades.csv'),
    short: useBaseUrl('/data/shortleg_trades.csv')
  };

  const columns = {
    active: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','Current Expiry Value','AVG Expiry Value'],
    exited: ['Date','Option expiration date','Strike short put','Strike long put','Status','Qty Buy','Qty Sell','Total Costs','AVG Backtested Return','Return'],
    exercised: ['Option expiration date','Strike long put','Status','Qty Buy','Total Costs','AVG Backtested Return','Return'],
   shortExercised: ['Option expiration date','Strike short put','Status','Qty Sell','Total Costs','AVG Backtested Return','Return']
 };

  const handleSort = (tableKey, key) => {
    setSortConfigs(prev => {
      const prevConfig = prev[tableKey] || { key: '', direction: 'asc' };
      const direction = prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      return { ...prev, [tableKey]: { key, direction } };
    });
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
    const avg = parseFloat(trade['AVG Expiry Value']),
          cost = parseFloat(trade['Total Costs']);
    return !isNaN(avg) && !isNaN(cost) ? avg - Math.abs(cost) : null;
  };

  const renderTable = (tableKey, data, cols, filterFn, extraCols = {}) => {
    const sortConfig = sortConfigs[tableKey] || { key: 'Date', direction: 'desc' };
    const sortedData = [...data].filter(filterFn).sort((a, b) => {
      const aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (!aVal || !bVal) return 0;
      const isDate = sortConfig.key.toLowerCase().includes('date');
      if (isDate) return sortConfig.direction === 'asc' ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
      const aNum = parseFloat(aVal), bNum = parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

    return (
      <table style={{
  borderCollapse: 'collapse',
  width: ['long', 'short'].includes(tableKey) ? '100%' : '100%',
  maxWidth: ['long', 'short'].includes(tableKey) ? '600px' : '100%'
}}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col} onClick={() => handleSort(tableKey, col)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '8px', backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-color)', textAlign: 'center' }}>
                {col} {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
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
  };

  useEffect(() => {
    Promise.all(Object.values(urls).map(url => fetch(url).then(r => r.text())))
      .then(([entry, check, exit, long, short]) => {
        setTrades(Papa.parse(entry, { header: true, skipEmptyLines: true }).data);
        setCheckTrades(Papa.parse(check, { header: true, skipEmptyLines: true }).data); // ✅ New line
        setExitData(Papa.parse(exit, { header: true, skipEmptyLines: true }).data);
        setLongLegTrades(Papa.parse(long, { header: true, skipEmptyLines: true }).data);
        setShortLegTrades(Papa.parse(short, { header: true, skipEmptyLines: true }).data);
      });
  }, []);

  return (
    <Layout title="Overview">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        {(() => {
  const activeFiltered = checkTrades.filter(row => ['Filled', 'Partial/Cancelled'].includes(row['Status'])); 
  return (
    <>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
        Active trades: Put-Spreads ({activeFiltered.length})
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
  <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
    {renderTable('active', activeFiltered, columns.active, () => true)}
  </div>
</div>
    </>
  );
})()}
        {(() => {
  const exitedFiltered = exitData.filter(row => row['Status'] === 'Exited');
  return (
    <>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
        Exited trades ({exitedFiltered.length})
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {renderTable('exited', exitedFiltered, columns.exited, () => true, {
  'Total Costs': row => {
    const cost = parseFloat(row['Total Costs']);
    if (isNaN(cost)) return '—';
    return (cost - 1.31).toFixed(2);
  },
  'Return': row => {
    const exitPrice = parseFloat(row["Exit Price"]);
    const totalCosts = parseFloat(row["Total Costs"]);
    if (isNaN(exitPrice) || isNaN(totalCosts)) return '—';
    const ret = exitPrice * 100 + (totalCosts - 1.47);
    return ret.toFixed(2);
  },
  'AVG Backtested Return': row => {
    const val = calculateBacktestedReturn(row);
    return !isNaN(val) ? val.toFixed(2) : '—';
  }
})}

      </div>
      </div>
    </>
  );
})()}
       {(() => {
  const longFiltered = longLegTrades.filter(row => row['Status'] === 'Exercised');
  const shortFiltered = shortLegTrades.filter(row => row['Status'] === 'Exercised');

  return (
    <>
      <h1 style={{ textAlign: 'center', margin: '3rem 0 1.5rem', fontSize: '1.8rem' }}>
        Exercised Trades (Long & Short Legs)
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Long leg Trades ({longFiltered.length})
          </h2>
          {renderTable('long', longFiltered, columns.exercised, () => true, {
            'Return': row => parseFloat(row['Return'])?.toFixed(2),
            'AVG Backtested Return': row => calculateBacktestedReturn(row)?.toFixed(2)
          })}
        </div>
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Short leg Trades ({shortFiltered.length})
          </h2>
          {renderTable('short', shortFiltered, columns.shortExercised, () => true, {
            'Return': row => parseFloat(row['Return'])?.toFixed(2),
            'AVG Backtested Return': row => calculateBacktestedReturn(row)?.toFixed(2)
          })}
        </div>
      </div>
    </>
  );
})()}
      </main>
    </Layout>
  );
}
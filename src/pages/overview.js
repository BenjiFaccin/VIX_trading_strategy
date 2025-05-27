import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function OverviewPage() {
  const [trades, setTrades] = useState([]);
  const [exitData, setExitData] = useState([]);
  const [longLegTrades, setLongLegTrades] = useState([]);
  const [shortLegTrades, setShortLegTrades] = useState([]);

  const entryCsvUrl = useBaseUrl('/data/entry_trades.csv');
  const exitCsvUrl = useBaseUrl('/data/exit_trades.csv');
  const longLegCsvUrl = useBaseUrl('/data/longleg_trades.csv');
  const shortLegCsvUrl = useBaseUrl('/data/shortleg_trades.csv');

  const [sortEntry, setSortEntry] = useState({ key: 'Date', direction: 'desc' });
  const [sortExit, setSortExit] = useState({ key: 'Date', direction: 'desc' });
  const [sortLong, setSortLong] = useState({ key: 'Date', direction: 'desc' });
  const [sortShort, setSortShort] = useState({ key: 'Date', direction: 'desc' });

  const handleSort = (key, sortConfig, setSortConfig) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortRows = (rows, sortConfig) => {
    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (!aVal || !bVal) return 0;

      if (sortConfig.key.toLowerCase().includes('date')) {
        return sortConfig.direction === 'asc'
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }

      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  };

  useEffect(() => {
    Promise.all([
      fetch(entryCsvUrl).then(res => res.text()),
      fetch(exitCsvUrl).then(res => res.text()),
      fetch(longLegCsvUrl).then(res => res.text()),
      fetch(shortLegCsvUrl).then(res => res.text())
    ]).then(([entryCsv, exitCsv, longLegCsv, shortLegCsv]) => {
      setTrades(Papa.parse(entryCsv, { header: true, skipEmptyLines: true }).data);
      setExitData(Papa.parse(exitCsv, { header: true, skipEmptyLines: true }).data);
      setLongLegTrades(Papa.parse(longLegCsv, { header: true, skipEmptyLines: true }).data);
      setShortLegTrades(Papa.parse(shortLegCsv, { header: true, skipEmptyLines: true }).data);
    });
  }, []);

  const columnsMap = {
    active: [
      'Date', 'Option expiration date', 'Strike short put', 'Strike long put', 'Status',
      'Qty Buy', 'Qty Sell', 'Total Costs', 'Current Expiry Value', 'AVG Expiry Value'
    ],
    exited: [
      'Date', 'Option expiration date', 'Strike short put', 'Strike long put', 'Status',
      'Qty Buy', 'Qty Sell', 'Total Costs', 'AVG Backtested Return', 'Return'
    ],
    long: [
      'Date', 'Option expiration date', 'Strike short put', 'Strike long put', 'Status',
      'Qty Buy', 'Qty Sell', 'Total Costs', 'AVG Backtested Return', 'Return'
    ],
    short: [
      'Date', 'Option expiration date', 'Strike short put', 'Strike long put', 'Status',
      'Qty Buy', 'Qty Sell', 'Total Costs', 'AVG Backtested Return', 'Payoff'
    ]
  };

  const formatCell = (value, column) => {
    if (['Date', 'Option expiration date'].includes(column)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      }
    }
    const number = parseFloat(value);
    return (!isNaN(number) ? number.toFixed(2) : (value || '—'));
  };

  const TableSection = ({ title, data, filter, sortConfig, setSortConfig, columns }) => (
    <>
      <h1 style={{ textAlign: 'center', margin: '3rem 0 1.5rem', fontSize: '1.8rem' }}>{title}</h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <table style={{ borderCollapse: 'collapse', width: '80%', maxWidth: '1000px' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col, sortConfig, setSortConfig)}
                  style={{
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    padding: '8px',
                    backgroundColor: 'var(--table-header-bg)',
                    color: 'var(--table-header-color)',
                    textAlign: 'center'
                  }}
                >
                  {col} {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortRows(data.filter(filter), sortConfig).map((row, index) => (
              <tr key={index}>
                {columns.map(col => (
                  <td key={col} style={{ border: '1px solid #eee', padding: '8px', textAlign: 'center' }}>
                    {formatCell(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <Layout title="Overview">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <TableSection
          title="Active trades: Put-Spreads"
          data={trades}
          filter={row => row['Status'] !== 'Exited'}
          sortConfig={sortEntry}
          setSortConfig={setSortEntry}
          columns={columnsMap.active}
        />
        <TableSection
          title="Exited trades"
          data={trades}
          filter={row => row['Status'] === 'Exited'}
          sortConfig={sortExit}
          setSortConfig={setSortExit}
          columns={columnsMap.exited}
        />
        <TableSection
          title="Exercised Long leg Trades"
          data={longLegTrades}
          filter={row => row['Status'] === 'Exercised'}
          sortConfig={sortLong}
          setSortConfig={setSortLong}
          columns={columnsMap.long}
        />
        <TableSection
          title="Exercised Short leg Trades"
          data={shortLegTrades}
          filter={row => row['Status'] === 'Exercised'}
          sortConfig={sortShort}
          setSortConfig={setSortShort}
          columns={columnsMap.short}
        />
      </main>
    </Layout>
  );
}

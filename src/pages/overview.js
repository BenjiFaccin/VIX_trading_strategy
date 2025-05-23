import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function OverviewPage() {
  const [trades, setTrades] = useState([]);
  const [exitData, setExitData] = useState([]);

  const entryCsvUrl = useBaseUrl('/data/entry_trades.csv');
  const exitCsvUrl = useBaseUrl('/data/exit_trades.csv');

  useEffect(() => {
    Promise.all([
      fetch(entryCsvUrl).then(res => res.text()),
      fetch(exitCsvUrl).then(res => res.text())
    ])
      .then(([entryCsv, exitCsv]) => {
        const parsedEntry = Papa.parse(entryCsv, { header: true, skipEmptyLines: true }).data;
        const parsedExit = Papa.parse(exitCsv, { header: true, skipEmptyLines: true }).data;
        setTrades(parsedEntry);
        setExitData(parsedExit);
      });
  }, [entryCsvUrl, exitCsvUrl]);

  const columnsToDisplay = [
    'Date',
    'Option expiration date',
    'Strike short put',
    'Strike long put',
    'Status',
    'Qty Buy',
    'Qty Sell',
    'Total Costs',
    'Current Expiry Value',
    'AVG Expiry Value'
  ];

  const exitedColumns = [
    'Date',
    'Option expiration date',
    'Strike short put',
    'Strike long put',
    'Status',
    'Qty Buy',
    'Qty Sell',
    'Total Costs',
    'AVG Backtested Return',
    'Return'
  ];

  const formatCell = (value, column) => {
    const numColumns = ['Current Expiry Value', 'AVG Expiry Value', 'AVG Backtested Return', 'Return'];
    const number = parseFloat(value);
    if (numColumns.includes(column) && !isNaN(number)) {
      return number.toFixed(2);
    }
    return value || '—';
  };

  const getExitReturn = (trade) => {
    const match = exitData.find(exit =>
      exit['Date'] === trade['Date'] &&
      exit['Option expiration date'] === trade['Option expiration date'] &&
      exit['Strike short put'] === trade['Strike short put'] &&
      exit['Strike long put'] === trade['Strike long put'] &&
      exit['Total Costs'] === trade['Total Costs']
    );
    return match?.['Expected return '] || null;
  };

  const calculateBacktestedReturn = (trade) => {
    const avg = parseFloat(trade['AVG Expiry Value']);
    const cost = parseFloat(trade['Total Costs']);
    if (!isNaN(avg) && !isNaN(cost)) {
      return avg - Math.abs(cost);
    }
    return null;
  };

  return (
    <Layout title="Overview">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        {/* === ACTIVE TRADES === */}
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          Active trades: Put-Spreads
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <table style={{ borderCollapse: 'collapse', width: '80%', maxWidth: '1000px' }}>
            <thead>
              <tr>
                {columnsToDisplay.map(col => (
                  <th key={col} style={{
                    border: '1px solid #ccc',
                    padding: '8px',
                    backgroundColor: 'var(--table-header-bg)',
                    color: 'var(--table-header-color)',
                    textAlign: 'center'
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades
                .filter(row => row['Status'] !== 'Exited')
                .sort((a, b) => new Date(b['Date']) - new Date(a['Date']))
                .map((row, index) => (
                  <tr key={index}>
                    {columnsToDisplay.map(col => (
                      <td key={col} style={{
                        border: '1px solid #eee',
                        padding: '8px',
                        textAlign: 'center'
                      }}>
                        {formatCell(row[col], col)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* === EXITED TRADES === */}
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          Exited trades
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <table style={{ borderCollapse: 'collapse', width: '80%', maxWidth: '1000px' }}>
            <thead>
              <tr>
                {exitedColumns.map(col => (
                  <th key={col} style={{
                    border: '1px solid #ccc',
                    padding: '8px',
                    backgroundColor: 'var(--table-header-bg)',
                    color: 'var(--table-header-color)',
                    textAlign: 'center'
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades
                .filter(row => row['Status'] === 'Exited')
                .sort((a, b) => new Date(b['Date']) - new Date(a['Date']))
                .map((row, index) => {
                  const returnValue = parseFloat(getExitReturn(row));
                  const avgBacktestedReturn = calculateBacktestedReturn(row);

                  return (
                    <tr key={index}>
                      {exitedColumns.map(col => {
                        let cellValue = '—';
                        let className = '';
                        const baseStyle = {
                          border: '1px solid #eee',
                          padding: '8px',
                          textAlign: 'center'
                        };

                        if (col === 'Return') {
                          if (!isNaN(returnValue)) {
                            cellValue = returnValue.toFixed(2);
                            if (returnValue > 0) className = 'return-positive';
                            else if (returnValue < 0) className = 'return-negative';
                          }
                        } else if (col === 'AVG Backtested Return') {
                          if (!isNaN(avgBacktestedReturn)) {
                            cellValue = avgBacktestedReturn.toFixed(2);
                          }
                        } else {
                          cellValue = formatCell(row[col], col);
                        }

                        return (
                          <td key={col} style={baseStyle} className={className}>
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </main>
    </Layout>
  );
}

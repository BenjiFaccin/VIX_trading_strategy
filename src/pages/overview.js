import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function OverviewPage() {
  const [trades, setTrades] = useState([]);
  const csvUrl = useBaseUrl('/data/entry_trades.csv'); // 

  useEffect(() => {
    fetch(csvUrl)
      .then(response => response.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setTrades(results.data);
          }
        });
      });
  }, [csvUrl]);

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

  const formatCell = (value, column) => {
    if (['Current Expiry Value', 'AVG Expiry Value'].includes(column)) {
      const number = parseFloat(value);
      if (!isNaN(number)) {
        return number.toFixed(2);
      }
    }
    return value || '—';
  };

  return (
    <Layout title="Overview">
      <main style={{ padding: '2rem' }}>
        <h1>Trade Overview: Put-Spreads</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columnsToDisplay.map((col) => (
                <th key={col} style={{ border: '1px solid #ccc', padding: '8px', background: '#f5f5f5' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((row, index) => (
              <tr key={index}>
                {columnsToDisplay.map((col) => (
                  <td key={col} style={{ border: '1px solid #eee', padding: '8px' }}>
                    {formatCell(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </Layout>
  );
}

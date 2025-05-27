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

useEffect(() => {
  Promise.all([
    fetch(entryCsvUrl).then(res => res.text()),
    fetch(exitCsvUrl).then(res => res.text()),
    fetch(longLegCsvUrl).then(res => res.text()),
    fetch(shortLegCsvUrl).then(res => res.text())
  ])
  .then(([entryCsv, exitCsv, longLegCsv, shortLegCsv]) => {
    const parsedEntry = Papa.parse(entryCsv, { header: true, skipEmptyLines: true }).data;
    const parsedExit = Papa.parse(exitCsv, { header: true, skipEmptyLines: true }).data;
    const parsedLongLeg = Papa.parse(longLegCsv, { header: true, skipEmptyLines: true }).data;
    const parsedShortLeg = Papa.parse(shortLegCsv, { header: true, skipEmptyLines: true }).data;
    setTrades(parsedEntry);
    setExitData(parsedExit);
    setLongLegTrades(parsedLongLeg);
    setShortLegTrades(parsedShortLeg); 
  });
}, [entryCsvUrl, exitCsvUrl, longLegCsvUrl]);

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
  const numColumns = ['Current Expiry Value', 'AVG Expiry Value', 'AVG Backtested Return', 'Return', 'Payoff'];

  if (column === 'Date') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
    }
  }

  if (column === 'Option expiration date') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
  }

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
                  const returnValue = 
                    parseFloat(row["Current Expiry Value"]) + 
                    parseFloat(row["Total Costs"]) - 
                    1.311;
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
                {/* === EXERCISED LONG LEG TRADES === */}
        <h1 style={{ textAlign: 'center', margin: '3rem 0 1.5rem', fontSize: '1.8rem' }}>
          Exercised Long leg Trades
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <table style={{ borderCollapse: 'collapse', width: '80%', maxWidth: '1000px' }}>
            <thead>
              <tr>
                {[
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
                ].map(col => (
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
              {longLegTrades
                .filter(row => row['Status'] === 'Exercised')
                .sort((a, b) => new Date(b['Date']) - new Date(a['Date']))
                .map((row, index) => {
                  const avgBacktestedReturn = calculateBacktestedReturn(row);
                  const returnValue = parseFloat(row['Return']);
                  return (
                    <tr key={index}>
                      {[
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
                      ].map(col => {
                        let value = '—';
                        let className = '';
                        const baseStyle = {
                          border: '1px solid #eee',
                          padding: '8px',
                          textAlign: 'center'
                        };

                        if (col === 'Return' && !isNaN(returnValue)) {
                          value = returnValue.toFixed(2);
                          className = returnValue > 0 ? 'return-positive' : (returnValue < 0 ? 'return-negative' : '');
                        } else if (col === 'AVG Backtested Return' && !isNaN(avgBacktestedReturn)) {
                          value = avgBacktestedReturn.toFixed(2);
                        } else {
                          value = formatCell(row[col], col);
                        }

                        return (
                          <td key={col} style={baseStyle} className={className}>
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {/* === EXERCISED SHORT LEG TRADES === */}
      <h1 style={{ textAlign: 'center', margin: '3rem 0 1.5rem', fontSize: '1.8rem' }}>
        Exercised Short leg Trades
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <table style={{ borderCollapse: 'collapse', width: '80%', maxWidth: '1000px' }}>
          <thead>
            <tr>
              {[
                'Date',
                'Option expiration date',
                'Strike short put',
                'Strike long put',
                'Status',
                'Qty Buy',
                'Qty Sell',
                'Total Costs',
                'AVG Backtested Return',
                'Payoff'
              ].map(col => (
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
            {shortLegTrades
              .filter(row => row['Status'] === 'Exercised')
              .sort((a, b) => new Date(b['Date']) - new Date(a['Date']))
              .map((row, index) => {
                const avgBacktestedReturn = calculateBacktestedReturn(row);
                const payoff = parseFloat(row['Payoff']);

                return (
                  <tr key={index}>
                    {[
                      'Date',
                      'Option expiration date',
                      'Strike short put',
                      'Strike long put',
                      'Status',
                      'Qty Buy',
                      'Qty Sell',
                      'Total Costs',
                      'AVG Backtested Return',
                      'Payoff'
                    ].map(col => {
                      let value = '—';
                      let className = '';
                      const baseStyle = {
                        border: '1px solid #eee',
                        padding: '8px',
                        textAlign: 'center'
                      };

                      if (col === 'Payoff' && !isNaN(payoff)) {
                        value = payoff.toFixed(2);
                        className = payoff > 0 ? 'return-positive' : (payoff < 0 ? 'return-negative' : '');
                      } else if (col === 'AVG Backtested Return' && !isNaN(avgBacktestedReturn)) {
                        value = avgBacktestedReturn.toFixed(2);
                      } else {
                        value = formatCell(row[col], col);
                      }

                      return (
                        <td key={col} style={baseStyle} className={className}>
                          {value}
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
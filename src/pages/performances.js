import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function PerformancesPage() {
  const [entryData, setEntryData] = useState([]);
  const [exitData, setExitData] = useState([]);

  const entryCsvUrl = useBaseUrl('/data/entry_trades.csv');
  const exitCsvUrl = useBaseUrl('/data/exit_trades.csv');

  useEffect(() => {
    fetch(entryCsvUrl)
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: results => setEntryData(results.data)
        });
      });

    fetch(exitCsvUrl)
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: results => setExitData(results.data)
        });
      });
  }, []);

  // --- Total Costs (Cumulative, Absolute) ---
  const parsedEntries = entryData
    .map(row => ({
      date: new Date(row['Date']),
      cost: parseFloat(row['Total Costs']) || 0
    }))
    .filter(row => !isNaN(row.date.getTime()))
    .sort((a, b) => a.date - b.date);

  let cumulativeCost = 0;
  const costChartData = parsedEntries.map(({ date, cost }) => {
    cumulativeCost += cost;
    return {
      date: date.toLocaleString(),
      cost: Math.abs(parseFloat(cumulativeCost.toFixed(2)))
    };
  });

  // --- Cumulative Transactions ---
  const txCountChartData = parsedEntries.map((entry, index) => ({
    date: entry.date.toLocaleString(),
    count: index + 1
  }));

  // --- Expected Return ---
  const expectedReturnOverTime = exitData.reduce((acc, row) => {
    const date = row['Date'];
    const value = parseFloat(row['Expected return']) || 0;
    acc[date] = (acc[date] || 0) + value;
    return acc;
  }, {});
  const returnChartData = Object.entries(expectedReturnOverTime).map(([date, value]) => ({
    date,
    expectedReturn: parseFloat(value.toFixed(2))
  }));

  // --- Current Expiry Value (Filtered by Filled) ---
  const currentExpiryValues = entryData
    .filter(row => row['Status'] === 'Filled')
    .reduce((acc, row) => {
      const label = `${row['Option expiration date']} | ${row['Strike short put']} / ${row['Strike long put']}`;
      const value = parseFloat(row['Current Expiry Value']) || 0;
      acc[label] = (acc[label] || 0) + value;
      return acc;
    }, {});
  const expiryValueChartData = Object.entries(currentExpiryValues).map(([label, value]) => ({
    label,
    currentExpiryValue: parseFloat(value.toFixed(2))
  }));

  return (
    <Layout title="Performances">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        {/* Header Stats */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', justifyContent: 'space-around' }}>
          <div style={{
            flex: 1, background: '#f5f5f5', padding: '2rem', borderRadius: '10px', textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{entryData.length}</h2>
            <p>Total Trades</p>
          </div>
          <div style={{
            flex: 1, background: '#f5f5f5', padding: '2rem', borderRadius: '10px', textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>– %</h2>
            <p>Current Win Rate</p>
          </div>
        </div>

        {/* Graph Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '2rem'
        }}>
          {/* Transaction Count */}
          <div style={{ gridColumn: 'span 2' }}>
            <h3>Cumulative Trade Count Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={txCountChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00c0c7" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Total Costs */}
          <div>
            <h3>Total Costs Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costChartData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" hide={false} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current Expiry Value */}
          <div>
            <h3>Current Expiry Value (Filled Only)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expiryValueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-30} textAnchor="end" interval={0} height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentExpiryValue" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expected Return Full Width */}
        <div style={{ marginTop: '4rem' }}>
          <h3>Expected Return Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={returnChartData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="expectedReturn" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </Layout>
  );
}

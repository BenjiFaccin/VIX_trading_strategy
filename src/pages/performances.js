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

  // --- Format large numbers for TXs display ---
  const formatTxCount = (num) => {
    if (num >= 100_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 10_000_000)  return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000_000)   return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 100_000)     return (num / 1_000).toFixed(2) + 'k';
    if (num >= 10_000)      return (num / 1_000).toFixed(2) + 'k';
    return num.toString();
  };

  const totalTxs = (entryData.length * 2 + exitData.length);

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

  // --- Filled vs Completed TXs Over Time (Stacked Bar) ---
  const filledTxsByDate = entryData
    .filter(row => row['Status'] === 'Filled')
    .reduce((acc, row) => {
      const date = row['Date'];
      acc[date] = acc[date] || { filled: 0, completed: 0 };
      acc[date].filled += 2;
      return acc;
    }, {});

  exitData.forEach(row => {
    const date = row['Date'];
    if (!filledTxsByDate[date]) {
      filledTxsByDate[date] = { filled: 0, completed: 0 };
    }
    filledTxsByDate[date].completed += 1;
  });

  let cumulativeFilled = 0;
let cumulativeCompleted = 0;

  const filledVsCompletedChartData = Object.entries(filledTxsByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, { filled, completed }]) => {
      cumulativeFilled += filled;
      cumulativeCompleted += completed;
      return {
        date,
        filled: cumulativeFilled,
        completed: cumulativeCompleted
      };
    });
  // --- Add successRate and failRate to chart data ---
  filledVsCompletedChartData.forEach(d => {
    const total = d.filled + d.completed;
    d.successRate = total > 0 ? d.filled / total : 0;
    d.failRate = total > 0 ? d.completed / total : 0;
  });

  return (
    <Layout title="Performances">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        {/* Black banner */}
        <div style={{
          background: '#111',
          color: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          Transactions Analysis
        </div>

        {/* Compact Stat Tiles */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '2rem',
          justifyContent: 'space-between'
        }}>
          {/* Total TXs */}
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
              {formatTxCount(totalTxs)} TXs
            </span>
            <span style={{ fontSize: '0.9rem', color: '#444' }}>Total Transactions Count</span>
          </div>

          {/* Win Rate */}
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
              <span style={{ marginRight: '0.3rem' }}>✓</span>–%
            </span>
            <span style={{ fontSize: '0.9rem', color: '#444' }}>Current Win Rate</span>
          </div>
        </div>

    {/* Cumulative TXs by Status - Half Width */}
    <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ textAlign: 'center' }}>Number of Transactions Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filledVsCompletedChartData} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="filled" stackId="a" fill="#00d1c1" name="entry" />
            <Bar dataKey="completed" stackId="a" fill="#000000" name="exit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Success Rate Chart */}
      <div style={{ flex: 1 }}>
        <h3 style={{ textAlign: 'center' }}>Transactions Success Rate Over Time </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filledVsCompletedChartData}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d1c1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00d1c1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`} />
            <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
            <Legend />
            <Area
              type="monotone"
              dataKey="successRate"
              stroke="#00d1c1"
              fillOpacity={1}
              fill="url(#colorSuccess)"
              name="true"
            />
            <Area
              type="monotone"
              dataKey="failRate"
              stroke="#000"
              fillOpacity={1}
              fill="url(#colorFail)"
              name="false"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
      </main>
    </Layout>
  );
}

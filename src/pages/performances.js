import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
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

  const formatTxCount = (num) => {
    if (num >= 100_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 10_000_000)  return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000_000)   return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 100_000)     return (num / 1_000).toFixed(2) + 'k';
    if (num >= 10_000)      return (num / 1_000).toFixed(2) + 'k';
    return num.toString();
  };

  const totalTxs = (entryData.length * 2 + exitData.length);

  // --- Filled vs Completed TXs Over Time (Cumulative Bar) ---
  const filledTxsByDate = {};
  entryData
    .filter(row => row['Status'] === 'Filled')
    .forEach(row => {
      const date = row['Date'];
      if (!filledTxsByDate[date]) filledTxsByDate[date] = { filled: 0, completed: 0 };
      filledTxsByDate[date].filled += 2;
    });

  exitData.forEach(row => {
    const date = row['Date'];
    if (!filledTxsByDate[date]) filledTxsByDate[date] = { filled: 0, completed: 0 };
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

  // --- Daily Ratio Entry / (Entry + Exit) ---
  const dailyRatioMap = {};
  entryData
    .filter(row => row['Status'] === 'Filled')
    .forEach(row => {
      const date = row['Date'];
      if (!dailyRatioMap[date]) dailyRatioMap[date] = { entry: 0, exit: 0 };
      dailyRatioMap[date].entry += 2;
    });

  exitData.forEach(row => {
    const date = row['Date'];
    if (!dailyRatioMap[date]) dailyRatioMap[date] = { entry: 0, exit: 0 };
    dailyRatioMap[date].exit += 1;
  });

  const entryExitRatioData = Object.entries(dailyRatioMap)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, { entry, exit }]) => {
      const total = entry + exit;
      const successRate = total > 0 ? entry / total : 1;
      const failRate = 1 - successRate;
      return { date, successRate, failRate };
    });

  return (
    <Layout title="Performances">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
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

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '2rem',
          justifyContent: 'space-between'
        }}>
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

          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: 'center' }}>Transactions Rate Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={entryExitRatioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="successRate"
                  stroke="#00d1c1"
                  fill="#00d1c1"
                  name="true"
                />
                <Area
                  type="monotone"
                  dataKey="failRate"
                  stroke="#000"
                  fill="#000"
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

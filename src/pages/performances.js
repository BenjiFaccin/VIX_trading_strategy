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
    if (num >= 10_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 100_000) return (num / 1_000).toFixed(2) + 'k';
    if (num >= 10_000) return (num / 1_000).toFixed(2) + 'k';
    return num.toString();
  };

  const normalizeDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return null;
    return date.toLocaleDateString('en-US'); // MM/DD/YYYY
  };

  const aggregateByDate = (dataArray, statusFilter, multiplier = 1) => {
    const result = {};
    dataArray.forEach(row => {
      if (statusFilter && row['Status'] !== statusFilter) return;
      const rawDate = normalizeDate(row['Date']);
      if (!rawDate) return;
      result[rawDate] = result[rawDate] || 0;
      result[rawDate] += multiplier;
    });
    return result;
  };

  const filledMap = aggregateByDate(entryData, 'Filled', 2);
  const completedMap = aggregateByDate(exitData, null, 1);
  const cancelledMap = aggregateByDate(entryData, 'Partial/Cancelled', 1);
  let cumCancelled2nd = 0;
  const cancelledCumulativeData = Object.entries(cancelledMap)
  .sort((a, b) => new Date(a[0]) - new Date(b[0]))
  .map(([date, value]) => {
    cumCancelled2nd += value;
    return { date, cancelled: cumCancelled2nd };
  });


  const allDates = new Set([
    ...Object.keys(filledMap),
    ...Object.keys(completedMap),
    ...Object.keys(cancelledMap)
  ]);

  let cumFilled = 0;
  let cumCompleted = 0;
  let cumCancelled = 0;
  const filledVsCompletedChartData = [...allDates]
    .sort((a, b) => new Date(a) - new Date(b))
    .map(date => {
      cumFilled += filledMap[date] || 0;
      cumCompleted += completedMap[date] || 0;
      cumCancelled += cancelledMap[date] || 0;

      return {
        date,
        filled: cumFilled,
        completed: cumCompleted,
        cancelled: cumCancelled,
        valid: cumFilled + cumCompleted
      };
    });

  const totalTxs = cumFilled + cumCompleted; // Exclude cancelled

  const entryExitRatioData = filledVsCompletedChartData.map(({ date, filled, completed }) => {
    const total = filled + completed;
    const successRate = total > 0 ? filled / total : 1;
    const failRate = 1 - successRate;
    return { date, successRate, failRate };
  });

  const cancelledRatioData = filledVsCompletedChartData.map(({ date, valid, cancelled }) => {
    const total = valid + cancelled;
    const validRatio = total > 0 ? valid / total : 1;
    const cancelledRatio = 1 - validRatio;
    return {
      date,
      valid: validRatio,
      cancelled: cancelledRatio
    };
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
              <BarChart data={filledVsCompletedChartData}>
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
                  name="entry"
                />
                <Area
                  type="monotone"
                  dataKey="failRate"
                  stroke="#000"
                  fill="#000"
                  name="exit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cancelled Ratio vs Valid Transactions */}
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: 'center' }}>Cancelled Transactions Ratio Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cancelledRatioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="valid"
                  stroke="#1890ff"
                  fill="#1890ff"
                  name="valid"
                />
                <Area
                  type="monotone"
                  dataKey="cancelled"
                  stroke="#ff4d4f"
                  fill="#ff4d4f"
                  name="cancelled"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ flex: 1 }}>
                <h3 style={{ textAlign: 'center' }}>Cumulative Cancelled Transactions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cancelledCumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cancelled" fill="#ff4d4f" name="cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

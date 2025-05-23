import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,  
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

  let cumCancelledCost = 0;
const cancelledCostData = entryData
  .filter(row => row['Status'] === 'Partial/Cancelled')
  .map(row => {
    const date = normalizeDate(row['Date']);
    const cost = parseFloat(row['Total Costs']) || 0;
    return { date, cost };
  })
  .filter(row => row.date) // remove invalid dates
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map(row => {
    cumCancelledCost += row.cost;
    return {
      date: row.date,
      cost: parseFloat(cumCancelledCost.toFixed(2))
    };
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

  let cumRowReturn = 0;
let cumNetReturn = 0;

const cumulativeReturnData = exitData
  .map(row => {
    const date = normalizeDate(row['Date']);
    const rowReturn = parseFloat(row['Current Value of sell leg']) || 0;
    const netReturn = parseFloat(row['Expected return ']) || 0;
    return { date, rowReturn, netReturn };
  })
  .filter(row => row.date) // Valid dates only
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map(row => {
    cumRowReturn += row.rowReturn;
    cumNetReturn += row.netReturn;
    return {
      date: row.date,
      rowReturn: parseFloat(cumRowReturn.toFixed(2)),
      netReturn: parseFloat(cumNetReturn.toFixed(2))
    };
  });

  let cumTotalCosts = 0;
let cumTotalCommissions = 0;

let cumCost = 0;
let cumCommission = 0;

const cumulativeCostsData = entryData
  .map(row => {
    const date = normalizeDate(row['Date']);
    const cost = parseFloat(row['Total Costs']) || 0;
    const commission = parseFloat(row['Total Commissions']) || 0;
    return { date, cost, commission };
  })
  .filter(row => row.date)
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .map(row => {
    cumCost += row.cost;
    cumCommission += row.commission;
    return {
      date: row.date,
      cost: Math.abs(parseFloat(cumCost.toFixed(2))), // ✅ Make cost absolute here
      commission: parseFloat(cumCommission.toFixed(2))
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
        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
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
                <h3 style={{ textAlign: 'center' }}>Cumulative Cancelled Transactions Over Time</h3>
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
          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: 'center' }}>Cumulative Cancelled Costs Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cancelledCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#ff4d4f"
                  strokeWidth={3}
                  dot={false}
                  name="cancelled cost"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
                  <div style={{
          background: '#111',
          color: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          marginTop: '3rem'
        }}>
          Performances Review
        </div>
        <div style={{ marginTop: '2rem' }}>
  <h3 style={{ textAlign: 'center' }}>Cumulative Row Return and Net Return Over Time</h3>
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={cumulativeReturnData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip formatter={(value) => `$${value}`} />
      <Legend />
      <Line
        type="monotone"
        dataKey="rowReturn"
        stroke="#00bcd4"
        strokeWidth={2}
        name="Row Return"
      />
      <Line
        type="monotone"
        dataKey="netReturn"
        stroke="#ff9800"
        strokeWidth={2}
        name="Net Return"
      />
    </LineChart>
  </ResponsiveContainer>
</div>
<div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
  {/* Cumulative Total Costs */}
  <div style={{ flex: 1 }}>
    <h3 style={{ textAlign: 'center' }}>Cumulative Total Costs Over Time</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={cumulativeCostsData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value}`} />
        <Legend />
        <Bar dataKey="cost" fill="#00d1c1" name="Total Costs" />
      </BarChart>
    </ResponsiveContainer>
  </div>
  {/* Cumulative Total Commissions */}
  <div style={{ flex: 1 }}>
    <h3 style={{ textAlign: 'center' }}>Cumulative Total Commissions Over Time</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={cumulativeCostsData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value}`} />
        <Legend />
        <Bar dataKey="commission" fill="#b2ebf2" name="Total Commissions" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

      </main>
    </Layout>
  );
}

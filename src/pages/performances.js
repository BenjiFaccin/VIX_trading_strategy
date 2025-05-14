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

  // 1. Total Costs Over Time
const parsedEntries = entryData
  .map(row => ({
    date: new Date(row['Date']),
    cost: parseFloat(row['Total Costs']) || 0
  }))
  .filter(row => !isNaN(row.date.getTime()))
  .sort((a, b) => a.date - b.date);

let cumulative = 0;
const costChartData = parsedEntries.map(({ date, cost }) => {
  cumulative += cost;
  return {
    date: date.toLocaleString(), // or date.toISOString() if you prefer
    cost: Math.abs(parseFloat(cumulative.toFixed(2)))
  };
});


  // 2. Expected Return Over Time
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

  // 3. Current Expiry Value by Option Details
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
      <main style={{ padding: '2rem' }}>
        <h1>Total Costs Over Time</h1>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costChartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cost" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>

        <h1 style={{ marginTop: '4rem' }}>Expected Return Over Time</h1>
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

        <h1 style={{ marginTop: '4rem' }}>Current Expiry Value (Filled Only)</h1>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={expiryValueChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" angle={-30} textAnchor="end" height={100} interval={0} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="currentExpiryValue" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </main>
    </Layout>
  );
}

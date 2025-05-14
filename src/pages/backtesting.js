import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Papa from 'papaparse';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  ResponsiveContainer, Legend
} from 'recharts';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function GeneralMetricsBacktesting() {
  const totalBacktestedTx = 21485;
  const percentageSelected = 1.52;

  const [strategyData, setStrategyData] = useState([]);
  const [winrateData, setWinrateData] = useState([]);
  const [riskRewardData, setRiskRewardData] = useState([]);
  const [averageWinrate, setAverageWinrate] = useState(0);
  const [averageRR, setAverageRR] = useState(0);

  const summaryCsvUrl = useBaseUrl('/data/Selected_Strategies_Summary.csv');

  useEffect(() => {
    fetch(summaryCsvUrl)
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let cumulative = 0;
            let winrateSum = 0;
            let rrSum = 0;

            const winrateArray = [];
            const rrArray = [];

            const data = results.data.map((row, index) => {
              const returnVal = parseFloat(row['Total Return']) || 0;
              const winrate = parseFloat(row['Winrate (%)']) || 0;
              const rr = parseFloat(row['Risk/Reward Ratio']) || 0;

              cumulative += returnVal;
              winrateSum += winrate;
              rrSum += rr;

              winrateArray.push({ name: `Strategy${index + 1}`, winrate });
              rrArray.push({ name: `Strategy${index + 1}`, rr });

              return {
                name: `Strategy${index + 1}`,
                totalReturn: parseFloat(cumulative.toFixed(2))
              };
            });

            setStrategyData(data);
            const winrateWithAvg = winrateArray.map(d => ({ ...d, avg: winrateSum / winrateArray.length }));
            const rrWithAvg = rrArray.map(d => ({ ...d, avg: rrSum / rrArray.length }));

            setWinrateData(winrateWithAvg);
            setRiskRewardData(rrWithAvg);
            setAverageWinrate(winrateSum / winrateArray.length);
            setAverageRR(rrSum / rrArray.length);
          }
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

  const formatTwoDecimals = (value) => {
  return typeof value === 'number' ? value.toFixed(2) : value;
  };

  const fixedAverageWinrate = 92.29;
  const fixedAverageRR = 89.41;

  const avgWinrateLine = [
  { name: 'Start', value: fixedAverageWinrate },
  { name: 'End', value: fixedAverageWinrate }
  ];

  const avgRRLine = [
    { name: 'Start', value: fixedAverageRR },
    { name: 'End', value: fixedAverageRR }
  ];

  return (
    <Layout title="General Metrics Backtesting">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <div style={{
          background: '#002244',
          color: 'white',
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          General Metrics Backtesting
        </div>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '2rem',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <div style={metricBoxStyle}>
            <span style={metricValueStyle}>
              {formatTxCount(totalBacktestedTx)}
            </span>
            <span style={metricLabelStyle}>
              Number of total transactions backtested
            </span>
          </div>

          <div style={metricBoxStyle}>
            <span style={{ fontSize: '2.5rem', fontWeight: '600' }}>
              [10.00 : 60.00]
            </span>
            <span style={metricLabelStyle}>
              VIX Interval Backtested
            </span>
          </div>

          <div style={metricBoxStyle}>
            <span style={metricValueStyle}>
              {percentageSelected.toFixed(2)}%
            </span>
            <span style={metricLabelStyle}>
              % of best profiles selected (38 out of 2500)
            </span>
          </div>
        </div>

        {/* Cumulative Return Line Chart */}
        <div style={{ marginTop: '3rem', position: 'relative' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Cumulative Return by Strategy (from 2010 to 2023) with 1 contract per leg on every put-spread*
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={strategyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={false} axisLine={false} />
              <YAxis tickFormatter={formatTxCount} />
              <Tooltip formatter={(value) => formatTxCount(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalReturn"
                stroke="#000000"
                strokeWidth={2}
                dot={false}
                name="Cumulative Return"
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '16px',
            fontSize: '0.75rem',
            fontStyle: 'italic',
            color: '#666'
          }}>
            *buying at ask, selling at bid (worst case scenario taken)
          </div>
        </div>

        {/* Winrate & Risk/Reward Bar Charts */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
          {/* Winrate Chart */}
          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Winrate by Strategy (%)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={winrateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} axisLine={false} />
                <YAxis />
                <Tooltip formatter={(value) => formatTwoDecimals(value)} />
                <Legend />
                <Bar dataKey="winrate" fill="#002244" name="Winrate (%)" />
                <Line
                  data={avgWinrateLine}
                  type="linear"
                  dataKey="value"
                  stroke="#FFA500"
                  strokeDasharray="5 5"
                  name="Average Winrate"
                  dot={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk/Reward Chart */}
          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Risk/Reward Ratio by Strategy
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskRewardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} axisLine={false} />
                <YAxis />
                <Tooltip formatter={(value) => formatTwoDecimals(value)} />
                <Legend />
                <Bar dataKey="rr" fill="#002244" name="R/R Ratio" />
                <Line
                  data={avgRRLine}
                  type="linear"
                  dataKey="value"
                  stroke="#FFA500"
                  strokeDasharray="5 5"
                  name="Average R/R"
                  dot={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </Layout>
  );
}

// Shared styles
const metricBoxStyle = {
  flex: '1 1 30%',
  background: '#fff',
  padding: '1rem 1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  textAlign: 'center',
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const metricValueStyle = {
  fontSize: '3rem',
  fontWeight: '600'
};

const metricLabelStyle = {
  fontSize: '0.9rem',
  color: '#444'
};

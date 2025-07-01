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

  const [longlegData, setLonglegData] = useState([]);
  const longlegCsvUrl = useBaseUrl('/data/longleg_trades.csv');
  const shortlegCsvUrl = useBaseUrl('/data/shortleg_trades.csv');
  const [shortlegData, setShortlegData] = useState([]);

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
      fetch(longlegCsvUrl)
        .then(res => res.text())
        .then(csv => {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: results => setLonglegData(results.data)
          });
        });
        fetch(shortlegCsvUrl)
        .then(res => res.text())
        .then(csv => {
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: results => setShortlegData(results.data)
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

  // === Harmonisation des dates sur les jambes long/short ===
const allExercisedDatesSet = new Set([
  ...longlegData.map(row => normalizeDate(row['Option expiration date'])).filter(Boolean),
  ...shortlegData.map(row => normalizeDate(row['Option expiration date'])).filter(Boolean),
]);

const allExercisedDates = [...allExercisedDatesSet].sort((a, b) => new Date(a) - new Date(b));

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

    // Aggregate all exercised trades by date (across both shortleg and longleg files)
const exercisedByDate = {};
[...shortlegData, ...longlegData].forEach(row => {
  // Use the same normalizeDate function as everywhere else
  const date = normalizeDate(row['Option expiration date']);
  if (!date) return;
  exercisedByDate[date] = (exercisedByDate[date] || 0) + 1;
});

  const allDates = new Set([
  ...Object.keys(filledMap),
  ...Object.keys(completedMap),
  ...Object.keys(cancelledMap),
  ...Object.keys(exercisedByDate)
]);

  let cumFilled = 0;
  let cumCompleted = 0;
  let cumCancelled = 0;
  let cumExercised = 0;
  const filledVsCompletedChartData = [...allDates]
  .sort((a, b) => new Date(a) - new Date(b))
  .map(date => {
    cumFilled += filledMap[date] || 0;
    cumCompleted += completedMap[date] || 0;
    cumCancelled += cancelledMap[date] || 0;
    cumExercised += exercisedByDate[date] || 0;
    return {
      date,
      filled: cumFilled,
      completed: cumCompleted,
      cancelled: cumCancelled,
      exercised: cumExercised, // <<< ADD THIS LINE!
      valid: cumFilled + cumCompleted
    };
  });

  const entryFilledCount = entryData.filter(row => row['Status'] === 'Filled').length * 2;
  const exitCount = exitData.length;
  const longlegCount = longlegData.length;
  const shortlegCount = shortlegData.length;
  const totalTxs = entryFilledCount + exitCount + longlegCount + shortlegCount;

  const entryExitRatioData = filledVsCompletedChartData.map(({ date, filled, completed, exercised }) => {
  const total = filled + completed + exercised;
  const entryRate = total > 0 ? filled / total : 0;
  const exitRate = total > 0 ? completed / total : 0;
  const exercisedRate = total > 0 ? exercised / total : 0;
  return { date, entryRate, exitRate, exercisedRate };
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

// 1. Extraire rowReturn du fichier longleg
const longlegReturns = longlegData
  .map(row => {
    const date = normalizeDate(row['Option expiration date']);
    const value = parseFloat(row['Current Expiry Value']) || 0;
    return { date, value };
  })
  .filter(row => row.date);

  const longlegNetReturns = longlegData
  .map(row => {
    const date = normalizeDate(row['Option expiration date']);
    const value = parseFloat(row['Return']) || 0;
    return { date, value };
  })
  .filter(row => row.date);

  const shortlegPayoffs = shortlegData
  .map(row => {
    const date = normalizeDate(row['Option expiration date']);
    const value = parseFloat(row['Payoff']) || 0;
    return { date, value };
  })
  .filter(row => row.date);

// 2. Extraire rowReturn et netReturn du fichier exit
const exitReturns = exitData
  .map(row => {
    const date = normalizeDate(row['Date']);
    const rowValue = parseFloat(row['Current Value of sell leg']) || 0;
    const expiryValue = parseFloat(row['Current Expiry Value']) || 0;
    const cost = parseFloat(row['Total Costs']) || 0;
    const netReturn = expiryValue + cost;
    return { date, rowValue, netReturn };
  })
  .filter(row => row.date);

// 3. Fusionner les deux sources par date
const allDatesSet = new Set([
  ...exitReturns.map(r => r.date),
  ...longlegReturns.map(r => r.date),
  ...longlegNetReturns.map(r => r.date),
  ...shortlegPayoffs.map(r => r.date),
]);

const combinedReturnDates = [...allDatesSet].sort((a, b) => new Date(a) - new Date(b));

const today = new Date();
const filteredDates = combinedReturnDates.filter(d => new Date(d) <= today);
let cumRowReturn = 0;
let cumNetReturn = 0;

const cumulativeReturnData = filteredDates.map(date => {
  // ==== Longleg trades (by date) ====
  const longlegMatches = longlegData.filter(r => normalizeDate(r['Option expiration date']) === date);
  const sumLonglegReturn = longlegMatches.reduce(
    (sum, r) => sum + (parseFloat(r['Return']) || 0),
    0
  );
  const sumLonglegCosts = longlegMatches.reduce(
    (sum, r) => sum + (parseFloat(r['Total Costs']) || 0),
    0
  );

  // ==== Shortleg trades (by date) ====
  const shortlegMatches = shortlegData.filter(r => normalizeDate(r['Option expiration date']) === date);
  const sumShortlegReturn = shortlegMatches.reduce(
    (sum, r) => sum + (parseFloat(r['Return']) || 0),
    0
  );

  // ==== Exit trades (by date) ====
  const exitMatches = exitData.filter(r => normalizeDate(r['Date']) === date);
  const sumCurrentValueSellLeg = exitMatches.reduce(
    (sum, r) => sum + ((parseFloat(r['Exit Price']) || 0) * 100),
    0
  );
  const sumExitCosts = exitMatches.reduce(
    (sum, r) => sum + (parseFloat(r['Total Costs']) || 0),
    0
  );

  // ==== Formulas ====
  // ROW RETURN: Return (longleg) + Return (shortleg) + Current Value of sell leg (exit)
  const rowReturn = sumLonglegReturn + sumShortlegReturn + sumCurrentValueSellLeg;
  // NET RETURN: rowReturn + Total Costs (longleg) + Total Costs (exit)
  const netReturn = rowReturn + sumLonglegCosts + sumExitCosts;

  cumRowReturn += rowReturn;
  cumNetReturn += netReturn;

  return {
    date,
    rowReturn: parseFloat(cumRowReturn.toFixed(2)),
    netReturn: parseFloat(cumNetReturn.toFixed(2)),
  };
});


// === Calcul du Win Rate basé sur l'évolution de netReturn cumulatif ===
let winCount = 0;
let lossCount = 0;

if (cumulativeReturnData.length >= 2) {
  for (let i = 1; i < cumulativeReturnData.length; i++) {
    const prev = cumulativeReturnData[i - 1].netReturn;
    const current = cumulativeReturnData[i].netReturn;
    if (current > prev) winCount++;
    else if (current < prev) lossCount++;
  }
}

var winRateDisplay;
if (cumulativeReturnData.length < 2) {
  winRateDisplay = 'N/A';
} else if (lossCount === 0) {
  winRateDisplay = '100%';
} else {
  const ratio = (winCount / (winCount + lossCount)) * 100;
  winRateDisplay = ratio.toFixed(2) + '%';
}

let cumCost = 0;
let cumCommission = 0;

// Soustraire 1.47 par ligne de exitData, groupé par date
const fixedExitCostsByDate = {};
exitData.forEach(row => {
  const date = normalizeDate(row['Date']);
  if (!date) return;
  fixedExitCostsByDate[date] = (fixedExitCostsByDate[date] || 0) - 1.47;
});

// Même logique appliquée aux commissions
// Ajouter 1.47 par ligne de exitData pour les commissions
const fixedExitCommissionsByDate = {};
exitData.forEach(row => {
  const date = normalizeDate(row['Date']);
  if (!date) return;
  fixedExitCommissionsByDate[date] = (fixedExitCommissionsByDate[date] || 0) + 1.47;
});

// Fusionner toutes les dates pertinentes
const allCostDatesSet = new Set([
  ...entryData.map(r => normalizeDate(r['Date'])).filter(Boolean),
  ...Object.keys(fixedExitCostsByDate)
]);

const allCostDates = [...allCostDatesSet].sort((a, b) => new Date(a) - new Date(b));

// Construire les données cumulées par date
const cumulativeCostsData = allCostDates.map(date => {
  const entryCosts = entryData
    .filter(r => normalizeDate(r['Date']) === date)
    .reduce((acc, r) => acc + (parseFloat(r['Total Costs']) || 0), 0);

  const entryCommissions = entryData
    .filter(r => normalizeDate(r['Date']) === date)
    .reduce((acc, r) => acc + (parseFloat(r['Total Commissions']) || 0), 0);

  const fixedExitCost = fixedExitCostsByDate[date] || 0;
  const fixedExitCommission = fixedExitCommissionsByDate[date] || 0;
  cumCost += entryCosts + fixedExitCost;
  cumCommission += entryCommissions + fixedExitCommission;
  return {
    date,
    cost: Math.abs(parseFloat(cumCost.toFixed(2))),
    commission: parseFloat(cumCommission.toFixed(2))
  };
});

const longMap = {};
longlegData.forEach(row => {
  const date = normalizeDate(row['Option expiration date']);
  if (!date) return;
  const value = parseFloat(row['Return']) || 0;
  longMap[date] = (longMap[date] || 0) + value;
});

const shortMap = {};
shortlegData.forEach(row => {
  const date = normalizeDate(row['Option expiration date']);
  if (!date) return;
  const value = parseFloat(row['Return']) || 0;
  shortMap[date] = (shortMap[date] || 0) + value;
});

let cumLong = 0;
let cumShort = 0;
const exercisedCombinedCumulativeData = allExercisedDates.map(date => {
  const long = longMap[date] || 0;
  const short = shortMap[date] || 0;
  cumLong += long;
  cumShort += short;
  return {
    date,
    longLeg: parseFloat(cumLong.toFixed(2)),
    shortLeg: parseFloat(cumShort.toFixed(2))
  };
});

// Net Return Exercised Legs (long + short return par date)
const exercisedNetReturnMap = {};

longlegData.forEach(row => {
  const date = normalizeDate(row['Option expiration date']);
  const value = parseFloat(row['Return']) || 0;
  if (!date) return;
  exercisedNetReturnMap[date] = (exercisedNetReturnMap[date] || 0) + value;
});

shortlegData.forEach(row => {
  const date = normalizeDate(row['Option expiration date']);
  const value = parseFloat(row['Return']) || 0;
  if (!date) return;
  exercisedNetReturnMap[date] = (exercisedNetReturnMap[date] || 0) + value;
});

const exercisedNetReturnData = allExercisedDates.map(date => ({
  date,
  netReturn: parseFloat((exercisedNetReturnMap[date] || 0).toFixed(2))
}));

let cumNet = 0;
const exercisedNetCumulativeData = exercisedNetReturnData.map(({ date, netReturn }) => {
  cumNet += netReturn;
  return {
    date,
    netReturn: parseFloat(cumNet.toFixed(2))
  };
});

  return (
    <Layout title="Performances">
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <div style={{
          background: '#111',
          color: 'white',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '1.4rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          Transactions Analysis
        </div>

        <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
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
                <span style={{ marginRight: '0.3rem' }}>✓</span>{winRateDisplay}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#444' }}>Current Win Rate</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column',gap: '2rem', marginBottom: '3rem' }}>
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
                <Bar dataKey="exercised" stackId="a" fill="#f4b400" name="exercised" />
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
    dataKey="entryRate"
    stroke="#00d1c1"
    fill="#00d1c1"
    name="entry"
  />
  <Area
    type="monotone"
    dataKey="exitRate"
    stroke="#000"
    fill="#000"
    name="exit"
  />
  <Area
    type="monotone"
    dataKey="exercisedRate"
    stroke="#f4b400"
    fill="#f4b400"
    name="exercised"
  />
</AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cancelled Ratio vs Valid Transactions */}
        <div style={{ display: 'flex',flexDirection: 'column', gap: '2rem', marginTop: '3rem' }}>
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
          padding: '1rem',
          textAlign: 'center',
          fontSize: '1.4rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          marginTop: '1.5rem'
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
<div style={{ display: 'flex',flexDirection: 'column', gap: '2rem', marginTop: '3rem' }}>
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
<div style={{ display: 'flex', flexDirection: 'column',gap: '2rem', marginTop: '3rem' }}>
  {/* Cumulative Exercised Long & Short Leg Returns */}
  <div style={{ flex: 1 }}>
    <h3 style={{ textAlign: 'center' }}>Cumulative Exercised Long & Short Leg Returns</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={exercisedCombinedCumulativeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip formatter={(v) => `$${v}`} />
        <Legend />
        <Line type="monotone" dataKey="longLeg" stroke="#4caf50" name="Long Leg Cumulative" />
        <Line type="monotone" dataKey="shortLeg" stroke="#f44336" name="Short Leg Cumulative" />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Net Return Exercised Legs (Non-Cumulative) */}
  <div style={{ flex: 1 }}>
    <h3 style={{ textAlign: 'center' }}>Net Return Exercised Legs </h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={exercisedNetReturnData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip formatter={(v) => `$${v}`} />
        <Legend />
        <Bar dataKey="netReturn" fill="#2196f3" name="Net Return" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Net Cumulative Return Exercised Legs */}
  <div style={{ flex: 1 }}>
    <h3 style={{ textAlign: 'center' }}>Net Cumulative Return Exercised Legs</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={exercisedNetCumulativeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip formatter={(v) => `$${v}`} />
        <Legend />
        <Line type="monotone" dataKey="netReturn" stroke="#673ab7" name="Cumulative Net Return" />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>
      </main>
    </Layout>
  );
}

// src/components/FinPilot/AnalyticsPanel.js
import React, { useEffect, useState } from "react";
import {
  getCategoryBreakdown,
  getMonthlySpending,
  getProjectedCashFlow,
  getPeerComparison,
} from "./analyticsUtils"; // ✅ fixed correct path
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "../components/FinPilot/AnalyticsPanel.css"; // ✅ correct local CSS

const AnalyticsPanel = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("transactions")) || [];
    console.log("✅ Transactions loaded:", stored);
    setTransactions(stored);
  }, []);

  const categoryData = getCategoryBreakdown(transactions);
  const monthlyData = getMonthlySpending(transactions);
  const cashFlow = getProjectedCashFlow(transactions);
  const peerData = getPeerComparison(transactions);

  const hasData = (data) => {
    return data?.datasets?.[0]?.data?.some((val) => Number(val) !== 0);
  };

  return (
    <div className="analytics-container">
      <h2>📊 Full Advanced Analytics</h2>
      <div className="grid-two-columns">
        {/* CATEGORY */}
        <section className="analytics-section card">
          <h3>📂 Category Breakdown</h3>
          {hasData(categoryData) ? (
            <Doughnut data={categoryData} />
          ) : (
            <p>No category data available.</p>
          )}
        </section>

        {/* MONTHLY */}
        <section className="analytics-section card">
          <h3>📅 Monthly Spending</h3>
          {hasData(monthlyData) ? (
            <Line data={monthlyData} />
          ) : (
            <p>No monthly spending data available.</p>
          )}
        </section>

        {/* CASH FLOW */}
        <section className="analytics-section card">
          <h3>🔮 Projected Cash Flow</h3>
          {hasData(cashFlow) ? (
            <Bar data={cashFlow} />
          ) : (
            <p>No projected cash flow data available.</p>
          )}
        </section>

        {/* PEER */}
        <section className="analytics-section card">
          <h3>👥 Peer Comparison</h3>
          {hasData(peerData) ? (
            <Bar data={peerData} />
          ) : (
            <p>Not enough data for peer comparison.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalyticsPanel;

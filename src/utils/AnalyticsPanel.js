// src/components/FinPilot/AnalyticsPanel.js
import React, { useEffect, useState } from "react";
import {
  getCategoryBreakdown,
  getMonthlySpending,
  getProjectedCashFlow,
  getPeerComparison,
} from "./analyticsUtils";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "../../src/components/FinPilot/AnalyticsPanel.css";

const AnalyticsPanel = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(stored);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("transactions")) || [];
    console.log("📦 Transactions Loaded:", stored);
    setTransactions(stored);
  }, []);

  const categoryData = getCategoryBreakdown(transactions);
  const monthlyData = getMonthlySpending(transactions);
  const cashFlow = getProjectedCashFlow(transactions);
  const peerData = getPeerComparison(transactions);

  const hasData = (data) => data?.datasets?.[0]?.data?.some((val) => val !== 0);

  return (
    <div className="analytics-container">
      <div className="analytics-left">
        <h3>📊 Category-wise Breakdown</h3>
        {hasData(categoryData) ? (
          <Doughnut data={categoryData} />
        ) : (
          <p>No category data available.</p>
        )}

        <h3>📈 Monthly Spending Trends</h3>
        {hasData(monthlyData) ? (
          <Line data={monthlyData} />
        ) : (
          <p>No monthly spending data yet.</p>
        )}
      </div>

      <div className="analytics-right">
        <h3>📅 Projected Cash Flow</h3>
        {hasData(cashFlow) ? (
          <Bar data={cashFlow} />
        ) : (
          <p>No cash flow projection available.</p>
        )}

        <h3>👥 Peer Comparison</h3>
        {hasData(peerData) ? (
          <Bar data={peerData} />
        ) : (
          <p>Not enough data for peer comparison.</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel;

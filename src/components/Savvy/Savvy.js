import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import animationData from "../../assets/finance.json";
import animationData2 from "../../assets/GirlMobile.json";
import "../../app.css";

import {
  analyzeSpendingPatterns,
  getCostCuttingSuggestions,
  dynamicBudgetReallocation,
} from "../../utils/aiBudgetUtils";

import {
  getCategoryBreakdown,
  getMonthlySpending,
  getProjectedCashFlow,
  getPeerComparison,
} from "../../utils/analyticsUtils";

const Savvy = () => {
  const [showForm, setShowForm] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [financeData, setFinanceData] = useState({
    salary: "",
    savingsGoal: "",
    essentials: 50,
    wants: 30,
    savings: 20,
  });
  const [transactions, setTransactions] = useState(
    () => JSON.parse(localStorage.getItem("transactions")) || []
  );
  const [expenseSummary, setExpenseSummary] = useState({});
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [projectedCashFlow, setProjectedCashFlow] = useState([]);
  const [peerComparison, setPeerComparison] = useState([]);

  // Load and update finance data + analytics
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("financeData"));
    if (savedData) {
      setFinanceData(savedData);
      setSubmittedData(savedData);
    }

    const tx = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(tx);
    setSpendingTrends(getMonthlySpending(tx));
    setPeerComparison(getPeerComparison(tx));
    calculateExpenses(tx);
  }, []);

  useEffect(() => {
    if (transactions.length && financeData.salary) {
      setCategoryBreakdown(getCategoryBreakdown(transactions));
      setProjectedCashFlow(getProjectedCashFlow(transactions));
    }
  }, [transactions, financeData.salary]);

  const calculateExpenses = (txList) => {
    const summary = {};
    txList.forEach((tx) => {
      if (tx.type === "debit") {
        summary[tx.category] = (summary[tx.category] || 0) + Number(tx.amount);
      }
    });
    setExpenseSummary(summary);
  };

  const getMonthlyBudgetVsActual = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthTx = transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        tx.type === "debit" &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });

    const actualSpent = monthTx.reduce((acc, tx) => acc + Number(tx.amount), 0);
    const salary = Number(financeData.salary) || 0;

    return {
      essentials: (salary * financeData.essentials) / 100,
      wants: (salary * financeData.wants) / 100,
      savings: (salary * financeData.savings) / 100,
      totalBudget: salary,
      totalSpent: actualSpent,
    };
  };

  const getBudgetIndicator = (category, amount) => {
    const totalSalary = Number(financeData.salary) || 1;
    let percent = 0;

    if (category.toLowerCase().includes("essential"))
      percent = financeData.essentials;
    else if (category.toLowerCase().includes("want"))
      percent = financeData.wants;
    else percent = financeData.savings;

    const budgetAmt = (totalSalary * percent) / 100;
    if (amount < budgetAmt * 0.8) return "green";
    if (amount <= budgetAmt) return "yellow";
    return "red";
  };

  const getSpendingSuggestions = () => {
    const suggestions = [];
    Object.entries(expenseSummary).forEach(([cat, amt]) => {
      if (amt > 0) {
        if (
          cat.toLowerCase().includes("food") ||
          cat.toLowerCase().includes("dining")
        ) {
          suggestions.push(
            "🍽 You're overspending on dining out. Try cooking at home more."
          );
        }
        if (cat.toLowerCase().includes("entertainment")) {
          suggestions.push(
            "🎬 Entertainment is high. Try free/low-cost options."
          );
        }
        if (cat.toLowerCase().includes("shopping")) {
          suggestions.push(
            "🛍 Try a no-spend challenge or delay non-essential purchases."
          );
        }
      }
    });
    return suggestions;
  };

  const getOverspendingAlerts = () => {
    const alerts = [];
    const monthlyBudget = Number(financeData.salary) || 0;
    const categoryLimit =
      monthlyBudget / (Object.keys(expenseSummary).length || 1);
    Object.entries(expenseSummary).forEach(([cat, amt]) => {
      if (amt > categoryLimit) {
        alerts.push(
          `⚠️ Overspending in ${cat}: ₹${amt} (Limit: ₹${categoryLimit.toFixed(
            2
          )})`
        );
      }
    });
    return alerts;
  };

  const handleChange = (e) => {
    setFinanceData({ ...financeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total =
      Number(financeData.essentials) +
      Number(financeData.wants) +
      Number(financeData.savings);

    if (total !== 100) {
      alert("Budget split must add up to 100%");
      return;
    }

    const dataWithId = { ...financeData, id: Date.now() };
    localStorage.setItem("financeData", JSON.stringify(dataWithId));
    setSubmittedData(dataWithId);
    setShowForm(false);
    alert("Finance details saved!");
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const girlOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData2,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const patterns = analyzeSpendingPatterns(transactions);
  const suggestions = getCostCuttingSuggestions(patterns, financeData.salary);
  const updatedBudget = dynamicBudgetReallocation(financeData, transactions);

  return (
    <div className="savvy-container">
      <h1>Welcome to Savvy</h1>
      <p>Your personal finance analytics and insights hub.</p>

      <button className="personalize-btn" onClick={() => setShowForm(true)}>
        Personalize Finances
      </button>

      {showForm && (
        <div className="finance-form-container">
          <div className="finance-left">
            <h2>Personalize Your Financial Plan</h2>
            <form onSubmit={handleSubmit}>
              <label>Budget Split (%):</label>
              <div className="budget-split-row">
                {["essentials", "wants", "savings"].map((item) => (
                  <div key={item}>
                    <label>
                      {item.charAt(0).toUpperCase() + item.slice(1)}:
                    </label>
                    <input
                      type="number"
                      name={item}
                      value={financeData[item]}
                      onChange={handleChange}
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                ))}
              </div>
              <p className="budget-note">Total must add up to 100%.</p>

              <label>Salary:</label>
              <input
                type="number"
                name="salary"
                value={financeData.salary}
                onChange={handleChange}
                required
              />

              <label>Savings Goal:</label>
              <input
                type="number"
                name="savingsGoal"
                value={financeData.savingsGoal}
                onChange={handleChange}
                required
              />

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Save Plan
                </button>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowForm(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>

          <div className="finance-right">
            <Lottie options={defaultOptions} height={300} width={300} />
            <div className="finance-expert-card">
              <h3>Finance Expert Tip</h3>
              <p>
                "Track your expenses weekly to stay ahead of your savings goal!"
              </p>
            </div>
          </div>
        </div>
      )}

      {submittedData && (
        <div className="budget-vs-actual card">
          <h2>Monthly Budget vs Actual</h2>
          {(() => {
            const report = getMonthlyBudgetVsActual();
            return (
              <div className="display-flex">
                <div>
                  <Lottie options={girlOptions} height={300} width={300} />
                </div>
                <div className="report-cards">
                  <div
                    className={`report-card ${getBudgetIndicator(
                      "essential",
                      report.totalSpent
                    )}`}
                  >
                    <h4>Budgeted Essentials</h4>
                    <p>₹{report.essentials.toFixed(2)}</p>
                  </div>
                  <div
                    className={`report-card ${getBudgetIndicator(
                      "want",
                      report.totalSpent
                    )}`}
                  >
                    <h4>Budgeted Wants</h4>
                    <p>₹{report.wants.toFixed(2)}</p>
                  </div>
                  <div
                    className={`report-card ${getBudgetIndicator(
                      "savings",
                      report.totalSpent
                    )}`}
                  >
                    <h4>Budgeted Savings</h4>
                    <p>₹{report.savings.toFixed(2)}</p>
                  </div>
                  <div className="report-card total-budget">
                    <h4>Total Monthly Budget</h4>
                    <p>₹{report.totalBudget.toFixed(2)}</p>
                  </div>
                  <div
                    className={`report-card ${
                      report.totalSpent <= report.totalBudget ? "green" : "red"
                    }`}
                  >
                    <h4>Actual Spending</h4>
                    <p>₹{report.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="display-flex">
        <div className="smart-insights">
          <h2>Smart Insights</h2>
          <h4>⚠️ Overspending Alerts</h4>
          <ul>
            {getOverspendingAlerts().map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
          <h4>💡 Cost-Cutting Suggestions</h4>
          <ul>
            {getSpendingSuggestions().map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="analytics-section">
          <h2>📊 Full Advanced Analytics</h2>
          <h3>Spending Trends</h3>
          <ul>
            {spendingTrends.map((entry, i) => (
              <li key={i}>
                {entry.month}: ₹{entry.total}
              </li>
            ))}
          </ul>
          <h3>Category-wise Breakdown</h3>
          <ul>
            {categoryBreakdown.map((item, i) => (
              <li key={i}>
                {item.category}: ₹{item.total}
              </li>
            ))}
          </ul>
          <h3>Projected Cash Flow</h3>
          <ul>
            {projectedCashFlow.map((entry, i) => (
              <li key={i}>
                {entry.month}: ₹{entry.projectedIncome}
              </li>
            ))}
          </ul>
          <h3>Peer Comparison (Estimated)</h3>
          <ul>
            {peerComparison.map((entry, i) => (
              <li key={i}>
                {entry.category}: You ₹{entry.userSpent} vs Avg ₹
                {entry.avgSpent}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Savvy;

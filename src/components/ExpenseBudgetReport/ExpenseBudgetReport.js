// src/components/FinPilot/ExpenseBudgetReport.js
import React, { useEffect, useState } from "react";
import "./BudgetComparison.css";

const getColorCode = (spent, budgeted) => {
  const ratio = spent / budgeted;
  if (ratio < 0.8) return "UnderBudget";
  if (ratio <= 1.0) return "Warning";
  return "OverBudget";
};

const SmartInsights = ({ expenses, salary }) => {
  const alerts = [];
  const suggestions = [];

  const categoryLimit = salary / (Object.keys(expenses).length || 1);

  Object.entries(expenses).forEach(([category, amount]) => {
    if (amount > categoryLimit) {
      alerts.push(
        `⚠️ Overspending in ${category}: ₹${amount.toFixed(
          2
        )} (Limit: ₹${categoryLimit.toFixed(2)})`
      );
    }

    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("food") || lowerCategory.includes("dining")) {
      suggestions.push("🍽 Consider reducing dining out and cook at home more.");
    }
    if (lowerCategory.includes("entertainment")) {
      suggestions.push("🎬 Entertainment is high. Try more free/low-cost fun.");
    }
    if (lowerCategory.includes("shopping")) {
      suggestions.push("🛍 Delay purchases or try a no-spend challenge.");
    }
  });

  return (
    <div className="display-flex-wrapper card">
      <div className="smart-insights ">
        <h2>💡 Smart Insights & Spending Analysis</h2>
        <div className="insight-block">
          <h4>Overspending Alerts</h4>
          <ul>
            {alerts.length > 0 ? (
              alerts.map((alert, i) => <li key={i}>{alert}</li>)
            ) : (
              <li>✅ No overspending this month!</li>
            )}
          </ul>
        </div>
        <div className="insight-block">
          <h4>Cost-Cutting Suggestions</h4>
          <ul>
            {suggestions.length > 0 ? (
              suggestions.map((tip, i) => <li key={i}>{tip}</li>)
            ) : (
              <li>You're managing expenses well!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const BudgetComparison = () => {
  const [budgetSplit, setBudgetSplit] = useState({});
  const [expenses, setExpenses] = useState({});
  const [salary, setSalary] = useState(0);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("financeData")) || {};
    const storedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];

    const totalSalary = Number(storedData.salary) || 0;
    setSalary(totalSalary);
    setBudgetSplit({
      essentials: storedData.essentials || 50,
      wants: storedData.wants || 30,
      savings: storedData.savings || 20,
    });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyDebits = storedTransactions.filter((tx) => {
      const d = new Date(tx.date);
      return (
        tx.type === "debit" &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

    const categorized = {};
    monthlyDebits.forEach((tx) => {
      categorized[tx.category] =
        (categorized[tx.category] || 0) + Number(tx.amount);
    });

    setExpenses(categorized);
  }, []);

  return (
    <div className="budget-comparison-wrapper display-flex-wrapper">
      <div className="budget-comparison card left-pane">
        <h2>📊 Budget vs Actual Spending</h2>
        <p>Based on your monthly salary: ₹{salary}</p>
        <div className="comparison-table">
          <div className="row header">
            <span>Category</span>
            <span>Budgeted</span>
            <span>Spent</span>
            <span>Status</span>
          </div>
          {Object.entries(expenses).map(([category, spent], i) => {
            const key = category.toLowerCase().includes("essential")
              ? "essentials"
              : category.toLowerCase().includes("want")
              ? "wants"
              : "savings";

            const budgeted = (budgetSplit[key] / 100) * salary;
            const status = getColorCode(spent, budgeted);

            return (
              <div key={i} className={`row ${status}`}>
                <span>{category}</span>
                <span>₹{budgeted.toFixed(2)}</span>
                <span>₹{spent.toFixed(2)}</span>
                <span className={`pill ${status}`}>{status.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="right-pane">
        <SmartInsights expenses={expenses} salary={salary} />
      </div>
    </div>
  );
};

export default BudgetComparison;

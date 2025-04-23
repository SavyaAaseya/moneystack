// 1. Category Breakdown
export function getCategoryBreakdown(transactions) {
  const categorized = {};
  transactions.forEach(({ type, category, amount, date }) => {
    const d = new Date(date);
    const isThisMonth =
      d.getMonth() === new Date().getMonth() &&
      d.getFullYear() === new Date().getFullYear();
    if (type === "debit" && isThisMonth) {
      categorized[category] = (categorized[category] || 0) + Number(amount);
    }
  });

  return {
    labels: Object.keys(categorized),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categorized),
        backgroundColor: [
          "#8f87f1",
          "#f5a623",
          "#f25f5c",
          "#4caf50",
          "#fed766",
          "#3ec1d3",
        ],
      },
    ],
  };
}

// 2. Monthly Spending (last 12 months view)
export function getMonthlySpending(transactions) {
  const monthly = Array(12).fill(0);
  transactions.forEach(({ type, amount, date }) => {
    if (type === "debit") {
      const month = new Date(date).getMonth();
      monthly[month] += Number(amount);
    }
  });

  return {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Spending",
        data: monthly,
        borderColor: "#8f87f1",
        backgroundColor: "#c68efd88",
        tension: 0.3,
      },
    ],
  };
}

// 3. Projected Cash Flow (next 3 months)
export function getProjectedCashFlow(transactions = []) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const pastSpending = [0, 0, 0]; // last 3 months
  const future = [0, 0, 0]; // predicted for this, next, next+1

  transactions.forEach(({ type, amount, date }) => {
    const txnDate = new Date(date);
    const txnMonth = txnDate.getMonth();
    const txnYear = txnDate.getFullYear();
    const diff = (currentYear - txnYear) * 12 + (currentMonth - txnMonth);

    if (type.toLowerCase() === "debit" && diff >= 1 && diff <= 3) {
      pastSpending[3 - diff] += Number(amount);
    }
  });

  const avgSpending =
    pastSpending.reduce((sum, val) => sum + val, 0) / pastSpending.length;
  console.log("avgSpending", avgSpending);

  // Use average as prediction
  for (let i = 0; i < 3; i++) {
    future[i] = -avgSpending; // negative because it's expense
  }

  return {
    labels: ["This Month", "Next Month", "Month+2"],
    datasets: [
      {
        label: "Projected Cash Flow (Based on Avg Past Spending)",
        data: future,
        backgroundColor: ["#4caf50", "#f5a623", "#f25f5c"],
      },
    ],
  };
}

// 4. Peer Comparison
export function getPeerComparison(transactions) {
  // Get financeData from localStorage (saved from FinPilot form)
  const financeData = JSON.parse(localStorage.getItem("financeData")) || {
    salary: 0,
    savings: 0,
  };

  // Calculate monthly savings as per salary and savings percentage
  const userSavings =
    (Number(financeData.salary) * Number(financeData.savings)) / 100;

  // Replace static peer benchmark with a sample for now (can be dynamic later)
  const peerAverage = Number(financeData.salary) * 0.35; // Peers save ~35% of salary

  return {
    labels: ["Your Savings", "Peer Average"],
    datasets: [
      {
        label: "Monthly Savings",
        data: [userSavings, peerAverage],
        backgroundColor: ["#8f87f1", "#bbb"],
      },
    ],
  };
}

// 5. Last 3 Months Spending (line chart)
export const getLastThreeMonthsSpending = (transactions = []) => {
  const now = new Date();
  const months = [];

  for (let i = 2; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString("default", { month: "short" });
    months.push({
      label,
      year: date.getFullYear(),
      month: date.getMonth(),
      total: 0,
    });
  }

  transactions.forEach((txn) => {
    const txnDate = new Date(txn.date);
    const txnMonth = txnDate.getMonth();
    const txnYear = txnDate.getFullYear();

    const match = months.find(
      (m) => m.month === txnMonth && m.year === txnYear
    );

    if (match && txn.type === "debit") {
      match.total += parseFloat(txn.amount || 0);
    }
  });

  const labels = months.map((m) => m.label);
  const values = months.map((m) => m.total);

  return { labels, values };
};

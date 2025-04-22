// src/utils/analyticsUtils.js
export function getCategoryBreakdown(transactions) {
  const categories = {};
  transactions.forEach(({ category, amount, type }) => {
    if (type === "Debit") {
      categories[category] = (categories[category] || 0) + Number(amount);
    }
  });

  return {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categories),
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

export function getMonthlySpending(transactions) {
  const monthly = Array(12).fill(0);
  transactions.forEach(({ type, amount, date }) => {
    if (type === "Debit") {
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

export function getProjectedCashFlow(transactions) {
  const currentMonth = new Date().getMonth();
  const future = Array(3).fill(0);

  transactions.forEach(({ type, amount, date }) => {
    const txMonth = new Date(date).getMonth();
    if (type === "Credit" && txMonth >= currentMonth) {
      future[txMonth - currentMonth] += Number(amount);
    }
    if (type === "Debit" && txMonth >= currentMonth) {
      future[txMonth - currentMonth] -= Number(amount);
    }
  });

  return {
    labels: ["This Month", "Next Month", "Month+2"],
    datasets: [
      {
        label: "Net Cash Flow",
        data: future,
        backgroundColor: ["#4caf50", "#f5a623", "#f25f5c"],
      },
    ],
  };
}

export function getPeerComparison(transactions) {
  // Example data for demonstration (random benchmark)
  const userTotal = transactions
    .filter((t) => t.type === "Debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const avgPeerSpending = 30000;

  return {
    labels: ["You", "Peers"],
    datasets: [
      {
        label: "Monthly Spend",
        data: [userTotal, avgPeerSpending],
        backgroundColor: ["#8f87f1", "#bbb"],
      },
    ],
  };
}
// 📁 src/utils/analyticsUtils.js

export const getLastThreeMonthsSpending = (transactions = []) => {
  if (!Array.isArray(transactions)) return { labels: [], values: [] };

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
    const matchingMonth = months.find(
      (m) => m.month === txnMonth && m.year === txnYear
    );

    if (matchingMonth) {
      matchingMonth.total += parseFloat(txn.amount || 0);
    }
  });

  const labels = months.map((m) => m.label);
  const values = months.map((m) => m.total);

  return { labels, values };
};

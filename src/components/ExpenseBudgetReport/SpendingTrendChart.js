import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { getLastThreeMonthsSpending } from "../../utils/analyticsUtils";

// Helper function to get the last three months dynamically
const getLastThreeMonths = () => {
  const months = [
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
  ];
  const currentMonth = new Date().getMonth(); // Get the current month index (0-11)
  const lastThreeMonths = [
    months[(currentMonth - 2 + 12) % 12], // Two months ago
    months[(currentMonth - 1 + 12) % 12], // Last month
    months[currentMonth], // Current month
  ];
  return lastThreeMonths;
};

const SpendingTrendChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const spendingData = getLastThreeMonthsSpending(transactions);

    console.log("🧾 Spending Data:", spendingData);

    // Get the labels for the last three months dynamically
    const labels = getLastThreeMonths();
    const values = spendingData?.values || [];

    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.length ? labels : ["No Data"],
        datasets: [
          {
            label: "Monthly Spending",
            data: values.length ? values : [0],
            backgroundColor: "rgba(143, 135, 241, 0.2)",
            borderColor: "#8F87F1",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#8F87F1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: "#666",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#666",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#555",
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div
      className="trend-chart card"
      style={{ height: "300px", position: "relative" }}
    >
      <h2>📈 Spending Trends (Last 3 Months)</h2>
      <canvas ref={chartRef} />
    </div>
  );
};

export default SpendingTrendChart;

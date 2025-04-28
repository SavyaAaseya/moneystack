// src/components/FinPilot/FinPilot.js
import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaTrash } from "react-icons/fa";
import Lottie from "react-lottie";
import animationData from "../../assets/finance.json";
import "../FinPilot/FinPilot.css";
import BudgetComparison from "../ExpenseBudgetReport/ExpenseBudgetReport";
import SpendingTrendChart from "../ExpenseBudgetReport/SpendingTrendChart";
import AnalyticsPanel from "../../utils/AnalyticsPanel";
import { useNavigate } from "react-router-dom";

const GoalsSection = () => {
  const [goals, setGoals] = useState(() => {
    const stored = localStorage.getItem("savingsGoals");
    return stored ? JSON.parse(stored) : [];
  });

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", amount: "" });
  const [totalSavings] = useState(
    Number(localStorage.getItem("totalBalance")) || 0
  );

  // 🟡 Periodically check for changes in totalBalance from localStorage

  useEffect(() => {
    if (!goals.length) return;

    const perGoalSavings = totalSavings / goals.length;

    const updatedGoals = goals.map((goal) => {
      const saved = Math.min(goal.amount, perGoalSavings);
      return {
        ...goal,
        progress: ((saved / goal.amount) * 100).toFixed(1),
        currentSaved: saved.toFixed(2),
      };
    });

    // 🛑 Check if update is really needed
    const shouldUpdate = updatedGoals.some((goal, index) => {
      return (
        goal.progress !== goals[index].progress ||
        goal.currentSaved !== goals[index].currentSaved
      );
    });

    if (shouldUpdate) {
      setGoals(updatedGoals);
      localStorage.setItem("savingsGoals", JSON.stringify(updatedGoals));
    }
  }, [totalSavings, goals]); // ✅ removed `goals` from dependency array

  const handleAddGoal = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      name: newGoal.name,
      amount: Number(newGoal.amount),
    };
    const updated = [...goals, newEntry];
    setGoals(updated);
    localStorage.setItem("savingsGoals", JSON.stringify(updated));
    setNewGoal({ name: "", amount: "" });
    setShowGoalForm(false);
    window.location.reload();
  };

  const handleDelete = (id) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    localStorage.setItem("savingsGoals", JSON.stringify(updated));
    window.location.reload();
  };

  return (
    <div className="goal-section card">
      <h2>Savings & Goals</h2>
      <button className="add-goal-btn" onClick={() => setShowGoalForm(true)}>
        <FaPlusCircle size={20} />
      </button>

      {showGoalForm && (
        <form onSubmit={handleAddGoal} className="goal-form">
          <input
            type="text"
            placeholder="Goal Name"
            value={newGoal.name}
            onChange={(e) =>
              setNewGoal((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={newGoal.amount}
            onChange={(e) =>
              setNewGoal((prev) => ({ ...prev, amount: e.target.value }))
            }
            required
          />
          <button type="submit" className="submit-btn">
            Add Goal
          </button>
        </form>
      )}

      <div className="goals-list">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div className="goal-item" key={goal.id}>
              <div className="goal-details">
                <h4>{goal.name}</h4>
                <p>
                  ₹{goal.currentSaved} / ₹{goal.amount}
                </p>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {goal.progress}% completed
                </span>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(goal.id)}
              >
                <FaTrash />
              </button>
            </div>
          ))
        ) : (
          <p>No goals added yet.</p>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------- */
const FinPilot = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  useEffect(() => {
    // Automatically open login dialog when arriving
    setShowLogin(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    // Hardcoded Username/Password for now
    if (username === "pro" && password === "Crazy123") {
      setIsAuthenticated(true);
      setShowLogin(false);
    } else {
      alert("Invalid Credentials");
    }
  };

  const [showForm, setShowForm] = useState(false);
  const [financeData, setFinanceData] = useState({
    salary: "",
    essentials: 50,
    wants: 30,
    savings: 20,
  });

  const handleChange = (e) => {
    setFinanceData({ ...financeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalSplit =
      Number(financeData.essentials) +
      Number(financeData.wants) +
      Number(financeData.savings);
    if (totalSplit !== 100) {
      alert("Budget split must equal 100%");
      return;
    }
    localStorage.setItem("financeData", JSON.stringify(financeData));
    alert("Financial plan saved!");
    setShowForm(false);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  /* Goal Section logics */

  return (
    <div className="finpilot-page">
      {/* Show login modal if not authenticated */}
      {!isAuthenticated && showLogin && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Login Required</h2>
            <form onSubmit={handleLogin}>
              <input
                className="input-styles"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                className="input-styles"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="save-btn">
                Login
              </button>
              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  setShowLogin(false);
                  navigate("/"); // ✅ Correct use of navigate
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Actual FinPilot page content after login */}
      {isAuthenticated && (
        <>
          <div className="finpilot-container">
            <h1>
              Welcome to <span className="highlight">FinPilot</span>
            </h1>{" "}
            <p>Your personal finance analytics and insights hub.</p>
            <button
              className="personalize-btn"
              onClick={() => setShowForm(true)}
            >
              Personalize Finances
            </button>
            {showForm && (
              <div className="finance-form-container">
                <div className="finance-left">
                  <h2>Customize Budget Plan</h2>
                  <form onSubmit={handleSubmit}>
                    <label>Budget Split (%):</label>
                    <div className="budget-split-row">
                      <div>
                        <label>Essentials:</label>
                        <input
                          type="number"
                          name="essentials"
                          value={financeData.essentials}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label>Wants:</label>
                        <input
                          type="number"
                          name="wants"
                          value={financeData.wants}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label>Savings:</label>
                        <input
                          type="number"
                          name="savings"
                          value={financeData.savings}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <label>Monthly Salary:</label>
                    <input
                      type="number"
                      name="salary"
                      value={financeData.salary}
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
                </div>
              </div>
            )}
            <div className="display-flex-wrapper">
              <GoalsSection />
              <SpendingTrendChart />
            </div>
            <BudgetComparison />
            <div>
              <AnalyticsPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinPilot;

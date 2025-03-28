import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaMinus,
  FaList,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaTrash,
  FaPencilAlt,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
const Dashboard = () => {
  const [showModal, setShowModal] = useState(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [sortDateAsc, setSortDateAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filterTypeOpen, setFilterTypeOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const recordsPerPage = 5;
  const creditCategories = ["Salary", "Saving", "Deposits", "Investments"];
  const debitCategories = [
    "Bills",
    "Eating Out",
    "Groceries",
    "Shopping",
    "Entertainment",
    "Travel",
    "Gifts",
    "Health",
    "Education",
    "Transport",
    "Others",
    "Sports",
  ];

  useEffect(() => {
    const savedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(savedTransactions);
    setFilteredTransactions(savedTransactions);
  }, [showTable]);

  useEffect(() => {
    let updatedTransactions = [...transactions];
    if (filterType) {
      updatedTransactions = updatedTransactions.filter(
        (t) => t.type === filterType
      );
    }
    if (selectedCategories.length) {
      updatedTransactions = updatedTransactions.filter((t) =>
        selectedCategories.includes(t.category)
      );
    }
    updatedTransactions.sort((a, b) =>
      sortDateAsc
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
    setFilteredTransactions(updatedTransactions);
  }, [filterType, selectedCategories, sortDateAsc, transactions]);

  const toggleCategoryFilter = () => {
    setCategoryFilterOpen(!categoryFilterOpen);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleDelete = (id) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
  };

  const processGraphData = () => {
    const groupedData = {};
    transactions.forEach(({ date, amount, type }) => {
      if (!groupedData[date]) groupedData[date] = { date, credit: 0, debit: 0 };
      if (type === "credit") groupedData[date].credit += Number(amount);
      else if (type === "debit") groupedData[date].debit += Number(amount);
    });
    return Object.values(groupedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const processPieChartData = () => {
    const categorySpending = {};
    transactions.forEach(({ category, amount, type }) => {
      if (type === "debit") {
        if (!categorySpending[category]) categorySpending[category] = 0;
        categorySpending[category] += Number(amount);
      }
    });
    return Object.keys(categorySpending).map((category) => ({
      name: category,
      value: categorySpending[category],
    }));
  };

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#a4de6c",
    "#d0ed57",
    "#ffbb28",
  ];

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount);
    setDate(transaction.date);
    setCategory(transaction.category);
    setShowModal(transaction.type); // Open the modal
  };

  const saveTransaction = () => {
    if (!amount || !date || !category) return; // Validation

    if (editingTransaction) {
      // Editing an existing transaction
      const updatedTransactions = transactions.map((t) =>
        t.id === editingTransaction.id ? { ...t, amount, date, category } : t
      );

      setTransactions(updatedTransactions);
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
      setEditingTransaction(null);
    } else {
      // Adding a new transaction
      const transaction = {
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        amount: parseFloat(amount) || 0,
        date,
        category,
        type: showModal,
      };

      const existingTransactions =
        JSON.parse(localStorage.getItem("transactions")) || [];
      existingTransactions.push(transaction);
      setTransactions(existingTransactions);
      localStorage.setItem(
        "transactions",
        JSON.stringify(existingTransactions)
      );
    }

    setShowModal(null);
    setAmount("");
    setDate("");
    setCategory("");
  };

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalBalance = totalCredits - totalDebits;

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    firstIndex,
    lastIndex
  );
  const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="app-header">
        <h1>Expense Manager</h1>
        <div className="header-buttons">
          <button
            className="credit-btn"
            data-tooltip="Add Credit"
            onClick={() => setShowModal("credit")}
          >
            <FaPlus className="icon" />
          </button>
          <button
            className="debit-btn"
            data-tooltip="Add Debit"
            onClick={() => setShowModal("debit")}
          >
            <FaMinus className="icon" />
          </button>
          <button
            className="button-primary view-all-btn"
            data-tooltip="View Transactions"
            onClick={() => setShowTable(!showTable)}
          >
            <FaList className="icon" />
          </button>
        </div>
      </header>

      <div className="stats-container">
        <div className="stats-card">
          <div className="icon-wrapper">
            <FaWallet className="icon" />
          </div>
          <div className="content">
            <div className="title">Total Balance</div>
            <div className="amount">₹{totalBalance.toFixed(2)}</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="icon-wrapper">
            <FaArrowUp className="icon up" />
          </div>
          <div className="content">
            <div className="title">Total Credits</div>
            <div className="amount">₹{totalCredits.toFixed(2)}</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="icon-wrapper">
            <FaArrowDown className="icon down" />
          </div>
          <div className="content">
            <div className="title">Total Debits</div>
            <div className="amount">₹{totalDebits.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {showTable && (
        <div className="card-common viewall-container">
          <h2>All Transactions</h2>
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>
                  Category{" "}
                  <FaFilter
                    className="filter-icon"
                    onClick={toggleCategoryFilter}
                  />
                  {categoryFilterOpen && (
                    <div className="filter-dropdown">
                      {creditCategories.concat(debitCategories).map((cat) => (
                        <label key={cat}>
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => handleCategorySelect(cat)}
                          />
                          {cat}
                        </label>
                      ))}
                    </div>
                  )}
                </th>
                <th>
                  Type{" "}
                  <FaFilter
                    className="filter-icon"
                    onClick={() => setFilterTypeOpen(!filterTypeOpen)}
                  />
                  {filterTypeOpen && (
                    <div className="filter-dropdown">
                      <label>
                        <input
                          type="checkbox"
                          value="credit"
                          onChange={() => setFilterType("credit")}
                        />{" "}
                        Credit
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          value="debit"
                          onChange={() => setFilterType("debit")}
                        />{" "}
                        Debit
                      </label>
                    </div>
                  )}
                </th>
                <th>
                  Date{" "}
                  <FaFilter
                    className="filter-icon"
                    onClick={() => setDateFilterOpen(!dateFilterOpen)}
                  />
                  {dateFilterOpen && (
                    <div className="filter-dropdown">
                      <button
                        className="dd-btn"
                        onClick={() => setSortDateAsc(true)}
                      >
                        Oldest First
                      </button>
                      <button
                        className="dd-btn"
                        onClick={() => setSortDateAsc(false)}
                      >
                        Newest First
                      </button>
                    </div>
                  )}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((t, i) => (
                <tr key={i}>
                  <td>₹{Number(t.amount).toFixed(2)}</td>
                  <td>{t.category}</td>
                  <td>
                    <span
                      className={`pill ${
                        t.type === "credit" ? "credit" : "debit"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td>{t.date}</td>
                  <td>
                    <button className="atn-btn" onClick={() => handleEdit(t)}>
                      <FaPencilAlt className="icon" />
                    </button>
                    <button
                      className="atn-btn"
                      onClick={() => handleDelete(t.id)}
                    >
                      <FaTrash className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
      <div className="display-flex">
        <div className="graph-container card-common">
          <h3 className="dashboard-heading">Credit vs Debit Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processGraphData()}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="credit"
                stroke="green"
                name="Credit"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="debit"
                stroke="red"
                name="Debit"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="graph-container card-common">
          <h3 className="dashboard-heading">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processPieChartData()}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {processPieChartData().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal for Adding Transactions */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {editingTransaction
                ? "Edit Transaction"
                : showModal === "credit"
                ? "Add Credit"
                : "Add Debit"}
            </h3>
            <input
              className="input-styles"
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="input-styles"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <select
              className="input-styles"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {(showModal === "credit"
                ? creditCategories
                : debitCategories
              ).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button className="save-btn" onClick={saveTransaction}>
              {editingTransaction ? "Update" : "Save"}
            </button>{" "}
            <button className="close-btn" onClick={() => setShowModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

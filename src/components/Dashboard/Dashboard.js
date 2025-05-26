import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  FaDownload,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import logo from "../../assets/logo.png";

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
  const [menuOpen, setMenuOpen] = useState(null);
  const [creditCategories, setCreditCategories] = useState([]);
  const [debitCategories, setDebitCategories] = useState([]);
  const [notes, setNotes] = useState("");

  const recordsPerPage = 5;

  useEffect(() => {
    const savedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(savedTransactions);
    setFilteredTransactions(savedTransactions);

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
      "Recharges",
      "Subscriptions",
      "Others",
      "Sports",
      "Gym",
      "Hobbies",
    ];

    // 🔄 Load custom categories from localStorage
    const customCredits =
      JSON.parse(localStorage.getItem("customCreditCategories")) || [];
    const customDebits =
      JSON.parse(localStorage.getItem("customDebitCategories")) || [];

    creditCategories.push(...customCredits);
    debitCategories.push(...customDebits);
    setCreditCategories([...creditCategories, ...customCredits]);
    setDebitCategories([...debitCategories, ...customDebits]);
  }, [showTable]);

  useEffect(() => {
    const savedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(savedTransactions);
    setFilteredTransactions(savedTransactions);
  }, [showTable]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTransactions]);

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

  const exportToCSV = () => {
    const filteredTransactions = applyFilters(transactions); // Only export visible data
    const csv = Papa.unparse(filteredTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "transactions.csv");
  };

  const exportToExcel = () => {
    const filteredTransactions = applyFilters(transactions);
    const worksheet = XLSX.utils.json_to_sheet(filteredTransactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "transactions.xlsx");
  };

  // Helper function to apply active filters
  const applyFilters = (data) => {
    return data.filter((txn) => {
      if (filterType && txn.type !== filterType) return false;
      if (
        selectedCategories.length &&
        !selectedCategories.includes(txn.category)
      )
        return false;
      return true;
    });
  };

  const toggleCategoryFilter = () => {
    setCategoryFilterOpen(!categoryFilterOpen);
  };

  const toggleMenu = (id) => {
    setMenuOpen((prev) => (prev === id ? null : id));
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
    setNotes(transaction.notes || "");
    setShowModal(transaction.type); // Open the modal
  };

  const [attachment, setAttachment] = useState(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    const filteredFiles = files.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (filteredFiles.length !== files.length) {
      alert(
        "Some files were ignored. Only JPG, PNG, XLS, and XLSX files are allowed."
      );
    }

    const transactionId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Rename & Store in LocalStorage
    const storedFiles = filteredFiles.map((file) => {
      const newFileName = `${transactionId}-${file.name}`;
      const reader = new FileReader();

      reader.readAsDataURL(file); // Convert file to base64
      reader.onload = () => {
        localStorage.setItem(newFileName, reader.result); // Save as base64
      };

      return { name: newFileName, url: `localStorage:${newFileName}` };
    });

    setAttachment(storedFiles);
  };
  const navigate = useNavigate();
  const saveTransaction = () => {
    if (!amount || !date || !category) {
      alert("All fields (Amount, Date, and Category) are mandatory!");
      return;
    }

    const transactionId = editingTransaction
      ? editingTransaction.id
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const transaction = {
      id: transactionId,
      amount: parseFloat(amount) || 0,
      date,
      category,
      type: showModal,
      notes: notes.trim(),
      attachment,
    };

    let existingTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];

    if (editingTransaction) {
      existingTransactions = existingTransactions.map((t) =>
        t.id === editingTransaction.id ? transaction : t
      );
    } else {
      existingTransactions.push(transaction);
    }

    setTransactions(existingTransactions);
    localStorage.setItem("transactions", JSON.stringify(existingTransactions));

    // Reset
    setShowModal(null);
    setAmount("");
    setDate("");
    setCategory("");
    setNotes("");
    setAttachment([]);
  };

  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalBalance = totalCredits - totalDebits;
  localStorage.setItem("totalBalance", totalBalance.toString());

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    firstIndex,
    lastIndex
  );
  const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);

  /* Import */

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="app-header">
        <Link to="/">
          <img src={logo} alt="Expense Manager Logo" className="app-logo" />
        </Link>

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
            creditCategories
            onClick={() => setShowTable(!showTable)}
          >
            <FaList className="icon" />
          </button>
          <button className="me-btn" onClick={() => navigate("/me")}>
            ME
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
          <div className="table-header">
            <h2>All Transactions</h2>
            <div className="button-group">
              <button className="button-primary" onClick={exportToCSV}>
                <FaDownload className="filter-icon marginR10" />
                CSV
              </button>
              <button className="button-secondary" onClick={exportToExcel}>
                <FaDownload className="filter-icon marginR10" />
                Excel
              </button>
            </div>
          </div>

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
                <th>Notes</th>

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((t, i) => (
                <tr key={i}>
                  <td>₹{Number(t.amount).toFixed(2)}</td>
                  <td>{t.category}</td>
                  <td title={t.notes}>
                    {t.notes && t.notes.length > 20
                      ? `${t.notes.substring(0, 20)}...`
                      : t.notes || "—"}
                  </td>
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
                  <td className="actions-cell">
                    <div className="menu-container">
                      <button onClick={() => toggleMenu(t.id)}>⋮</button>
                      {menuOpen === t.id && (
                        <div className="menu">
                          <button
                            className="dd-btn"
                            onClick={() => handleEdit(t)}
                          >
                            <FaPencilAlt className="icon" />
                            Edit
                          </button>
                          <button
                            className="dd-btn"
                            onClick={() => handleDelete(t.id)}
                          >
                            <FaTrash className="icon" />
                            Delete
                          </button>

                          {Array.isArray(t.attachment) &&
                          t.attachment.length > 0
                            ? t.attachment.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.url}
                                  className="dd-btn"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FaDownload className="marginR10" size={16} />
                                  {file.name.includes("image")
                                    ? "View Image"
                                    : "Attachment"}
                                </a>
                              ))
                            : null}
                        </div>
                      )}
                    </div>
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
            <BarChart data={processPieChartData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8f87f1">
                {processPieChartData().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
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
            <div className="custom-category-wrapper">
              <input
                type="text"
                className="input-styles"
                value={category}
                placeholder="Search or add category"
                onChange={(e) => setCategory(e.target.value)}
                list="category-options"
              />
              <datalist id="category-options">
                {(showModal === "credit"
                  ? creditCategories
                  : debitCategories
                ).map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>

              {/* Show "Add" button if input is non-empty and not in list */}
              {category &&
                ![
                  ...(showModal === "credit"
                    ? creditCategories
                    : debitCategories),
                ].includes(category) && (
                  <button
                    className="add-category-btn"
                    onClick={() => {
                      const key =
                        showModal === "credit"
                          ? "customCreditCategories"
                          : "customDebitCategories";
                      const stored =
                        JSON.parse(localStorage.getItem(key)) || [];
                      const trimmed = category.trim();

                      if (!stored.includes(trimmed) && trimmed !== "") {
                        const updated = [...stored, trimmed];
                        localStorage.setItem(key, JSON.stringify(updated));
                        alert(`New category "${trimmed}" added!`);

                        // ⏱ Refresh category list in state immediately
                        if (showModal === "credit") {
                          setCreditCategories((prev) => [...prev, trimmed]);
                        } else {
                          setDebitCategories((prev) => [...prev, trimmed]);
                        }
                      }
                    }}
                  >
                    + Add “{category.trim()}”
                  </button>
                )}
            </div>
            <textarea
              className="input-styles"
              maxLength={100}
              placeholder="Notes (optional, max 100 chars)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <input
              className="input-styles"
              placeholder="Attachment (optional)"
              type="file"
              accept=".jpg,.jpeg,.png,.xls,.xlsx"
              onChange={handleFileChange}
            />
            {attachment && <p>Attached File: {attachment.name}</p>}
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

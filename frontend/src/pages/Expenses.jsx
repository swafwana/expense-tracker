import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  FileText,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { getCategoryIcon } from "../utils/categoryIcons";
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function Expenses() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayLocal);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
    // Month being viewed (YYYY-MM)
  const [viewMonth, setViewMonth] = useState(() => todayLocal().slice(0, 7));
  const loadExpenses = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        setMessage("Could not load expenses");
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    }
  }, [token]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8000/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId((current) => current || String(data[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, [token]);

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, [loadExpenses, loadCategories]);

  const getCategoryName = useCallback((id) => {
    const found = categories.find((cat) => cat.id === id);
    return found ? found.name : "General";
  }, [categories]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const catName = getCategoryName(exp.category_id).toLowerCase();
      const desc = (exp.description || "").toLowerCase();
      const matchesSearch =
        desc.includes(searchQuery.toLowerCase()) ||
        catName.includes(searchQuery.toLowerCase()) ||
        String(exp.amount).includes(searchQuery);

      const matchesCat =
        selectedFilterCategory === "all" ||
        String(exp.category_id) === String(selectedFilterCategory);

      const matchesMonth = (exp.date || "").slice(0, 7) === viewMonth;

      return matchesSearch && matchesCat && matchesMonth;
    }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [expenses, searchQuery, selectedFilterCategory, viewMonth, getCategoryName]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredExpenses]);

  async function handleAdd(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          amount: Number(amount),
          description: description || "Expense",
          date: date,
        }),
      });

      if (response.ok) {
        setAmount("");
        setDescription("");
        setViewMonth(date.slice(0, 7));
        setMessage("Expense added successfully!");
        loadExpenses();
      } else {
        const error = await response.json();
        setMessage(typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setCategoryId(String(expense.category_id));
    setAmount(String(expense.amount));
    setDescription(expense.description || "");
    setDate(expense.date);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setDate(todayLocal());
    if (categories.length > 0) setCategoryId(String(categories[0].id));
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/expenses/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          amount: Number(amount),
          description: description,
          date: date,
        }),
      });

      if (response.ok) {
        cancelEdit();
        setViewMonth(date.slice(0, 7));
        setMessage("Expense updated successfully!");
        loadExpenses();
      } else {
        const error = await response.json();
        setMessage(typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`http://localhost:8000/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadExpenses();
      } else {
        const error = await response.json();
        setMessage(typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    }
  }

  return (
    <AppLayout onDataRefresh={loadExpenses}>
      <div className="space-y-6">
        {/* ================= HEADER SUMMARY ================= */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF8F7] text-[#2F7E79] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Viewing Month
              </p>
              <input
                type="month"
                value={viewMonth}
                onChange={(e) => {
                  if (e.target.value) setViewMonth(e.target.value);
                }}
                className="text-lg font-black text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-white px-5 py-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#F95B51] flex items-center justify-center font-bold">
              $
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Shown
              </p>
              <p className="text-lg font-black text-slate-800">
                ${totalFilteredAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center justify-between ${
              isError
                ? "bg-rose-50 border border-rose-200 text-rose-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage("")} className="p-1 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= FORM CARD (Styled from Screen 5) ================= */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl mono-gradient-primary text-white flex items-center justify-center">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {editingId ? "Edit Expense" : "Record New Expense"}
                </h3>
                <p className="text-[11px] text-slate-400">Fill in transaction details</p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={editingId ? handleSave : handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2F7E79]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="" disabled>Choose Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Amount ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2F7E79]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description / Note
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Starbucks, Groceries"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full mono-gradient-primary text-white font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingId ? "Update Expense" : "Save Expense"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ================= SEARCH & FILTER BAR ================= */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#438883] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= EXPENSES LIST / TABLE ================= */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-medium">No expenses found for this month</p>
              </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => {
                const categoryName = getCategoryName(expense.category_id);
                const { icon: CatIcon, bg } = getCategoryIcon(categoryName);

                return (
                  <div
                    key={expense.id}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {expense.description || categoryName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          <span className="font-semibold text-slate-600">{categoryName}</span> • {expense.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                      <span className="text-sm sm:text-base font-extrabold text-[#F95B51]">
                        - ${Number(expense.amount).toFixed(2)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(expense)}
                          title="Edit"
                          className="p-2 text-slate-400 hover:text-[#2F7E79] hover:bg-[#EEF8F7] rounded-xl transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          title="Delete"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

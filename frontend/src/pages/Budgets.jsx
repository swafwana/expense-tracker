import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  AlertCircle,
  Check,
  X,
  
  
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { getCategoryIcon } from "../utils/categoryIcons";

export default function Budgets() {
  const { token } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(defaultMonth);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMonth, setViewMonth] = useState(defaultMonth);

  // Spent comparisons per category
  const [spentMap, setSpentMap] = useState({});

  async function loadCategories() {
    try {
      const response = await fetch("http://localhost:8000/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0 && !categoryId) {
          setCategoryId(String(data[0].id));
        }
      }
    } catch {}
  }

  async function loadBudgets() {
    try {
      const response = await fetch("http://localhost:8000/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBudgets(data);
        loadComparisonsForBudgets(data);
      } else {
        setMessage(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    }
  }

  async function loadComparisonsForBudgets(budgetList) {
    const map = {};
    for (const b of budgetList) {
      try {
        const res = await fetch(
          `http://localhost:8000/summary/comparison?category_id=${b.category_id}&month=${b.month}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const comp = await res.json();
          map[`${b.category_id}_${b.month}`] = comp.spent_amount;
        }
      } catch {}
    }
    setSpentMap(map);
  }

  useEffect(() => {
    loadCategories();
    loadBudgets();
  }, [token]);

  function getCategoryName(id) {
    const found = categories.find((cat) => cat.id === id);
    return found ? found.name : "Category";
  }

 const visibleBudgets = useMemo(() => {
  return budgets.filter((b) => b.month.slice(0, 7) === viewMonth);
}, [budgets, viewMonth]);

const totalBudgeted = useMemo(() => {
  return visibleBudgets.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}, [visibleBudgets]);

  async function handleAdd(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          amount: Number(amount),
          month: month + "-01",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Budget set successfully!");
        setViewMonth(month); 
        setAmount("");
        loadBudgets();
      } else {
        setMessage(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(budget) {
    setEditingId(budget.id);
    setCategoryId(String(budget.category_id));
    setAmount(String(budget.amount));
    setMonth(budget.month.slice(0, 7));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setAmount("");
    setMonth(defaultMonth);
    if (categories.length > 0) setCategoryId(String(categories[0].id));
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/budgets/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          month: month + "-01",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setViewMonth(month); 
        cancelEdit();
        setMessage("Budget updated successfully!");
        loadBudgets();
      } else {
        setMessage(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail));
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
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`http://localhost:8000/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadBudgets();
      } else {
        const data = await response.json();
        setMessage(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail));
        setIsError(true);
      }
    } catch {
      setMessage("Could not reach the server");
      setIsError(true);
    }
  }

  return (
    <AppLayout onDataRefresh={loadBudgets}>
      <div className="space-y-6">
       
        {/* ================= HEADER SUMMARY ================= */}
        <div className="flex flex-col sm:flex-row sm:items-stretch sm:justify-end gap-3">
          {/* Month picker card */}
          <div className="bg-white px-5 py-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#2F7E79] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Viewing Month
              </p>
              <input
                type="month"
                value={viewMonth}
                onChange={(e) => setViewMonth(e.target.value)}
                className="bg-transparent text-base font-black text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Total budgeted card */}
          <div className="bg-white px-5 py-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#2F7E79] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Budgeted
              </p>
              <p className="text-base font-black text-slate-800">
                ${totalBudgeted.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
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

        {/* ================= FORM CARD ================= */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl mono-gradient-primary text-white flex items-center justify-center">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {editingId ? "Edit Category Budget" : "Set Monthly Budget"}
                </h3>
                <p className="text-[11px] text-slate-400">Assign a spending ceiling for a category</p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1 bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={editingId ? handleSave : handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    disabled={editingId !== null}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
                  Monthly Budget ($)
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

              {/* Month */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Month
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2F7E79]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="month"
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all cursor-pointer"
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
                    <span>{editingId ? "Update Budget" : "Add Budget"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ================= BUDGET CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleBudgets.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-medium">No budgets for this month. Set one above!</p>
            </div>
          ) : (
        visibleBudgets.map((budget) => {
                const categoryName = getCategoryName(budget.category_id);
              const { icon: CatIcon, bg } = getCategoryIcon(categoryName);
              const spent = Number(spentMap[`${budget.category_id}_${budget.month}`] || 0);
              const budgetAmount = Number(budget.amount);
              const percent = budgetAmount > 0 ? Math.min(100, Math.round((spent / budgetAmount) * 100)) : 0;
              const remaining = budgetAmount - spent;
              const isOver = remaining < 0;

              return (
                <div
                  key={budget.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Category icon, name, actions */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{categoryName}</h4>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {budget.month.slice(0, 7)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(budget)}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-[#2F7E79] hover:bg-[#EEF8F7] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2 mt-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-slate-800 text-base">
                          ${budgetAmount.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Spent: <strong className="text-slate-700">${spent.toFixed(2)}</strong>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver
                              ? "bg-rose-500"
                              : percent > 85
                              ? "bg-amber-400"
                              : "mono-gradient-primary"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom badge */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Status</span>
                    {isOver ? (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full">
                        Over by ${Math.abs(remaining).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[#25A969] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        ${remaining.toFixed(2)} left ({100 - percent}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}

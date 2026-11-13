import React, { useState, useEffect } from "react";
import { X, Calendar, Tag, FileText, ChevronDown, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded, existingCategories = [] }) {
  const { token } = useAuth();
  const [categories, setCategories] = useState(existingCategories);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayLocal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setDate(todayLocal());
      if (!existingCategories || existingCategories.length === 0) {
        fetch("http://localhost:8000/categories", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setCategories(data);
              if (data.length > 0 && !categoryId) {
                setCategoryId(String(data[0].id));
              }
            }
          })
          .catch((err) => console.error("Failed to load categories:", err));
      } else {
        setCategories(existingCategories);
        if (existingCategories.length > 0 && !categoryId) {
          setCategoryId(String(existingCategories[0].id));
        }
      }
    }
  }, [isOpen, existingCategories, token, categoryId]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!date) {
      setError("Please choose a date");
      return;
    }

    setLoading(true);
    setError("");

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
        onClose();
        if (onExpenseAdded) onExpenseAdded();
      } else {
        const data = await response.json();
        setError(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail));
      }
    } catch {
      setError("Could not reach server. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all">
        {/* Top Teal Curved Header */}
        <div className="mono-gradient-header px-6 pt-6 pb-10 text-white relative">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold tracking-wide">Add Expense</h2>
            <div className="w-9" />
          </div>
          <p className="text-center text-xs text-white/80 mt-1">Record your transaction</p>
        </div>

        {/* Floating Form Card */}
        <div className="-mt-6 mx-4 mb-5 bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
                {error}
              </div>
            )}

            {/* Category Field */}
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Amount
                </label>
                {amount && (
                  <button
                    type="button"
                    onClick={() => setAmount("")}
                    className="text-[11px] font-semibold text-[#438883] hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold">
                  $
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Date Field */}
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

            {/* Description / Note Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Invoice / Note
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Netflix, Starbucks, Uber"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#438883] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-full mono-gradient-primary text-white font-semibold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Expense</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

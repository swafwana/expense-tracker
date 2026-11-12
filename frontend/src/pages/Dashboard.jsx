import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { getCategoryIcon } from "../utils/categoryIcons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [message, setMessage] = useState("");

  // Month state in YYYY-MM
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Time filter for statistics chart (Week, Month, Year)
  const [chartPeriod, setChartPeriod] = useState("Month");

  // Determine greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const loadComparison = useCallback(
    async (categoryId, chosenMonth) => {
      try {
        const response = await fetch(
          `http://localhost:8000/summary/comparison?category_id=${categoryId}${
            chosenMonth ? `&month=${chosenMonth}-01` : ""
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          return await response.json();
        }
      } catch {
        // ignore a single failed comparison; the others can still load
      }
      return null;
    },
    [token]
  );

  const loadAllComparisons = useCallback(
    async (catList, chosenMonth) => {
      if (!catList || catList.length === 0) return;
      const results = [];
      for (const cat of catList) {
        const data = await loadComparison(cat.id, chosenMonth);
        if (data) results.push(data);
      }
      setComparisons(results);
    },
    [loadComparison]
  );

  const loadAllData = useCallback(async () => {
    setMessage(""); // clear any old error before trying again
    try {
      const catRes = await fetch("http://localhost:8000/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let loadedCats = [];
      if (catRes.ok) {
        loadedCats = await catRes.json();
        setCategories(loadedCats);
      }

      const expRes = await fetch("http://localhost:8000/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }

      if (loadedCats.length > 0) {
        await loadAllComparisons(loadedCats, month);
      }
    } catch {
      setMessage("Could not reach the server");
    }
  }, [token, month, loadAllComparisons]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (categories.length > 0) {
      loadAllComparisons(categories, month);
    }
  }, [month, categories, loadAllComparisons]);

  // Listen to global add expense event from modal
  useEffect(() => {
    function handleGlobalExpenseAdded() {
      loadAllData();
    }
    window.addEventListener("mono-expense-added", handleGlobalExpenseAdded);
    return () =>
      window.removeEventListener("mono-expense-added", handleGlobalExpenseAdded);
  }, [loadAllData]);

  // Category helper
  function getCategoryName(id) {
    const found = categories.find((c) => c.id === id);
    return found ? found.name : "General";
  }

  // Expenses for the selected month, newest first
  const monthlyExpenses = useMemo(() => {
    return expenses
      .filter((exp) => exp.date && exp.date.startsWith(month))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, month]);

  const totalSpent = useMemo(() => {
    return monthlyExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  }, [monthlyExpenses]);

  const totalBudget = useMemo(() => {
    return comparisons.reduce(
      (sum, item) => sum + Number(item.budgeted_amount || 0),
      0
    );
  }, [comparisons]);

  const totalBalance = useMemo(() => {
    return totalBudget > 0 ? totalBudget - totalSpent : totalSpent;
  }, [totalBudget, totalSpent]);

  // Only categories that actually have a budget are shown in "Category Budget Health"
  const budgetedComparisons = useMemo(() => {
    return comparisons.filter((item) => Number(item.budgeted_amount || 0) > 0);
  }, [comparisons]);

  // Chart data calculation
  const chartData = useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number);

    if (chartPeriod === "Week") {
      const today = new Date();
      const isCurrentMonth =
        today.getFullYear() === year && today.getMonth() === monthNumber - 1;
      const selectedDate = isCurrentMonth
        ? today
        : new Date(year, monthNumber - 1, 1);
      const startOfWeek = new Date(selectedDate);
      const day = startOfWeek.getDay();

      startOfWeek.setDate(startOfWeek.getDate() - ((day + 6) % 7));

      return Array.from({ length: 7 }, (_, index) => {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + index);

        const dateString = [
          currentDate.getFullYear(),
          String(currentDate.getMonth() + 1).padStart(2, "0"),
          String(currentDate.getDate()).padStart(2, "0"),
        ].join("-");

        const spent = expenses
          .filter((exp) => exp.date === dateString)
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        return {
          name: currentDate.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          spending: spent,
        };
      });
    }

    if (chartPeriod === "Month") {
      const daysInMonth = new Date(year, monthNumber, 0).getDate();

      return Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;

        const dateString = `${month}-${String(day).padStart(2, "0")}`;

        const spent = expenses
          .filter((exp) => exp.date === dateString)
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        return {
          name: String(day),
          spending: spent,
        };
      });
    }

    if (chartPeriod === "Year") {
      return Array.from({ length: 12 }, (_, index) => {
        const currentMonth = String(index + 1).padStart(2, "0");
        const datePrefix = `${year}-${currentMonth}`;

        const spent = expenses
          .filter((exp) => exp.date && exp.date.startsWith(datePrefix))
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        return {
          name: new Date(year, index).toLocaleDateString("en-US", {
            month: "short",
          }),
          spending: spent,
        };
      });
    }

    return [];
  }, [expenses, month, chartPeriod]);

  return (
    <AppLayout onDataRefresh={loadAllData}>
      <div className="space-y-6">
        {/* ================= TOP MOBILE HEADER (Gradient banner matching Screen 3) ================= */}
        <div className="md:hidden -mx-4 -mt-4 mb-2 mono-gradient-header px-6 pt-6 pb-20 text-white rounded-b-3xl relative shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80 font-medium">{greeting},</p>
              <h2 className="text-lg font-bold tracking-tight">
                {user?.name || "there"}
              </h2>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white relative">
              <span className="w-2 h-2 rounded-full bg-amber-300 absolute top-2 right-2" />
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP SUBHEADER & MONTH PICKER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="hidden md:block">
            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              Financial Overview
            </h2>
            <p className="text-xs text-slate-400">
              Summary and spending trends for {month}
            </p>
          </div>

          {/* Month selector pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-full shadow-xs border border-slate-200">
            <Calendar className="w-4 h-4 text-[#2F7E79]" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {message && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* ================= MAIN DASHBOARD GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: BALANCE CARD & STATISTICS (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            {/* TOTAL BALANCE CARD (Screen 3 style) */}
            <div className="relative -mt-16 md:mt-0 mono-gradient-primary rounded-3xl p-6 text-white mono-card-shadow overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border-[20px] border-white/10 pointer-events-none" />
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-[12px] border-white/10 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between text-white/90">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold tracking-wide">
                      {totalBudget > 0 ? "Remaining Budget" : "Total Spent"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 mb-6">
                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    ${" "}
                    {totalBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <ArrowDownCircle className="w-5 h-5 text-emerald-300 stroke-[2]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                        Budgeted
                      </p>
                      <p className="text-sm font-bold text-white">
                        $
                        {totalBudget.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <ArrowUpCircle className="w-5 h-5 text-rose-300 stroke-[2]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
                        Expenses
                      </p>
                      <p className="text-sm font-bold text-white">
                        $
                        {totalSpent.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STATISTICS & TREND CHART CARD (Screen 4 style) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Statistics
                  </h4>
                </div>

                <div className="inline-flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  {["Week", "Month", "Year"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        chartPeriod === period
                          ? "mono-gradient-primary text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                      interval={chartPeriod === "Month" ? 4 : 0}
                    />

                    <YAxis
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                      tickFormatter={(value) => `$${value}`}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Spending",
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        fontSize: "12px",
                      }}
                    />

                    <Bar
                      dataKey="spending"
                      fill="#438883"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Budgets Overview */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category Budget Health
                  </h5>
                  <Link
                    to="/budgets"
                    className="text-xs font-bold text-[#2F7E79] hover:underline"
                  >
                    Manage Budgets
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {budgetedComparisons.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No category budgets set for this month.
                    </p>
                  ) : (
                    budgetedComparisons.slice(0, 4).map((item) => {
                      const categoryName = getCategoryName(item.category_id);
                      const { icon: CatIcon, bg } = getCategoryIcon(categoryName);
                      const spent = Number(item.spent_amount || 0);
                      const budgeted = Number(item.budgeted_amount || 0);
                      const percent = Math.min(
                        100,
                        Math.round((spent / budgeted) * 100)
                      );
                      const isOver =
                        item.remaining !== null &&
                        item.remaining !== undefined &&
                        Number(item.remaining) < 0;

                      return (
                        <div key={item.category_id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}
                              >
                                <CatIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-slate-700">
                                {categoryName}
                              </span>
                            </div>
                            <span className="text-slate-500 text-[11px]">
                              ${spent.toFixed(2)} / ${budgeted.toFixed(2)}
                              {isOver && (
                                <span className="ml-1 text-rose-500 font-bold">
                                  (Over by $
                                  {Math.abs(Number(item.remaining)).toFixed(2)})
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TRANSACTIONS (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            {/* TRANSACTIONS HISTORY (Screen 3 style) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Transactions History
                  </h4>
                  <p className="text-xs text-slate-400">Recent outflows</p>
                </div>
                <Link
                  to="/expenses"
                  className="text-xs font-bold text-[#2F7E79] hover:underline flex items-center gap-1"
                >
                  <span>See all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {monthlyExpenses.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500">
                    No transactions recorded yet
                  </p>
                  <Link
                    to="/expenses"
                    className="inline-block px-4 py-2 rounded-full mono-gradient-primary text-white text-xs font-bold cursor-pointer"
                  >
                    Add First Expense
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {monthlyExpenses.slice(0, 6).map((expense) => {
                    const categoryName = getCategoryName(expense.category_id);
                    const { icon: CatIcon, bg } = getCategoryIcon(categoryName);

                    return (
                      <div
                        key={expense.id}
                        className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 -mx-2 px-2 rounded-2xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-xs`}
                          >
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {expense.description || categoryName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {categoryName} • {expense.date}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-extrabold text-[#F95B51]">
                            - ${Number(expense.amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Plus,
  Wallet,
  User,
  LogOut,
  Layers,
  CreditCard,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AddExpenseModal from "./AddExpenseModal";

export default function AppLayout({ children, onDataRefresh }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "Expenses", path: "/expenses", icon: CreditCard },
    { label: "Budgets", path: "/budgets", icon: Wallet },
    { label: "Categories", path: "/categories", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col md:flex-row text-slate-800">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200/80 p-6 sticky top-0 h-screen z-20 justify-between">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            {/* <div className="w-10 h-10 rounded-2xl mono-gradient-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md tracking-wider"> */}
              
            {/* </div> */}
            <div>
              {/* <span className="text-2xl font-black tracking-tight text-[#2F7E79]">mono</span> */}
              <span className="block text-xl font-black tracking-tight text-[#2F7E79]">
                Expense Tracker
              </span>
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl mono-gradient-primary text-white font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                    isActive
                      ? "bg-[#EEF8F7] text-[#2F7E79] shadow-xs"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#2F7E79]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Card */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 hover:bg-[#EEF8F7]/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full mono-gradient-header text-white flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name ? user.name[0] : "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name || "My Account"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {navItems.find((n) => n.path === location.pathname)?.label || "Overview"}
            </h1>
            <p className="text-xs text-slate-400">Manage your daily transactions and financial goals</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-slate-600">
                Welcome back, {user?.name || "Friend"}
              </p>
              <p className="text-[11px] text-[#438883] font-medium">Personal Finance</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAVIGATION DOCK (Signature Screen Style) ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-1 pointer-events-none">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 px-4 py-2 flex items-center justify-between pointer-events-auto">
          {/* Home */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              location.pathname === "/dashboard"
                ? "text-[#2F7E79]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-semibold mt-0.5">Home</span>
          </Link>

          {/* Expenses */}
          <Link
            to="/expenses"
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              location.pathname === "/expenses"
                ? "text-[#2F7E79]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[9px] font-semibold mt-0.5">Expenses</span>
          </Link>

          {/* Center Floating Elevated Plus Button */}
          <div className="relative -top-5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-13 h-13 rounded-full mono-gradient-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-[#F8FAFA] cursor-pointer"
              aria-label="Add expense"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Budgets */}
          <Link
            to="/budgets"
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              location.pathname === "/budgets"
                ? "text-[#2F7E79]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[9px] font-semibold mt-0.5">Budgets</span>
          </Link>

          {/* Categories */}
          <Link
            to="/categories"
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              location.pathname === "/categories"
                ? "text-[#2F7E79]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-semibold mt-0.5">Profile</span>
          </Link>
        </div>
      </div>

      {/* Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExpenseAdded={() => {
          if (onDataRefresh) {
            onDataRefresh();
          } else {
            window.dispatchEvent(new Event("mono-expense-added"));
          }
        }}
      />
    </div>
  );
}

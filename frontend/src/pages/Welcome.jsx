import React from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFA] flex flex-col justify-between items-center px-4 py-8 md:py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#EEF8F7] to-transparent rounded-full blur-3xl -z-10" />

      {/* Brand Header */}
      <div className="w-full max-w-md flex items-center justify-center gap-2 pt-4">
                <div className="w-9 h-9 rounded-2xl mono-gradient-primary flex items-center justify-center text-white shadow-md">
          <Wallet className="w-5 h-5" />
        </div>
        <span className="text-3xl font-black tracking-tight text-[#2F7E79]">Expense Tracker</span>
      </div>

      {/* Hero Illustration / Graphics matching Screen 2 */}
      <div className="w-full max-w-md flex flex-col items-center justify-center my-auto py-8">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle glow circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#3D8C86]/20 to-[#EEF8F7] animate-pulse" />

          {/* Clean Finance 3D-styled Graphic Elements */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Center Wallet / Card Emblem */}
            <div className="w-36 h-36 rounded-3xl mono-gradient-header flex flex-col items-center justify-center text-white shadow-2xl border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Wallet className="w-16 h-16 stroke-[1.5] text-white/90 drop-shadow-md" />
              
            </div>

            

           
          </div>
        </div>

        {/* Hero Title & Tagline */}
        <div className="text-center mt-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F7E79] tracking-tight leading-tight">
                        Track Your Expenses <br />
            <span className="text-slate-800">Stay On Budget</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Record your expenses, set monthly budgets for each category, and see where your money goes.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4 pb-4">
        <Link
          to="/register"
          className="w-full py-4 rounded-full mono-gradient-primary text-white font-bold text-base shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-center text-sm text-slate-500">
          Already Have Account?{" "}
          <Link
            to="/login"
            className="font-bold text-[#2F7E79] hover:underline cursor-pointer"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

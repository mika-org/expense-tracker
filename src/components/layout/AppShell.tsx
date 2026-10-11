"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AddTransactionModal } from "../transactions/AddTransactionModal";
import {
  Compass,
  Receipt,
  Scan,
  BarChart2,
  User,
  Plus,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  userName?: string;
}

export function AppShell({ children, title, subtitle, onRefresh, userName = "Priscilla" }: AppShellProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F6F5F8] text-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main App Body */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-8">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenAddModal={() => setIsAddOpen(true)}
          userName={userName}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation - EXACT reference bar matching image */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-lg px-6 py-2">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Discover / Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
              pathname === "/" ? "text-[#2D1836]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Compass className="w-5 h-5 stroke-[2.2]" />
            <span>Discover</span>
          </Link>

          {/* Receipts / Transactions */}
          <Link
            href="/transactions"
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
              pathname === "/transactions" ? "text-[#2D1836]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Receipt className="w-5 h-5 stroke-[2.2]" />
            <span>Receipts</span>
          </Link>

          {/* Center Scanner / Quick Add Button (Coral rounded rectangle from reference) */}
          <div className="-mt-6">
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-14 h-14 rounded-2xl bg-[#F27A54] text-white flex items-center justify-center shadow-xl shadow-[#F27A54]/40 hover:scale-105 active:scale-95 transition-all"
            >
              <Scan className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Stats / Reports */}
          <Link
            href="/reports"
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
              pathname === "/reports" ? "text-[#2D1836]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <BarChart2 className="w-5 h-5 stroke-[2.2]" />
            <span>Stats</span>
          </Link>

          {/* Profile / Settings */}
          <Link
            href="/settings"
            className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all ${
              pathname === "/settings" ? "text-[#2D1836]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span>Profile</span>
          </Link>
        </div>
      </nav>

      {/* Universal Quick Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
          window.location.reload();
        }}
      />
    </div>
  );
}

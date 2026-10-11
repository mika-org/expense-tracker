"use client";

import { Search, Plus, Sparkles } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAddModal: () => void;
  userName?: string;
}

export function Header({ title, subtitle, onOpenAddModal, userName = "Priscilla" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#F6F5F8]/90 backdrop-blur-md border-b border-slate-200/60">
      <div>
        <div className="text-xs font-medium text-slate-500">Hello,</div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {userName}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Circular Search Button from Reference Image */}
        <button
          title="Pencarian"
          onClick={() => {
            const searchInput = document.getElementById("search-input");
            if (searchInput) searchInput.focus();
          }}
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 text-slate-700 flex items-center justify-center shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Search className="w-4 h-4 text-slate-600" />
        </button>

        {/* Coral Accent Quick Add Button from Reference Image */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#F27A54]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Tambah Transaksi</span>
        </button>
      </div>
    </header>
  );
}

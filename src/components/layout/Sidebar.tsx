"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Receipt,
  PieChart,
  Tags,
  Wallet,
  PiggyBank,
  HandCoins,
  BarChart3,
  Settings,
  LogOut,
  Layers,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

const navItems = [
  { name: "Discover", href: "/", icon: Compass },
  { name: "Receipts", href: "/transactions", icon: Receipt },
  { name: "Anggaran", href: "/budgets", icon: PieChart },
  { name: "Kategori", href: "/categories", icon: Tags },
  { name: "Akun & Dompet", href: "/accounts", icon: Wallet },
  { name: "Tabungan", href: "/savings", icon: PiggyBank },
  { name: "Utang & Piutang", href: "/debts", icon: HandCoins },
  { name: "Stats & Laporan", href: "/reports", icon: BarChart3 },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 text-slate-700 min-h-screen p-5 select-none shrink-0 shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-[#2D1836] flex items-center justify-center shadow-md shadow-[#2D1836]/20 text-white font-bold">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black text-slate-900 tracking-tight">EXPENSE TRACKER</h1>
          <p className="text-[11px] text-slate-400 font-medium">Fintech Personal</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#2D1836] text-white shadow-md shadow-[#2D1836]/15"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#F27A54]" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User & Logout */}
      <div className="pt-4 mt-auto border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] text-slate-400">
          <span>Mode: Priscilla (Demo)</span>
          <span className="w-2 h-2 rounded-full bg-[#F27A54] animate-pulse"></span>
        </div>
        <button
          onClick={async () => {
            await logoutAction();
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}

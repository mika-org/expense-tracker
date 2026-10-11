"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/categories";
import { Plus, Trash2, Edit2, X, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [submitting, setSubmitting] = useState(false);

  function loadCategories() {
    setLoading(true);
    getCategoriesAction().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setName("");
    setColor("#3B82F6");
    setIsModalOpen(true);
  }

  function openEditModal(cat: any) {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color || "#3B82F6");
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    if (editingId) {
      await updateCategoryAction({
        id: editingId,
        name,
        type: tab,
        color,
      });
    } else {
      await createCategoryAction({
        name,
        type: tab,
        color,
      });
    }
    setName("");
    setEditingId(null);
    setIsModalOpen(false);
    setSubmitting(false);
    loadCategories();
  }

  async function handleDelete(id: string) {
    if (confirm("Hapus atau arsipkan kategori ini?")) {
      await deleteCategoryAction(id);
      loadCategories();
    }
  }

  const filteredCategories = categories.filter((c) => c.type === tab);

  return (
    <AppShell
      title="Kategori Transaksi"
      subtitle="Klasifikasikan pos pemasukan dan pengeluaran Anda"
      onRefresh={loadCategories}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button
            onClick={() => setTab("expense")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "expense"
                ? "bg-[#2D1836] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Pengeluaran ({categories.filter((c) => c.type === "expense").length})
          </button>
          <button
            onClick={() => setTab("income")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "income"
                ? "bg-[#2D1836] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Pemasukan ({categories.filter((c) => c.type === "income").length})
          </button>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Tambah Kategori
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-slate-200/80 rounded-[28px] p-5 shadow-sm hover:border-slate-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-4 h-4 rounded-full ring-4 ring-slate-100"
                style={{ backgroundColor: cat.color || "#3B82F6" }}
              ></div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{cat.name}</h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {cat.isDefault ? "Default Sistem" : "Kustom Pengguna"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(cat)}
                title="Ubah Kategori"
                className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {!cat.isDefault && (
                <button
                  onClick={() => handleDelete(cat.id)}
                  title="Hapus Kategori"
                  className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-[32px] p-6 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900">
                {editingId
                  ? `Ubah Kategori ${tab === "income" ? "Pemasukan" : "Pengeluaran"}`
                  : `Tambah Kategori ${tab === "income" ? "Pemasukan" : "Pengeluaran"}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Langganan SaaS, Hewan Peliharaan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Warna Aksen</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-500 font-semibold">{color}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#F27A54] hover:bg-[#e06b46] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#F27A54]/25"
                >
                  {submitting
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

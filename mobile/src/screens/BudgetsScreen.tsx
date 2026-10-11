import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calculator,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { FadeInView, ScalePress, AnimatedProgressBar } from "../components/AnimatedComponents";

interface BudgetsScreenProps {
  onBack: () => void;
}

interface BudgetItem {
  id?: string;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  name?: string;
  limit: number;
  spent: number;
  amountType?: "percentage" | "fixed" | string;
  amountValue?: number;
  percentage?: number;
  pct?: number;
  status: "safe" | "warning" | "exceeded" | string;
}

interface BudgetData {
  id: string;
  name: string;
  incomeBasis: number;
  totalLimit: number;
  totalSpent: number;
  overallRemaining: number;
  overallPercentage: number;
  overallStatus: string;
  items: BudgetItem[];
}

export const BudgetsScreen = ({ onBack }: BudgetsScreenProps) => {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Simulation states
  const [incomeBasis, setIncomeBasis] = useState<number>(10000000);
  const [simPreset, setSimPreset] = useState<"standard" | "focus" | "conservative">("standard");
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);

  const [savingBudget, setSavingBudget] = useState(false);

  // CRUD Item states
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [amountType, setAmountType] = useState<"fixed" | "percentage">("fixed");
  const [amountValue, setAmountValue] = useState("");
  const [submittingItem, setSubmittingItem] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      if (Array.isArray(data)) {
        const expenseOnly = data.filter((c: any) => c.type === "expense");
        setCategories(expenseOnly);
        if (expenseOnly.length > 0 && !selectedCatId) {
          setSelectedCatId(expenseOnly[0].id);
        }
      }
    } catch (e) {
      console.warn("Failed to load categories for budget", e);
    }
  };

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const data = await api.getBudgets();
      if (data) {
        setBudget(data);
        if (data.incomeBasis && data.incomeBasis > 0) {
          setIncomeBasis(data.incomeBasis);
        }
      } else {
        setBudget(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBudget = async () => {
    setSavingBudget(true);
    try {
      const cats = await api.getCategories();
      const expenseCats = Array.isArray(cats)
        ? cats.filter((c: any) => c.type === "expense")
        : [];

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const items = expenseCats.slice(0, 6).map((c: any, idx: number) => {
        const pct = idx === 0 ? 30 : idx === 1 ? 25 : idx === 2 ? 20 : 15;
        const val = Math.round((incomeBasis * pct) / 100);
        return {
          categoryId: c.id,
          amountType: "fixed" as const,
          amountValue: val,
        };
      });

      if (items.length === 0) {
        Alert.alert("Perhatian", "Tidak ada kategori pengeluaran ditemukan.");
        return;
      }

      const res = await api.saveBudget({
        name: `Anggaran ${now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`,
        startDate: startOfMonth,
        endDate: endOfMonth,
        allocationMethod: "hybrid",
        incomeBasis,
        items,
      });

      if (res.success === false) {
        Alert.alert("Gagal", res.error || "Gagal menerapkan anggaran");
        return;
      }

      Alert.alert("Sukses", "Simulasi berhasil diterapkan sebagai anggaran aktif!");
      fetchBudget();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Gagal menyimpan anggaran");
    } finally {
      setSavingBudget(false);
    }
  };

  useEffect(() => {
    fetchBudget();
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    if (categories.length > 0) {
      setSelectedCatId(categories[0].id);
    }
    setAmountType("fixed");
    setAmountValue("");
    setItemModalVisible(true);
  };

  const handleOpenEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setSelectedCatId(item.categoryId || "");
    setAmountType((item.amountType as any) === "percentage" ? "percentage" : "fixed");
    setAmountValue(String(item.amountValue ?? item.limit ?? ""));
    setItemModalVisible(true);
  };

  const handleSaveBudgetItem = async () => {
    if (!selectedCatId) {
      Alert.alert("Perhatian", "Pilih kategori pengeluaran terlebih dahulu.");
      return;
    }
    const cleanStr = amountValue.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleanStr);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Perhatian", "Masukkan nominal atau persentase batas anggaran yang valid.");
      return;
    }

    setSubmittingItem(true);
    try {
      if (editingItem?.id) {
        const res = await api.updateBudgetItem({
          id: editingItem.id,
          categoryId: selectedCatId,
          amountType,
          amountValue: num,
        });
        if (res.success === false) {
          Alert.alert("Gagal", res.error || "Gagal memperbarui pos anggaran");
          return;
        }
        Alert.alert("Sukses", "Pos anggaran berhasil diperbarui.");
      } else {
        const res = await api.addBudgetItem({
          budgetId: budget?.id,
          categoryId: selectedCatId,
          amountType,
          amountValue: num,
        });
        if (res.success === false) {
          Alert.alert("Gagal", res.error || "Gagal menambahkan pos anggaran");
          return;
        }
        Alert.alert("Sukses", "Pos anggaran baru berhasil ditambahkan.");
      }
      setItemModalVisible(false);
      fetchBudget();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Gagal memproses pos anggaran");
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleDeleteBudgetItem = (item: BudgetItem) => {
    if (!item.id) return;
    const catName = item.categoryName || item.name || "Kategori";
    Alert.alert(
      "Hapus Pos Realisasi",
      `Apakah Anda yakin ingin menghapus pos anggaran "${catName}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteBudgetItem(item.id!);
              if (res.success === false) {
                Alert.alert("Gagal", res.error || "Gagal menghapus pos anggaran");
                return;
              }
              Alert.alert("Sukses", "Pos anggaran berhasil dihapus.");
              fetchBudget();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Gagal menghapus");
            }
          },
        },
      ]
    );
  };

  const handleSelectPreset = (preset: "standard" | "focus" | "conservative") => {
    setSimPreset(preset);
    if (preset === "standard") {
      setNeedsPct(50);
      setWantsPct(30);
      setSavingsPct(20);
    } else if (preset === "focus") {
      setNeedsPct(60);
      setWantsPct(20);
      setSavingsPct(20);
    } else {
      setNeedsPct(70);
      setWantsPct(20);
      setSavingsPct(10);
    }
  };

  const needsAmount = Math.round((incomeBasis * needsPct) / 100);
  const wantsAmount = Math.round((incomeBasis * wantsPct) / 100);
  const savingsAmount = Math.round((incomeBasis * savingsPct) / 100);

  const budgetItems = budget?.items || [];
  const totalLimit = budget?.totalLimit || 0;
  const totalSpent = budget?.totalSpent || 0;
  const overallRemaining = budget?.overallRemaining || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <ScalePress onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </ScalePress>
        <Text style={styles.headerTitle}>Anggaran (Budgets)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchBudget}
            colors={[colors.coral]}
            tintColor={colors.coral}
          />
        }
      >
        {/* Hero Budget Card */}
        <FadeInView delay={0}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroSubtitle}>Alokasi Bulan Ini</Text>
                <Text style={styles.heroTitle}>{budget ? budget.name : "Belum Ada Anggaran Aktif"}</Text>
              </View>
              <View style={styles.iconCircle}>
                <PieChart size={20} color={colors.coral} />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Batas Anggaran</Text>
                <Text style={styles.statValue}>Rp {totalLimit.toLocaleString("id-ID")}</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Terpakai</Text>
                <Text style={[styles.statValue, { color: colors.coral }]}>
                  Rp {totalSpent.toLocaleString("id-ID")}
                </Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Sisa</Text>
                <Text style={[styles.statValue, { color: colors.incomeGreen }]}>
                  Rp {overallRemaining.toLocaleString("id-ID")}
                </Text>
              </View>
            </View>
          </View>
        </FadeInView>

        {/* Categories Progress Breakdown */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Realisasi Kategori</Text>
          <TouchableOpacity
            style={styles.addPosBtn}
            onPress={handleOpenAddModal}
            activeOpacity={0.8}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.addPosBtnText}>Tambah Pos</Text>
          </TouchableOpacity>
        </View>

        {budgetItems.length === 0 ? (
          <FadeInView delay={100}>
            <View style={styles.emptyCard}>
              <PieChart size={32} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum Ada Kategori Anggaran</Text>
              <Text style={styles.emptySubtitle}>
                Belum ada target anggaran bulanan yang dibuat di database. Tambahkan pos anggaran atau terapkan simulasi alokasi.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={handleOpenAddModal}
                activeOpacity={0.8}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.emptyActionBtnText}>Tambah Pos Sekarang</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        ) : (
          <View style={styles.itemsList}>
            {budgetItems.map((item, idx) => {
              const name = item.categoryName || item.name || "Kategori";
              const pct = item.percentage ?? item.pct ?? 0;
              const isExceeded = item.status === "exceeded" || pct >= 100;
              const isWarning = item.status === "warning" || (pct >= 80 && pct < 100);

              return (
                <FadeInView key={item.id || idx} delay={idx * 40}>
                  <View style={styles.budgetItemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemTitleGroup}>
                        {item.categoryColor ? (
                          <View
                            style={[
                              styles.categoryDot,
                              { backgroundColor: item.categoryColor },
                            ]}
                          />
                        ) : null}
                        <Text style={styles.itemName} numberOfLines={1}>
                          {name}
                        </Text>
                      </View>

                      <View style={styles.itemActionsGroup}>
                        {isExceeded ? (
                          <View style={[styles.badge, { backgroundColor: "#FFF0F2" }]}>
                            <XCircle size={11} color="#EF4444" />
                            <Text style={[styles.badgeText, { color: "#EF4444" }]}>Melewati</Text>
                          </View>
                        ) : isWarning ? (
                          <View style={[styles.badge, { backgroundColor: "#FFF7EB" }]}>
                            <AlertTriangle size={11} color="#F59E0B" />
                            <Text style={[styles.badgeText, { color: "#F59E0B" }]}>Mendekati</Text>
                          </View>
                        ) : (
                          <View style={[styles.badge, { backgroundColor: "#ECFDF5" }]}>
                            <CheckCircle2 size={11} color="#10B981" />
                            <Text style={[styles.badgeText, { color: "#10B981" }]}>Aman</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => handleOpenEditModal(item)}
                          activeOpacity={0.7}
                        >
                          <Edit2 size={13} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionIconBtn, { backgroundColor: "#FEE2E2" }]}
                          onPress={() => handleDeleteBudgetItem(item)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={13} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.progressTrack}>
                      <AnimatedProgressBar
                        percentage={pct}
                        height={8}
                        color={isExceeded ? "#EF4444" : isWarning ? colors.coral : colors.plum}
                        backgroundColor="#EFEBF5"
                        borderRadius={4}
                      />
                    </View>

                    <View style={styles.itemFooter}>
                      <Text style={styles.footerSpent}>
                        Rp {item.spent.toLocaleString("id-ID")}{" "}
                        <Text style={styles.footerLimit}>/ Rp {item.limit.toLocaleString("id-ID")}</Text>
                      </Text>
                      <Text style={styles.footerPct}>{pct}%</Text>
                    </View>
                  </View>
                </FadeInView>
              );
            })}
          </View>
        )}

        {/* Dynamic What-If Simulation Box */}
        <View style={styles.simulationCard}>
          <View style={styles.simHeaderRow}>
            <View>
              <Text style={styles.simTitle}>Simulasi Finansial (What-If)</Text>
              <Text style={styles.simSubtitle}>Uji coba skenario alokasi pendapatan bulanan Anda</Text>
            </View>
            <Calculator size={22} color={colors.plum} />
          </View>

          {/* Basis Pendapatan Bulanan */}
          <Text style={styles.simInputLabel}>Basis Penghasilan Bulanan (Rp)</Text>
          <View style={styles.incomeInputContainer}>
            <Text style={styles.incomePrefix}>Rp</Text>
            <TextInput
              style={styles.incomeTextInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={incomeBasis > 0 ? incomeBasis.toString() : ""}
              onChangeText={(val) => {
                const clean = val.replace(/[^0-9]/g, "");
                setIncomeBasis(clean ? parseInt(clean, 10) : 0);
              }}
            />
          </View>

          <View style={styles.incomePresetRow}>
            {[5000000, 10000000, 15000000, 25000000].map((amt) => {
              const active = incomeBasis === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  style={[styles.incomeChip, active ? styles.incomeChipActive : null]}
                  onPress={() => setIncomeBasis(amt)}
                >
                  <Text style={[styles.incomeChipText, active ? styles.incomeChipTextActive : null]}>
                    Rp {(amt / 1000000)} Jt
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Preset Strategi Rasio */}
          <Text style={styles.simInputLabel}>Model Strategi Alokasi</Text>
          <View style={styles.presetToggleRow}>
            <ScalePress
              style={[styles.presetBtn, simPreset === "standard" ? styles.presetBtnActive : null]}
              onPress={() => handleSelectPreset("standard")}
            >
              <Text style={[styles.presetText, simPreset === "standard" ? styles.presetTextActive : null]}>
                50/30/20 Seimbang
              </Text>
            </ScalePress>
            <ScalePress
              style={[styles.presetBtn, simPreset === "focus" ? styles.presetBtnActive : null]}
              onPress={() => handleSelectPreset("focus")}
            >
              <Text style={[styles.presetText, simPreset === "focus" ? styles.presetTextActive : null]}>
                60/20/20 Pokok
              </Text>
            </ScalePress>
            <ScalePress
              style={[styles.presetBtn, simPreset === "conservative" ? styles.presetBtnActive : null]}
              onPress={() => handleSelectPreset("conservative")}
            >
              <Text style={[styles.presetText, simPreset === "conservative" ? styles.presetTextActive : null]}>
                70/20/10 Hemat
              </Text>
            </ScalePress>
          </View>

          {/* Calculated Output Pillars */}
          <View style={styles.simPillsRow}>
            <View style={styles.simBox}>
              <Text style={styles.simBoxTitle}>Kebutuhan Pokok</Text>
              <Text style={styles.simBoxValue}>{needsPct}%</Text>
              <Text style={styles.simBoxNominal}>Rp {needsAmount.toLocaleString("id-ID")}</Text>
              <Text style={styles.simBoxNote}>Sewa, Makan, Utilitas</Text>
            </View>

            <View style={[styles.simBox, { backgroundColor: "#FFF7ED" }]}>
              <Text style={[styles.simBoxTitle, { color: colors.coral }]}>Keinginan & Gaya</Text>
              <Text style={[styles.simBoxValue, { color: colors.coral }]}>{wantsPct}%</Text>
              <Text style={[styles.simBoxNominal, { color: colors.coral }]}>
                Rp {wantsAmount.toLocaleString("id-ID")}
              </Text>
              <Text style={styles.simBoxNote}>Hiburan, Belanja</Text>
            </View>

            <View style={[styles.simBox, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[styles.simBoxTitle, { color: colors.incomeGreen }]}>Tabungan & Masa Depan</Text>
              <Text style={[styles.simBoxValue, { color: colors.incomeGreen }]}>{savingsPct}%</Text>
              <Text style={[styles.simBoxNominal, { color: colors.incomeGreen }]}>
                Rp {savingsAmount.toLocaleString("id-ID")}
              </Text>
              <Text style={styles.simBoxNote}>Dana Darurat, Investasi</Text>
            </View>
          </View>

          <View style={styles.simInsightBox}>
            <Sparkles size={16} color={colors.plum} />
            <Text style={styles.simInsightText}>
              Dengan penghasilan Rp {incomeBasis.toLocaleString("id-ID")}, alokasi aman belanja keinginan Anda adalah maksimal{" "}
              <Text style={{ fontWeight: "800", color: colors.coral }}>
                Rp {wantsAmount.toLocaleString("id-ID")}
              </Text>{" "}
              per bulan.
            </Text>
          </View>

          <ScalePress
            style={[styles.applyBudgetBtn, savingBudget ? { opacity: 0.7 } : null]}
            onPress={handleApplyBudget}
            disabled={savingBudget}
          >
            {savingBudget ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.applyBudgetBtnText}>Terapkan Simulasi Ini Sebagai Anggaran</Text>
            )}
          </ScalePress>
        </View>
      </ScrollView>

      {/* Add / Edit Pos Realisasi Modal */}
      <Modal
        visible={itemModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setItemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingItem ? "Edit Pos Realisasi" : "Tambah Pos Realisasi"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Tentukan target batas anggaran per kategori belanja
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setItemModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Kategori Pengeluaran */}
              <Text style={styles.inputLabel}>Pilih Kategori Pengeluaran</Text>
              {categories.length === 0 ? (
                <Text style={styles.emptyCatText}>
                  Memuat kategori pengeluaran...
                </Text>
              ) : (
                <View style={styles.categoryPickerList}>
                  {categories.map((cat) => {
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipSelected,
                        ]}
                        onPress={() => setSelectedCatId(cat.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.catDot,
                            { backgroundColor: cat.color || colors.plum },
                          ]}
                        />
                        <Text
                          style={[
                            styles.catChipText,
                            isSelected && styles.catChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Tipe Batas */}
              <Text style={styles.inputLabel}>Metode Batas Anggaran</Text>
              <View style={styles.amountTypeRow}>
                <TouchableOpacity
                  style={[
                    styles.amountTypeBtn,
                    amountType === "fixed" && styles.amountTypeBtnActive,
                  ]}
                  onPress={() => setAmountType("fixed")}
                >
                  <Text
                    style={[
                      styles.amountTypeText,
                      amountType === "fixed" && styles.amountTypeTextActive,
                    ]}
                  >
                    Nominal Tetap (Rp)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.amountTypeBtn,
                    amountType === "percentage" && styles.amountTypeBtnActive,
                  ]}
                  onPress={() => setAmountType("percentage")}
                >
                  <Text
                    style={[
                      styles.amountTypeText,
                      amountType === "percentage" && styles.amountTypeTextActive,
                    ]}
                  >
                    Persentase (%)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Nilai Input */}
              <Text style={styles.inputLabel}>
                {amountType === "fixed"
                  ? "Batas Anggaran Bulanan (Rp)"
                  : "Persentase Alokasi Dari Pemasukan (%)"}
              </Text>
              <View style={styles.modalInputWrap}>
                <Text style={styles.modalInputPrefix}>
                  {amountType === "fixed" ? "Rp" : "%"}
                </Text>
                <TextInput
                  style={styles.modalTextInput}
                  keyboardType="numeric"
                  placeholder={amountType === "fixed" ? "1000000" : "20"}
                  placeholderTextColor={colors.textMuted}
                  value={amountValue}
                  onChangeText={setAmountValue}
                />
              </View>

              {amountType === "percentage" && incomeBasis > 0 && amountValue ? (
                <Text style={styles.modalEstimatedText}>
                  Estimasi batas: Rp{" "}
                  {(
                    Math.round(
                      (incomeBasis * (parseFloat(amountValue) || 0)) / 100
                    )
                  ).toLocaleString("id-ID")}{" "}
                  (berdasarkan basis pemasukan Rp {incomeBasis.toLocaleString("id-ID")})
                </Text>
              ) : null}

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setItemModalVisible(false)}
                >
                  <Text style={styles.cancelModalBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveModalBtn,
                    submittingItem && { opacity: 0.6 },
                  ]}
                  onPress={handleSaveBudgetItem}
                  disabled={submittingItem}
                >
                  {submittingItem ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveModalBtnText}>
                      {editingItem ? "Perbarui" : "Tambahkan"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF4",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  content: { padding: 20, paddingBottom: 40 },
  heroCard: {
    backgroundColor: colors.plum,
    borderRadius: 30,
    padding: 24,
    marginBottom: 24,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroSubtitle: { fontSize: 12, color: "#C5B6CF", fontWeight: "600" },
  heroTitle: { fontSize: 20, fontWeight: "900", color: "#FFFFFF", marginTop: 2 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  statLabel: { fontSize: 11, color: "#A797B3", fontWeight: "500" },
  statValue: { fontSize: 15, fontWeight: "800", color: "#FFFFFF", marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  itemsList: { gap: 12, marginBottom: 24 },
  budgetItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  progressTrack: {
    height: 8,
    backgroundColor: colors.slateLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: { height: "100%", borderRadius: 4 },
  itemFooter: { flexDirection: "row", justifyContent: "space-between" },
  footerSpent: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  footerLimit: { color: colors.textMuted, fontWeight: "500" },
  footerPct: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  simulationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  simHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  simTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  simSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  simInputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 6,
  },
  incomeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slateLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  incomePrefix: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.plum,
    marginRight: 6,
  },
  incomeTextInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  incomePresetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  incomeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.slateLight,
    alignItems: "center",
  },
  incomeChipActive: {
    backgroundColor: colors.plum,
  },
  incomeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  incomeChipTextActive: {
    color: "#FFFFFF",
  },
  presetToggleRow: {
    flexDirection: "row",
    backgroundColor: colors.slateLight,
    borderRadius: 16,
    padding: 3,
    marginBottom: 18,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 13,
  },
  presetBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  presetText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
  },
  presetTextActive: {
    color: colors.plum,
  },
  simPillsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  simBox: {
    flex: 1,
    backgroundColor: "#F8F7FA",
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
  },
  simBoxTitle: { fontSize: 10, color: colors.textSecondary, fontWeight: "700", textAlign: "center" },
  simBoxValue: { fontSize: 16, fontWeight: "900", color: colors.textPrimary, marginTop: 4 },
  simBoxNominal: { fontSize: 11, fontWeight: "800", color: colors.textPrimary, marginTop: 2, textAlign: "center" },
  simBoxNote: { fontSize: 9, color: colors.textMuted, marginTop: 4, textAlign: "center" },
  simInsightBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F3F8",
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  simInsightText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  applyBudgetBtn: {
    backgroundColor: colors.plum,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  applyBudgetBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addPosBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.plum,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addPosBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.plum,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 14,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  itemTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemActionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  emptyCatText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
    marginBottom: 10,
  },
  categoryPickerList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: colors.slateLight,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipSelected: {
    backgroundColor: "#F3E8FF",
    borderColor: colors.plum,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  catChipTextSelected: {
    color: colors.plum,
    fontWeight: "800",
  },
  amountTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  amountTypeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  amountTypeBtnActive: {
    backgroundColor: "#F3E8FF",
    borderColor: colors.plum,
  },
  amountTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  amountTypeTextActive: {
    color: colors.plum,
    fontWeight: "800",
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slateLight,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 6,
  },
  modalInputPrefix: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.plum,
    marginRight: 6,
  },
  modalTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modalEstimatedText: {
    fontSize: 11,
    color: colors.coral,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 2,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 6,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.slateLight,
    alignItems: "center",
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  saveModalBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.plum,
    alignItems: "center",
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});

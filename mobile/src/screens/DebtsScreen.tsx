import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Landmark,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { FadeInView, ScalePress } from "../components/AnimatedComponents";

interface DebtsScreenProps {
  onBack: () => void;
}

interface DebtItem {
  id: string;
  type: "debt" | "receivable";
  counterparty: string;
  initialAmount: number;
  remainingAmount: number;
  startDate: string;
  dueDate?: string | null;
  status: string;
  note?: string | null;
}

export const DebtsScreen = ({ onBack }: DebtsScreenProps) => {
  const [filter, setFilter] = useState<"all" | "debt" | "receivable">("all");
  const [debtList, setDebtList] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [formType, setFormType] = useState<"debt" | "receivable">("debt");
  const [formCounterparty, setFormCounterparty] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formNote, setFormNote] = useState("");

  // Pay Modal
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [activeDebt, setActiveDebt] = useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const data = await api.getDebts();
      if (Array.isArray(data)) {
        setDebtList(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleCreateDebt = async () => {
    if (!formCounterparty.trim()) {
      Alert.alert("Perhatian", "Nama pihak (debitur/kreditur) wajib diisi.");
      return;
    }
    const amount = parseFloat(formAmount.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) {
      Alert.alert("Perhatian", "Nominal harus lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.createDebt({
        type: formType,
        counterparty: formCounterparty.trim(),
        initialAmount: amount,
        dueDate: formDueDate.trim() || undefined,
        note: formNote.trim() || undefined,
      });

      if (res.success === false) {
        Alert.alert("Gagal", res.error || "Gagal mencatat utang/piutang");
        return;
      }

      setCreateModalVisible(false);
      setFormCounterparty("");
      setFormAmount("");
      setFormDueDate("");
      setFormNote("");
      fetchDebts();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Gagal mencatat utang/piutang");
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async () => {
    if (!activeDebt) return;
    const amount = parseFloat(payAmount.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) {
      Alert.alert("Perhatian", "Nominal pembayaran harus lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.payDebt({
        debtId: activeDebt.id,
        amount,
        note: payNote.trim() || "Pembayaran angsuran",
      });

      if (res.success === false) {
        Alert.alert("Gagal", res.error || "Gagal mencatat pembayaran");
        return;
      }

      setPayModalVisible(false);
      setPayAmount("");
      setPayNote("");
      setActiveDebt(null);
      fetchDebts();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Gagal mencatat pembayaran");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDebt = (item: DebtItem) => {
    Alert.alert(
      "Hapus Catatan",
      `Apakah Anda yakin ingin menghapus catatan dengan "${item.counterparty}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteDebt(item.id);
              if (res.success === false) {
                Alert.alert("Gagal", res.error || "Gagal menghapus catatan");
                return;
              }
              fetchDebts();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Gagal menghapus catatan");
            }
          },
        },
      ]
    );
  };

  const filtered = debtList.filter((d) => {
    if (filter === "all") return true;
    return d.type === filter;
  });

  const totalDebt = debtList
    .filter((d) => d.type === "debt" && d.status !== "paid")
    .reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);

  const totalReceivable = debtList
    .filter((d) => d.type === "receivable" && d.status !== "paid")
    .reduce((acc, curr) => acc + (curr.remainingAmount || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <ScalePress onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </ScalePress>
        <Text style={styles.headerTitle}>Utang & Piutang</Text>
        <ScalePress
          onPress={() => setCreateModalVisible(true)}
          style={styles.headerAddBtn}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={3} />
        </ScalePress>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchDebts}
            colors={[colors.coral]}
            tintColor={colors.coral}
          />
        }
      >
        {/* Metric Summary Grid */}
        <FadeInView delay={0}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, { backgroundColor: "#FFF1F2" }]}>
              <Text style={[styles.summaryLabel, { color: "#E11D48" }]}>Utang (Kewajiban)</Text>
              <Text style={[styles.summaryValue, { color: "#BE123C" }]}>
                Rp {totalDebt.toLocaleString("id-ID")}
              </Text>
            </View>
            <View style={[styles.summaryBox, { backgroundColor: "#ECFDF5" }]}>
              <Text style={[styles.summaryLabel, { color: "#059669" }]}>Piutang (Hak Tagih)</Text>
              <Text style={[styles.summaryValue, { color: "#047857" }]}>
                Rp {totalReceivable.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>
        </FadeInView>

        {/* Toggle Filters & Add Button */}
        <View style={styles.filterRow}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <ScalePress
              style={[styles.filterBtn, filter === "all" ? styles.filterBtnActive : null]}
              onPress={() => setFilter("all")}
            >
              <Text style={[styles.filterText, filter === "all" ? styles.filterTextActive : null]}>Semua</Text>
            </ScalePress>
            <ScalePress
              style={[styles.filterBtn, filter === "debt" ? styles.filterBtnActive : null]}
              onPress={() => setFilter("debt")}
            >
              <Text style={[styles.filterText, filter === "debt" ? styles.filterTextActive : null]}>Utang Saya</Text>
            </ScalePress>
            <ScalePress
              style={[styles.filterBtn, filter === "receivable" ? styles.filterBtnActive : null]}
              onPress={() => setFilter("receivable")}
            >
              <Text style={[styles.filterText, filter === "receivable" ? styles.filterTextActive : null]}>Piutang</Text>
            </ScalePress>
          </View>

          <ScalePress
            style={styles.addSmallBtn}
            onPress={() => setCreateModalVisible(true)}
          >
            <Plus size={14} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.addSmallText}>Catat</Text>
          </ScalePress>
        </View>

        {filtered.length === 0 && !loading ? (
          <FadeInView delay={100}>
            <View style={styles.emptyCard}>
              <Landmark size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum Ada Catatan Utang / Piutang</Text>
              <Text style={styles.emptySubtitle}>
                Catat pinjaman atau tagihan kepada rekan untuk memantau arus kewajiban finansial Anda secara tertib.
              </Text>
            </View>
          </FadeInView>
        ) : (
          <View style={styles.list}>
            {filtered.map((item, idx) => {
              const isDebt = item.type === "debt";
              const isPaid = item.status === "paid" || item.remainingAmount <= 0;
              const formattedDue = item.dueDate
                ? new Date(item.dueDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Tanpa Jatuh Tempo";

              return (
                <FadeInView key={`${item.id || idx}`} delay={idx * 50}>
                  <View style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={[styles.typeBadge, { backgroundColor: isDebt ? "#FFF1F2" : "#ECFDF5" }]}>
                        {isDebt ? <ArrowDownRight size={14} color="#EF4444" /> : <ArrowUpRight size={14} color="#10B981" />}
                        <Text style={[styles.typeText, { color: isDebt ? "#EF4444" : "#10B981" }]}>
                          {isDebt ? "Utang (Kewajiban)" : "Piutang (Hak Tagih)"}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {isPaid ? (
                          <View style={styles.statusBadge}>
                            <CheckCircle2 size={12} color="#10B981" />
                            <Text style={[styles.statusText, { color: "#10B981" }]}>Lunas</Text>
                          </View>
                        ) : (
                          <View style={styles.statusBadge}>
                            <Clock size={12} color="#F59E0B" />
                            <Text style={[styles.statusText, { color: "#F59E0B" }]}>Aktif</Text>
                          </View>
                        )}
                        <ScalePress
                          onPress={() => handleDeleteDebt(item)}
                          style={styles.deleteBtn}
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </ScalePress>
                      </View>
                    </View>

                    <Text style={styles.personName}>{item.counterparty}</Text>
                    {item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
                    <Text style={styles.dueDate}>Jatuh Tempo: {formattedDue}</Text>

                    <View style={styles.amountsRow}>
                      <View>
                        <Text style={styles.amtLabel}>Sisa Nominal</Text>
                        <Text style={[styles.amtRemaining, { color: isDebt ? "#EF4444" : "#10B981" }]}>
                          Rp {item.remainingAmount.toLocaleString("id-ID")}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.amtLabel}>Total Awal</Text>
                        <Text style={styles.amtInitial}>Rp {item.initialAmount.toLocaleString("id-ID")}</Text>
                      </View>
                    </View>

                    {!isPaid && (
                      <ScalePress
                        style={styles.payBtn}
                        onPress={() => {
                          setActiveDebt(item);
                          setPayAmount(item.remainingAmount.toString());
                          setPayNote("");
                          setPayModalVisible(true);
                        }}
                      >
                        <Text style={styles.payBtnText}>
                          {isDebt ? "Bayar Angsuran / Lunasi" : "Terima Pembayaran / Lunasi"}
                        </Text>
                      </ScalePress>
                    )}
                  </View>
                </FadeInView>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal Catat Utang/Piutang */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Catat Utang / Piutang</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Selector Tipe */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Jenis Pencatatan</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[styles.typeChip, formType === "debt" ? styles.typeChipActiveDebt : null]}
                  onPress={() => setFormType("debt")}
                >
                  <Text style={[styles.typeChipText, formType === "debt" ? { color: "#FFFFFF" } : null]}>
                    Utang (Kewajiban Saya)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeChip, formType === "receivable" ? styles.typeChipActiveReceivable : null]}
                  onPress={() => setFormType("receivable")}
                >
                  <Text style={[styles.typeChipText, formType === "receivable" ? { color: "#FFFFFF" } : null]}>
                    Piutang (Hak Tagih Saya)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {formType === "debt" ? "Pemberi Pinjaman (Kreditur)" : "Peminjam (Debitur)"}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Budi Santoso, Bank Mandiri"
                placeholderTextColor={colors.textMuted}
                value={formCounterparty}
                onChangeText={setFormCounterparty}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nominal (Rp)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formAmount}
                onChangeText={setFormAmount}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Jatuh Tempo (Opsional: YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2026-12-31"
                placeholderTextColor={colors.textMuted}
                value={formDueDate}
                onChangeText={setFormDueDate}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Pinjaman modal usaha"
                placeholderTextColor={colors.textMuted}
                value={formNote}
                onChangeText={setFormNote}
              />
            </View>

            <ScalePress
              style={[styles.saveBtn, saving ? { opacity: 0.7 } : null]}
              onPress={handleCreateDebt}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Simpan Catatan</Text>
              )}
            </ScalePress>
          </View>
        </View>
      </Modal>

      {/* Modal Pembayaran Utang/Piutang */}
      <Modal
        visible={payModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeDebt?.type === "debt" ? "Bayar Angsuran Utang" : "Terima Pembayaran Piutang"}
              </Text>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {activeDebt && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.textPrimary }}>
                  Pihak: {activeDebt.counterparty}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                  Sisa tagihan: Rp {activeDebt.remainingAmount.toLocaleString("id-ID")}
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nominal Pembayaran (Rp)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={payAmount}
                onChangeText={setPayAmount}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Pembayaran cicilan 1"
                placeholderTextColor={colors.textMuted}
                value={payNote}
                onChangeText={setPayNote}
              />
            </View>

            <ScalePress
              style={[styles.saveBtn, saving ? { opacity: 0.7 } : null]}
              onPress={handlePay}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Konfirmasi Pembayaran</Text>
              )}
            </ScalePress>
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
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryBox: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
  },
  summaryLabel: { fontSize: 12, fontWeight: "700" },
  summaryValue: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterBtnActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  filterText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  filterTextActive: { color: "#FFFFFF" },
  addSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.coral,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addSmallText: { fontSize: 12, fontWeight: "800", color: "#FFFFFF" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 6, lineHeight: 18 },
  list: { gap: 14 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  typeText: { fontSize: 11, fontWeight: "800" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  deleteBtn: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: colors.slateLight,
  },
  personName: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginTop: 12 },
  noteText: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  dueDate: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: "500" },
  amountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  amtLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  amtRemaining: { fontSize: 17, fontWeight: "900", marginTop: 2 },
  amtInitial: { fontSize: 13, color: colors.textSecondary, fontWeight: "700", marginTop: 2 },
  payBtn: {
    marginTop: 12,
    backgroundColor: colors.slateLight,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  payBtnText: { fontSize: 13, fontWeight: "800", color: colors.plum },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  textInput: {
    backgroundColor: colors.slateLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  typeSelectorRow: { flexDirection: "row", gap: 10 },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.slateLight,
    alignItems: "center",
  },
  typeChipActiveDebt: { backgroundColor: "#EF4444" },
  typeChipActiveReceivable: { backgroundColor: "#10B981" },
  typeChipText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  saveBtn: {
    backgroundColor: colors.plum,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
});

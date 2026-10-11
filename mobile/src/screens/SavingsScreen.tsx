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
  PiggyBank,
  Plus,
  CheckCircle2,
  Trash2,
  X,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { FadeInView, ScalePress, AnimatedProgressBar } from "../components/AnimatedComponents";

interface SavingsScreenProps {
  onBack: () => void;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  accountName?: string | null;
  status: string;
  percentage: number;
  remaining: number;
}

export const SavingsScreen = ({ onBack }: SavingsScreenProps) => {
  const [goalsList, setGoalsList] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create Goal Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [formName, setFormName] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formInitialAmount, setFormInitialAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");

  // Contribute Modal
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeNote, setContributeNote] = useState("");

  const fetchSavings = async () => {
    setLoading(true);
    try {
      const data = await api.getSavings();
      if (Array.isArray(data)) {
        setGoalsList(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const handleCreateGoal = async () => {
    if (!formName.trim()) {
      Alert.alert("Perhatian", "Nama target tabungan wajib diisi.");
      return;
    }
    const target = parseFloat(formTargetAmount.replace(/[^0-9.]/g, ""));
    if (!target || target <= 0) {
      Alert.alert("Perhatian", "Nominal target harus lebih dari 0.");
      return;
    }

    const initial = parseFloat(formInitialAmount.replace(/[^0-9.]/g, "")) || 0;

    setSaving(true);
    try {
      const res = await api.createSavingsGoal({
        name: formName.trim(),
        targetAmount: target,
        initialAmount: initial,
        targetDate: formTargetDate.trim() || undefined,
      });

      if (res.success === false) {
        Alert.alert("Gagal", res.error || "Gagal membuat target tabungan");
        return;
      }

      setCreateModalVisible(false);
      setFormName("");
      setFormTargetAmount("");
      setFormInitialAmount("");
      setFormTargetDate("");
      fetchSavings();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Gagal membuat target tabungan");
    } finally {
      setSaving(false);
    }
  };

  const handleContribute = async () => {
    if (!activeGoal) return;
    const amount = parseFloat(contributeAmount.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) {
      Alert.alert("Perhatian", "Nominal setoran harus lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.contributeSavings({
        goalId: activeGoal.id,
        amount,
        note: contributeNote.trim() || "Setoran tabungan",
      });

      if (res.success === false) {
        Alert.alert("Gagal", res.error || "Gagal menambah setoran");
        return;
      }

      setContributeModalVisible(false);
      setContributeAmount("");
      setContributeNote("");
      setActiveGoal(null);
      fetchSavings();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Gagal menambah setoran");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = (goal: SavingsGoal) => {
    Alert.alert(
      "Hapus Target Tabungan",
      `Apakah Anda yakin ingin menghapus "${goal.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteSavingsGoal(goal.id);
              if (res.success === false) {
                Alert.alert("Gagal", res.error || "Gagal menghapus target");
                return;
              }
              fetchSavings();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Gagal menghapus target");
            }
          },
        },
      ]
    );
  };

  const totalTarget = goalsList.reduce((acc, curr) => acc + (curr.targetAmount || 0), 0);
  const totalCurrent = goalsList.reduce((acc, curr) => acc + (curr.currentAmount || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <ScalePress onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </ScalePress>
        <Text style={styles.headerTitle}>Target Tabungan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchSavings}
            colors={[colors.coral]}
            tintColor={colors.coral}
          />
        }
      >
        {/* Total Summary Card */}
        <FadeInView delay={0}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Tabungan Terkumpul</Text>
            <Text style={styles.summaryAmount}>Rp {totalCurrent.toLocaleString("id-ID")}</Text>
            <Text style={styles.summaryTarget}>
              dari total target Rp {totalTarget.toLocaleString("id-ID")}
            </Text>
          </View>
        </FadeInView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Target Finansial ({goalsList.length})</Text>
          <ScalePress
            style={styles.addBtn}
            onPress={() => setCreateModalVisible(true)}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.addBtnText}>Buat Target</Text>
          </ScalePress>
        </View>

        {goalsList.length === 0 && !loading ? (
          <FadeInView delay={100}>
            <View style={styles.emptyCard}>
              <PiggyBank size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum Ada Target Tabungan</Text>
              <Text style={styles.emptySubtitle}>
                Mulai rencanakan dana darurat atau impian masa depan Anda dengan membuat target tabungan baru.
              </Text>
            </View>
          </FadeInView>
        ) : (
          <View style={styles.goalsList}>
            {goalsList.map((g, idx) => {
              const isDone = g.percentage >= 100;
              const formattedDate = g.targetDate
                ? new Date(g.targetDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Fleksibel";

              return (
                <FadeInView key={`${g.id || idx}`} delay={idx * 50}>
                  <View style={styles.goalCard}>
                    <View style={styles.goalTop}>
                      <View style={styles.goalIconBox}>
                        <PiggyBank size={24} color="#F59E0B" />
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {isDone ? (
                          <View style={styles.doneBadge}>
                            <CheckCircle2 size={12} color="#10B981" />
                            <Text style={styles.doneText}>Tercapai</Text>
                          </View>
                        ) : (
                          <Text style={styles.pctText}>{g.percentage}%</Text>
                        )}
                        <ScalePress
                          onPress={() => handleDeleteGoal(g)}
                          style={styles.deleteGoalBtn}
                        >
                          <Trash2 size={15} color="#EF4444" />
                        </ScalePress>
                      </View>
                    </View>

                    <Text style={styles.goalName}>{g.name}</Text>
                    <Text style={styles.goalDate}>Target: {formattedDate}</Text>

                    <View style={styles.track}>
                      <AnimatedProgressBar
                        percentage={g.percentage}
                        height={10}
                        color={isDone ? "#10B981" : colors.plum}
                        backgroundColor="#EFEBF5"
                        borderRadius={5}
                      />
                    </View>

                    <View style={styles.amountsRow}>
                      <Text style={styles.currentAmount}>
                        Rp {g.currentAmount.toLocaleString("id-ID")}
                      </Text>
                      <Text style={styles.targetAmount}>
                        Target: Rp {g.targetAmount.toLocaleString("id-ID")}
                      </Text>
                    </View>

                    <ScalePress
                      style={styles.depositBtn}
                      onPress={() => {
                        setActiveGoal(g);
                        setContributeAmount("");
                        setContributeNote("");
                        setContributeModalVisible(true);
                      }}
                    >
                      <Text style={styles.depositBtnText}>+ Setor Tabungan</Text>
                    </ScalePress>
                  </View>
                </FadeInView>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal Buat Target Tabungan */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buat Target Tabungan Baru</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nama Target Tabungan</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Dana Darurat 2026, Liburan Jepang"
                placeholderTextColor={colors.textMuted}
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Nominal (Rp)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formTargetAmount}
                onChangeText={setFormTargetAmount}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Saldo Awal Terkumpul (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formInitialAmount}
                onChangeText={setFormInitialAmount}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Tanggal (Opsional: YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2026-12-31"
                placeholderTextColor={colors.textMuted}
                value={formTargetDate}
                onChangeText={setFormTargetDate}
              />
            </View>

            <ScalePress
              style={[styles.saveBtn, saving ? { opacity: 0.7 } : null]}
              onPress={handleCreateGoal}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Simpan Target</Text>
              )}
            </ScalePress>
          </View>
        </View>
      </Modal>

      {/* Modal Setor Tabungan */}
      <Modal
        visible={contributeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setContributeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Setor Tabungan</Text>
              <TouchableOpacity onPress={() => setContributeModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {activeGoal && (
              <Text style={{ fontSize: 14, color: colors.plum, fontWeight: "700", marginBottom: 12 }}>
                Target: {activeGoal.name}
              </Text>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nominal Setoran (Rp)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={contributeAmount}
                onChangeText={setContributeAmount}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Catatan (Opsional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Tabungan gaji bulan ini"
                placeholderTextColor={colors.textMuted}
                value={contributeNote}
                onChangeText={setContributeNote}
              />
            </View>

            <ScalePress
              style={[styles.saveBtn, saving ? { opacity: 0.7 } : null]}
              onPress={handleContribute}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Konfirmasi Setoran</Text>
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
  content: { padding: 20 },
  summaryCard: {
    backgroundColor: colors.plum,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },
  summaryLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "600", textTransform: "uppercase" },
  summaryAmount: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginTop: 4 },
  summaryTarget: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6, fontWeight: "500" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.coral,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
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
  goalsList: { gap: 14 },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  goalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  pctText: { fontSize: 14, fontWeight: "800", color: colors.plum },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  doneText: { fontSize: 12, fontWeight: "800", color: "#10B981" },
  deleteGoalBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.slateLight,
  },
  goalName: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginTop: 12 },
  goalDate: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: "500" },
  track: {
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 5,
    marginVertical: 14,
    overflow: "hidden",
  },
  bar: { height: 10, borderRadius: 5 },
  amountsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  currentAmount: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  targetAmount: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  depositBtn: {
    marginTop: 14,
    backgroundColor: colors.slateLight,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  depositBtnText: { fontSize: 13, fontWeight: "800", color: colors.plum },
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
  saveBtn: {
    backgroundColor: colors.plum,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
